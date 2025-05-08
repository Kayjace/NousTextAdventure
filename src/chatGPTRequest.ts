import axios, { AxiosResponse } from "axios";

// Define interfaces for better type management
interface NousRequestOptions {
  prompt: string;
  apiKey: string;
  model: string;
}

// Central request function
const request = async (
  prompt: string,
  apiKey: string,
  provider: string = "nous" // Add provider with default value
): Promise<string[]> => {
  // You can use the provider parameter to determine which API to use
  // For now, we're just using the Nous API
  return nousRequest(prompt, {
    prompt,
    apiKey,
    model: "Hermes-3-Llama-3.1-70B"
  });
};

// Nous API request function
async function nousRequest(
  prompt: string,
  { apiKey, model }: NousRequestOptions
): Promise<string[]> {
  const url = "https://inference-api.nousresearch.com/v1/chat/completions";
  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };

  const data = {
    model: model,
    messages: [
      { role: "system", content: "JSON" },
      { role: "user", content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1000
  };

  const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
  const defaultDelayMs = 5000; // Default delay of 5000 ms

  while (true) {
    try {
      const response: AxiosResponse = await axios.post(url, data, { headers });
      return [response.data.choices[0].message.content];
    } catch (error: any) {
      // Handle rate limiting errors
      if (error.response && error.response.status === 429) {
        console.error("Rate limit exceeded. Waiting before retrying...");
        await delay(defaultDelayMs);
      } else {
        console.error("Error occurred while making request:", error);
        throw error;
      }
    }
  }
}

export default request;