<template>
  <div class="max-w-4xl mx-auto space-y-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ $t('settings.title') }}</h1>

    <!-- Language Settings -->
    <section class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {{ $t('settings.language') }}
      </h2>
      <select
        v-model="locale"
        class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
      >
        <option v-for="loc in availableLocales" :key="loc.code" :value="loc.code">
          {{ loc.nativeName }} ({{ loc.name }})
        </option>
      </select>
    </section>

    <!-- Accessibility Settings -->
    <section class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {{ $t('settings.accessibility') }}
      </h2>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('settings.fontScale') }}: {{ fontScale.toFixed(1) }}x
          </label>
          <input
            type="range"
            v-model.number="fontScale"
            @change="saveFontScale"
            min="0.8"
            max="1.5"
            step="0.1"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Smaller</span>
            <span>Normal</span>
            <span>Larger</span>
          </div>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p :style="{ fontSize: `${fontScale}rem` }" class="text-gray-900 dark:text-white">
            Sample text: This is how your text will appear at {{ fontScale.toFixed(1) }}x scale.
          </p>
        </div>
      </div>
    </section>

    <!-- Privacy & Data -->
    <section class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {{ $t('privacy.title') }}
      </h2>

      <div class="space-y-6">
        <!-- Default Visibility -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('privacy.defaultVisibility') }}
          </label>
          <select
            v-model="defaultVisibility"
            @change="handleDefaultVisibilityChange"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="private">{{ $t('tiles.private') }} - Only you and your pair</option>
            <option value="family">{{ $t('tiles.family') }} - Extended family (coming soon)</option>
            <option value="public">{{ $t('tiles.public') }} - Everyone on community wall</option>
          </select>
        </div>

        <!-- Bulk Actions -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t('privacy.bulkUpdate') }}
          </label>
          <button
            @click="handleBulkPrivate"
            :disabled="!activePair || bulkLoading"
            class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ bulkLoading ? 'Updating...' : $t('privacy.setAllPrivate') }}
          </button>
          <p v-if="bulkSuccess" class="text-sm text-green-600 dark:text-green-400 mt-2">
            ✓ Updated {{ bulkSuccess }} tiles
          </p>
        </div>
      </div>
    </section>

    <!-- Recently Deleted -->
    <section
      v-if="deletedTiles.length > 0"
      class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {{ $t('privacy.recentlyDeleted') }}
      </h2>

      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Tiles deleted within the last 7 days can be restored.
      </p>

      <div class="space-y-3">
        <div
          v-for="tile in deletedTiles"
          :key="tile.id"
          class="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <div class="flex-1">
            <div class="font-medium text-gray-900 dark:text-white">{{ tile.title }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              Deleted {{ formatDate(tile.deleted_at!) }}
            </div>
          </div>
          <button
            @click="handleRestore(tile.id)"
            :disabled="restoreLoading"
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {{ $t('tiles.restore') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Data Export -->
    <section class="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {{ $t('privacy.downloadData') }}
      </h2>

      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Export all your tiles and media files as a ZIP archive.
      </p>

      <button
        @click="handleExportData"
        :disabled="!activePair || exportLoading"
        class="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
      >
        <svg v-if="exportLoading" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ exportLoading ? `Exporting... ${exportProgress}%` : $t('privacy.downloadData') }}</span>
      </button>
    </section>

    <!-- Danger Zone -->
    <section class="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800">
      <h2 class="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
        Danger Zone
      </h2>

      <p class="text-sm text-gray-700 dark:text-gray-300 mb-4">
        {{ $t('privacy.deleteAccountConfirm') }}
      </p>

      <button
        @click="handleDeleteAccount"
        :disabled="deleteLoading"
        class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
      >
        {{ deleteLoading ? 'Deleting...' : $t('privacy.deleteAccount') }}
      </button>
    </section>

    <!-- Success/Error Messages -->
    <div
      v-if="message"
      :class="[
        'fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-lg max-w-md',
        messageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
      ]"
    >
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { availableLocales } from '@/i18n'
import { usePrivacy } from '@/composables/usePrivacy'
import { useDataExport } from '@/composables/useDataExport'
import { usePairing } from '@/composables/usePairing'
import { useUserPreferences } from '@/composables/useUserPreferences'

