import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAgentSchema } from "@shared/schema";
import { executeAgentTask } from "./gemini";
import { validateRequest, validateId, asyncHandler } from "./utils/validation";
import logger from "./utils/logger";
import config from "./config";
import { z } from "zod";

/**
 * Register all API routes
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", asyncHandler(async (_req, res) => {
    try {
      // Test database connection health
      const isDbHealthy = await storage.checkHealth();
      
      const healthStatus = {
        status: isDbHealthy ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        database: isDbHealthy ? "connected" : "error",
        environment: process.env.NODE_ENV || "development",
        gemini: process.env.GOOGLE_API_KEY ? "configured" : "missing_api_key",
      };
      
      const statusCode = isDbHealthy ? 200 : 503;
      
      res.status(statusCode).json(healthStatus);
      
      if (!isDbHealthy) {
        logger.warn('Health check returned degraded status', healthStatus);
      }
    } catch (error) {
      logger.error('Health check failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }));

  // Get all agents
  app.get("/api/agents", asyncHandler(async (_req, res) => {
    const agents = await storage.getAllAgents();
    res.json(agents);
  }));

  // Get agent by ID
  app.get(
    "/api/agents/:id",
    validateId(),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({
          error: "Agent not found",
          timestamp: new Date().toISOString()
        });
      }
      
      res.json(agent);
    })
  );

  // Create new agent
  app.post(
    "/api/agents",
    validateRequest(insertAgentSchema),
    asyncHandler(async (req, res) => {
      const validatedData = req.body;
      const agent = await storage.createAgent(validatedData);
      
      logger.info(`Created agent: ${agent.id} - ${agent.name}`);
      res.status(201).json(agent);
    })
  );

  // Reorder agents - validate with custom schema
  const reorderAgentsSchema = z.object({
    agents: z.array(z.object({
      id: z.string().min(1, "Agent ID is required").max(100, "Agent ID is too long"),
      order: z.number().int().nonnegative("Order must be a non-negative integer")
    })).min(1, "Agents array cannot be empty").max(1000, "Too many agents to reorder at once")
  });
  
  app.patch(
    "/api/agents/reorder",
    validateRequest(reorderAgentsSchema),
    asyncHandler(async (req, res) => {
      const { agents } = req.body;
      await storage.reorderAgents(agents);
      
      logger.info(`Reordered ${agents.length} agents`);
      res.status(204).send();
    })
  );

  // Update agent by ID
  app.patch(
    "/api/agents/:id",
    validateId(),
    validateRequest(insertAgentSchema),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const validatedData = req.body;
      
      const agent = await storage.updateAgent(id, validatedData);
      if (!agent) {
        return res.status(404).json({
          error: "Agent not found",
          timestamp: new Date().toISOString()
        });
      }
      
      logger.info(`Updated agent: ${agent.id} - ${agent.name}`);
      res.json(agent);
    })
  );

  // Delete agent by ID
  app.delete(
    "/api/agents/:id",
    validateId(),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      
      const success = await storage.deleteAgent(id);
      if (!success) {
        return res.status(404).json({
          error: "Agent not found",
          timestamp: new Date().toISOString()
        });
      }
      
      logger.info(`Deleted agent: ${id}`);
      res.status(204).send();
    })
  );

  // Execute agent tasks
  app.post(
    "/api/agents/:id/execute",
    validateId(),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      
      // Verify agent exists
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({
          error: "Agent not found",
          timestamp: new Date().toISOString()
        });
      }

      // Verify agent has tasks
      if (!agent.tasks || agent.tasks.length === 0) {
        return res.status(400).json({
          error: "Agent has no tasks to execute",
          timestamp: new Date().toISOString()
        });
      }

      // Verify tasks are not empty strings
      const validTasks = agent.tasks.filter(task => task && task.trim().length > 0);
      if (validTasks.length === 0) {
        return res.status(400).json({
          error: "Agent has no valid tasks to execute",
          timestamp: new Date().toISOString()
        });
      }
      
      // Create execution record
      const execution = await storage.createExecution({
        agentId: agent.id,
        agentName: agent.name,
        status: "running",
        result: null,
      });

      logger.info(`Started execution ${execution.id} for agent: ${agent.name}`);
      
      // Respond 202 Accepted immediately
      res.status(202).json(execution);

      // Add execution performance tracking
      const executionStartTime = Date.now();
      
      // Execution timeout from config (default: 5 minutes)
      const EXECUTION_TIMEOUT_MS = config.execution.timeoutMs;

      // Execute the task in the background with proper error handling and timeout
      const executeWithTimeout = async () => {
        let timeoutId: NodeJS.Timeout | null = null;
        try {
          // Create a timeout promise with cleanup
          const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => {
              reject(new Error(`Execution timed out after ${EXECUTION_TIMEOUT_MS / 1000} seconds`));
            }, EXECUTION_TIMEOUT_MS);
          });

          // Race between execution and timeout
          const result = await Promise.race([
            executeAgentTask(agent.name, agent.role, agent.goal, agent.backstory, validTasks),
            timeoutPromise
          ]);
          
          // Clear timeout if execution completes before timeout
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

          const executionTime = Date.now() - executionStartTime;
          
          // Update execution with result
          await storage.updateExecution(execution.id, {
            status: "completed",
            result,
          });
          
          logger.info(`Completed execution ${execution.id}`, {
            executionId: execution.id,
            agentId: agent.id,
            agentName: agent.name,
            executionTimeMs: executionTime,
            resultLength: typeof result === 'string' ? result.length : JSON.stringify(result).length,
          });
        } catch (error) {
          // Clear timeout on error
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
          const executionTime = Date.now() - executionStartTime;
          const errorMessage = error instanceof Error ? error.message : "Execution failed";
          
          // Ensure database update happens even if there's an error
          try {
            await storage.updateExecution(execution.id, {
              status: "failed",
              result: errorMessage,
            });
            
            logger.error(`Failed execution ${execution.id}`, {
              executionId: execution.id,
              agentId: agent.id,
              agentName: agent.name,
              executionTimeMs: executionTime,
              error: errorMessage,
            });
          } catch (dbError) {
            // If database update fails, log it but don't throw
            logger.error(`Failed to update execution ${execution.id} in database`, {
              executionId: execution.id,
              originalError: errorMessage,
              dbError: dbError instanceof Error ? dbError.message : String(dbError),
            });
          }
        }
      };

      // Execute without blocking the response
      executeWithTimeout().catch((error) => {
        // This catch is a safety net for any unhandled errors
        logger.error(`Unhandled error in background execution ${execution.id}`, {
          executionId: execution.id,
          error: error instanceof Error ? error.message : String(error),
        });
      });
);
  );

  // Get all executions
  app.get("/api/executions", asyncHandler(async (req, res) => {
    // Optional limit query parameter with validation
    let limit: number | undefined = undefined;
    if (req.query.limit) {
      const parsedLimit = parseInt(req.query.limit as string, 10);
      // Validate limit is a positive number and not too large (prevent DoS)
      if (!isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 1000) {
        limit = parsedLimit;
      } else {
        return res.status(400).json({
          error: "Invalid limit parameter",
          details: "Limit must be a positive number between 1 and 1000",
          timestamp: new Date().toISOString()
        });
      }
    }
    
    const executions = await storage.getAllExecutions();
    
    // Apply limit if valid
    const result = limit ? executions.slice(0, limit) : executions;
      
    res.json(result);
  }));

  // Get execution by ID
  app.get(
    "/api/executions/:id",
    validateId(),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      
      const execution = await storage.getExecution(id);
      if (!execution) {
        return res.status(404).json({
          error: "Execution not found",
          timestamp: new Date().toISOString()
        });
      }
      
      res.json(execution);
    })
  );

  // Create HTTP server
  const httpServer = createServer(app);

  // Add graceful shutdown handler
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    
    // Force close after 10s
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  });

  logger.info('All API routes registered successfully');
  return httpServer;
}
