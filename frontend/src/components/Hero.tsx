import { useState } from 'react';

interface HeroProps {
  onSubmit: (youtubeUrl: string) => void;
  isProcessing: boolean;
}

const FITS_IN_3_MINS = [
  { icon: '📣', label: 'Short explainers', desc: 'Quick how-it-works clips' },
  { icon: '🎙️', label: 'Video intros', desc: 'Channel or product intros' },
  { icon: '📱', label: 'Social clips', desc: 'Reels, shorts, highlights' },
];

const TRUST_SIGNALS = [
  'No account needed',
  'Any public YouTube video',
  'Ready in minutes',
  'Free to try',
];

const EXAMPLES = [
  { label: 'Explainer', url: 'https://www.youtube.com/watch?v=8jPQjjsBbIc' },
];

export default function Hero({ onSubmit, isProcessing }: HeroProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = () => {
    if (!url.trim()) return;
    onSubmit(url.trim());
  };

  return (
    <section className="flex flex-col items-center px-4 py-14 text-center">
      {/* Badge */}
      <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1 text-xs font-medium text-teal-400">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
        AI-Powered Video Dubbing
      </span>

      {/* Heading */}
      <h1 className="mb-4 text-5xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
        Dub any video
        <br />
        into <span className="text-teal-400">Khmer</span>
      </h1>

      {/* Subtitle */}
      <p className="mb-8 max-w-md text-sm leading-relaxed text-gray-400">
        Paste a YouTube link. We transcribe the audio, translate the script, and
        synthesise a natural Khmer voice — automatically.
      </p>

      {/* Input + meta row */}
      <div className="mb-10 flex w-full max-w-lg flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="https://youtube.com/watch?v=..."
            disabled={isProcessing}
            className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-500 disabled:opacity-50"
          />
          <button
            onClick={handleSubmit}
            disabled={isProcessing || !url.trim()}
            className="rounded-lg bg-teal-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isProcessing ? 'Processing...' : 'Dub now'}
          </button>
        </div>

        {/* Limit warning + example links */}
        <div className="flex items-center justify-between px-0.5 text-xs">
          <span className="flex items-center gap-1.5 text-yellow-400">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
            Max 3 minutes · public videos only
          </span>
          <span className="text-gray-500">
            Try:{' '}
            {EXAMPLES.map((ex, i) => (
              <span key={ex.label}>
                <button
                  onClick={() => setUrl(ex.url)}
                  className="text-teal-500 transition hover:text-teal-400"
                >
                  {ex.label}
                </button>
                {i < EXAMPLES.length - 1 && (
                  <span className="mx-1 text-gray-700">·</span>
                )}
              </span>
            ))}
          </span>
        </div>
      </div>

      {/* What fits in 3 minutes */}
      {url.length === 0 && (
        <div>
          {/* Divider */}
          <div className="my-10 w-full max-w-lg border-t border-gray-800" />

          <p className="mb-4 text-[11px] font-medium uppercase tracking-widest text-gray-600">
            What fits in 3 minutes
          </p>
          <div className="mb-10 grid w-full max-w-lg grid-cols-3 gap-3">
            {FITS_IN_3_MINS.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-gray-800 bg-gray-900 p-3 text-left"
              >
                <span className="mb-2.5 block text-lg">{item.icon}</span>
                <p className="mb-0.5 text-xs font-medium text-gray-100">
                  {item.label}
                </p>
                <p className="text-[11px] leading-snug text-gray-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-5">
            {TRUST_SIGNALS.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1.5 text-xs text-gray-500"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