const { t, locale } = useI18n()
const router = useRouter()

const {
  deletedTiles,
  loadDeletedTiles,
  restoreTile,
  updateDefaultVisibility,
  bulkUpdateVisibility,
  deleteAccount
} = usePrivacy()

const { exportPairData, loading: exportLoading, progress: exportProgress } = useDataExport()
const { activePair } = usePairing()
const { preferences, updatePreferences, loadPreferences } = useUserPreferences()

// Local state
const fontScale = ref(1.0)
const defaultVisibility = ref<'private' | 'family' | 'public'>('private')
const bulkLoading = ref(false)
const bulkSuccess = ref<number | null>(null)
const restoreLoading = ref(false)
const deleteLoading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

// Load user preferences on mount
onMounted(async () => {
  await loadPreferences()
  await loadDeletedTiles()

  if (preferences.value) {
    fontScale.value = preferences.value.font_scale || 1.0
  }

  // Apply font scale to root
  applyFontScale()
})

// Watch locale changes and save to preferences
watch(locale, async (newLocale) => {
  if (preferences.value) {
    await updatePreferences({ language_preference: newLocale })
  }
  // Also save to localStorage as backup
  localStorage.setItem('kampungquest_locale', newLocale)
})

// Watch font scale and apply immediately
watch(fontScale, () => {
  applyFontScale()
})

const applyFontScale = () => {
  document.documentElement.style.setProperty('--font-scale', fontScale.value.toString())
}

const saveFontScale = async () => {
  await updatePreferences({ font_scale: fontScale.value })
  showMessage('Font size updated', 'success')
}

const handleDefaultVisibilityChange = async () => {
  const success = await updateDefaultVisibility(defaultVisibility.value)
  if (success) {
    showMessage('Default visibility updated', 'success')
  } else {
    showMessage('Failed to update default visibility', 'error')
  }
}

const handleBulkPrivate = async () => {
  if (!activePair.value) {
    showMessage('No active pair selected', 'error')
    return
  }

  if (!confirm('Set all your tiles to Private? This cannot be undone easily.')) {
    return
  }

  bulkLoading.value = true
  bulkSuccess.value = null

  const result = await bulkUpdateVisibility(activePair.value.pair_id, 'private')

  if (result.success) {
    bulkSuccess.value = result.count
    showMessage(`Updated ${result.count} tiles to Private`, 'success')
  } else {
    showMessage('Failed to update tiles', 'error')
  }

  bulkLoading.value = false
}

const handleRestore = async (tileId: string) => {
  restoreLoading.value = true
  const success = await restoreTile(tileId)

  if (success) {
    showMessage('Tile restored successfully', 'success')
    await loadDeletedTiles() // Reload the list
  } else {
    showMessage('Failed to restore tile', 'error')
  }

  restoreLoading.value = false
}

const handleExportData = async () => {
  if (!activePair.value) {
    showMessage('No active pair selected', 'error')
    return
  }

  const success = await exportPairData(activePair.value.pair_id)

  if (success) {
    showMessage('Data exported successfully', 'success')
  } else {
    showMessage('Failed to export data', 'error')
  }
}

const handleDeleteAccount = async () => {
  const confirmation = prompt(
    'This will permanently delete your account and all data. Type "DELETE" to confirm.'
  )

  if (confirmation !== 'DELETE') {
    return
  }

  deleteLoading.value = true
  const success = await deleteAccount()

  if (success) {
    showMessage('Account deleted. Redirecting...', 'success')
    setTimeout(() => {
      router.push('/')
    }, 2000)
  } else {
    showMessage('Failed to delete account', 'error')
  }

  deleteLoading.value = false
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString()
}

const showMessage = (text: string, type: 'success' | 'error') => {
  message.value = text
  messageType.value = type

  setTimeout(() => {
    message.value = ''
  }, 5000)
}
</script>

<style scoped>
/* Custom range slider styling */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #10b981;
  cursor: pointer;
  border: none;
}
</style>