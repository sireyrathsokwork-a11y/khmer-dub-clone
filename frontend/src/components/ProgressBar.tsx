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

export default function ProgressBar({ status }: ProgressBarProps) {
  const currentIndex = stepOrder.indexOf(status);

  return (
    <section className="px-4 py-10">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center gap-2">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all
                ${isCompleted ? 'border-teal-500 bg-teal-500 text-black' : ''}
                ${isActive ? 'border-teal-400 bg-teal-400/20 text-teal-400' : ''}
                ${!isCompleted && !isActive ? 'border-gray-700 text-gray-600' : ''}
              `}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span
                className={`text-xs ${isActive ? 'text-teal-400' : isCompleted ? 'text-teal-500' : 'text-gray-600'}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
