<template>
  <ModeAwareCard
    @click="$router.push(`/teach/${questId}`)"
    :size="isSeniorMode ? 'lg' : 'md'"
    clickable
    elevated
    tabindex="0"
    role="button"
    :aria-label="`Start ${name} quest, ${minutes} minutes`"
    @keydown.enter="$router.push(`/teach/${questId}`)"
    @keydown.space.prevent="$router.push(`/teach/${questId}`)"
    class="group quest-card"
  >
    <!-- Enhanced quest icon with glow effect -->
    <div class="absolute top-4 left-4 flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-400/20 via-teal-400/20 to-cyan-400/20 rounded-2xl backdrop-blur-sm border border-emerald-300/30 group-hover:scale-110 transition-all duration-300">
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-2xl animate-pulse group-hover:animate-none"></div>
      <svg class="relative z-10 w-6 h-6 text-emerald-600 dark:text-emerald-400 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
      </svg>
    </div>

    <!-- Floating sparkles on hover -->
    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
      <div class="absolute top-6 right-8 w-1 h-1 bg-yellow-400/70 rounded-full animate-ping delay-100"></div>
      <div class="absolute bottom-8 left-6 w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-pulse delay-300"></div>
      <div class="absolute top-1/2 right-6 w-0.5 h-0.5 bg-emerald-400/80 rounded-full animate-bounce delay-500"></div>
    </div>

    <div :class="[
      'flex items-start justify-between relative z-10',
      isSeniorMode ? 'gap-6 pl-20' : 'gap-4 pl-20'
    ]">
      <div class="flex-1">
        <!-- Enhanced title with better contrast -->
        <h3 :class="[
          'font-bold text-gray-900 dark:text-gray-50 drop-shadow-sm',
          isSeniorMode ? 'text-2xl mb-3' : 'text-xl mb-2'
        ]">
          {{ name }}
        </h3>

        <!-- Enhanced time display with icon -->
        <div :class="[
          'flex items-center gap-2 text-emerald-700 dark:text-emerald-300',
          isSeniorMode ? 'text-lg mb-3' : 'text-base mb-2'
        ]">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
          </svg>
          <span class="font-bold">{{ minutes }} minutes</span>
        </div>

        <!-- Youth Mode: Enhanced description and jazzy tags -->
        <div v-if="isYouthMode" class="space-y-3">
          <p v-if="description" class="text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
            {{ description }}
          </p>
          <div v-if="tags && tags.length > 0" class="flex gap-2 flex-wrap">
            <span
              v-for="tag in tags"
              :key="tag"
              class="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-emerald-100 via-teal-50 to-cyan-100 text-emerald-900 rounded-full border border-emerald-200/50 shadow-sm hover:shadow-md transition-all duration-200 dark:from-emerald-800 dark:via-teal-800 dark:to-cyan-800 dark:text-emerald-100 dark:border-emerald-600/50"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- Enhanced arrow with glow effect -->
      <div class="flex-shrink-0 relative">
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-md group-hover:blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
        <div class="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl border border-emerald-200/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg group-hover:shadow-xl dark:from-emerald-900/30 dark:to-teal-900/30 dark:border-emerald-700/50">
          <svg
            :class="[
              'text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform duration-300',
              isSeniorMode ? 'w-6 h-6' : 'w-5 h-5'
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2.5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Subtle progress indicator for completed quests (if applicable) -->
    <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 rounded-b-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 dark:from-emerald-800 dark:via-teal-800 dark:to-cyan-800"></div>
  </ModeAwareCard>
</template>

<script setup lang="ts">
import { useMode } from '@/composables/useMode'
import ModeAwareCard from '@/components/ModeAwareCard.vue'

defineProps<{
  questId: string
  name: string
  minutes: number
  tags?: string[]
  description?: string
}>()

const { isSeniorMode, isYouthMode } = useMode()
</script>