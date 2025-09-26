<template>
  <div v-if="user" class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Your Profile</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">Manage your account and view your teaching progress</p>
    </div>

    <div class="grid lg:grid-cols-3 gap-8">
      <!-- Left Sidebar - Account Info -->
      <div class="lg:col-span-1 space-y-6">
        <!-- Profile Card -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <!-- Avatar Circle -->
          <div class="flex flex-col items-center text-center mb-6">
            <div class="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-3">
              <span class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {{ user.email?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <h2 class="text-base font-semibold text-gray-900 dark:text-gray-100 break-all px-2 leading-tight">{{ user.email }}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Member since {{ formatDate(user.created_at) }}</p>
          </div>

          <!-- Account Details -->
          <div class="space-y-4">
            <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span class="text-sm text-gray-500 dark:text-gray-400">Status</span>
              <span class="text-sm font-medium text-emerald-600 dark:text-emerald-400">Active</span>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span class="text-sm text-gray-500 dark:text-gray-400">Last sign in</span>
              <span class="text-sm text-gray-900 dark:text-gray-100">{{ formatDate(user.last_sign_in_at) }}</span>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-sm text-gray-500 dark:text-gray-400">User ID</span>
              <span class="text-xs text-gray-600 dark:text-gray-400 font-mono">{{ user.id.slice(0, 8) }}...</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <button
              @click="$router.push('/quests')"
              class="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Start Teaching Quest
            </button>

            <button
              @click="$router.push('/map')"
              class="w-full flex items-center justify-center gap-2 border border-emerald-600 text-emerald-600 px-4 py-3 rounded-lg hover:bg-emerald-50 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-900/10 transition-colors font-medium"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              View Your Tiles
            </button>

            <button
              @click="handleSignOut"
              class="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-4 py-3 rounded-lg transition-colors font-medium"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <!-- Right Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Teaching Stats -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Teaching Statistics</h3>
            <div class="text-sm text-gray-500 dark:text-gray-400">
              All time
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <div class="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{{ stats.questsCompleted }}</div>
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Quests Completed</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Teaching sessions</div>
            </div>

            <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{{ stats.tilesCreated }}</div>
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Tiles Created</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Knowledge shared</div>
            </div>

            <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div class="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{{ stats.recordingMinutes }}</div>
              <div class="text-sm font-medium text-gray-700 dark:text-gray-300">Minutes Recorded</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">Voice teachings</div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Recent Activity</h3>

          <div class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Account created</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(user.created_at) }}</p>
              </div>
            </div>

            <div class="text-center py-8 text-gray-500 dark:text-gray-400">
              <svg class="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
              </svg>
              <p class="text-sm">Start your first quest to see activity here!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Not logged in state -->
  <div v-else class="text-center py-12">
    <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Sign in to view your profile</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-6">You need to be signed in to access your profile and teaching stats.</p>

    <div class="max-w-sm mx-auto">
      <AuthPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { listTiles } from '@/lib/api'
import LargeButton from '@/components/LargeButton.vue'
import AuthPanel from '@/pages/_parts/AuthPanel.vue'

const router = useRouter()
const { user, signOut } = useAuth()

const stats = ref({
  questsCompleted: 0,
  tilesCreated: 0,
  recordingMinutes: 0
})

const loadStats = async () => {
  if (!user.value) return

  try {
    const tiles = await listTiles()
    stats.value.tilesCreated = tiles.length
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

onMounted(() => {
  loadStats()
})

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleSignOut = async () => {
  try {
    await signOut()
    router.push('/')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}
</script>