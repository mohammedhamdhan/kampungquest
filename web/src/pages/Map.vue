<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Your Tiles</h1>

    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500 dark:text-gray-400">Fetching your tiles...</p>
    </div>

    <div v-else-if="error" class="p-4 bg-red-50 text-red-700 rounded-md dark:bg-red-900/20 dark:text-red-400">
      {{ error }}
      <button @click="loadTiles" class="ml-2 underline hover:no-underline">
        Try again
      </button>
    </div>

    <div v-else-if="!activePairId" class="text-center py-16">
      <div class="text-6xl mb-4">🤝</div>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">No Active Pair</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-8 text-lg">
        Pair with someone to start creating and viewing memory tiles
      </p>
      <LargeButton @click="$router.push('/pairs')">
        Pair with Someone
      </LargeButton>
    </div>

    <div v-else-if="tiles.length === 0" class="text-center py-12">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
      </svg>
      <p class="text-gray-500 dark:text-gray-400 mb-2 text-lg">No tiles yet with {{ activePair?.partner_name || 'this pair' }}</p>
      <p class="text-gray-500 dark:text-gray-400 mb-6">Start your first Teach Quest!</p>
    </div>

    <div v-else class="grid gap-6">
      <div
        v-for="tile in tiles"
        :key="tile.id"
        class="border border-neutral-200 rounded-xl p-6 dark:border-neutral-700 bg-white dark:bg-gray-800 shadow-sm"
      >
        <!-- Title and Date -->
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {{ tile.title }}
          </h2>
          <time class="text-sm text-gray-500 dark:text-gray-400">
            {{ formatDate(tile.created_at) }}
          </time>
        </div>

        <!-- Summary -->
        <p class="text-neutral-700 dark:text-neutral-300 mb-4 line-clamp-2">
          {{ tile.summary }}
        </p>

        <!-- Media -->
        <div v-if="tile.media.length > 0" class="mb-4 space-y-3">
          <div v-for="mediaItem in tile.media" :key="mediaItem.url" class="media-item">
            <img
              v-if="mediaItem.kind === 'photo'"
              :src="mediaItem.url"
              :alt="tile.title"
              class="w-full h-48 object-cover rounded-lg"
              loading="lazy"
            />
            <audio
              v-else-if="mediaItem.kind === 'audio'"
              :src="mediaItem.url"
              controls
              class="w-full"
              preload="none"
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        </div>

        <!-- Steps -->
        <div v-if="tile.steps?.length" class="space-y-2">
          <h3 class="font-medium text-neutral-900 dark:text-neutral-100">Steps:</h3>
          <ol class="space-y-2">
            <li
              v-for="(step, index) in expandedTiles.has(tile.id) ? tile.steps : tile.steps.slice(0, 3)"
              :key="index"
              class="flex items-start gap-3"
            >
              <span class="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-sm font-medium dark:bg-emerald-900 dark:text-emerald-300">
                {{ index + 1 }}
              </span>
              <span class="text-sm text-neutral-700 dark:text-neutral-300">{{ step }}</span>
            </li>
          </ol>
          <button
            v-if="tile.steps.length > 3"
            @click="toggleExpand(tile.id)"
            class="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 ml-9 underline"
          >
            {{ expandedTiles.has(tile.id) ? 'Show less' : `... and ${tile.steps.length - 3} more steps` }}
          </button>
        </div>

        <!-- Materials -->
        <div v-if="tile.materials?.length" class="mt-4 space-y-2">
          <h3 class="font-medium text-neutral-900 dark:text-neutral-100">Materials:</h3>
          <ul class="space-y-1">
            <li
              v-for="(material, index) in expandedTiles.has(tile.id) ? tile.materials : tile.materials.slice(0, 3)"
              :key="index"
              class="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300"
            >
              <span class="w-1.5 h-1.5 bg-neutral-400 rounded-full flex-shrink-0"></span>
              {{ material }}
            </li>
          </ul>
          <button
            v-if="tile.materials.length > 3 && !expandedTiles.has(tile.id)"
            @click="toggleExpand(tile.id)"
            class="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 ml-4 underline"
          >
            ... and {{ tile.materials.length - 3 }} more materials
          </button>
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="space-y-3 mt-8">
      <LargeButton @click="$router.push('/quests')">
        {{ tiles.length > 0 ? 'Start Another Quest' : 'Start Your First Quest' }}
      </LargeButton>

      <button
        v-if="tiles.length > 0"
        @click="loadTiles"
        class="w-full px-4 py-2 text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors text-sm font-medium dark:text-gray-400 dark:hover:text-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
      >
        Refresh Tiles
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { listTiles } from '@/lib/api'
import { usePairing } from '@/composables/usePairing'
import LargeButton from '@/components/LargeButton.vue'

const router = useRouter()
const { activePair, activePairId, loadPairs } = usePairing()

const tiles = ref<Array<{
  id: string
  title: string
  summary: string
  steps: string[]
  materials: string[]
  created_at: string
  media: Array<{ kind: 'audio' | 'photo', url: string }>
}>>([])

const expandedTiles = ref<Set<string>>(new Set())
const loading = ref(false)
const error = ref('')

const toggleExpand = (tileId: string) => {
  if (expandedTiles.value.has(tileId)) {
    expandedTiles.value.delete(tileId)
  } else {
    expandedTiles.value.add(tileId)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const loadTiles = async () => {
  if (!activePairId.value) {
    tiles.value = []
    return
  }

  loading.value = true
  error.value = ''

  try {
    const fetchedTiles = await listTiles(activePairId.value)
    tiles.value = fetchedTiles
  } catch (fetchError: any) {
    console.error('Error loading tiles:', fetchError)

    if (fetchError.message?.includes('401')) {
      error.value = 'Please sign in to see your tiles.'
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      error.value = fetchError.message || 'Failed to load tiles. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadPairs()
  loadTiles()
})

watch(activePairId, () => {
  if (activePairId.value) {
    loadTiles()
  }
})
</script>