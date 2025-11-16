import dotenv from 'dotenv';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import logger from './utils/logger';

// Ensure .env is loaded
dotenv.config();

// Environment schema
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  
  // Port configuration
  PORT: z.string().transform(val => parseInt(val, 10)).default('5000'),
  
  // Database configuration
  DATABASE_URL: z.string().min(1, "Database URL is required"),
  DB_MAX_CONNECTIONS: z.string().transform(val => parseInt(val, 10)).default('10'),
  DB_CONNECTION_TIMEOUT_MS: z.string().transform(val => parseInt(val, 10)).default('30000'),
  DB_IDLE_TIMEOUT_MS: z.string().transform(val => parseInt(val, 10)).default('10000'),
  DB_RETRY_ATTEMPTS: z.string().transform(val => parseInt(val, 10)).default('5'),
  DB_RETRY_DELAY_MS: z.string().transform(val => parseInt(val, 10)).default('1000'),
  
  // API configurations
  GOOGLE_API_KEY: z.string().min(1, "Google API key is required"),
  
  // Security configurations
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5000'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(val => parseInt(val, 10)).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(val => parseInt(val, 10)).default('100'),
  
  // Logging configuration
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug', 'silly']).default('info'),
  
  // Performance/caching configurations
  ENABLE_RESPONSE_CACHE: z.string().transform(val => val.toLowerCase() === 'true').default('false'),
  CACHE_TTL_SECONDS: z.string().transform(val => parseInt(val, 10)).default('300'), // 5 minutes
  
  // Timeout configurations
  REQUEST_TIMEOUT_MS: z.string().transform(val => parseInt(val, 10)).default('30000'),
  API_TIMEOUT_MS: z.string().transform(val => parseInt(val, 10)).default('10000'),
});

// Parse environment variables with defaults
function parseEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .filter(err => err.code === 'invalid_type' && err.received === 'undefined')
        .map(err => err.path.join('.'));
      
      if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:', missingVars);
        
        // In development, suggest copying from .env.example
        if (process.env.NODE_ENV !== 'production') {
          const exampleEnvPath = path.join(process.cwd(), '.env.example');
          if (fs.existsSync(exampleEnvPath)) {
            console.error('\nPlease configure these variables in your .env file.');
            console.error('You can copy missing variables from .env.example\n');
          }
        }
      } else {
        console.error('❌ Invalid environment variables:', error.errors);
      }
      
      process.exit(1);
    }
    
    console.error('❌ Unexpected error parsing environment variables:', error);
    process.exit(1);
  }
}

// Environment-specific configurations
const env = parseEnv();

// Base config for all environments
const baseConfig = {
  env: env.NODE_ENV,
  server: {
    port: env.PORT,
    requestTimeoutMs: env.REQUEST_TIMEOUT_MS,
  },
  database: {
    url: env.DATABASE_URL,
    maxConnections: env.DB_MAX_CONNECTIONS,
    connectionTimeoutMs: env.DB_CONNECTION_TIMEOUT_MS,
    idleTimeoutMs: env.DB_IDLE_TIMEOUT_MS,
    retryAttempts: env.DB_RETRY_ATTEMPTS,
    retryDelayMs: env.DB_RETRY_DELAY_MS,
    ssl: env.NODE_ENV === 'production',
  },
  api: {
    googleApiKey: env.GOOGLE_API_KEY,
    timeoutMs: env.API_TIMEOUT_MS,
  },
  security: {
    allowedOrigins: env.ALLOWED_ORIGINS.split(','),
    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    },
  },
  logging: {
    level: env.LOG_LEVEL,
    pretty: env.NODE_ENV !== 'production',
  },
  performance: {
    enableResponseCache: env.ENABLE_RESPONSE_CACHE,
    cacheTtlSeconds: env.CACHE_TTL_SECONDS,
  },
};

// Development environment overrides
const developmentConfig = {
  ...baseConfig,
  logging: {
    ...baseConfig.logging,
    level: 'debug',
    pretty: true,
  },
  security: {
    ...baseConfig.security,
    // Disable rate limiting in development
    rateLimit: {
      ...baseConfig.security.rateLimit,
      enabled: false,
    },
  },
  database: {
    ...baseConfig.database,
    ssl: false,
  },
};

// Test environment overrides
const testConfig = {
  ...baseConfig,
  logging: {
    ...baseConfig.logging,
    level: 'error', // Minimal logging in tests
  },
  database: {
    ...baseConfig.database,
    ssl: false,
  },
};

// Production environment overrides
const productionConfig = {
  ...baseConfig,
  logging: {
    ...baseConfig.logging,
    pretty: false,
    level: 'info',
  },
  security: {
    ...baseConfig.security,
    rateLimit: {
      ...baseConfig.security.rateLimit,
      enabled: true,
    },
  },
  database: {
    ...baseConfig.database,
    ssl: true,
  },
};

// Select config based on environment
function getConfig() {
  switch (env.NODE_ENV) {
    case 'development':
      return developmentConfig;
    case 'test':
      return testConfig;
    case 'production':
      return productionConfig;
    default:
      return baseConfig;
  }
}

const config = getConfig();

// Log the configuration on startup (but only in development)
if (env.NODE_ENV === 'development') {
  // Create a safe copy of the config with sensitive data masked
  const loggableConfig = JSON.parse(JSON.stringify(config));
  if (loggableConfig.api?.googleApiKey) {
    loggableConfig.api.googleApiKey = '********';
  }
  if (loggableConfig.database?.url) {
    loggableConfig.database.url = '********';
  }
  
  logger.debug('Application configuration loaded', { config: loggableConfig });
}

export default config;