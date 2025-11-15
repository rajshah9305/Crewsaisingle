// Import the Google Generative AI SDK
import { GoogleGenAI } from "@google/genai";

// Get API key from environment variable
const apiKey = process.env.GOOGLE_API_KEY || "";

if (!apiKey) {
  console.warn("Warning: GOOGLE_API_KEY environment variable is not set");
}

// Initialize with the API key
const ai = new GoogleGenAI({ apiKey });

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

    // FIX: Use correct API method with proper structure
    // Model: gemini-2.5-preview-05-20 (April 17th, 2025)
    const response = await ai.models.generateContent({
      model: 'models/gemini-2.5-flash-preview-05-20',
      contents: prompt
    });
    const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    
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
