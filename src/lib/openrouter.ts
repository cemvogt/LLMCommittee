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
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const errorMessage = axiosError.response?.data
          ? JSON.stringify(axiosError.response.data)
          : axiosError.message;
        throw new Error(`OpenRouter API error: ${errorMessage}`);
      }
      throw error;
    }
  }

  async getModelResponse(model: string, messages: Array<{ role: string; content: string }>): Promise<string> {
    const request: OpenRouterRequest = {
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    };

    const response = await this.chat(request);

    if (!response.choices || response.choices.length === 0) {
      throw new Error('No response from model');
    }

    return response.choices[0].message.content;
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
