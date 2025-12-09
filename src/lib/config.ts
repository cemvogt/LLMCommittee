import { LLMConfig } from './types';

// Default LLM Council configuration
// You can customize this to include your preferred models
export const DEFAULT_COUNCIL: LLMConfig[] = [
  {
    id: 'gpt4-turbo',
    name: 'GPT-4 Turbo',
    model: 'openai/gpt-4-turbo',
  },
  {
    id: 'claude-sonnet',
    name: 'Claude 3.5 Sonnet',
    model: 'anthropic/claude-3.5-sonnet',
    isChairman: true, // Default chairman
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    model: 'google/gemini-pro',
  },
  {
    id: 'mixtral',
    name: 'Mixtral 8x7B',
    model: 'mistralai/mixtral-8x7b-instruct',
  },
];

// Get the chairman from the council
export function getChairman(council: LLMConfig[]): LLMConfig {
  const chairman = council.find(c => c.isChairman);
  if (!chairman) {
    throw new Error('No chairman designated in council configuration');
  }
  return chairman;
}

// Validate that the council has at least 2 members and a chairman
export function validateCouncil(council: LLMConfig[]): void {
  if (council.length < 2) {
    throw new Error('Council must have at least 2 members');
  }

  const chairmen = council.filter(c => c.isChairman);
  if (chairmen.length === 0) {
    throw new Error('Council must have a designated chairman');
  }
  if (chairmen.length > 1) {
    throw new Error('Council can only have one chairman');
  }
}
