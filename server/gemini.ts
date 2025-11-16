// Import the Google Generative AI SDK
// Corrected package name: "@google/generative-ai"
// Corrected class name: "GoogleGenerativeAI"
import { GoogleGenerativeAI } from "@google/generative-ai";

// Get API key from environment variable
const apiKey = process.env.GOOGLE_API_KEY || "";

if (!apiKey) {
  console.warn("Warning: GOOGLE_API_KEY environment variable is not set");
}

// Initialize the Google Generative AI client
// Corrected class name: "GoogleGenerativeAI"
const genAI = new GoogleGenerativeAI(apiKey);

export async function executeAgentTask(
  agentName: string,
  role: string,
  goal: string,
  backstory: string,
  tasks: string[]
): Promise<string> {
  // Validate inputs
  if (!tasks || tasks.length === 0) {
    throw new Error("No tasks provided for agent execution.");
  }

  if (!apiKey || apiKey === "your_google_api_key_here") {
    throw new Error("GOOGLE_API_KEY is not configured. Please set it in your .env file.");
  }

  // Filter out any empty tasks
  const validTasks = tasks.filter(task => task && task.trim().length > 0);
  if (validTasks.length === 0) {
    throw new Error("No valid tasks provided for agent execution.");
  }

  try {
    // Construct the prompt
    const prompt = `You are ${agentName}, a ${role}.

Background: ${backstory}

Your Goal: ${goal}

You have been assigned the following tasks to complete:
${validTasks.map((task, idx) => `${idx + 1}. ${task}`).join('\n')}

Please execute these tasks thoroughly and provide detailed results for each one. Structure your response clearly, showing your work for each task.`;

    // Get the specific model from the genAI instance
    // Using stable Gemini 2.0 Flash model for reliable performance
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Call generateContent on the model instance with the prompt string
    const result = await model.generateContent(prompt);

    // Parse the response correctly
    const response = result.response;
    const text = response.text();
    
    if (!text || text.trim().length === 0) {
      throw new Error("Gemini API returned an empty response.");
    }
    
    return text;
  } catch (error) {
    console.error("Gemini API error:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      // Check for common API errors
      if (error.message.includes("API key")) {
        throw new Error("Invalid or missing Google API key. Please check your GOOGLE_API_KEY environment variable.");
      }
      if (error.message.includes("quota")) {
        throw new Error("Google API quota exceeded. Please check your API usage limits.");
      }
      if (error.message.includes("model")) {
        throw new Error("Invalid model specified or model not available. Please check the Gemini model name.");
      }
      
      throw new Error(`Gemini execution failed: ${error.message}`);
    }
    
    throw new Error("Gemini execution failed with an unknown error.");
  }
}
