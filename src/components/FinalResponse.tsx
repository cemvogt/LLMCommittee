'use client';

interface FinalResponseProps {
  response: string;
  chairmanName: string;
}

export default function FinalResponse({ response, chairmanName }: FinalResponseProps) {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg shadow-lg border-2 border-primary-200 p-6">
      <div className="flex items-center space-x-2 mb-4">
        <svg
          className="w-6 h-6 text-primary-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-lg font-bold text-gray-900">Committee Final Answer</h2>
        <span className="text-sm text-gray-600">by {chairmanName}</span>
      </div>

      <div className="prose max-w-none">
        <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">{response}</div>
      </div>
    </div>
  );
}
