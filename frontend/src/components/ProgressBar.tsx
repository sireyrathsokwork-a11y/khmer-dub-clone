import { type PipelineStatus } from '../types';

interface ProgressBarProps {
  status: PipelineStatus;
}

const steps: { key: PipelineStatus; label: string }[] = [
  { key: 'extracting', label: 'Fetching Video' },
  { key: 'transcribing', label: 'Transcribing' },
  { key: 'translating', label: 'Translating' },
  { key: 'generating_audio', label: 'Generating Voice' },
  { key: 'merging', label: 'Creating Video' },
];

const stepOrder = steps.map((s) => s.key);

function SpinnerNode({ index }: { index: number }) {
  return (
    <div className="relative h-8 w-8 shrink-0 md:h-10 md:w-10">
      <div
        className="absolute -inset-0.5 animate-spin rounded-full"
        style={{
          background: 'conic-gradient(#2dd4bf 0deg, transparent 200deg)',
          animationDuration: '1.2s',
          animationTimingFunction: 'linear',
        }}
      />
      <div className="absolute inset-0.5 rounded-full bg-gray-950" />
      <div className="absolute inset-0 z-10 flex items-center justify-center text-xs font-medium text-teal-400 md:text-sm">
        {index + 1}
      </div>
    </div>
  );
}

export default function ProgressBar({ status }: ProgressBarProps) {
  const currentIndex = stepOrder.indexOf(status);

  return (
    <section className="px-4 py-8">
      {/* ── Mobile: vertical stepper (hidden on md+) ── */}
      <ol className="flex flex-col md:hidden" aria-label="Pipeline progress">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isLast = index === steps.length - 1;

          return (
            <li key={step.key} className="flex flex-col">
              {/* Node + label grouped as one centered row */}
              <div className="flex items-center gap-3">
                {isActive ? (
                  <SpinnerNode index={-1} />
                ) : (
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium transition-all
                      ${
                        isCompleted
                          ? 'border-teal-500 bg-teal-500 text-black'
                          : 'border-gray-700 text-gray-600'
                      }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                )}

                <span
                  className={`text-sm font-medium
                    ${isActive ? 'text-teal-400' : ''}
                    ${isCompleted ? 'text-teal-500' : ''}
                    ${!isActive && !isCompleted ? 'text-gray-600' : ''}
                  `}
                >
                  {step.label}
                  {isActive && (
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      In progress…
                    </span>
                  )}
                </span>
              </div>

              {/* Connector sits between rows, aligned under node center */}
              {!isLast && (
                <div className="relative my-1 ml-[15px] w-0.5 min-h-7 overflow-hidden bg-gray-800">
                  <div
                    className="absolute inset-0 bg-teal-500 transition-all duration-700"
                    style={{ opacity: isCompleted ? 1 : 0 }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* ── Desktop: horizontal stepper (hidden below md) ── */}
      <ol
        className="mx-auto hidden max-w-3xl items-center justify-between md:flex"
        aria-label="Pipeline progress"
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isLast = index === steps.length - 1;

          return (
            <li key={step.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                {isActive ? (
                  <SpinnerNode index={index} />
                ) : (
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-all
                      ${
                        isCompleted
                          ? 'border-teal-500 bg-teal-500 text-black'
                          : 'border-gray-700 text-gray-600'
                      }`}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                )}
                <span
                  className={`text-xs
                    ${isActive ? 'text-teal-400' : ''}
                    ${isCompleted ? 'text-teal-500' : ''}
                    ${!isActive && !isCompleted ? 'text-gray-600' : ''}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div className="relative mx-2 mb-5 h-0.5 flex-1 overflow-hidden rounded-full bg-gray-800">
                  <div
                    className="h-full rounded-full bg-teal-500 transition-all duration-700"
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
