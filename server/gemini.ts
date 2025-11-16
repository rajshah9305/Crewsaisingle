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
  // No tasks check is good!
  if (!tasks || tasks.length === 0) {
    throw new Error("No tasks provided for agent execution.");
  }

  try {
    // Construct the prompt
    const prompt = `You are ${agentName}, a ${role}.

Background: ${backstory}

Your Goal: ${goal}

You have been assigned the following tasks to complete:
${tasks.map((task, idx) => `${idx + 1}. ${task}`).join('\n')}

Please execute these tasks thoroughly and provide detailed results for each one. Structure your response clearly, showing your work for each task.`;

    // Get the specific model from the genAI instance
    // This method will now be found on the corrected genAI object.
    // Switched to the model you provided.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

    // Call generateContent on the model instance with the prompt string
    const result = await model.generateContent(prompt);

    // Parse the response correctly
    const response = result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error("Gemini API returned an empty response.");
    }
    
    return text;
  } catch (error) {
    console.error("Gemini API error:", error);
    if (error instanceof Error) {
      throw new Error(`Gemini execution failed: ${error.message}`);
    }
    throw new Error("Gemini execution failed with an unknown error.");
  }
}
