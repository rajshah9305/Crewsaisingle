import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import compression from "compression";
import { mkdirSync } from "fs";
import path from "path";

import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import logger, { stream } from "./utils/logger";
import config from "./config";
import { storage } from "./storage";
import * as apicache from "apicache";

// Create logs directory if it doesn't exist
try {
  mkdirSync(path.join(process.cwd(), 'logs'), { recursive: true });
} catch (err) {
  logger.error('Error creating logs directory', { error: err });
}

const app = express();

// Trust proxy headers for proper IP detection (important for rate limiting behind proxies)
app.set('trust proxy', 1);

// Add request timeout middleware
app.use((req, res, next) => {
  res.setTimeout(config.server.requestTimeoutMs, () => {
    logger.warn('Request timeout', {
      path: req.path,
      method: req.method,
      timeout: config.server.requestTimeoutMs
    });
    
    res.status(408).json({
      error: 'Request timeout',
      timestamp: new Date().toISOString()
    });
  });
  next();
});

// Apply compression for all responses
app.use(compression());

// Security middleware
app.use(helmet({
  contentSecurityPolicy: config.env === 'production' ? undefined : false,
}));

// CORS configuration
app.use(cors({
  origin: (origin: string | undefined, callback: Function) => {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    if (config.security.allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours cache for preflight requests
}));

// Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later',
  skip: () => config.env === 'development', // Disable in development
});

// Apply rate limiting to API routes only
app.use("/api", apiLimiter);

// Add response caching based on configuration
if (config.performance.enableResponseCache) {
  const cache = apicache.middleware;
  
  // Cache successful GET requests to API routes
  app.use('/api', cache(`${config.performance.cacheTtlSeconds} seconds`, (req: express.Request, res: express.Response) => {
    return req.method === 'GET' && res.statusCode === 200;
  }));
  
  logger.info('Response caching enabled', {
    ttlSeconds: config.performance.cacheTtlSeconds
  });
}

// Initialize database connection at startup
storage.initialize()
  .then(async () => {
    logger.info('Database initialized successfully');
    
    // Clean up any stuck executions from previous server crashes
    try {
      const cleanedCount = await storage.cleanupStuckExecutions(0);
      if (cleanedCount > 0) {
        logger.info('Startup cleanup completed', {
          cleanedExecutions: cleanedCount,
          message: 'Cleaned up executions stuck from previous server instance'
        });
      }
    } catch (error) {
      logger.error('Startup cleanup failed', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
    
    // Start periodic cleanup of stuck executions (every 5 minutes)
    const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
    const EXECUTION_TIMEOUT_MINUTES = 10; // Consider executions stuck after 10 minutes
    
    setInterval(async () => {
      try {
        const cleanedCount = await storage.cleanupStuckExecutions(EXECUTION_TIMEOUT_MINUTES);
        if (cleanedCount > 0) {
          logger.info('Periodic cleanup completed', {
            cleanedExecutions: cleanedCount,
            timeoutMinutes: EXECUTION_TIMEOUT_MINUTES
          });
        }
      } catch (error) {
        logger.error('Periodic cleanup failed', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }, CLEANUP_INTERVAL_MS);
    
    logger.info('Periodic cleanup job started', {
      intervalMinutes: CLEANUP_INTERVAL_MS / 60000,
      timeoutMinutes: EXECUTION_TIMEOUT_MINUTES
    });
  })
  .catch(err => {
    logger.error('Database initialization failed', {
      error: err instanceof Error ? err.message : String(err)
    });
  });

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
  limit: '1mb', // Limit the request size to prevent abuse
}));

app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json.bind(res);
  res.json = (body?: any) => {
    capturedJsonResponse = body;
    return originalResJson(body);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      const logData: Record<string, any> = {
        method: req.method,
        path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.get('user-agent') || 'unknown',
      };

      // Only add response for non-error status codes to avoid filling logs with error details
      if (capturedJsonResponse && res.statusCode < 400) {
        try {
          // We'll just log that there was a response but not include it in logs
          // to avoid sensitive data in logs
          logData['responseSize'] = JSON.stringify(capturedJsonResponse).length;
        } catch (e) {
          logData['responseError'] = 'Could not stringify response';
        }
      }

      if (res.statusCode >= 400) {
        logger.error(`API Error: ${req.method} ${path} ${res.statusCode} in ${duration}ms`, logData);
      } else if (res.statusCode >= 300) {
        logger.warn(`API Redirect: ${req.method} ${path} ${res.statusCode} in ${duration}ms`, logData);
      } else {
        logger.info(`API Request: ${req.method} ${path} ${res.statusCode} in ${duration}ms`, logData);
      }

      // For backward compatibility with the existing log function
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// Initialize the app
async function initializeApp() {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    // Don't rethrow in production to prevent process crashes
    if (app.get("env") === "development") {
      console.error("Error:", err);
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  return server;
}

// For Vercel serverless deployment, export the app
export default app;

// For traditional Node.js deployment, start the server
if (process.env.VERCEL !== '1') {
  (async () => {
    const server = await initializeApp();
    
    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5001', 10);
    server.listen(port, "0.0.0.0", () => {
      log(`serving on port ${port}`);
    });
  })();
} else {
  // Initialize for Vercel
  initializeApp().catch(err => {
    logger.error('Failed to initialize app for Vercel', {
      error: err instanceof Error ? err.message : String(err)
    });
  });
}
