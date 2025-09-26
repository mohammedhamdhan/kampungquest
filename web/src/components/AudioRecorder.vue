<template>
  <div class="space-y-4">
    <div class="text-center">
      <div class="mb-4">
        <div
          class="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
          :class="isRecording ? 'bg-red-100' : 'bg-gray-100'"
        >
          <button
            @click="toggleRecording"
            :disabled="loading"
            class="w-16 h-16 rounded-full flex items-center justify-center transition-colors"
            :class="isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-indigo-500 hover:bg-indigo-600'"
          >
            <svg
              v-if="!isRecording"
              class="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
              <path d="M19 10v1a7 7 0 0 1-14 0v-1"/>
              <path d="M12 18v4"/>
              <path d="M8 22h8"/>
            </svg>
            <div
              v-else
              class="w-4 h-4 bg-white rounded-sm"
            ></div>
          </button>
        </div>
      </div>

      <div class="text-sm text-gray-600 mb-2">
        {{ isRecording ? 'Recording...' : 'Click to start recording' }}
      </div>

      <div v-if="recordingTime > 0" class="text-lg font-mono text-gray-900">
        {{ formatTime(recordingTime) }}
      </div>
    </div>

    <div v-if="audioUrl" class="space-y-3">
      <div class="border rounded-lg p-3 bg-gray-50">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">Recording Preview</span>
          <span class="text-xs text-gray-500">{{ formatTime(recordingDuration) }}</span>
        </div>

        <audio
          ref="audioPlayer"
          controls
          class="w-full"
          :src="audioUrl"
          @loadedmetadata="updateDuration"
        ></audio>
      </div>

      <div class="flex gap-2">
        <button
          @click="saveRecording"
          class="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
        >
          Save Recording
        </button>
        <button
          @click="discardRecording"
          class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Discard
        </button>
      </div>
    </div>

    <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md">
      <p class="text-sm text-red-700">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

const emit = defineEmits<{
  'recording-complete': [blob: Blob]
}>()

const isRecording = ref(false)
const loading = ref(false)
const recordingTime = ref(0)
const recordingDuration = ref(0)
const audioUrl = ref('')
const error = ref('')

const mediaRecorder = ref<MediaRecorder | null>(null)
const audioChunks = ref<Blob[]>([])
const recordingTimer = ref<number | null>(null)
const audioPlayer = ref<HTMLAudioElement | null>(null)

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const startRecording = async () => {
  try {
    error.value = ''
    loading.value = true

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    })

    mediaRecorder.value = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    })

    audioChunks.value = []

    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data)
      }
    }

    mediaRecorder.value.onstop = () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm;codecs=opus' })
      audioUrl.value = URL.createObjectURL(audioBlob)

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop())
    }

    mediaRecorder.value.start()
    isRecording.value = true
    recordingTime.value = 0

    // Start timer
    recordingTimer.value = window.setInterval(() => {
      recordingTime.value++
    }, 1000)

  } catch (err: any) {
    error.value = err.message || 'Failed to access microphone. Please check permissions.'
  } finally {
    loading.value = false
  }
}

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false

    if (recordingTimer.value) {
      clearInterval(recordingTimer.value)
      recordingTimer.value = null
    }
  }
}

const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

const updateDuration = () => {
  if (audioPlayer.value) {
    recordingDuration.value = Math.floor(audioPlayer.value.duration || 0)
  }
}

const saveRecording = () => {
  if (audioChunks.value.length > 0) {
    const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm;codecs=opus' })
    emit('recording-complete', audioBlob)
    discardRecording()
  }
}

const discardRecording = () => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
  audioUrl.value = ''
  audioChunks.value = []
  recordingTime.value = 0
  recordingDuration.value = 0
}

onUnmounted(() => {
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value)
  }
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
  if (isRecording.value) {
    stopRecording()
  }
})
</script>