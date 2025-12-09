'use client';

interface FinalResponseProps {
  response: string;
  chairmanName: string;
}

export default function FinalResponse({ response, chairmanName }: FinalResponseProps) {
  return (
    <div className="bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 rounded-2xl shadow-lg border-2 border-emerald-200 p-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-200/20 to-blue-200/20 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl -z-0" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg
              className="w-7 h-7 text-white"
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
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent">
              Committee Final Answer
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              Synthesized by <span className="font-semibold text-emerald-700">{chairmanName}</span>
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
              ✓ Verified
            </span>
          </div>
        </div>

        {/* Response Content */}
        <div className="prose prose-lg max-w-none">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {response}
          </div>
        </div>
      </div>
    </div>
  );
}
