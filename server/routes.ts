import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAgentSchema } from "@shared/schema";
import { executeAgentTask } from "./gemini";
import { validateRequest, validateId, asyncHandler } from "./utils/validation";
import logger from "./utils/logger";
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
      id: z.string().min(1),
      order: z.number().int().nonnegative()
    })).min(1, "Agents array cannot be empty")
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

      // Execute the task in the background with proper error handling
      executeAgentTask(agent.name, agent.role, agent.goal, agent.backstory, agent.tasks)
        .then(async (result) => {
          const executionTime = Date.now() - executionStartTime;
          
          await storage.updateExecution(execution.id, {
            status: "completed",
            result,
          });
          
          logger.info(`Completed execution ${execution.id}`, {
            executionId: execution.id,
            agentId: agent.id,
            agentName: agent.name,
            executionTimeMs: executionTime,
            resultLength: result.length,
          });
        })
        .catch(async (error) => {
          const executionTime = Date.now() - executionStartTime;
          const errorMessage = error instanceof Error ? error.message : "Execution failed";
          
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
        });
    })
  );

  // Get all executions
  app.get("/api/executions", asyncHandler(async (req, res) => {
    // Optional limit query parameter
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    
    const executions = await storage.getAllExecutions();
    
    // Apply limit if valid
    const result = limit && !isNaN(limit) && limit > 0
      ? executions.slice(0, limit)
      : executions;
      
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
