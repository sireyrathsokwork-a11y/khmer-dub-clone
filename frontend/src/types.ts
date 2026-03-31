export type PipelineStatus =
    | 'idle'
    | 'extracting'
    | 'transcribing'
    | 'translating'
    | 'generating_audio'
    | 'merging'
    | 'completed'
    | 'error'

export interface Job {
    jobId: number
    status: PipelineStatus
    youtubeUrl: string
}

export interface Transcript {
    english: string
    khmer: string
}

export interface AppState {
    job: Job | null
    transcript: Transcript | null
    videoUrl: string | null
    error: string | null
}