// Core types for the LLM Council system

export interface LLMConfig {
  id: string;
  name: string;
  model: string; // OpenRouter model ID
  isChairman?: boolean;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LLMResponse {
  modelId: string;
  modelName: string;
  response: string;
  timestamp: number;
}

export interface RankingEntry {
  anonymousId: string; // e.g., "Response A", "Response B"
  rank: number;
  reasoning: string;
}

export interface ReviewResponse {
  reviewerId: string;
  reviewerName: string;
  rankings: RankingEntry[];
}

export interface CouncilStage {
  stage: 1 | 2 | 3;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  data?: any;
  error?: string;
}

export interface CouncilResponse {
  query: string;
  stage1: {
    status: 'pending' | 'in-progress' | 'completed' | 'error';
    responses: LLMResponse[];
  };
  stage2: {
    status: 'pending' | 'in-progress' | 'completed' | 'error';
    reviews: ReviewResponse[];
  };
  stage3: {
    status: 'pending' | 'in-progress' | 'completed' | 'error';
    finalResponse: string;
    chairmanId: string;
  };
  timestamp: number;
}

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
