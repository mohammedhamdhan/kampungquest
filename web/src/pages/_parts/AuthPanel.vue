<template>
  <div class="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
    <!-- Step 1: Email Input -->
    <form v-if="!otpSent" @submit.prevent="sendMagicLink" class="space-y-3">
      <div>
        <input
          v-model="email"
          type="email"
          placeholder="Enter your email"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>
      <button
        type="submit"
        :disabled="loading"
        class="w-full px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ loading ? 'Sending...' : 'Send magic link' }}
      </button>
    </form>

    <!-- Step 2: Magic Link Sent -->
    <div v-else class="space-y-3">
      <div class="text-center py-6">
        <div class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Check your email
        </div>
        <div class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          We sent a magic link to <strong>{{ email }}</strong>. Click the link in the email to sign in.
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-500">
          The link will expire in 1 hour.
        </div>
      </div>
      <button
        type="button"
        @click="resetForm"
        class="w-full px-4 py-2 text-gray-600 hover:text-gray-800 text-sm dark:text-gray-400 dark:hover:text-gray-200"
      >
        ← Back to email
      </button>
    </div>

    <div v-if="message" :class="[
      'mt-3 p-3 rounded-md text-sm',
      success ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
    ]">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { signInWithOtp, verifyOtp: authVerifyOtp } = useAuth()

const email = ref('')
const otpCode = ref('')
const loading = ref(false)
const message = ref('')
const success = ref(false)
const otpSent = ref(false)

const sendMagicLink = async () => {
  loading.value = true
  message.value = ''

  try {
    console.log('Attempting to send OTP to:', email.value)
    await signInWithOtp(email.value)

    message.value = 'Magic link sent! Check your email.'
    success.value = true
    otpSent.value = true
  } catch (error: any) {
    console.error('Auth error:', error)
    message.value = error.message || 'Failed to send magic link'
    success.value = false
  } finally {
    loading.value = false
  }
}

const verifyOtp = async () => {
  loading.value = true
  message.value = ''

  try {
    console.log('Attempting to verify OTP:', otpCode.value)
    await authVerifyOtp(email.value, otpCode.value)

    message.value = 'Successfully signed in!'
    success.value = true

    // Reset form after successful login
    setTimeout(() => {
      resetForm()
    }, 1500)
  } catch (error: any) {
    console.error('Verification error:', error)
    message.value = error.message || 'Invalid verification code'
    success.value = false
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  email.value = ''
  otpCode.value = ''
  otpSent.value = false
  message.value = ''
  success.value = false
  loading.value = false
}
</script>