<template>
  <button
    @click="$emit('click')"
    :disabled="disabled"
    :class="[
      'group relative w-full min-h-[48px] px-6 py-3 text-base font-bold rounded-2xl overflow-hidden transition-all duration-300 transform shadow-lg hover:shadow-2xl',
      'focus:outline-none focus:ring-4 focus:ring-emerald-500/30 active:scale-95 hover:scale-105',
      disabled
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400 shadow-none'
        : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 border border-emerald-400/20 shadow-emerald-500/25 hover:shadow-emerald-500/40'
    ]"
  >
    <!-- Background effects for enabled buttons -->
    <template v-if="!disabled">
      <!-- Animated gradient background -->
      <div class="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

      <!-- Shimmer effect -->
      <div class="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700"></div>

      <!-- Floating particles -->
      <div class="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div class="absolute top-2 left-1/4 w-1 h-1 bg-white/60 rounded-full animate-ping delay-100"></div>
        <div class="absolute bottom-2 right-1/4 w-1 h-1 bg-white/60 rounded-full animate-ping delay-300"></div>
        <div class="absolute top-1/2 right-8 w-0.5 h-0.5 bg-white/70 rounded-full animate-pulse delay-500"></div>
      </div>
    </template>

    <!-- Content -->
    <span class="relative z-10 flex items-center justify-center gap-2">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  disabled?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>