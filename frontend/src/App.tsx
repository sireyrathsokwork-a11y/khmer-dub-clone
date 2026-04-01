import { useState } from 'react';
import { type AppState } from './types';
import Hero from './components/Hero';
import ProgressBar from './components/ProgressBar';
import TranscriptEditor from './components/TranscriptEditor';
import VideoEditor from './components/VideoEditor';
import DownloadButton from './components/DownloadButton';
import { regenerateAudio, startDubbing, subscribeToJob, BASE_URL } from './api';

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

  function handleJobUpdates(jobId: number, onDone?: () => void) {
    subscribeToJob(jobId, (update) => {
      if (update.status === 'completed') {
        setState((prev) => ({
          ...prev,
          job: prev.job ? { ...prev.job, status: 'completed' } : null,
          transcript: {
            english:
              update.transcript?.english || prev.transcript?.english || '',
            khmer:
              update.transcript?.khmer ||
              update.khmer ||
              prev.transcript?.khmer ||
              '',
          },
          videoUrl: `${BASE_URL}/api/dub/video/${jobId}?t=${Date.now()}`,
        }));
        onDone?.();
      } else if (update.status === 'error') {
        setState((prev) => ({
          ...prev,
          error: update.message,
          job: prev.job ? { ...prev.job, status: 'error' } : null,
        }));
        onDone?.();
      } else {
        setState((prev) => ({
          ...prev,
          job: prev.job ? { ...prev.job, status: update.status } : null,
        }));
      }
    });
  }

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

      handleJobUpdates(jobId);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: 'Failed to start dubbing. Please try again.',
        job: prev.job ? { ...prev.job, status: 'error' } : null,
      }));
    }
  }

  function handleKhmerChange(text: string) {
    setState((prev) => ({
      ...prev,
      transcript: prev.transcript ? { ...prev.transcript, khmer: text } : null,
    }));
  }

  async function handleRegenerate() {
    if (!state.job || !state.transcript) return;
    setIsRegenerating(true);

    // Subscribe BEFORE calling regenerate — don't miss any events
    handleJobUpdates(state.job.jobId, () => setIsRegenerating(false));

    try {
      await regenerateAudio(state.job.jobId, state.transcript.khmer);
    } catch (err) {
      console.error('Regenerate error:', err);
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
