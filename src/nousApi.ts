// nousApi.ts
import axios from "axios";

const API_URL = "https://inference-api.nousresearch.com/v1/chat/completions";
const MODEL = "Hermes-3-Llama-3.1-70B"; // Default model

// Function to validate API key with a test request
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    };

    const data = {
      model: MODEL,
      messages: [
        { role: "user", content: "Hello, this is a test message to validate the API key." }
      ],
      max_tokens: 5
    };

    await axios.post(API_URL, data, { headers });
    return true;
  } catch (error) {
    console.error("API key validation failed:", error);
    return false;
  }
};

// Function to get story progression
export const getStoryProgress = async (
  prompt: string,
  apiKey: string
): Promise<any> => {
  try {
    const headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    };

    const data = {
      model: MODEL,
      messages: [
        { role: "system", content: "JSON" },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    const response = await axios.post(API_URL, data, { headers });
    const content = response.data.choices[0].message.content;
    
    try {
      // Try to parse as JSON
      return JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      // Return raw content if parsing fails
      return { error: "Failed to parse response", rawContent: content };
    }
  } catch (error) {
    console.error("Error in getStoryProgress:", error);
    throw error;
  }
};

// Function with reasoning mode enabled (using the DeepHermes model instead)
export const getStoryWithReasoning = async (
  prompt: string,
  apiKey: string
): Promise<any> => {
  try {
    const headers = {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    };

    const reasoningModel = "DeepHermes-3-Mistral-24B-Preview"; // Using the reasoning model
    
    const data = {
      model: reasoningModel,
      messages: [
        { 
          role: "system", 
          content: "You are a deep thinking AI, you may use extremely long chains of thought to deeply consider the problem and deliberate with yourself via systematic reasoning processes to help come to a correct solution prior to answering. You should enclose your thoughts and internal monologue inside <think> </think> tags, and then provide your solution or response to the problem in JSON format." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    };

    const response = await axios.post(API_URL, data, { headers });
    const content = response.data.choices[0].message.content;
    
    // Extract JSON from the response (outside the <think> tags)
    const jsonMatch = content.match(/<think>[\s\S]*?<\/think>([\s\S]*)/);
    const jsonContent = jsonMatch ? jsonMatch[1].trim() : content;
    
    try {
      // Try to parse as JSON
      return JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      // Return raw content if parsing fails
      return { error: "Failed to parse response", rawContent: content };
    }
  } catch (error) {
    console.error("Error in getStoryWithReasoning:", error);
    throw error;
  }
};

export default {
  validateApiKey,
  getStoryProgress,
  getStoryWithReasoning
};