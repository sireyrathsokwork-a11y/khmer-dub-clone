'use client';

import { useState } from 'react';

interface DownloadButtonProps {
  videoUrl: string;
  fileName?: string;
}

export default function DownloadButton({
  videoUrl,
  fileName = 'khmer-dubbed-video.mp4',
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setIsDownloading(true);
    setError(null);
    setProgress(0);

    try {
      const response = await fetch(videoUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.statusText}`);
      }

      // Track download progress
      const contentLength = response.headers.get('Content-Length');
      const total = contentLength ? parseInt(contentLength, 10) : null;
      const reader = response.body!.getReader();
      const chunks: Uint8Array<ArrayBuffer>[] = [];
      let received = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        received += value.length;
        if (total) setProgress(Math.round((received / total) * 100));
      }

      // Build blob and trigger download
      const blob = new Blob(chunks, { type: 'video/mp4' });
      const blobUrl = URL.createObjectURL(blob);

      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      // Release memory
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setIsDownloading(false);
      setProgress(0);
    }
  }

  return (
    <section className="flex flex-col items-center gap-3 px-4 py-10">
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="rounded-lg bg-teal-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDownloading
          ? progress > 0
            ? `Downloading... ${progress}%`
            : 'Preparing...'
          : 'Download Dubbed Video'}
      </button>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </section>
  );
}
