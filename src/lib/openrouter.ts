import axios, { AxiosError } from 'axios';
import { OpenRouterRequest, OpenRouterResponse } from './types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export class OpenRouterClient {
  private apiKey: string;
  private siteUrl: string;
  private siteName: string;

  constructor(apiKey?: string, siteUrl?: string, siteName?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
    this.siteUrl = siteUrl || process.env.OPENROUTER_SITE_URL || 'http://localhost:3000';
    this.siteName = siteName || process.env.OPENROUTER_SITE_NAME || 'LLM Committee';

    if (!this.apiKey) {
      throw new Error('OpenRouter API key is required');
    }
  }

  async chat(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    try {
      const response = await axios.post<OpenRouterResponse>(
        OPENROUTER_API_URL,
        request,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': this.siteUrl,
            'X-Title': this.siteName,
            'Content-Type': 'application/json',
          },
          timeout: 120000, // 2 minutes timeout for slow models
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        // Check if it's a timeout error
        if (axiosError.code === 'ECONNABORTED') {
          throw new Error(`Request timeout after 120 seconds`);
        }

        const errorMessage = axiosError.response?.data
          ? JSON.stringify(axiosError.response.data)
          : axiosError.message;
        throw new Error(`OpenRouter API error: ${errorMessage}`);
      }
      throw error;
    }
  }

  async getModelResponse(model: string, messages: Array<{ role: string; content: string }>, retries = 2): Promise<string> {
    const request: OpenRouterRequest = {
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4000, // Increased for longer responses
    };

    let lastError: Error | null = null;

    // Retry logic for transient failures
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.chat(request);

        if (!response.choices || response.choices.length === 0) {
          throw new Error(`No response from model ${model}`);
        }

        const content = response.choices[0].message.content;

        // Validate content is not empty
        if (!content || content.trim().length === 0) {
          throw new Error(`Empty response from model ${model}`);
        }

        return content;
      } catch (error) {
        lastError = error as Error;

        // If it's the last retry, throw the error
        if (attempt === retries) {
          break;
        }

        // Wait before retrying (exponential backoff: 1s, 2s, 4s)
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Retry ${attempt + 1}/${retries} for model ${model} after ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // If we got here, all retries failed
    throw lastError || new Error(`Failed to get response from model ${model}`);
  }
}

// Singleton instance
let openRouterClient: OpenRouterClient | null = null;

export function getOpenRouterClient(): OpenRouterClient {
  if (!openRouterClient) {
    openRouterClient = new OpenRouterClient();
  }
  return openRouterClient;
}
