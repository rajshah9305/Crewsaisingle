// This file is a basic test for the Gemini API integration
// It can be run with `node --loader tsx server/gemini.test.ts`

// We need to mock the Google Generative AI module before importing our module
jest.mock("@google/genai", () => {
  // Mock implementation
  return {
    GoogleGenAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockImplementation(() => {
          return {
            generateContent: jest.fn().mockImplementation((prompt) => {
              return Promise.resolve({
                response: {
                  text: () => `Mocked response for: ${prompt.substring(0, 20)}...`,
                }
              });
            }),
          };
        }),
      };
    }),
  };
});

// Now import the module that uses the mocked dependency
import { executeAgentTask } from "./gemini";

async function runTest() {
  try {
    console.log("Running Gemini API test...");
    
    const agentName = "Test Agent";
    const role = "Test Role";
    const goal = "Test the system";
    const backstory = "I am a test agent";
    const tasks = ["Task 1", "Task 2"];
    
    const result = await executeAgentTask(agentName, role, goal, backstory, tasks);
    console.log("Test result:", result);
    console.log("✅ Test completed successfully");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Only run the test if this file is executed directly (not imported)
if (require.main === module) {
  runTest();
}

export {}; // Make this a module
