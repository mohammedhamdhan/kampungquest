<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
        Turn 10 minutes into a memory.
      </h1>
      <p class="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
        Share your wisdom with the next generation through collaborative Teach Quests.
        Record your knowledge, create structured lessons, and help young minds learn from your experience.
      </p>
    </div>

    <div class="max-w-sm mx-auto space-y-3">
      <LargeButton @click="$router.push('/quests')">
        Start a Teach Quest
      </LargeButton>

      <div v-if="user" class="text-center">
        <router-link
          to="/map"
          class="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-sm font-medium underline hover:no-underline"
        >
          View your tiles →
        </router-link>
      </div>
    </div>

    <div v-if="!user" class="max-w-sm mx-auto">
      <AuthPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import LargeButton from '@/components/LargeButton.vue'
import AuthPanel from '@/pages/_parts/AuthPanel.vue'

const { user } = useAuth()
</script>