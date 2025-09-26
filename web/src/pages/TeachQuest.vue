<template>
  <div class="space-y-6">
    <!-- Mode-aware header -->
    <div>
      <h1 :class="[
        'font-bold text-neutral-900 dark:text-neutral-100 mb-2',
        isSeniorMode ? 'text-4xl' : 'text-3xl'
      ]">
        Record step
      </h1>

      <!-- Senior Mode: Voice instruction -->
      <VoiceHint
        v-if="isSeniorMode"
        :text="currentStepVoiceInstruction"
        :show-repeat="true"
        class="mt-4"
      />

      <!-- Senior Mode: Progress indicators -->
      <div v-if="isSeniorMode" class="flex justify-center space-x-4 my-6">
        <div
          v-for="(step, index) in progressSteps"
          :key="step.id"
          class="flex flex-col items-center"
        >
          <div :class="[
            'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold',
            index <= currentStepIndex
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
          ]">
            {{ index + 1 }}
          </div>
          <span :class="[
            'mt-2 text-sm font-medium',
            index <= currentStepIndex
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-gray-500 dark:text-gray-400'
          ]">
            {{ step.label }}
          </span>
        </div>
      </div>

      <!-- Youth Mode: Coach card -->
      <CoachCard v-if="isYouthMode && !coachCardDismissed" class="mt-4" @dismiss="dismissCoachCard">
        {{ currentStepCoachTip }}
      </CoachCard>

      <p v-if="isYouthMode" class="text-neutral-600 dark:text-neutral-300">
        Speak as if teaching a first-timer. You can retry anytime.
      </p>
    </div>

    <!-- Recording Section -->
    <div class="space-y-4">
      <!-- Senior Mode: One clear CTA at a time -->
      <div v-if="isSeniorMode" class="space-y-4">
        <!-- Step 1: Record -->
        <div v-if="currentStepIndex === 0" class="text-center">
          <ModeAwareButton
            @click="recorder.start()"
            :disabled="recorder.isRecording.value || uploading"
            size="lg"
            variant="primary"
            full-width
          >
            {{ recorder.isRecording.value ? '🔴 Recording...' : '🎤 Start Recording' }}
          </ModeAwareButton>
        </div>

        <!-- Step 2: Stop -->
        <div v-else-if="currentStepIndex === 1" class="text-center">
          <ModeAwareButton
            @click="recorder.stop()"
            :disabled="!recorder.isRecording.value"
            size="lg"
            variant="secondary"
            full-width
          >
            ⏹️ Stop Recording
          </ModeAwareButton>
        </div>

        <!-- Step 3: Review (handled later in template) -->
      </div>

      <!-- Youth Mode: All controls visible -->
      <div v-else class="flex gap-3 flex-wrap">
        <ModeAwareButton
          @click="recorder.start()"
          :disabled="recorder.isRecording.value || uploading"
          variant="primary"
        >
          {{ recorder.isRecording.value ? 'Recording...' : 'Record' }}
        </ModeAwareButton>
        <ModeAwareButton
          @click="recorder.stop()"
          :disabled="!recorder.isRecording.value"
          variant="secondary"
        >
          Stop
        </ModeAwareButton>
        <ModeAwareButton
          v-if="recorder.blob.value"
          @click="retakeRecording"
          :disabled="uploading || transcribing"
          variant="outline"
        >
          🔄 Retake
        </ModeAwareButton>
      </div>

      <div v-if="recorder.error.value" class="p-3 bg-red-50 text-red-700 rounded-md dark:bg-red-900/20 dark:text-red-400">
        {{ recorder.error.value }}
        <button @click="recorder.reset()" class="ml-2 underline hover:no-underline">
          Try again
        </button>
      </div>

      <div v-if="recorder.blob.value && !uploading" class="space-y-4">
        <div class="space-y-2">
          <p class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Recording preview:</p>
          <audio :src="audioUrl" controls class="w-full"></audio>
        </div>

        <div class="space-y-3">
          <!-- Language Selection -->
          <div class="space-y-3">
            <label :class="[
              'block font-medium text-neutral-700 dark:text-neutral-300',
              isSeniorMode ? 'text-base' : 'text-sm'
            ]">
              {{ isSeniorMode ? 'Choose your language:' : 'Transcription Language' }}
            </label>

            <!-- Senior Mode: Simple row of buttons -->
            <div v-if="isSeniorMode" class="grid grid-cols-2 gap-3">
              <ModeAwareButton
                v-for="lang in languages"
                :key="lang.code"
                @click="selectedLanguage = lang.code"
                :variant="selectedLanguage === lang.code ? 'primary' : 'outline'"
                size="md"
              >
                {{ lang.name }}
              </ModeAwareButton>
            </div>

            <!-- Youth Mode: Dropdown -->
            <select
              v-else
              id="language"
              v-model="selectedLanguage"
              class="w-full px-4 py-3 border-2 border-emerald-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 shadow-lg focus:shadow-xl appearance-none cursor-pointer transition-all duration-300"
            >
              <option v-for="lang in languages" :key="lang.code" :value="lang.code">
                {{ lang.name }}
              </option>
            </select>
          </div>

          <!-- Senior Mode: Single action (Step 3: Review) -->
          <div v-if="isSeniorMode && currentStepIndex === 2" class="text-center">
            <ModeAwareButton
              @click="uploadAndTranscribe"
              :disabled="uploading || transcribing"
              size="lg"
              variant="primary"
              full-width
            >
              {{ transcribing ? '⏳ Transcribing...' : '📝 Create Text Version' }}
            </ModeAwareButton>

            <!-- Always-visible Back button for Senior Mode -->
            <ModeAwareButton
              @click="retakeRecording"
              :disabled="uploading || transcribing"
              variant="outline"
              size="lg"
              full-width
              class="mt-3"
            >
              ← Back: Record Again
            </ModeAwareButton>
          </div>

          <!-- Youth Mode: Multiple actions -->
          <div v-if="isYouthMode" class="flex gap-3 flex-wrap">
            <ModeAwareButton
              @click="uploadAndTranscribe"
              :disabled="uploading || transcribing"
              variant="primary"
              class="flex-1"
            >
              {{ transcribing ? 'Transcribing...' : 'Upload & Transcribe' }}
            </ModeAwareButton>
            <ModeAwareButton
              @click="retakeRecording"
              :disabled="uploading || transcribing"
              variant="outline"
            >
              Retake
            </ModeAwareButton>
          </div>
        </div>
      </div>

      <div v-if="uploading" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p class="text-blue-700 dark:text-blue-300">Uploading audio...</p>
      </div>

      <div v-if="transcribing" class="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
        <p class="text-yellow-700 dark:text-yellow-300">Transcribing audio with AI...</p>
      </div>

      <div v-if="transcriptionNote && transcript === ''" class="p-3 bg-yellow-50 text-yellow-700 rounded-md dark:bg-yellow-900/20 dark:text-yellow-400">
        {{ transcriptionNote }}
      </div>
    </div>

    <!-- Photo Section (Youth Mode: More prominent, Senior Mode: Optional) -->
    <div v-if="isYouthMode || (isSeniorMode && currentStepIndex === 2)" class="space-y-3">
      <label :class="[
        'block font-medium text-neutral-700 dark:text-neutral-300',
        isSeniorMode ? 'text-base' : 'text-sm'
      ]">
        {{ isYouthMode ? '📸 Add photo' : 'Add photo (optional)' }}
      </label>

      <!-- Youth Mode: Prominent button -->
      <div v-if="isYouthMode" class="flex gap-3">
        <ModeAwareButton
          @click="triggerPhotoInput"
          variant="outline"
          size="md"
        >
          📷 Add Photo
        </ModeAwareButton>
        <input
          ref="photoInput"
          type="file"
          accept="image/*"
          capture="environment"
          @change="handlePhotoSelect"
          class="hidden"
        />
      </div>

      <!-- Senior Mode: Simple input -->
      <input
        v-else
        type="file"
        accept="image/*"
        capture="environment"
        @change="handlePhotoSelect"
        class="w-full px-4 py-3 border-2 border-emerald-300 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg focus:shadow-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300"
      />

      <div v-if="photoPaths.length > 0" :class="[
        'text-emerald-600 dark:text-emerald-400',
        isSeniorMode ? 'text-base' : 'text-sm'
      ]">
        {{ photoPaths.length }} photo(s) added ✅
      </div>
    </div>

    <!-- Transcript/Notes Section -->
    <div class="space-y-3">
      <label for="notes" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {{ audioPath ? 'Edit transcript or add notes' : 'Type your teaching notes' }}
      </label>
      <textarea
        id="notes"
        v-model="transcript"
        rows="5"
        :placeholder="audioPath ? 'Edit the transcribed text or add additional notes...' : 'Type your teaching notes here...'"
        class="w-full px-4 py-3 border-2 border-emerald-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 text-base shadow-lg focus:shadow-xl transition-all duration-300 resize-none"
      ></textarea>
    </div>

    <div v-if="error" class="p-3 bg-red-50 text-red-700 rounded-md dark:bg-red-900/20 dark:text-red-400">
      {{ error }}
    </div>

    <LargeButton
      @click="goToReview"
      :disabled="!hasContent || uploading || transcribing"
    >
      Next: Review
    </LargeButton>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRecorder } from '@/composables/useRecorder'
