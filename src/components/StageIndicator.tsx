'use client';

interface StageIndicatorProps {
  currentStage: 1 | 2 | 3;
}

export default function StageIndicator({ currentStage }: StageIndicatorProps) {
  const stages = [
    {
      number: 1,
      title: 'First Opinions',
      description: 'Collecting responses from all council members...',
    },
    {
      number: 2,
      title: 'Peer Review',
      description: 'Council members reviewing and ranking responses...',
    },
    {
      number: 3,
      title: 'Final Response',
      description: 'Chairman compiling the final answer...',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center mb-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <div className="space-y-4">
        {stages.map((stage) => (
          <div
            key={stage.number}
            className={`flex items-start space-x-4 transition-opacity ${
              stage.number === currentStage ? 'opacity-100' : 'opacity-40'
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                stage.number === currentStage
                  ? 'bg-primary-600 text-white'
                  : stage.number < currentStage
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {stage.number < currentStage ? '✓' : stage.number}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{stage.title}</p>
              <p className="text-sm text-gray-600">{stage.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
