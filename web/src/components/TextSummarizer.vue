<template>
  <div class="space-y-4">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="relative group">
        <label for="transcript" class="block text-sm font-bold text-emerald-800 dark:text-emerald-200 mb-3 flex items-center gap-2">
          <span class="text-emerald-600 dark:text-emerald-400">💡</span>
          Share your wisdom or teaching
        </label>
        <div class="relative">
          <textarea
            id="transcript"
            v-model="transcript"
            rows="6"
            class="block w-full border-2 border-emerald-200/50 rounded-2xl px-4 py-3 text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-300 bg-white dark:bg-gray-800 resize-none shadow-lg focus:shadow-xl"
            placeholder="Tell us about something you'd like to teach the youth..."
            required
          ></textarea>
          <!-- Floating sparkle on focus -->
          <div class="absolute top-3 right-3 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300">
            <div class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      <div class="relative group">
        <label for="locale" class="block text-sm font-bold text-emerald-800 dark:text-emerald-200 mb-3 flex items-center gap-2">
          <span class="text-emerald-600 dark:text-emerald-400">🌏</span>
          Language/Region
        </label>
        <div class="relative">
          <select
            id="locale"
            v-model="selectedLocale"
            class="block w-full border-2 border-emerald-200/50 rounded-2xl px-4 py-3 text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-300 bg-white dark:bg-gray-800 shadow-lg focus:shadow-xl appearance-none cursor-pointer"
          >
            <option value="SG">🇸🇬 Singapore</option>
            <option value="MY">🇲🇾 Malaysia</option>
            <option value="ID">🇮🇩 Indonesia</option>
            <option value="TH">🇹🇭 Thailand</option>
            <option value="PH">🇵🇭 Philippines</option>
          </select>
          <!-- Custom dropdown arrow -->
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg class="w-5 h-5 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <button
        type="submit"
        :disabled="loading || !transcript.trim()"
        class="group relative w-full min-h-[48px] px-6 py-3 text-base font-bold rounded-2xl overflow-hidden transition-all duration-300 transform shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/30 active:scale-95 hover:scale-105 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 border border-emerald-400/20 shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100"
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
          <span v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white">
            <svg fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          <span v-if="!loading" class="mr-2">✨</span>
          {{ loading ? 'Creating Summary...' : 'Create AI Summary' }}
        </span>
      </button>
    </form>

    <div v-if="error" class="relative p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200/50 rounded-2xl shadow-lg backdrop-blur-sm dark:from-red-950/30 dark:to-pink-950/30 dark:border-red-700/50">
      <div class="flex items-center gap-2">
        <span class="text-red-500 text-lg">⚠️</span>
        <p class="text-sm font-medium text-red-700 dark:text-red-300">{{ error }}</p>
      </div>
    </div>

    <!-- Preview generated summary -->
    <div v-if="generatedSummary" class="border-t-2 border-emerald-200/30 pt-6 space-y-4">
      <h4 class="font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
        <span class="text-emerald-600 dark:text-emerald-400">📖</span>
        Generated Summary Preview
      </h4>

      <div class="bg-gradient-to-br from-emerald-50/80 via-teal-50/60 to-cyan-50/80 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30 rounded-2xl p-6 space-y-4 border-2 border-emerald-200/30 dark:border-emerald-700/30 shadow-xl backdrop-blur-sm">
        <div>
          <h5 class="font-semibold text-gray-900">{{ generatedSummary.title }}</h5>
          <p class="text-sm text-gray-600 mt-1">{{ generatedSummary.summary }}</p>
        </div>

        <div v-if="generatedSummary.steps?.length">
          <h6 class="text-sm font-medium text-gray-700 mb-2">Steps:</h6>
          <ol class="text-sm text-gray-600 space-y-1">
            <li v-for="(step, index) in generatedSummary.steps" :key="index" class="flex">
              <span class="text-indigo-600 font-medium mr-2">{{ index + 1 }}.</span>
              <span>{{ step }}</span>
            </li>
          </ol>
        </div>

        <div v-if="generatedSummary.materials?.length">
          <h6 class="text-sm font-medium text-gray-700 mb-2">Materials needed:</h6>
          <ul class="text-sm text-gray-600 space-y-1">
            <li v-for="material in generatedSummary.materials" :key="material" class="flex items-center">
              <span class="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
              <span>{{ material }}</span>
            </li>
          </ul>
        </div>

        <div v-if="generatedSummary.tags?.length" class="flex flex-wrap gap-2">
          <span
            v-for="tag in generatedSummary.tags"
            :key="tag"
            class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 via-teal-50 to-cyan-100 text-emerald-800 border border-emerald-200/50 shadow-sm dark:from-emerald-900/40 dark:via-teal-900/40 dark:to-cyan-900/40 dark:text-emerald-200 dark:border-emerald-700/50"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <div class="flex gap-3">
        <button
          @click="saveSummary"
          class="group relative flex-1 px-6 py-3 text-sm font-bold rounded-2xl overflow-hidden transition-all duration-300 transform shadow-lg hover:shadow-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 border border-emerald-400/20 shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
        >
          <!-- Background effects -->
          <div class="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          <div class="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700"></div>

          <!-- Content -->
          <span class="relative z-10 flex items-center justify-center gap-2">
            <span>💾</span>
            Save Summary
          </span>
        </button>
        <button
          @click="discardSummary"
          class="group relative px-6 py-3 border-2 border-gray-300/50 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-gray-50/80 dark:text-gray-300 dark:border-gray-600/50 dark:hover:from-gray-800/80 dark:hover:to-gray-700/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-500/20 backdrop-blur-sm"
        >
          <span class="relative z-10 flex items-center justify-center gap-2">
            <span>🗑️</span>
            Discard
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { summarizeText } from '@/services/api'
import type { SummarizeResponse } from '@/services/api'
import type { SummaryTile } from '@/types'

const emit = defineEmits<{
  'summary-created': [summary: SummaryTile]
}>()

const transcript = ref('')
const selectedLocale = ref('SG')
const loading = ref(false)
const error = ref('')
const generatedSummary = ref<SummarizeResponse | null>(null)

const handleSubmit = async () => {
  if (!transcript.value.trim()) return

  loading.value = true
  error.value = ''

  try {
    const result = await summarizeText(transcript.value, selectedLocale.value)
    generatedSummary.value = result
  } catch (err: any) {
    error.value = err.message || 'Failed to generate summary'
  } finally {
    loading.value = false
  }
}

const saveSummary = () => {
  if (generatedSummary.value) {
    const summary: SummaryTile = {
      id: Date.now().toString(),
      title: generatedSummary.value.title,
      summary: generatedSummary.value.summary,
      steps: generatedSummary.value.steps || [],
      materials: generatedSummary.value.materials || [],
      tags: generatedSummary.value.tags || [],
      originalTranscript: transcript.value,
      createdAt: new Date().toISOString()
    }

    emit('summary-created', summary)
    resetForm()
  }
}

const discardSummary = () => {
  generatedSummary.value = null
}

const resetForm = () => {
  transcript.value = ''
  generatedSummary.value = null
  error.value = ''
}
</script>