import { uploadMedia, transcribeFromPath } from '@/lib/api'
import { useMode } from '@/composables/useMode'
import LargeButton from '@/components/LargeButton.vue'
import VoiceHint from '@/components/VoiceHint.vue'
import CoachCard from '@/components/CoachCard.vue'
import ModeAwareButton from '@/components/ModeAwareButton.vue'

const props = defineProps<{
  questId: string
}>()

const router = useRouter()
const recorder = useRecorder()
const { isSeniorMode, isYouthMode } = useMode()

// Template refs
const photoInput = ref<HTMLInputElement | null>(null)

// State
const transcript = ref('')
const audioPath = ref<string | null>(null)
const photoPaths = ref<string[]>([])
const uploading = ref(false)
const transcribing = ref(false)
const error = ref('')
const audioUrl = ref('')
const selectedLanguage = ref('en')
const transcriptionNote = ref('')

// Coach card persistence
const coachCardDismissed = ref(false)

// Mode-specific data
const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ms', name: 'Malay' },
  { code: 'ta', name: 'Tamil' }
]

// Senior Mode: Progress tracking
const progressSteps = [
  { id: 'record', label: 'Record' },
  { id: 'stop', label: 'Stop' },
  { id: 'review', label: 'Review' }
]

const currentStepIndex = computed(() => {
  if (recorder.isRecording.value) return 1 // Stop step (currently recording)
  if (recorder.blob.value) return 2 // Review step (has recording)
  return 0 // Record step (no recording yet)
})

