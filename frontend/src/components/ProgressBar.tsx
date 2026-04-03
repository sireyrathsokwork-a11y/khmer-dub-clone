import { type PipelineStatus } from '../types';

interface ProgressBarProps {
  status: PipelineStatus | null;
}

const steps: { key: PipelineStatus; label: string }[] = [
  { key: 'extracting', label: 'Fetching Video' },
  { key: 'transcribing', label: 'Transcribing' },
  { key: 'translating', label: 'Translating' },
  { key: 'generating_audio', label: 'Generating Voice' },
  { key: 'merging', label: 'Creating Video' },
];

const stepOrder = steps.map((s) => s.key);

export default function ProgressBar({ status }: ProgressBarProps) {
  const currentIndex = stepOrder.indexOf(status);

  return (
    <section className="px-4 py-10">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.key} className="flex flex-1 items-center">
              {/* Step node */}
              <div className="flex flex-col items-center gap-2">
                {isActive ? (
                  <div className="relative h-10 w-10">
                    <div
                      className="absolute -inset-0.5 animate-spin rounded-full"
                      style={{
                        background:
                          'conic-gradient(#2dd4bf 0deg, transparent 200deg)',
                        animationDuration: '1.2s',
                        animationTimingFunction: 'linear',
                      }}
                    />
                    <div className="absolute inset-0.5 rounded-full bg-gray-950" />
                    <div className="absolute inset-0 z-10 flex items-center justify-center text-sm font-medium text-teal-400">
                      {index + 1}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all
                      ${isCompleted ? 'border-teal-500 bg-teal-500 text-black' : ''}
                      ${!isCompleted && !isActive ? 'border-gray-700 text-gray-600' : ''}
                    `}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                )}

                <span
                  className={`text-xs ${
                    isActive
                      ? 'text-teal-400'
                      : isCompleted
                        ? 'text-teal-500'
                        : 'text-gray-600'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line — skip after last step */}
              {!isLast && (
                <div className="relative mx-2 mb-5 h-0.5 flex-1 overflow-hidden rounded-full bg-gray-800">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all duration-700"
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
