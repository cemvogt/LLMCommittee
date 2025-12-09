import { LLMConfig } from './types';

// Default LLM Committee configuration
// You can customize this to include your preferred models
export const DEFAULT_COMMITTEE: LLMConfig[] = [
  {
    id: 'gpt4-turbo',
    name: 'GPT-4 Turbo',
    model: 'openai/gpt-4-turbo',
  },
  {
    id: 'claude-sonnet',
    name: 'Claude 3.5 Sonnet',
    model: 'anthropic/claude-3.5-sonnet-20241022',
    isChairman: true, // Default chairman
  },
  {
    id: 'gemini-flash',
    name: 'Gemini 2.5 Flash',
    model: 'google/gemini-2.5-flash',
  },
  {
    id: 'llama-70b',
    name: 'Llama 3.1 70B',
    model: 'meta-llama/llama-3.1-70b-instruct',
  },
  {
    id: 'grok-beta',
    name: 'Grok Beta',
    model: 'x-ai/grok-beta',
  },
];

// Get the chairman from the committee
export function getChairman(committee: LLMConfig[]): LLMConfig {
  const chairman = committee.find(c => c.isChairman);
  if (!chairman) {
    throw new Error('No chairman designated in committee configuration');
  }
  return chairman;
}

// Validate that the committee has at least 2 members and a chairman
export function validateCommittee(committee: LLMConfig[]): void {
  if (committee.length < 2) {
    throw new Error('Committee must have at least 2 members');
  }

  const chairmen = committee.filter(c => c.isChairman);
  if (chairmen.length === 0) {
    throw new Error('Committee must have a designated chairman');
  }
  if (chairmen.length > 1) {
    throw new Error('Committee can only have one chairman');
  }
}
