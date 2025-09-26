const API_BASE = import.meta.env.VITE_API_BASE

if (!API_BASE) {
  throw new Error('Missing VITE_API_BASE environment variable. Please check your .env.local file.')
}

export interface SummarizeRequest {
  transcript: string
  context: {
    mode: 'teach'
    audience: 'youth'
    locale: string
  }
}

export interface SummarizeResponse {
  title: string
  summary: string
  steps: string[]
  materials: string[]
  tags: string[]
}

export async function summarizeText(transcript: string, locale: string = 'SG'): Promise<SummarizeResponse> {
  const response = await fetch(`${API_BASE}/api/summarise`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transcript,
      context: {
        mode: 'teach',
        audience: 'youth',
        locale
      }
    } as SummarizeRequest)
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}