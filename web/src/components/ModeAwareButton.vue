<template>
  <button
    :class="buttonClasses"
    :style="buttonStyles"
    v-bind="$attrs"
    class="group relative overflow-hidden"
  >
    <!-- Button background effects -->
    <div v-if="props.variant === 'primary'" class="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>

    <!-- Shimmer effect -->
    <div class="absolute inset-0 -skew-x-12 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700"></div>

    <!-- Content -->
    <span class="relative z-10 flex items-center justify-center gap-2">
      <slot />
    </span>

    <!-- Floating particles for primary buttons -->
    <div v-if="props.variant === 'primary'" class="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <div class="absolute top-1 left-1/4 w-1 h-1 bg-white/60 rounded-full animate-ping delay-100"></div>
      <div class="absolute bottom-1 right-1/4 w-1 h-1 bg-white/60 rounded-full animate-ping delay-300"></div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMode } from '@/composables/useMode'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  fullWidth: false
})

const { isSeniorMode } = useMode()

const buttonClasses = computed(() => {
  const baseClasses = [
    'font-semibold rounded-2xl transition-all duration-300 transform',
    'focus:outline-none focus:ring-4 focus:ring-emerald-500/30',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'active:scale-95 hover:scale-105',
    'shadow-lg hover:shadow-2xl'
  ]

  // Senior mode gets larger targets and text
  const sizeClasses = {
    sm: isSeniorMode.value ? 'px-6 py-3 text-base min-h-[48px]' : 'px-4 py-2 text-sm min-h-[40px]',
    md: isSeniorMode.value ? 'px-10 py-5 text-lg min-h-[56px]' : 'px-6 py-3 text-base min-h-[44px]',
    lg: isSeniorMode.value ? 'px-16 py-8 text-xl min-h-[72px]' : 'px-8 py-4 text-lg min-h-[56px]'
  }

  const variantClasses = {
    primary: [
      'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white',
      'hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700',
      'focus:from-emerald-700 focus:via-teal-700 focus:to-cyan-700',
      'shadow-emerald-500/25 hover:shadow-emerald-500/40',
      'border border-emerald-400/20'
    ],
    secondary: [
      'bg-gradient-to-r from-gray-50 via-white to-gray-50 text-gray-800 border border-gray-200/50',
      'hover:from-gray-100 hover:via-gray-50 hover:to-gray-100',
      'focus:from-gray-100 focus:via-gray-50 focus:to-gray-100',
      'dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 dark:text-gray-100 dark:border-gray-600/50',
      'dark:hover:from-gray-700 dark:hover:via-gray-600 dark:hover:to-gray-700',
      'shadow-gray-500/10 hover:shadow-gray-500/20'
    ],
    outline: [
      'border-2 border-emerald-500/50 text-emerald-700 bg-gradient-to-r from-emerald-50/50 to-teal-50/50',
      'hover:border-emerald-600 hover:bg-gradient-to-r hover:from-emerald-100/80 hover:to-teal-100/80',
      'focus:border-emerald-600 focus:bg-gradient-to-r focus:from-emerald-100/80 focus:to-teal-100/80',
      'dark:text-emerald-300 dark:border-emerald-400/50 dark:from-emerald-900/30 dark:to-teal-900/30',
      'dark:hover:border-emerald-400 dark:hover:from-emerald-900/50 dark:hover:to-teal-900/50',
      'shadow-emerald-500/10 hover:shadow-emerald-500/20'
    ],
    ghost: [
      'text-gray-600 bg-transparent',
      'hover:bg-gradient-to-r hover:from-gray-100/80 hover:to-gray-50/80 hover:text-gray-800',
      'focus:bg-gradient-to-r focus:from-gray-100/80 focus:to-gray-50/80',
      'dark:text-gray-300 dark:hover:from-gray-800/80 dark:hover:to-gray-700/80',
      'dark:hover:text-gray-100 dark:focus:from-gray-800/80 dark:focus:to-gray-700/80',
      'shadow-none hover:shadow-lg'
    ]
  }

  const widthClass = props.fullWidth ? 'w-full' : ''

  return [
    ...baseClasses,
    sizeClasses[props.size],
    ...variantClasses[props.variant],
    widthClass
  ].filter(Boolean).join(' ')
})

const buttonStyles = computed(() => {
  // Senior mode gets higher contrast
  if (isSeniorMode.value && props.variant === 'primary') {
    return {
      '--tw-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
    }
  }
  return {}
})
</script>