// Mode-specific instructions
const currentStepVoiceInstruction = computed(() => {
  switch (currentStepIndex.value) {
    case 0:
      return 'Press the record button and start explaining your skill step by step. Speak clearly as if teaching someone new.'
    case 1:
      return 'Press stop when you finish explaining. You can always record again if needed.'
    case 2:
      return 'Review your recording and choose your language for transcription. Then press next to continue.'
    default:
      return ''
  }
})

const currentStepCoachTip = computed(() => {
  switch (currentStepIndex.value) {
    case 0:
      return 'Ask them to list the tools or materials needed first, then go through each step slowly.'
    case 1:
      return 'Let them know they can re-record if they want to add more details or start over.'
    case 2:
      return 'Help them choose the right language for transcription. They can edit the text afterwards.'
    default:
      return 'Help them break down the skill into simple, clear steps.'
  }
})

watch(recorder.blob, (newBlob) => {
  if (newBlob) {
    if (audioUrl.value) {
      URL.revokeObjectURL(audioUrl.value)
    }
    audioUrl.value = URL.createObjectURL(newBlob)
  }
})

const hasContent = computed(() => {
  return transcript.value.trim().length > 0 || audioPath.value !== null
})

const uploadAndTranscribe = async () => {
  if (!recorder.blob.value) return

  error.value = ''
  uploading.value = true

  try {
    // Upload audio
    const { path } = await uploadMedia(recorder.blob.value, 'audio')
    audioPath.value = path
    uploading.value = false
    transcribing.value = true

    // Transcribe
    try {
      const { transcript: transcribedText, note } = await transcribeFromPath(path, selectedLanguage.value)
      transcript.value = transcribedText || ''
      transcriptionNote.value = note || ''

      if (!transcribedText && note) {
        error.value = note
      } else if (!transcribedText) {
        error.value = 'We couldn\'t transcribe this clip. You can type the gist and still generate steps.'
      }
    } catch (transcribeError: any) {
      console.error('Transcription error:', transcribeError)
      error.value = 'Transcription failed. You can type the content manually.'
    }
  } catch (uploadError: any) {
    console.error('Upload error:', uploadError)
    if (uploadError.message?.includes('413')) {
      error.value = 'That file looks too large. Try a shorter clip under 15 MB.'
    } else if (uploadError.message?.includes('415')) {
      error.value = 'That file type is not supported. Please record again.'
    } else {
      error.value = 'Upload failed. Please try again.'
    }
  } finally {
    uploading.value = false
    transcribing.value = false
  }
}

const retakeRecording = () => {
  recorder.reset()
  audioPath.value = null
  transcript.value = ''
  error.value = ''
  transcriptionNote.value = ''
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
    audioUrl.value = ''
  }
}

const triggerPhotoInput = () => {
  photoInput.value?.click()
}

const handlePhotoSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  error.value = ''

  try {
    const { path } = await uploadMedia(file, 'photo')
    photoPaths.value.push(path)
  } catch (uploadError: any) {
    console.error('Photo upload error:', uploadError)
    if (uploadError.message?.includes('413')) {
      error.value = 'That photo is too large. Try a photo under 15 MB.'
    } else if (uploadError.message?.includes('415')) {
      error.value = 'That photo format is not supported. Try JPEG or PNG.'
    } else {
      error.value = 'Photo upload failed. Please try again.'
    }
  }

  // Reset the input
  target.value = ''
}

const goToReview = () => {
  router.push({
    path: '/review',
    state: {
      transcript: transcript.value,
      audioPath: audioPath.value,
      photoPaths: [...photoPaths.value],
      questId: props.questId
    }
  })
}

const dismissCoachCard = () => {
  coachCardDismissed.value = true
}
</script>