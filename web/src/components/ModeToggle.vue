<template>
  <div class="inline-flex rounded-lg border border-gray-200 p-1 dark:border-gray-700">
    <button
      @click="setSessionMode('senior')"
      :class="[
        'px-3 py-1 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500',
        currentMode === 'senior'
          ? 'bg-emerald-500 text-white shadow-sm'
          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
      ]"
      :aria-pressed="currentMode === 'senior'"
    >
      Senior Mode
    </button>
    <button
      @click="setSessionMode('youth')"
      :class="[
        'px-3 py-1 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500',
        currentMode === 'youth'
          ? 'bg-emerald-500 text-white shadow-sm'
          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
      ]"
      :aria-pressed="currentMode === 'youth'"
    >
      Youth Mode
    </button>
  </div>

  <!-- Session mode indicator -->
  <div v-if="userSavedRole && currentMode !== userSavedRole" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
    Session mode (default: {{ userSavedRole }})
  </div>
</template>

<script setup lang="ts">
import { useMode } from '@/composables/useMode'

const { currentMode, userSavedRole, setSessionMode } = useMode()
</script>