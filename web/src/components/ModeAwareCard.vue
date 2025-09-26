<template>
  <div :class="cardClasses" class="group relative overflow-hidden">
    <!-- Card background effects -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/60 via-emerald-50/30 to-teal-50/60 dark:from-gray-800/60 dark:via-emerald-950/30 dark:to-teal-950/60"></div>

    <!-- Animated border -->
    <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-200/50 via-teal-200/50 to-cyan-200/50 dark:from-emerald-800/50 dark:via-teal-800/50 dark:to-cyan-800/50 p-[1px]">
      <div class="h-full w-full rounded-2xl bg-gradient-to-br from-white/80 to-emerald-50/80 dark:from-gray-900/80 dark:to-emerald-950/80"></div>
    </div>

    <!-- Floating particles on hover -->
    <div v-if="clickable" class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <div class="absolute top-4 right-6 w-1 h-1 bg-emerald-400/60 rounded-full animate-ping delay-100"></div>
      <div class="absolute bottom-6 left-4 w-1 h-1 bg-teal-400/60 rounded-full animate-ping delay-300"></div>
      <div class="absolute top-1/2 right-4 w-0.5 h-0.5 bg-cyan-400/60 rounded-full animate-pulse delay-500"></div>
    </div>

    <!-- Shimmer effect on hover -->
    <div v-if="clickable" class="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000"></div>

    <!-- Content -->
    <div class="relative z-10">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMode } from '@/composables/useMode'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  clickable?: boolean
  elevated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  clickable: false,
  elevated: false
})

const { isSeniorMode } = useMode()

const cardClasses = computed(() => {
  const baseClasses = [
    'bg-white rounded-lg border border-gray-200',
    'dark:bg-gray-800 dark:border-gray-700',
    'transition-all duration-200'
  ]

  // Senior mode gets larger padding and text
  const sizeClasses = {
    sm: isSeniorMode.value ? 'p-4' : 'p-3',
    md: isSeniorMode.value ? 'p-6' : 'p-4',
    lg: isSeniorMode.value ? 'p-8' : 'p-6'
  }

  const interactionClasses = []
  if (props.clickable) {
    interactionClasses.push(
      'cursor-pointer hover:shadow-lg hover:border-emerald-300',
      'focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2',
      'active:scale-[0.99]'
    )
  }

  const elevationClasses = []
  if (props.elevated || isSeniorMode.value) {
    elevationClasses.push('shadow-lg')
    if (props.clickable) {
      elevationClasses.push('hover:shadow-xl')
    }
  } else {
    elevationClasses.push('shadow-sm')
    if (props.clickable) {
      elevationClasses.push('hover:shadow-md')
    }
  }

  return [
    ...baseClasses,
    sizeClasses[props.size],
    ...interactionClasses,
    ...elevationClasses
  ].filter(Boolean).join(' ')
})
</script>