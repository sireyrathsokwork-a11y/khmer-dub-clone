import { type Transcript } from '../types';

interface TranscriptEditorProps {
  transcript: Transcript;
  onKhmerChange: (text: string) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export default function TranscriptEditor({
  transcript,
  onKhmerChange,
  onRegenerate,
  isRegenerating,
}: TranscriptEditorProps) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h2 className="mb-6 text-xl font-semibold text-white">Script Editor</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Original (English)
          </label>
          <textarea
            value={transcript.english}
            readOnly
            className="h-48 w-full rounded-lg border border-gray-700 bg-gray-900 p-4 text-sm text-gray-300 outline-none resize-none"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm text-gray-400">
            Khmer Translation
          </label>
          <textarea
            value={transcript.khmer}
            onChange={(e) => onKhmerChange(e.target.value)}
            className="h-48 w-full rounded-lg border border-gray-700 bg-gray-900 p-4 text-sm text-white outline-none resize-none focus:border-teal-500"
          />
        </div>
      </div>
      <button
        onClick={onRegenerate}
        disabled={isRegenerating}
        className="mt-4 flex items-center gap-2 rounded-lg border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-sm text-teal-400 transition hover:bg-teal-500/20 disabled:opacity-50"
      >
        {isRegenerating ? 'Regenerating...' : 'Regenerate Audio'}
      </button>
    </section>
  );
}
