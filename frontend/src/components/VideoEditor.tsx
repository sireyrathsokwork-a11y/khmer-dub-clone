import { useRef, useState } from 'react';

interface VideoEditorProps {
  videoUrl: string;
  duration: number;
}

export default function VideoEditor({ videoUrl, duration }: VideoEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(duration);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <section className="flex justify-center mx-auto max-w-3xl px-4 py-10">
      <div>
        <h2 className="mb-6 text-xl font-semibold text-white">Video Preview</h2>
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="max-w-xl  rounded-lg border border-gray-800 bg-black"
        />

        <div className="mt-6 space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-xs text-gray-400">
              <span>Start: {formatTime(startTime)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={duration}
              value={startTime}
              onChange={(e) => setStartTime(Number(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>

          <div>
            <div className="mb-1 flex justify-between text-xs text-gray-400">
              <span>End: {formatTime(endTime)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={duration}
              value={endTime}
              onChange={(e) => setEndTime(Number(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
