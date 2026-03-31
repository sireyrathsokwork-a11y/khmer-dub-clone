import { useEffect, useState } from 'react';
import { type AppState } from './types';
import Hero from './components/Hero';
import ProgressBar from './components/ProgressBar';
import TranscriptEditor from './components/TranscriptEditor';
import VideoEditor from './components/VideoEditor';
import DownloadButton from './components/DownloadButton';
import { startDubbing, subscribeToJob } from './api';

const initialState: AppState = {
  job: null,
  transcript: null,
  videoUrl: null,
  error: null,
};

export default function App() {
  const [state, setState] = useState<AppState>(initialState);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const isProcessing =
    !!state.job &&
    state.job.status !== 'completed' &&
    state.job.status !== 'error';

  async function handleDubStart(youtubeUrl: string) {
    setState((prev) => ({
      ...prev,
      job: { jobId: 0, status: 'extracting', youtubeUrl },
      transcript: null,
      videoUrl: null,
      error: null,
    }));

    try {
      const data = await startDubbing(youtubeUrl);
      const jobId = data.jobId;

      setState((prev) => ({
        ...prev,
        job: prev.job ? { ...prev.job, jobId } : null,
      }));

      // Subscribe to real-time updates
      subscribeToJob(jobId, (update) => {
        if (update.status === 'completed') {
          setState((prev) => ({
            ...prev,
            job: prev.job ? { ...prev.job, status: 'completed' } : null,
            transcript: update.transcript,
            videoUrl: `http://localhost:3001/api/dub/video/${jobId}`,
          }));
        } else if (update.status === 'error') {
          setState((prev) => ({
            ...prev,
            error: update.message,
            job: prev.job ? { ...prev.job, status: 'error' } : null,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            job: prev.job ? { ...prev.job, status: update.status } : null,
          }));
        }
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: 'Failed to start dubbing. Please try again.',
        job: prev.job ? { ...prev.job, status: 'error' } : null,
      }));
    }
  }

  useEffect(() => {``
    console.log('setate----------', state);
  }, [setState, state]);

  function handleKhmerChange(text: string) {
    setState((prev) => ({
      ...prev,
      transcript: prev.transcript ? { ...prev.transcript, khmer: text } : null,
    }));
  }

  async function handleRegenerate() {
    if (!state.job || !state.transcript) return;
    setIsRegenerating(true);
    try {
      // regenerate endpoint coming soon
      console.log('Regenerating with:', state.transcript.khmer);
    } finally {
      setIsRegenerating(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Hero onSubmit={handleDubStart} isProcessing={isProcessing} />

      {state.error && (
        <p className="text-center text-red-400 py-4">{state.error}</p>
      )}

      {state.job && state.job.status !== 'idle' && (
        <ProgressBar status={state.job.status} />
      )}

      {state.transcript && (
        <TranscriptEditor
          transcript={state.transcript}
          onKhmerChange={handleKhmerChange}
          onRegenerate={handleRegenerate}
          isRegenerating={isRegenerating}
        />
      )}

      {state.videoUrl && (
        <VideoEditor videoUrl={state.videoUrl} duration={60} />
      )}

      {state.job?.status === 'completed' && state.videoUrl && (
        <DownloadButton videoUrl={state.videoUrl} />
      )}
    </main>
  );
}
