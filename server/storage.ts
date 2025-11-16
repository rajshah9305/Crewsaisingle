import { type Agent, type InsertAgent, type Execution, type InsertExecution, agents, executions } from "@shared/schema";
import config from "./config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, desc, sql } from "drizzle-orm";
import logger from "./utils/logger";

const { Pool } = pg;

export interface IStorage {
  getAllAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, agent: InsertAgent): Promise<Agent | undefined>;
  deleteAgent(id: string): Promise<boolean>;
  reorderAgents(agents: Agent[]): Promise<void>;
  
  getAllExecutions(): Promise<Execution[]>;
  getExecution(id: string): Promise<Execution | undefined>;
  createExecution(execution: InsertExecution): Promise<Execution>;
  updateExecution(id: string, updates: Partial<Execution>): Promise<Execution | undefined>;
  cleanupStuckExecutions(timeoutMinutes?: number): Promise<number>;

  // Connection lifecycle management
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  checkHealth(): Promise<boolean>;
}

/**
 * Configuration for database connection pooling
 */
interface DbConfig {
  maxConnections: number;
  connectionTimeoutMs: number;
  idleTimeoutMs: number;
  retryAttempts: number;
  retryDelayMs: number;
}

// Get database configuration from environment or use defaults
function getDbConfig(): DbConfig {
  return {
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
    connectionTimeoutMs: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS || '30000', 10),
    idleTimeoutMs: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '10000', 10),
    retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '5', 10),
    retryDelayMs: parseInt(process.env.DB_RETRY_DELAY_MS || '1000', 10),
  };
}

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set. Please configure it in your environment settings.");
  }
  return databaseUrl;
}

// Initialize pool lazily to avoid errors at module load time
let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

// Track connection status
let isInitialized = false;
let connectionError: Error | null = null;

/**
 * Create and configure database connection pool with proper error handling
 */
function createPool(): pg.Pool {
  const dbConfig = getDbConfig();
  
  const databaseUrl = getDatabaseUrl();
  const parsedUrl = new URL(databaseUrl);
  
  // Check if the URL already contains 'sslmode'
  const hasSslMode = parsedUrl.searchParams.has('sslmode');
  
  const sslConfig = config.database.ssl && !hasSslMode
    ? { rejectUnauthorized: false } // Use rejectUnauthorized: false for common cloud DB setups
    : false;
    
  const newPool = new Pool({
    connectionString: databaseUrl,
    max: dbConfig.maxConnections,
    connectionTimeoutMillis: dbConfig.connectionTimeoutMs,
    idleTimeoutMillis: dbConfig.idleTimeoutMs,
    ssl: sslConfig,
  });
  
  // Set up error handling for the pool
  newPool.on('error', (err) => {
    connectionError = err;
    logger.error('Unexpected error on idle database client', { error: err.message });
  });
  
  newPool.on('connect', (client) => {
    logger.debug('New database connection established');
    
    // Set up error handling for each client
    client.on('error', (err) => {
      logger.error('Database client error', { error: err.message });
    });
  });
  
  return newPool;
}

/**
 * Get database connection pool with retry logic
 */
async function getPool(retry = 0): Promise<pg.Pool> {
  const dbConfig = getDbConfig();
  
  if (!pool) {
    try {
      pool = createPool();
      // Test connection
      const client = await (pool ?? await getPool()).connect();
      client.release();
      logger.info('Database connection pool initialized successfully');
      isInitialized = true;
      connectionError = null;
    } catch (error) {
      connectionError = error instanceof Error ? error : new Error(String(error));
      
      // Implement retry logic
      if (retry < dbConfig.retryAttempts) {
        logger.warn(`Database connection failed, retrying (${retry + 1}/${dbConfig.retryAttempts})`,
          { error: connectionError.message });
        
        await new Promise(resolve => setTimeout(resolve, dbConfig.retryDelayMs));
        return getPool(retry + 1);
      }
      
      logger.error('Failed to initialize database connection after retries',
        { error: connectionError.message, retryAttempts: dbConfig.retryAttempts });
      throw connectionError;
    }
  }
  
  return pool;
}

/**
 * Get database ORM instance
 */
async function getDb() {
  if (!db) {
    const poolInstance = await getPool();
    db = drizzle(poolInstance);
  }
  return db;
}

