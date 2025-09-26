<template>
  <div
    v-if="isSeniorMode && text"
    class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 dark:bg-amber-900/20 dark:border-amber-800"
    role="complementary"
    aria-label="Voice instruction"
  >
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <button
          @click="togglePlayback"
          :disabled="loading"
          :class="[
            'p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500',
            isPlaying
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : 'bg-amber-200 text-amber-800 hover:bg-amber-300 dark:bg-amber-800 dark:text-amber-200'
          ]"
          :aria-label="isPlaying ? 'Stop voice instruction' : 'Play voice instruction'"
        >
          <svg
            v-if="loading"
            class="h-5 w-5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"/>
            <path fill="currentColor" class="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <svg
            v-else-if="isPlaying"
            class="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
          <svg
            v-else
            class="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      </div>
      <div class="ml-3 flex-1">
        <p class="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
          🔊 Voice Instruction
        </p>
        <p class="text-base text-amber-900 dark:text-amber-100 leading-relaxed">
          {{ text }}
        </p>
        <button
          v-if="showRepeat"
          @click="repeatInstruction"
          class="mt-2 text-sm text-amber-700 hover:text-amber-900 underline focus:outline-none focus:ring-2 focus:ring-amber-500 dark:text-amber-300 dark:hover:text-amber-100"
          aria-label="Repeat instruction"
        >
          🔄 Repeat instruction
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useMode } from '@/composables/useMode'

interface Props {
  text: string
  showRepeat?: boolean
  autoPlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showRepeat: true,
  autoPlay: false
})

const { isSeniorMode } = useMode()

const isPlaying = ref(false)
const loading = ref(false)
const currentUtterance = ref<SpeechSynthesisUtterance | null>(null)

const speak = (text: string) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported')
    return
  }

  // Stop any current speech
  window.speechSynthesis.cancel()

  loading.value = true

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.8 // Slower for seniors
  utterance.pitch = 1
  utterance.volume = 1

  utterance.onstart = () => {
    isPlaying.value = true
    loading.value = false
  }

  utterance.onend = () => {
    isPlaying.value = false
    currentUtterance.value = null
  }

  utterance.onerror = () => {
    isPlaying.value = false
    loading.value = false
    currentUtterance.value = null
    console.error('Speech synthesis error')
  }

  currentUtterance.value = utterance
  window.speechSynthesis.speak(utterance)
}

const stopSpeech = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
  isPlaying.value = false
  currentUtterance.value = null
}

const togglePlayback = () => {
  if (isPlaying.value) {
    stopSpeech()
  } else {
    speak(props.text)
  }
}

const repeatInstruction = () => {
  speak(props.text)

  // Track analytics
  try {
    console.log('Repeat instruction used')
    // TODO: Add analytics tracking
  } catch (err) {
    console.warn('Analytics tracking failed:', err)
  }
}

// Auto-play on mount if requested and in senior mode
if (props.autoPlay && isSeniorMode.value) {
  setTimeout(() => {
    speak(props.text)
  }, 500)
}

// Cleanup on unmount
onUnmounted(() => {
  stopSpeech()
})
</script>