'use client';

import { useState } from 'react';
import { CommitteeResponse } from '@/lib/types';
import ResponseTabs from './ResponseTabs';
import StageIndicator from './StageIndicator';
import FinalResponse from './FinalResponse';

export default function ChatInterface() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CommitteeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setCurrentStage(1);

    try {
      const response = await fetch('/api/committee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get committee response');
      }

      const data = await response.json();

      // Simulate stage progression for better UX
      setCurrentStage(2);
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentStage(3);
      await new Promise(resolve => setTimeout(resolve, 500));

      setResult(data);
      setCurrentStage(null);
    } catch (err) {
      setError((err as Error).message);
      setCurrentStage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">LLM Committee</h1>
        <p className="text-sm text-gray-600 mt-1">
          Multiple AI models collaborate to provide the best answer
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Show results if available */}
          {result && (
            <div className="space-y-6 mb-8">
              {/* User Query */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm font-semibold text-gray-500 mb-2">YOUR QUESTION</div>
                <div className="text-gray-900">{result.query}</div>
              </div>

              {/* Final Response */}
              {result.stage3.status === 'completed' && (
                <FinalResponse
                  response={result.stage3.finalResponse}
                  chairmanName={result.stage3.chairmanName}
                />
              )}

              {/* Individual Responses */}
              {result.stage1.status === 'completed' && result.stage1.responses.length > 0 && (
                <ResponseTabs
                  responses={result.stage1.responses}
                  reviews={result.stage2.reviews}
                />
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && currentStage && (
            <div className="bg-white rounded-lg shadow p-8 mb-8">
              <StageIndicator currentStage={currentStage} />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="flex gap-4">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask your question to the LLM Committee..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
