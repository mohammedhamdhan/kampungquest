<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/composables/useAuth'
import LargeButton from '@/components/LargeButton.vue'
import type { UserRole } from '@/types'

const router = useRouter()
const { user } = useAuth()
const selectedRole = ref<UserRole | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const selectRole = async (role: UserRole) => {
  if (!user.value) return

  selectedRole.value = role
  loading.value = true
  error.value = null

  try {
    const displayName = user.value.email?.split('@')[0] || 'User'

    const { error: updateError } = await supabase
      .from('users')
      .upsert({
        id: user.value.id,
        display_name: displayName,
        role: role
      }, {
        onConflict: 'id'
      })

    if (updateError) throw updateError

    router.push('/quests')
  } catch (err) {
    console.error('Error setting role:', err)
    error.value = 'Failed to save your choice. Please try again.'
    selectedRole.value = null
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex flex-col items-center justify-center">
    <div class="text-center max-w-2xl mx-auto px-4">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome to KampungQuest!
      </h1>

      <p class="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12">
        How would you like to use the app?
      </p>

      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <button
          @click="selectRole('senior')"
          :disabled="loading"
          class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-left transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div class="relative z-10">
            <div class="text-5xl mb-4">👴</div>
            <h3 class="text-2xl md:text-3xl font-bold text-white mb-3">Senior</h3>
            <p class="text-emerald-50 text-lg">
              I want to share my knowledge and teach what I know
            </p>
          </div>
          <div v-if="selectedRole === 'senior' && loading" class="absolute inset-0 bg-white/20 flex items-center justify-center">
            <div class="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </button>

        <button
          @click="selectRole('youth')"
          :disabled="loading"
          class="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-left transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div class="relative z-10">
            <div class="text-5xl mb-4">🧑</div>
            <h3 class="text-2xl md:text-3xl font-bold text-white mb-3">Youth</h3>
            <p class="text-blue-50 text-lg">
              I want to learn from others and preserve their wisdom
            </p>
          </div>
          <div v-if="selectedRole === 'youth' && loading" class="absolute inset-0 bg-white/20 flex items-center justify-center">
            <div class="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </button>
      </div>

      <p v-if="error" class="text-red-600 dark:text-red-400 text-lg mb-4">
        {{ error }}
      </p>

      <p class="text-gray-500 dark:text-gray-400 text-base">
        You can always change this later in your profile
      </p>
    </div>
  </div>
</template>