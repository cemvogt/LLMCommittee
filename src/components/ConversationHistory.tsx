'use client';

import { CommitteeResponse } from '@/lib/types';

interface ConversationHistoryProps {
  conversations: CommitteeResponse[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

export default function ConversationHistory({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: ConversationHistoryProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const truncateQuery = (query: string, maxLength: number = 50) => {
    if (query.length <= maxLength) return query;
    return query.substring(0, maxLength) + '...';
  };

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col h-screen border-r border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onNewConversation}
          className="w-full bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Conversation
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {conversations.length === 0 ? (
          <div className="text-gray-400 text-sm text-center mt-8 px-4">
            No conversations yet. Start by asking a question!
          </div>
        ) : (
          conversations.map((conversation) => {
            const conversationId = conversation.timestamp.toString();
            const isActive = conversationId === currentConversationId;

            return (
              <div
                key={conversationId}
                className={`group relative rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-600/20 to-blue-600/20 border border-primary-500/50'
                    : 'bg-gray-800/50 hover:bg-gray-700/50 border border-transparent'
                }`}
              >
                <button
                  onClick={() => onSelectConversation(conversationId)}
                  className="w-full text-left p-3 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {truncateQuery(conversation.query)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(conversation.timestamp)}
                      </p>
                    </div>
                    {isActive && (
                      <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-1.5"></div>
                    )}
                  </div>
                </button>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversationId);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-red-600/0 hover:bg-red-600 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="Delete conversation"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          <p>LLM Committee</p>
          <p className="mt-1">AI Collaboration System</p>
        </div>
      </div>
    </div>
  );
}
