<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Review & Generate</h1>

    <div class="space-y-3">
      <label for="transcript" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Teaching transcript
      </label>
      <textarea
        id="transcript"
        v-model="transcript"
        rows="5"
        class="w-full px-4 py-3 border-2 border-emerald-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 text-base shadow-lg focus:shadow-xl transition-all duration-300 resize-none"
      ></textarea>
    </div>

    <button
      @click="generateSteps"
      :disabled="loading || !transcript.trim()"
      class="group relative w-full h-12 px-6 py-3 text-base font-bold rounded-2xl overflow-hidden transition-all duration-300 transform shadow-lg hover:shadow-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 border border-emerald-400/20 shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100"
    >
      <!-- Background effects for enabled buttons -->
      <template v-if="!loading && transcript.trim()">
        <!-- Animated gradient background -->
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

        <!-- Shimmer effect -->
        <div class="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700"></div>

        <!-- Floating particles -->
        <div class="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div class="absolute top-2 left-1/4 w-1 h-1 bg-white/60 rounded-full animate-ping delay-100"></div>
          <div class="absolute bottom-2 right-1/4 w-1 h-1 bg-white/60 rounded-full animate-ping delay-300"></div>
        </div>
      </template>

      <!-- Content -->
      <span class="relative z-10 flex items-center justify-center gap-2">
        <span v-if="!loading">🤖</span>
        {{ loading ? 'Generating...' : 'Generate steps with AI' }}
      </span>
    </button>

    <div v-if="error" class="p-3 bg-red-50 text-red-700 rounded-md dark:bg-red-900/20 dark:text-red-400">
      {{ error }}
    </div>

    <div v-if="aiResult" class="space-y-6 border-t pt-6">
      <div class="space-y-2">
        <label for="title" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Title
        </label>
        <input
          id="title"
          v-model="aiResult.title"
          class="w-full px-4 py-3 border-2 border-emerald-300 rounded-2xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 shadow-lg focus:shadow-xl transition-all duration-300"
        />
      </div>

      <div class="space-y-2">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Summary</h3>
        <textarea
          v-model="aiResult.summary"
          rows="2"
          class="w-full px-4 py-3 border-2 border-emerald-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 shadow-lg focus:shadow-xl transition-all duration-300 resize-none"
        ></textarea>
      </div>

      <div class="space-y-2">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Steps</h3>
        <ol class="space-y-2">
          <li
            v-for="(step, index) in aiResult.steps"
            :key="index"
            class="flex items-start gap-3"
          >
            <span class="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-sm font-medium mt-1 dark:bg-emerald-900 dark:text-emerald-300">
              {{ index + 1 }}
            </span>
            <input
              v-model="aiResult.steps[index]"
              class="flex-1 px-4 py-3 border-2 border-emerald-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 text-base shadow-lg focus:shadow-xl transition-all duration-300"
            />
          </li>
        </ol>
      </div>

      <div class="space-y-2">
        <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Materials</h3>
        <ul class="space-y-2">
          <li
            v-for="(material, index) in aiResult.materials"
            :key="index"
            class="flex items-center gap-3"
          >
            <span class="w-2 h-2 bg-neutral-400 rounded-full flex-shrink-0"></span>
            <input
              v-model="aiResult.materials[index]"
              class="flex-1 px-4 py-3 border-2 border-emerald-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 text-base shadow-lg focus:shadow-xl transition-all duration-300"
            />
          </li>
        </ul>
      </div>

      <!-- Visibility and Mood Settings -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-3">
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Visibility
          </label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                type="radio"
                v-model="visibility"
                value="private"
                class="mr-2"
              />
              <span class="text-sm">Private (only me)</span>
            </label>
            <label class="flex items-center">
              <input
                type="radio"
                v-model="visibility"
                value="family"
                class="mr-2"
              />
              <span class="text-sm">Family</span>
            </label>
            <label class="flex items-center">
              <input
                type="radio"
                v-model="visibility"
                value="public"
                class="mr-2"
              />
              <span class="text-sm">Public</span>
            </label>
          </div>
        </div>

        <div class="space-y-3">
          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Mood (optional)
          </label>
          <div class="flex gap-2">
            <button
              v-for="moodOption in moods"
              :key="moodOption"
              @click="mood = mood === moodOption ? '' : moodOption"
              :class="[
                'w-12 h-12 rounded-lg border-2 text-2xl transition-colors',
                mood === moodOption
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
              ]"
            >
              {{ moodOption }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="saving" class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p class="text-blue-700 dark:text-blue-300">Saving tile...</p>
      </div>

      <div v-if="!activePairId" class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p class="text-yellow-800 dark:text-yellow-200 text-lg">
          You need an active pair to save tiles.
          <router-link to="/pairs" class="underline font-semibold">Go to My Pairs</router-link>
        </p>
      </div>

      <LargeButton
        @click="saveAndGoToMap"
        :disabled="!canSave || saving"
      >
        {{ saving ? 'Saving...' : 'Save → Map' }}
      </LargeButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { summariseTranscript, saveTile } from '@/lib/api'
import { usePairing } from '@/composables/usePairing'
import LargeButton from '@/components/LargeButton.vue'

const router = useRouter()
const { activePairId, loadPairs } = usePairing()
const transcript = ref('')
const loading = ref(false)
const saving = ref(false)
const error = ref('')

// Form data
const audioPath = ref<string | null>(null)
const photoPaths = ref<string[]>([])
const questId = ref('')
const visibility = ref<'private' | 'family' | 'public'>('private')
const mood = ref('')
const moods = ['🙂', '🤗', '❤️']

const aiResult = ref<{
  title: string
  summary: string
  steps: string[]
  materials: string[]
  tags: string[]
} | null>(null)

onMounted(async () => {
  await loadPairs()

  const state = history.state as {
    transcript?: string
    audioPath?: string
    photoPaths?: string[]
    questId?: string
  }

  if (state?.transcript) {
    transcript.value = state.transcript
  }
  if (state?.audioPath) {
    audioPath.value = state.audioPath
  }
  if (state?.photoPaths) {
    photoPaths.value = state.photoPaths
  }
  if (state?.questId) {
    questId.value = state.questId
  }
})

const canSave = computed(() => {
  return activePairId.value &&
    aiResult.value &&
    aiResult.value.title &&
    aiResult.value.steps.length >= 3 &&
    !saving.value
})

const generateSteps = async () => {
  loading.value = true
  error.value = ''

  try {
    const result = await summariseTranscript(transcript.value)
    aiResult.value = result

    // Save to history state for backup
    history.replaceState({
      ...history.state,
      ai: result
    }, '')
  } catch (err: any) {
    error.value = err.message || 'Failed to generate steps'
  } finally {
    loading.value = false
  }
}

const saveAndGoToMap = async () => {
  if (!aiResult.value || !canSave.value) return

  if (!activePairId.value) {
    error.value = 'Please select an active pair before saving. Go to My Pairs to pair with someone.'
    return
  }

  saving.value = true
  error.value = ''

  try {
    const mediaPaths = []
    if (audioPath.value) {
      mediaPaths.push({ kind: 'audio' as const, path: audioPath.value })
    }
    for (const photoPath of photoPaths.value) {
      mediaPaths.push({ kind: 'photo' as const, path: photoPath })
    }

    const { tileId } = await saveTile({
      pairId: activePairId.value,
      questId: questId.value || 'default',
      mediaPaths,
      ai: aiResult.value,
      mood: mood.value || undefined,
      visibility: visibility.value
    })

    console.log('Tile saved with ID:', tileId)

    router.push('/map')

  } catch (saveError: any) {
    console.error('Save error:', saveError)

    if (saveError.message?.includes('401')) {
      error.value = 'Please sign in again to save your tile.'
    } else if (saveError.message?.includes('403')) {
      error.value = 'Permission denied. You may not have access to save tiles.'
    } else {
      error.value = saveError.message || 'Failed to save tile. Please try again.'
    }
  } finally {
    saving.value = false
  }
}
</script>