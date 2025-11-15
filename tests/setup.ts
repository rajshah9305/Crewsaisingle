// Test setup file
import dotenv from 'dotenv';

// Load environment variables from .env.test if it exists, otherwise from .env
try {
  dotenv.config({ path: '.env.test' });
} catch (error) {
  dotenv.config();
}

// Mock the database connection
jest.mock('../server/storage', () => {
  return {
    ...jest.requireActual('../server/storage-mock'),
  };
});

// Mock the Google API
jest.mock('@google/genai', () => {
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockImplementation(() => ({
        generateContent: jest.fn().mockImplementation((prompt) => 
          Promise.resolve({
            response: {
              text: () => `Mock response for: ${prompt}`,
            },
          })
        ),
      })),
    })),
  };
});

// Global test timeout
jest.setTimeout(10000);

// Global afterAll hook
afterAll(async () => {
  // Clean up resources if needed
});