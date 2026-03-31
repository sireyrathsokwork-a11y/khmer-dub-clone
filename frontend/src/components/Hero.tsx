import { useState } from 'react'

interface HeroProps {
    onSubmit: (youtubeUrl: string) => void
    isProcessing: boolean
}

export default function Hero({ onSubmit, isProcessing }: HeroProps) {
    const [url, setUrl] = useState('')

    function handleSubmit() {
        if (!url.trim()) return
        onSubmit(url.trim())
    }

    return (
        <section className="flex flex-col items-center justify-center px-4 py-20 text-center">
            <span className="mb-4 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1 text-sm text-teal-400">
                AI-Powered Video Dubbing
            </span>

            <h1 className="mb-4 bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-6xl font-bold text-transparent">
                KhmerDub
            </h1>

            <p className="mb-10 max-w-md text-gray-400">
                Dub any YouTube video into Khmer with AI-powered
                transcription, translation, and voice synthesis.
            </p>

            <div className="flex w-full max-w-lg gap-3">
                <input
                    type="text"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="Paste YouTube URL here..."
                    disabled={isProcessing}
                    className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-teal-500 disabled:opacity-50"
                />
                <button
                    onClick={handleSubmit}
                    disabled={isProcessing || !url.trim()}
                    className="rounded-lg bg-teal-500 px-6 py-3 font-semibold text-black transition hover:bg-teal-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? 'Processing...' : 'Dub Now'}
                </button>
            </div>
        </section>
    )
}