<template>
  <div
    v-if="streakDisplay"
    :class="[
      'relative inline-flex items-center gap-2 rounded-2xl text-sm font-bold overflow-hidden',
      'bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 text-white shadow-lg',
      'hover:shadow-2xl hover:scale-110 transition-all duration-300 cursor-pointer',
      'border-2 border-white/30 backdrop-blur-sm',
      'animate-pulse hover:animate-none',
      isSeniorMode ? 'px-5 py-3 text-base' : 'px-4 py-2 text-sm'
    ]"
    @click="$emit('click')"
    role="button"
    tabindex="0"
    :aria-label="`Current streak: ${streakDisplay}. Click for details.`"
    @keydown.enter="$emit('click')"
    @keydown.space.prevent="$emit('click')"
  >
    <!-- Animated background -->
    <div class="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 animate-pulse"></div>

    <!-- Content -->
    <div class="relative z-10 flex items-center gap-2">
      <span class="drop-shadow-sm">Streak:</span>
      <span class="font-extrabold drop-shadow-sm text-yellow-100">{{ streakDisplay }}</span>

      <!-- Sparkle effect -->
      <div class="flex">
        <span class="animate-bounce text-yellow-200">✨</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMode } from '@/composables/useMode'

defineProps<{
  streakDisplay: string | null
}>()

defineEmits<{
  click: []
}>()

const { isSeniorMode } = useMode()
</script>