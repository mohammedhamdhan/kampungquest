<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ $t('community.title') }}
      </h1>
      <button
        @click="loadPublicTiles"
        class="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
      >
        Refresh
      </button>
    </div>

    <p class="text-gray-600 dark:text-gray-400">
      Discover skills and stories shared by the KampungQuest community
    </p>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      <p class="text-gray-500 dark:text-gray-400 mt-4">Loading community tiles...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 bg-red-50 text-red-700 rounded-lg">
      {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="publicTiles.length === 0" class="text-center py-16">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
      </svg>
      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
        No public tiles yet
      </h3>
      <p class="text-gray-500 dark:text-gray-400">
        Be the first to share your knowledge with the community!
      </p>
    </div>

    <!-- Tiles Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="tile in publicTiles"
        :key="tile.id"
        class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
      >
        <!-- Media -->
        <div v-if="tile.media && tile.media.length > 0" class="mb-4">
          <img
            v-if="tile.media[0].type === 'photo' && tile.media[0].url"
            :src="tile.media[0].url"
            :alt="tile.title"
            class="w-full h-48 object-cover rounded-lg"
          />
        </div>

        <!-- Title -->
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {{ tile.title }}
        </h3>

        <!-- Summary -->
        <p class="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
          {{ tile.summary }}
        </p>

        <!-- Steps Preview -->
        <div v-if="tile.steps_json && tile.steps_json.length > 0" class="mb-4">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Steps:
          </h4>
          <ol class="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li v-for="(step, index) in tile.steps_json.slice(0, 3)" :key="index">
              {{ step }}
            </li>
            <li v-if="tile.steps_json.length > 3" class="text-gray-500">
              ... and {{ tile.steps_json.length - 3 }} more steps
            </li>
          </ol>
        </div>

        <!-- Footer -->
        <div class="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ formatDate(tile.created_at) }}
          </span>

          <button
            @click="openReportModal(tile.id)"
            class="text-xs text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
          >
            {{ $t('community.report') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Report Modal -->
    <div
      v-if="showReportModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="closeReportModal"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
        @click.stop
      >
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {{ $t('community.report') }}
        </h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason
            </label>
            <select
              v-model="reportReason"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="inappropriate">{{ $t('community.reportReasons.inappropriate') }}</option>
              <option value="spam">{{ $t('community.reportReasons.spam') }}</option>
              <option value="copyright">{{ $t('community.reportReasons.copyright') }}</option>
              <option value="other">{{ $t('community.reportReasons.other') }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional details (optional)
            </label>
            <textarea
              v-model="reportDetails"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              placeholder="Provide more information..."
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button
              @click="closeReportModal"
              class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              @click="submitReport"
              :disabled="reportLoading"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {{ reportLoading ? 'Submitting...' : $t('common.submit') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Message -->
    <div
      v-if="successMessage"
      class="fixed bottom-4 right-4 px-6 py-4 bg-green-50 text-green-800 border border-green-200 rounded-lg shadow-lg"
    >
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCommunity } from '@/composables/useCommunity'

const { t } = useI18n()
const { publicTiles, loading, error, loadPublicTiles, reportTile } = useCommunity()

// Report modal state
const showReportModal = ref(false)
const reportTileId = ref<string | null>(null)
const reportReason = ref<'inappropriate' | 'spam' | 'copyright' | 'other'>('inappropriate')
const reportDetails = ref('')
const reportLoading = ref(false)
const successMessage = ref('')

onMounted(async () => {
  await loadPublicTiles()
})

const openReportModal = (tileId: string) => {
  reportTileId.value = tileId
  reportReason.value = 'inappropriate'
  reportDetails.value = ''
  showReportModal.value = true
}

const closeReportModal = () => {
  showReportModal.value = false
  reportTileId.value = null
}

const submitReport = async () => {
  if (!reportTileId.value) return

  reportLoading.value = true

  const result = await reportTile(
    reportTileId.value,
    reportReason.value,
    reportDetails.value || undefined
  )

  if (result.success) {
    showSuccess('Report submitted successfully. Thank you!')
    closeReportModal()
  } else {
    showSuccess('Failed to submit report. Please try again.')
  }

  reportLoading.value = false
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const showSuccess = (message: string) => {
  successMessage.value = message
  setTimeout(() => {
    successMessage.value = ''
  }, 5000)
}
</script>