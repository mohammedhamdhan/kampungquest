import { fetchWithAuth } from './fetchWithAuth'

const API_BASE = import.meta.env.VITE_API_BASE

export async function uploadMedia(file: File | Blob, kind: 'audio' | 'photo'): Promise<{ path: string }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('kind', kind)

  const response = await fetchWithAuth(`${API_BASE}/uploadMedia`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function transcribeFromPath(path: string, language?: string): Promise<{ transcript: string; note?: string }> {
  const response = await fetchWithAuth(`${API_BASE}/transcribe`, {
    method: 'POST',
    body: JSON.stringify({ path, language }),
    auth: false // No auth needed for transcription as it uses service role
  })

  if (!response.ok) {
    throw new Error(`Transcription failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function ensurePair(): Promise<{ pairId: string }> {
  const response = await fetchWithAuth(`${API_BASE}/ensurePair`, {
    method: 'POST'
  })

  if (!response.ok) {
    throw new Error(`Failed to ensure pair: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function saveTile(input: {
  pairId: string
  questId: string
  mediaPaths: Array<{ kind: 'audio' | 'photo', path: string }>
  ai: {
    title: string
    summary: string
    steps: string[]
    materials: string[]
    tags: string[]
  }
  mood?: string
  visibility?: 'private' | 'family' | 'public'
}): Promise<{ tileId: string }> {
  const response = await fetchWithAuth(`${API_BASE}/saveTile`, {
    method: 'POST',
    body: JSON.stringify(input)
  })

  if (!response.ok) {
    throw new Error(`Failed to save tile: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function listTiles(pairId?: string): Promise<Array<{
  id: string
  title: string
  summary: string
  steps: string[]
  materials: string[]
  created_at: string
  media: Array<{ kind: 'audio' | 'photo', url: string }>
}>> {
  const url = pairId
    ? `${API_BASE}/listTiles?pairId=${pairId}`
    : `${API_BASE}/listTiles`

  const response = await fetchWithAuth(url, {
    method: 'GET'
  })

  if (!response.ok) {
    throw new Error(`Failed to list tiles: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

export async function summariseTranscript(transcript: string) {
  const response = await fetch(`${API_BASE}/summarise`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transcript,
      context: {
        mode: 'teach',
        audience: 'youth',
        locale: 'SG'
      }
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('Summarise API error:', errorData)
    throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`)
  }

  const result = await response.json()

  return {
    title: result.title as string,
    summary: result.summary as string,
    steps: result.steps as string[],
    materials: result.materials as string[],
    tags: result.tags as string[]
  }
}