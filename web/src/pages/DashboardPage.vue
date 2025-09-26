<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">KampungQuest</h1>
          </div>
          <div class="flex items-center space-x-4">
            <router-link
              to="/profile"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Profile
            </router-link>
            <button
              @click="signOut"
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>

        <div class="grid gap-6 md:grid-cols-2">
          <!-- Audio Recording Card -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Record Your Wisdom
              </h3>
              <AudioRecorder @recording-complete="handleRecordingComplete" />
            </div>
          </div>

          <!-- Text Input Card -->
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                Share Your Knowledge
              </h3>
              <TextSummarizer @summary-created="handleSummaryCreated" />
            </div>
          </div>
        </div>

        <!-- Recent Tiles -->
        <div v-if="tiles.length > 0" class="mt-8">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Your Recent Teachings
          </h3>
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div
              v-for="tile in tiles"
              :key="tile.id"
              class="bg-white overflow-hidden shadow rounded-lg p-4"
            >
              <h4 class="font-semibold text-gray-900 mb-2">{{ tile.title }}</h4>
              <p class="text-sm text-gray-600 mb-3">{{ tile.summary }}</p>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="tag in tile.tags"
                  :key="tag"
                  class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import AudioRecorder from '@/components/AudioRecorder.vue'
import TextSummarizer from '@/components/TextSummarizer.vue'
import type { SummaryTile } from '@/types'

const { signOut } = useAuth()

const tiles = ref<SummaryTile[]>([])

const handleRecordingComplete = (audioBlob: Blob) => {
  console.log('Recording completed:', audioBlob)
  // TODO: Implement transcription and summarization
}

const handleSummaryCreated = (summary: SummaryTile) => {
  tiles.value.unshift({ ...summary, id: Date.now().toString() })
}
</script>