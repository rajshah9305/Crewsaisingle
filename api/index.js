import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { agents, executions } from '../shared/schema.js';
import { eq, desc } from 'drizzle-orm';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'connected',
    environment: process.env.NODE_ENV || 'production',
    gemini: process.env.GOOGLE_API_KEY ? 'configured' : 'missing'
  });
});

// Get all agents
app.get('/api/agents', async (req, res) => {
  try {
    const result = await db.select().from(agents).orderBy(agents.order);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get agent by ID
app.get('/api/agents/:id', async (req, res) => {
  try {
    const result = await db.select().from(agents).where(eq(agents.id, req.params.id));
    if (!result[0]) return res.status(404).json({ error: 'Agent not found' });
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create agent
app.post('/api/agents', async (req, res) => {
  try {
    const allAgents = await db.select().from(agents);
    const order = allAgents.length;
    const result = await db.insert(agents).values({
      ...req.body,
      order
    }).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update agent
app.patch('/api/agents/:id', async (req, res) => {
  try {
    const result = await db.update(agents)
      .set(req.body)
      .where(eq(agents.id, req.params.id))
      .returning();
    if (!result[0]) return res.status(404).json({ error: 'Agent not found' });
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete agent
app.delete('/api/agents/:id', async (req, res) => {
  try {
    const result = await db.delete(agents).where(eq(agents.id, req.params.id)).returning();
    if (!result[0]) return res.status(404).json({ error: 'Agent not found' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reorder agents
app.patch('/api/agents/reorder', async (req, res) => {
  try {
    for (const agent of req.body.agents) {
      await db.update(agents).set({ order: agent.order }).where(eq(agents.id, agent.id));
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Execute agent
app.post('/api/agents/:id/execute', async (req, res) => {
  try {
    const agent = await db.select().from(agents).where(eq(agents.id, req.params.id));
    if (!agent[0]) return res.status(404).json({ error: 'Agent not found' });
    
    const execution = await db.insert(executions).values({
      agentId: agent[0].id,
      agentName: agent[0].name,
      status: 'running',
      result: null
    }).returning();
    
    res.status(202).json(execution[0]);
    
    // Execute in background
    (async () => {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const prompt = `You are ${agent[0].name}, a ${agent[0].role}.\n\nBackground: ${agent[0].backstory}\n\nYour Goal: ${agent[0].goal}\n\nTasks:\n${agent[0].tasks.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\nExecute these tasks and provide results.`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        await db.update(executions).set({ status: 'completed', result: text }).where(eq(executions.id, execution[0].id));
      } catch (error) {
        await db.update(executions).set({ status: 'failed', result: error.message }).where(eq(executions.id, execution[0].id));
      }
    })();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get executions
app.get('/api/executions', async (req, res) => {
  try {
    const result = await db.select().from(executions).orderBy(desc(executions.createdAt));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get execution by ID
app.get('/api/executions/:id', async (req, res) => {
  try {
    const result = await db.select().from(executions).where(eq(executions.id, req.params.id));
    if (!result[0]) return res.status(404).json({ error: 'Execution not found' });
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
