<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {{ isOTPStep ? 'Verify your email' : 'Sign in to your account' }}
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        {{ isOTPStep ? 'Check your email for a magic link to sign in' : 'We\'ll send you a secure login link' }}
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="sendOTP()" class="space-y-6">
          <div v-if="!isOTPStep">
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div v-else>
            <div class="mb-4 p-4 bg-blue-50 rounded-md">
              <p class="text-sm text-gray-700">
                We sent a magic link to <strong>{{ email }}</strong>
              </p>
              <p class="text-sm text-gray-600 mt-2">
                Click the link in your email to sign in. You can close this page.
              </p>
            </div>
          </div>

          <div v-if="error" class="rounded-md bg-red-50 p-4">
            <div class="text-sm text-red-700">
              {{ error }}
            </div>
          </div>

          <div v-if="!isOTPStep">
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white">
                <svg fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              Send Magic Link
            </button>
          </div>

          <div v-if="isOTPStep" class="text-center">
            <button
              type="button"
              @click="backToEmail"
              class="text-sm text-indigo-600 hover:text-indigo-500"
            >
              ← Back to email
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { signInWithOtp } = useAuth()

const email = ref('')
const isOTPStep = ref(false)
const loading = ref(false)
const error = ref('')

const sendOTP = async () => {
  loading.value = true
  error.value = ''

  try {
    await signInWithOtp(email.value)
    isOTPStep.value = true
  } catch (err: any) {
    error.value = err.message || 'Failed to send verification code'
  } finally {
    loading.value = false
  }
}


const backToEmail = () => {
  isOTPStep.value = false
  error.value = ''
}
</script>