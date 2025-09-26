<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { usePairing } from '@/composables/usePairing'

const route = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()
const { acceptInvite } = usePairing()

const inviteCode = ref<string>('')
const loading = ref(true)
const success = ref(false)
const error = ref<string | null>(null)
const inviterName = ref<string>('')

onMounted(async () => {
  inviteCode.value = (route.params.code as string)?.toUpperCase() || ''

  if (!inviteCode.value) {
    error.value = 'Invalid invite link'
    loading.value = false
    return
  }

  if (!isAuthenticated.value) {
    error.value = 'Please log in first to accept this invite'
    loading.value = false
    return
  }

  try {
    const result = await acceptInvite(inviteCode.value)
    inviterName.value = result.inviterName
    success.value = true

    setTimeout(() => {
      router.push('/map')
    }, 3000)
  } catch (err: any) {
    console.error('Error accepting invite:', err)
    if (err.message.includes('already been used')) {
      error.value = 'This invite has already been used. Please ask for a new invite link.'
    } else if (err.message.includes('expired')) {
      error.value = 'This invite has expired. Please ask for a new invite link.'
    } else if (err.message.includes('cannot accept your own')) {
      error.value = 'You cannot accept your own invite. Use "Create Self Pair" in My Pairs for demo purposes.'
    } else if (err.message.includes('Invalid')) {
      error.value = 'Invalid invite code. Please check the link and try again.'
    } else {
      error.value = 'Something went wrong. Please try again or ask for a new invite link.'
    }
  } finally {
    loading.value = false
  }
})

const goToAuth = () => {
  router.push(`/auth?redirect=/join/${inviteCode.value}`)
}

const goToPairs = () => {
  router.push('/pairs')
}
</script>

<template>
  <div class="min-h-[80vh] flex flex-col items-center justify-center">
    <div class="text-center max-w-2xl mx-auto px-4">
      <div v-if="loading" class="space-y-6">
        <div class="w-20 h-20 mx-auto border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          Joining pair...
        </h1>
      </div>

      <div v-else-if="success" class="space-y-6">
        <div class="text-8xl mb-4">✅</div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Successfully Paired!
        </h1>
        <p class="text-2xl text-gray-600 dark:text-gray-300">
          You're now paired with <span class="font-semibold text-emerald-600 dark:text-emerald-400">{{ inviterName }}</span>
        </p>
        <p class="text-lg text-gray-500 dark:text-gray-400">
          Redirecting to your map...
        </p>
      </div>

      <div v-else-if="!isAuthenticated" class="space-y-6">
        <div class="text-8xl mb-4">🔐</div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Log In Required
        </h1>
        <p class="text-2xl text-gray-600 dark:text-gray-300 mb-8">
          Please log in first to accept this pair invite
        </p>
        <button
          @click="goToAuth"
          class="px-8 py-4 bg-emerald-600 text-white text-xl rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
        >
          Go to Login
        </button>
      </div>

      <div v-else-if="error" class="space-y-6">
        <div class="text-8xl mb-4">❌</div>
        <h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Couldn't Join Pair
        </h1>
        <p class="text-2xl text-gray-600 dark:text-gray-300 mb-8">
          {{ error }}
        </p>
        <button
          @click="goToPairs"
          class="px-8 py-4 bg-emerald-600 text-white text-xl rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
        >
          Go to My Pairs
        </button>
      </div>
    </div>
  </div>
</template>