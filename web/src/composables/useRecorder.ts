import { ref } from 'vue'

export function useRecorder() {
  const isRecording = ref(false)
  const blob = ref<Blob | null>(null)
  const error = ref<string | null>(null)

  let mediaRecorder: MediaRecorder | null = null
  let chunks: Blob[] = []
  let stream: MediaStream | null = null

  const start = async () => {
    try {
      error.value = null
      chunks = []

      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        blob.value = new Blob(chunks, { type: 'audio/webm' })
        if (stream) {
          stream.getTracks().forEach(track => track.stop())
        }
      }

      mediaRecorder.start()
      isRecording.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to access microphone'
    }
  }

  const stop = () => {
    if (mediaRecorder && isRecording.value) {
      mediaRecorder.stop()
      isRecording.value = false
    }
  }

  const reset = () => {
    if (mediaRecorder && isRecording.value) {
      mediaRecorder.stop()
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }

    isRecording.value = false
    blob.value = null
    error.value = null
    chunks = []
    mediaRecorder = null
    stream = null
  }

  return {
    isRecording,
    blob,
    error,
    start,
    stop,
    reset
  }
}