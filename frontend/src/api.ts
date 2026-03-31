import axios from 'axios'

const BASE_URL = 'http://localhost:3001'

export async function startDubbing(youtubeUrl: string) {
    const response = await axios.post(`${BASE_URL}/api/dub/process`, {
        youtubeUrl
    })
    return response.data
}

export async function regenerateAudio(jobId: number, khmerText: string) {
    const response = await axios.post(`${BASE_URL}/api/dub/regenerate`, {
        jobId,
        khmerText
    })
    return response.data
}

export function subscribeToJob(
    jobId: number,
    onUpdate: (data: any) => void
  ) {
    const eventSource = new EventSource(
      `http://localhost:3001/api/dub/status/${jobId}`
    )
  
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      onUpdate(data)
      if (data.status === 'completed' || data.status === 'error') {
        eventSource.close()
      }
    }
  
    eventSource.onerror = () => {
      console.error('SSE connection error')
      eventSource.close()
    }
  
    return eventSource
  }