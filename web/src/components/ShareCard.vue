<template>
  <div
    v-if="showCard"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click="closeCard"
  >
    <div
      :class="[
        'bg-white rounded-xl shadow-2xl max-w-lg w-full relative',
        isSeniorMode ? 'p-8' : 'p-6'
      ]"
      @click.stop
    >
      <!-- Close button -->
      <button
        @click="closeCard"
        class="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Close share card"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Card preview -->
      <div class="mb-6">
        <h3 :class="[
          'font-bold text-gray-900 mb-4',
          isSeniorMode ? 'text-xl' : 'text-lg'
        ]">
          Share this achievement
        </h3>

        <!-- Card content -->
        <div
          ref="shareCardRef"
          class="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-6 border border-emerald-200"
        >
          <!-- Achievement header -->
          <div class="text-center mb-4">
            <div class="text-4xl mb-2">{{ achievementEmoji }}</div>
            <h4 class="text-2xl font-bold text-emerald-900 mb-1">
              {{ achievementTitle }}
            </h4>
            <p class="text-emerald-700">
              {{ achievementDescription }}
            </p>
          </div>

          <!-- Key steps (for tiles) -->
          <div v-if="keySteps && keySteps.length > 0" class="mb-4">
            <h5 class="font-semibold text-emerald-900 mb-2">Key steps:</h5>
            <ol class="list-decimal list-inside space-y-1 text-sm text-emerald-800">
              <li v-for="step in keySteps.slice(0, 3)" :key="step">{{ step }}</li>
            </ol>
          </div>

          <!-- Attribution -->
          <div class="text-center pt-4 border-t border-emerald-200">
            <p class="text-sm text-emerald-600">
              {{ teacherName ? `Taught by ${teacherName}` : 'Preserved through KampungQuest' }}
            </p>
            <p class="text-xs text-emerald-500 mt-1">
              Connecting generations through shared knowledge
            </p>
          </div>
        </div>
      </div>

      <!-- Share actions -->
      <div :class="[
        'space-y-3',
        isSeniorMode ? 'space-y-4' : 'space-y-3'
      ]">
        <!-- Main share button -->
        <ModeAwareButton
          @click="shareToSystem"
          :size="isSeniorMode ? 'lg' : 'md'"
          variant="primary"
          full-width
        >
          📱 Share with Family
        </ModeAwareButton>

        <!-- WhatsApp quick share (Youth Mode) -->
        <ModeAwareButton
          v-if="isYouthMode"
          @click="shareToWhatsApp"
          :size="isSeniorMode ? 'lg' : 'md'"
          variant="outline"
          full-width
          class="text-green-600 border-green-300 hover:bg-green-50"
        >
          💬 Send to WhatsApp
        </ModeAwareButton>

        <!-- Copy text option -->
        <ModeAwareButton
          @click="copyShareText"
          :size="isSeniorMode ? 'lg' : 'md'"
          variant="ghost"
          full-width
        >
          📋 Copy Text
        </ModeAwareButton>
      </div>

      <!-- Success message -->
      <div
        v-if="showSuccessMessage"
        class="mt-4 p-3 bg-green-50 text-green-800 rounded-lg text-center"
      >
        {{ successMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMode } from '@/composables/useMode'
import { useStreaks } from '@/composables/useStreaks'
import ModeAwareButton from '@/components/ModeAwareButton.vue'

interface Props {
  showCard: boolean
  type: 'milestone' | 'tile'
  milestoneType?: string
  tileTitle?: string
  keySteps?: string[]
  teacherName?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  shared: []
}>()

const { isSeniorMode, isYouthMode } = useMode()
const { getMilestoneDisplayText } = useStreaks()

const shareCardRef = ref<HTMLElement | null>(null)
const showSuccessMessage = ref(false)
const successMessage = ref('')

const achievementData = computed(() => {
  if (props.type === 'milestone' && props.milestoneType) {
    return getMilestoneDisplayText(props.milestoneType)
  } else if (props.type === 'tile' && props.tileTitle) {
    return {
      title: props.tileTitle,
      description: 'A valuable skill preserved!',
      emoji: '📚'
    }
  }
  return { title: 'Achievement', description: 'Great work!', emoji: '🎉' }
})

const achievementTitle = computed(() => achievementData.value.title)
const achievementDescription = computed(() => achievementData.value.description)
const achievementEmoji = computed(() => achievementData.value.emoji)

const shareText = computed(() => {
  let text = `${achievementEmoji.value} ${achievementTitle.value}\n\n${achievementDescription.value}`

  if (props.keySteps && props.keySteps.length > 0) {
    text += '\n\nKey steps:\n'
    props.keySteps.slice(0, 3).forEach((step, index) => {
      text += `${index + 1}. ${step}\n`
    })
  }

  if (props.teacherName) {
    text += `\nTaught by ${props.teacherName}`
  }

  text += '\n\nPreserving knowledge across generations with KampungQuest 💚'

  return text
})

const whatsAppText = computed(() => {
  return encodeURIComponent(shareText.value)
})

const closeCard = () => {
  emit('close')
}

const shareToSystem = async () => {
  try {
    if (navigator.share) {
      await navigator.share({
        title: achievementTitle.value,
        text: shareText.value,
        // In a real app, you might also include a URL to the achievement
        // url: window.location.href
      })

      showSuccess('Shared successfully!')
      emit('shared')
    } else {
      // Fallback to copying text
      await copyShareText()
    }
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Error sharing:', error)
      // Fallback to copying
      await copyShareText()
    }
  }
}

const shareToWhatsApp = () => {
  const whatsappUrl = `https://wa.me/?text=${whatsAppText.value}`
  window.open(whatsappUrl, '_blank')
  showSuccess('Opened WhatsApp!')
  emit('shared')
}

const copyShareText = async () => {
  try {
    await navigator.clipboard.writeText(shareText.value)
    showSuccess('Copied to clipboard!')
  } catch (error) {
    console.error('Error copying text:', error)
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea')
      textArea.value = shareText.value
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      showSuccess('Copied to clipboard!')
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError)
      showSuccess('Please manually copy the text above')
    }
  }
}

const showSuccess = (message: string) => {
  successMessage.value = message
  showSuccessMessage.value = true

  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}
</script>