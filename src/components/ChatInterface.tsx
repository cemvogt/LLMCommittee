'use client';

import { useState, useEffect } from 'react';
import { CommitteeResponse } from '@/lib/types';
import ResponseTabs from './ResponseTabs';
import StageIndicator from './StageIndicator';
import FinalResponse from './FinalResponse';
import ConversationHistory from './ConversationHistory';

const STORAGE_KEY = 'llm-committee-conversations';

export default function ChatInterface() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CommitteeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3 | null>(null);
  const [conversations, setConversations] = useState<CommitteeResponse[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConversations(parsed);
      } catch (e) {
        console.error('Failed to parse stored conversations:', e);
      }
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations]);

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

      // Add to conversations history
      const newConversations = [data, ...conversations];
      setConversations(newConversations);
      setCurrentConversationId(data.timestamp.toString());
      setQuery(''); // Clear input after successful submission
    } catch (err) {
      setError((err as Error).message);
      setCurrentStage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    const conversation = conversations.find(c => c.timestamp.toString() === id);
    if (conversation) {
      setResult(conversation);
      setCurrentConversationId(id);
      setError(null);
    }
  };

  const handleNewConversation = () => {
    setResult(null);
    setCurrentConversationId(null);
    setError(null);
    setQuery('');
  };

  const handleDeleteConversation = (id: string) => {
    const newConversations = conversations.filter(c => c.timestamp.toString() !== id);
    setConversations(newConversations);

    if (id === currentConversationId) {
      handleNewConversation();
    }

    // Update localStorage
    if (newConversations.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConversations));
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      {sidebarOpen && (
        <ConversationHistory
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                LLM Committee
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Multiple AI models collaborate to provide the best answer
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Message */}
            {!result && !loading && !error && (
              <div className="text-center py-16 px-4">
                <div className="mb-8 flex justify-center">
                  <img
                    src="/committee-hero.png"
                    alt="LLM Committee - AI models collaborating"
                    className="rounded-2xl shadow-2xl max-w-3xl w-full"
                  />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to LLM Committee
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Ask any question and watch as multiple AI models collaborate, review each other's work,
                  and synthesize their insights into a comprehensive answer.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="text-primary-600 mb-3">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Stage 1: First Opinions</h3>
                    <p className="text-sm text-gray-600">All models provide independent responses</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="text-blue-600 mb-3">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Stage 2: Peer Review</h3>
                    <p className="text-sm text-gray-600">Models rank each other anonymously</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="text-green-600 mb-3">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Stage 3: Final Answer</h3>
                    <p className="text-sm text-gray-600">Chairman synthesizes everything</p>
                  </div>
                </div>
              </div>
            )}

            {/* Show results if available */}
            {result && (
              <div className="space-y-6 mb-8 animate-fadeIn">
                {/* User Query */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Your Question</div>
                      <div className="text-gray-900 text-lg">{result.query}</div>
                    </div>
                  </div>
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
              <div className="bg-white rounded-xl shadow-lg p-12 mb-8 border border-gray-200">
                <StageIndicator currentStage={currentStage} />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-900 mb-1">Error</h3>
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
          <div className="max-w-6xl mx-auto">
            <form onSubmit={handleSubmit}>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask your question to the LLM Committee..."
                    className="w-full px-6 py-4 text-base border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Submit</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
