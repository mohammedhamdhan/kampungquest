<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePairing } from '@/composables/usePairing'

const router = useRouter()
const { pairs, activePair, loadPairs, setActivePair } = usePairing()

const showMenu = ref(false)

onMounted(async () => {
  await loadPairs()
})

const handleSetActivePair = async (pairId: string) => {
  await setActivePair(pairId)
  showMenu.value = false
}

const goToPairs = () => {
  showMenu.value = false
  router.push('/pairs')
}

const closeMenu = () => {
  showMenu.value = false
}
</script>

<template>
  <div class="relative">
    <button
      v-if="activePair"
      @click="showMenu = !showMenu"
      class="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors text-sm font-medium"
    >
      <span class="text-lg">🤝</span>
      <span class="hidden sm:inline">
        You & {{ activePair.partner_name }}
      </span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <button
      v-else
      @click="goToPairs"
      class="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
    >
      <span class="text-lg">🤝</span>
      <span class="hidden sm:inline">No pair selected</span>
    </button>

    <div
      v-if="showMenu"
      class="fixed inset-0 z-40"
      @click="closeMenu"
    ></div>

    <div
      v-if="showMenu"
      class="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
    >
      <div class="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Switch Active Pair</h3>
      </div>

      <div class="max-h-64 overflow-y-auto">
        <button
          v-for="pair in pairs"
          :key="pair.pair_id"
          @click="handleSetActivePair(pair.pair_id)"
          class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between"
          :class="[
            activePair?.pair_id === pair.pair_id
              ? 'bg-emerald-50 dark:bg-emerald-900/20'
              : ''
          ]"
        >
          <div>
            <p class="font-medium text-gray-900 dark:text-white">
              {{ pair.relationship === 'self' ? 'Demo (Self)' : pair.partner_name }}
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ pair.relationship }}
            </p>
          </div>
          <svg
            v-if="activePair?.pair_id === pair.pair_id"
            class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>

      <div class="p-2 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="goToPairs"
          class="w-full px-4 py-2 text-emerald-600 dark:text-emerald-400 font-medium rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-sm"
        >
          Manage Pairs
        </button>
      </div>
    </div>
  </div>
</template>