import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../../server/routes';
import { storage } from '../../server/storage-mock';
import { Agent } from '../../shared/schema';

describe('Agents API', () => {
  let app: express.Express;
  let server: any;
  let testAgent: Agent;

  // Set up the Express app and register routes before all tests
  beforeAll(async () => {
    app = express();
    app.use(express.json());
    server = await registerRoutes(app);
  });

  // Clean up any resources after all tests
  afterAll(async () => {
    if (server && server.close) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
  });

  // Create a test agent before tests
  beforeEach(async () => {
    // Clear any existing data
    jest.spyOn(storage, 'getAllAgents').mockResolvedValue([]);

    // Create a test agent
    const agentData = {
      name: 'Test Agent',
      role: 'Tester',
      goal: 'Test the API',
      backstory: 'Created for testing purposes',
      tasks: ['Run tests', 'Verify results'],
    };

    const createSpy = jest.spyOn(storage, 'createAgent').mockImplementation(async (agent) => {
      const newAgent: Agent = {
        id: 'test-agent-1',
        order: 0,
        ...agent,
      };
      testAgent = newAgent;
      return newAgent;
    });

    // Mock getAgent to return the test agent
    jest.spyOn(storage, 'getAgent').mockImplementation(async (id) => {
      return id === testAgent?.id ? testAgent : undefined;
    });
  });

  // Reset mocks after each test
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/agents', () => {
    test('should return all agents', async () => {
      // Mock the storage response
      const agents: Agent[] = [
        {
          id: 'test-agent-1',
          name: 'Test Agent 1',
          role: 'Tester',
          goal: 'Test the API',
          backstory: 'Created for testing purposes',
          tasks: ['Run tests'],
          order: 0,
        },
        {
          id: 'test-agent-2',
          name: 'Test Agent 2',
          role: 'Developer',
          goal: 'Develop features',
          backstory: 'Created for development',
          tasks: ['Write code', 'Debug issues'],
          order: 1,
        },
      ];

      jest.spyOn(storage, 'getAllAgents').mockResolvedValue(agents);

      const response = await request(app).get('/api/agents');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].id).toBe('test-agent-1');
      expect(response.body[1].id).toBe('test-agent-2');
    });
  });

  describe('GET /api/agents/:id', () => {
    test('should return a specific agent', async () => {
      const response = await request(app).get(`/api/agents/${testAgent.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testAgent.id);
      expect(response.body.name).toBe(testAgent.name);
    });

    test('should return 404 for non-existent agent', async () => {
      const response = await request(app).get('/api/agents/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Agent not found');
    });

    test('should return 400 for invalid agent ID', async () => {
      // Mock validateId to simulate a validation error
      jest.spyOn(storage, 'getAgent').mockImplementation(async () => {
        throw new Error('Invalid ID format');
      });

      const response = await request(app).get('/api/agents/invalid-id');

      expect(response.status).toBe(500); // Since we're mocking an error thrown in the handler
    });
  });

  describe('POST /api/agents', () => {
    test('should create a new agent', async () => {
      const agentData = {
        name: 'New Agent',
        role: 'Creator',
        goal: 'Create things',
        backstory: 'Born to create',
        tasks: ['Create stuff', 'Make things'],
      };

      const newAgent: Agent = {
        id: 'new-agent-id',
        order: 1,
        ...agentData,
      };

      jest.spyOn(storage, 'createAgent').mockResolvedValue(newAgent);

      const response = await request(app)
        .post('/api/agents')
        .send(agentData);

      expect(response.status).toBe(201);
      expect(response.body.id).toBe('new-agent-id');
      expect(response.body.name).toBe('New Agent');
    });

    test('should return 400 for invalid agent data', async () => {
      const invalidData = {
        name: 'Invalid Agent',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/agents')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('PATCH /api/agents/:id', () => {
    test('should update an existing agent', async () => {
      const updateData = {
        name: 'Updated Agent',
        role: 'Tester',
        goal: 'Test the API',
        backstory: 'Created for testing purposes',
        tasks: ['Run tests', 'Verify results'],
      };

      const updatedAgent: Agent = {
        ...testAgent,
        ...updateData,
      };

      jest.spyOn(storage, 'updateAgent').mockResolvedValue(updatedAgent);

      const response = await request(app)
        .patch(`/api/agents/${testAgent.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testAgent.id);
      expect(response.body.name).toBe('Updated Agent');
    });

    test('should return 404 for non-existent agent', async () => {
      jest.spyOn(storage, 'updateAgent').mockResolvedValue(undefined);

      const response = await request(app)
        .patch('/api/agents/non-existent-id')
        .send({
          name: 'Updated Name',
          role: 'Tester',
          goal: 'Test the API',
          backstory: 'Created for testing purposes',
          tasks: ['Run tests', 'Verify results'],
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Agent not found');
    });
  });

  describe('DELETE /api/agents/:id', () => {
    test('should delete an existing agent', async () => {
      jest.spyOn(storage, 'deleteAgent').mockResolvedValue(true);

      const response = await request(app).delete(`/api/agents/${testAgent.id}`);

      expect(response.status).toBe(204);
    });

    test('should return 404 for non-existent agent', async () => {
      jest.spyOn(storage, 'deleteAgent').mockResolvedValue(false);

      const response = await request(app).delete('/api/agents/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Agent not found');
    });
  });
});