<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/dashboard" class="text-xl font-semibold text-gray-900">
              KampungQuest
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link
              to="/dashboard"
              class="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
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

    <main class="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Profile</h2>

        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Account Information
            </h3>

            <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Email address</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ user?.email || 'Not available' }}
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Account created</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ formatDate(user?.created_at) }}
                </dd>
              </div>
            </dl>

            <div class="mt-6 pt-6 border-t border-gray-200">
              <h4 class="text-md font-medium text-gray-900 mb-4">Account Settings</h4>

              <div class="space-y-4">
                <button
                  @click="handleSignOut"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign out of all devices
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Section -->
        <div class="mt-8 bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Your Impact
            </h3>
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div class="text-center">
                <div class="text-2xl font-bold text-indigo-600">{{ stats.recordings }}</div>
                <div class="text-sm text-gray-500">Recordings Made</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-indigo-600">{{ stats.summaries }}</div>
                <div class="text-sm text-gray-500">Wisdom Shared</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-indigo-600">{{ stats.totalTime }}</div>
                <div class="text-sm text-gray-500">Minutes Taught</div>
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

const { user, signOut } = useAuth()

const stats = ref({
  recordings: 0,
  summaries: 0,
  totalTime: 0
})

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Not available'
  return new Date(dateString).toLocaleDateString()
}

const handleSignOut = async () => {
  await signOut()
}
</script>