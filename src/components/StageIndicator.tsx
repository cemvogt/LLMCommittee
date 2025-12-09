'use client';

interface StageIndicatorProps {
  currentStage: 1 | 2 | 3;
}

export default function StageIndicator({ currentStage }: StageIndicatorProps) {
  const stages = [
    {
      number: 1,
      title: 'First Opinions',
      description: 'Collecting responses from all committee members...',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      ),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      number: 2,
      title: 'Peer Review',
      description: 'Committee members reviewing and ranking responses...',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      ),
      color: 'from-purple-500 to-pink-500',
    },
    {
      number: 3,
      title: 'Final Response',
      description: 'Chairman compiling the final answer...',
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      color: 'from-emerald-500 to-green-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Loading Animation */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-primary-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-600">{currentStage}</span>
          </div>
        </div>
      </div>

      {/* Progress Text */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {stages[currentStage - 1].title}
        </h3>
        <p className="text-sm text-gray-600">
          {stages[currentStage - 1].description}
        </p>
      </div>

      {/* Stage Cards */}
      <div className="grid gap-4">
        {stages.map((stage) => {
          const isActive = stage.number === currentStage;
          const isCompleted = stage.number < currentStage;

          return (
            <div
              key={stage.number}
              className={`relative flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-primary-50 to-blue-50 border-primary-300 shadow-lg scale-105'
                  : isCompleted
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              {/* Stage Icon */}
              <div
                className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg ${
                  isCompleted
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                    : isActive
                    ? `bg-gradient-to-br ${stage.color}`
                    : 'bg-gray-400'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {stage.icon}
                  </svg>
                )}
              </div>

              {/* Stage Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-base font-bold text-gray-900">{stage.title}</h4>
                  {isActive && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-600 text-white animate-pulse">
                      In Progress
                    </span>
                  )}
                  {isCompleted && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-600 text-white">
                      ✓ Completed
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{stage.description}</p>
              </div>

              {/* Stage Number Badge */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
                  isCompleted
                    ? 'bg-green-100 text-green-700'
                    : isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stage.number}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
