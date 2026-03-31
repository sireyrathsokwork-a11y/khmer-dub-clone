interface DownloadButtonProps {
  videoUrl: string;
}

export default function DownloadButton({ videoUrl }: DownloadButtonProps) {
  return (
    <section className="flex justify-center px-4 py-10">
      <a
        href={videoUrl}
        download="khmer-dubbed-video.mp4"
        className="rounded-lg bg-teal-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-teal-400"
      >
        Download Dubbed Video
      </a>
    </section>
  );
}