export class DatabaseStorage implements IStorage {
  /**
   * Initialize the database connection
   */
  async initialize(): Promise<void> {
    try {
      await getPool();
      logger.info('Database storage initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize database storage', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Shutdown the database connection pool gracefully
   */
  async shutdown(): Promise<void> {
    if (pool) {
      try {
        await pool.end();
        pool = null;
        db = null;
        isInitialized = false;
        logger.info('Database connection pool closed successfully');
      } catch (error) {
        logger.error('Error closing database connection pool', {
          error: error instanceof Error ? error.message : String(error)
        });
        throw error;
      }
    }
  }

  /**
   * Check database connection health
   */
  async checkHealth(): Promise<boolean> {
    try {
      if (!pool) {
        await getPool();
      }
      
      const client = await (pool ?? await getPool()).connect();
      try {
        await client.query('SELECT 1');
        return true;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Database health check failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      return false;
    }
  }
  
  /**
   * Get all agents ordered by their position
   */
  async getAllAgents(): Promise<Agent[]> {
    try {
      const db = await getDb();
      const result = await db.select().from(agents).orderBy(agents.order);
      return result;
    } catch (error) {
      logger.error('Failed to get all agents', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (error instanceof Error && error.message?.includes('DATABASE_URL')) {
        throw new Error("Database configuration error: DATABASE_URL environment variable is not properly set.");
      }
      throw error;
    }
  }

  /**
   * Get a specific agent by ID
   */
  async getAgent(id: string): Promise<Agent | undefined> {
    try {
      const db = await getDb();
      const result = await db.select().from(agents).where(eq(agents.id, id));
      return result[0];
    } catch (error) {
      logger.error('Failed to get agent', {
        agentId: id,
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (error instanceof Error && error.message?.includes('DATABASE_URL')) {
        throw new Error("Database configuration error: DATABASE_URL environment variable is not properly set.");
      }
      throw error;
    }
  }

  /**
   * Create a new agent
   */
  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    try {
      const db = await getDb();
      const allAgents = await this.getAllAgents();
      const order = allAgents.length;
      
      const result = await db.insert(agents).values({
        name: insertAgent.name,
        role: insertAgent.role,
        goal: insertAgent.goal,
        backstory: insertAgent.backstory,
        tasks: insertAgent.tasks as string[],
        order,
      }).returning();
      
      if (!result || result.length === 0) {
        throw new Error("Failed to create agent: No result returned from database");
      }
      
      logger.info('Agent created successfully', { agentId: result[0].id });
      return result[0];
    } catch (error) {
      logger.error('Failed to create agent', {
        agent: { name: insertAgent.name },
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (error instanceof Error && error.message?.includes('DATABASE_URL')) {
        throw new Error("Database configuration error: DATABASE_URL environment variable is not properly set.");
      }
      throw error;
    }
  }

  /**
   * Update an existing agent
   */
  async updateAgent(id: string, insertAgent: InsertAgent): Promise<Agent | undefined> {
    try {
      const db = await getDb();
      const result = await db.update(agents)
        .set({
          name: insertAgent.name,
          role: insertAgent.role,
          goal: insertAgent.goal,
          backstory: insertAgent.backstory,
          tasks: insertAgent.tasks as string[],
        })
        .where(eq(agents.id, id))
        .returning();
      
      if (result.length > 0) {
        logger.info('Agent updated successfully', { agentId: id });
        return result[0];
      }
      
      logger.warn('Agent not found for update', { agentId: id });
      return undefined;
    } catch (error) {
      logger.error('Failed to update agent', {
        agentId: id,
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (error instanceof Error && error.message?.includes('DATABASE_URL')) {
        throw new Error("Database configuration error: DATABASE_URL environment variable is not properly set.");
      }
      throw error;
    }
  }

  /**
   * Delete an agent by ID
   */
  async deleteAgent(id: string): Promise<boolean> {
    try {
      const db = await getDb();
      const result = await db.delete(agents).where(eq(agents.id, id)).returning();
      const success = result.length > 0;
      
      if (success) {
        logger.info('Agent deleted successfully', { agentId: id });
      } else {
        logger.warn('Agent not found for deletion', { agentId: id });
      }
      
      return success;
    } catch (error) {
      logger.error('Failed to delete agent', {
        agentId: id,
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (error instanceof Error && error.message?.includes('DATABASE_URL')) {
        throw new Error("Database configuration error: DATABASE_URL environment variable is not properly set.");
      }
      throw error;
    }
  }

  /**
   * Update the order of agents
   */
  async reorderAgents(agentList: Agent[]): Promise<void> {
    try {
      const db = await getDb();
      
      // Use a transaction to ensure all updates succeed or fail together
      await db.transaction(async (tx) => {
        for (const agent of agentList) {
          await tx.update(agents)
            .set({ order: agent.order })
            .where(eq(agents.id, agent.id));
        }
      });
      
      logger.info('Agents reordered successfully', { count: agentList.length });
    } catch (error) {
      logger.error('Failed to reorder agents', {
        count: agentList.length,
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (error instanceof Error && error.message?.includes('DATABASE_URL')) {
        throw new Error("Database configuration error: DATABASE_URL environment variable is not properly set.");
      }
      throw error;
    }
  }

  /**
   * Get all executions ordered by creation date (newest first)
   */
  async getAllExecutions(): Promise<Execution[]> {
    try {
      const db = await getDb();
      const result = await db.select().from(executions).orderBy(desc(executions.createdAt));
      return result;
    } catch (error) {
      logger.error('Failed to get all executions', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (error instanceof Error && error.message?.includes('DATABASE_URL')) {
        throw new Error("Database configuration error: DATABASE_URL environment variable is not properly set.");
      }
      throw error;
    }
  }

  /**
   * Get a specific execution by ID
   */
  async getExecution(id: string): Promise<Execution | undefined> {
    try {
      const db = await getDb();
      const result = await db.select().from(executions).where(eq(executions.id, id));
      return result[0];
    } catch (error) {
      logger.error('Failed to get execution', {
        executionId: id,
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (error instanceof Error && error.message?.includes('DATABASE_URL')) {
        throw new Error("Database configuration error: DATABASE_URL environment variable is not properly set.");
      }
      throw error;
    }
  }

  /**
   * Create a new execution
   */
  async createExecution(insertExecution: InsertExecution): Promise<Execution> {
    try {
      const db = await getDb();
      const result = await db.insert(executions).values(insertExecution).returning();
      
      if (!result || result.length === 0) {
        throw new Error("Failed to create execution: No result returned from database");
      }
      
      logger.info('Execution created successfully', {
        executionId: result[0].id,
        agentId: insertExecution.agentId
      });
      
      return result[0];
    } catch (error) {
      logger.error('Failed to create execution', {
        agentId: insertExecution.agentId,
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (error instanceof Error && error.message?.includes('DATABASE_URL')) {
        throw new Error("Database configuration error: DATABASE_URL environment variable is not properly set.");
      }
      throw error;
    }
  }

  /**
   * Update an existing execution
   */
  async updateExecution(id: string, updates: Partial<Execution>): Promise<Execution | undefined> {
    try {
      const db = await getDb();
      const result = await db.update(executions)
        .set(updates)
        .where(eq(executions.id, id))
        .returning();
      
      if (result.length > 0) {
        logger.info('Execution updated successfully', {
          executionId: id,
          status: updates.status
        });
        return result[0];
      }
      
      logger.warn('Execution not found for update', { executionId: id });
      return undefined;
    } catch (error) {
      logger.error('Failed to update execution', {
        executionId: id,
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (error instanceof Error && error.message?.includes('DATABASE_URL')) {
        throw new Error("Database configuration error: DATABASE_URL environment variable is not properly set.");
      }
      throw error;
    }
  }

  /**
   * Clean up executions that have been stuck in "running" state for too long
   * 
   * @param timeoutMinutes Number of minutes after which an execution is considered stuck (default: 10)
   * @returns Number of executions cleaned up
   */
  async cleanupStuckExecutions(timeoutMinutes: number = 10): Promise<number> {
    try {
      const db = await getDb();
      
      // Calculate the cutoff time
      const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);
      
      // Find and update stuck executions
      const result = await db.update(executions)
        .set({
          status: 'failed',
          result: `Execution timed out after ${timeoutMinutes} minutes and was automatically cleaned up`
        })
        .where(sql`${executions.status} = 'running' AND ${executions.createdAt} < ${cutoffTime}`)
        .returning();
      
      if (result.length > 0) {
        logger.warn('Cleaned up stuck executions', {
          count: result.length,
          timeoutMinutes,
          executionIds: result.map(e => e.id)
        });
      }
      
      return result.length;
    } catch (error) {
      logger.error('Failed to cleanup stuck executions', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (error instanceof Error && error.message?.includes('DATABASE_URL')) {
        throw new Error("Database configuration error: DATABASE_URL environment variable is not properly set.");
      }
      throw error;
    }
  }
}

// Create an instance of the storage class
const databaseStorage = new DatabaseStorage();

// Initialize the database connection when the module is imported
// This ensures the connection is established before the first query
(async () => {
  try {
    await databaseStorage.initialize();
  } catch (error) {
    // Log the error but don't prevent the app from starting
    // The app will attempt to reconnect on the first database operation
    logger.error('Failed to initialize database on startup', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
})();

// Register shutdown handler for graceful shutdown
process.on('SIGINT', async () => {
  try {
    logger.info('Shutting down database connections...');
    await databaseStorage.shutdown();
  } catch (error) {
    logger.error('Error during database shutdown', {
      error: error instanceof Error ? error.message : String(error)
    });
  } finally {
    process.exit(0);
  }
});

export const storage = databaseStorage;
