<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { usePairing } from '@/composables/usePairing'
import LargeButton from '@/components/LargeButton.vue'

const { pairs, activePairId, loadPairs, setActivePair, createInvite, createSelfPair } = usePairing()

const showInviteModal = ref(false)
const inviteCode = ref<string | null>(null)
const relationshipNote = ref('')
const creatingInvite = ref(false)
const creatingSelfPair = ref(false)
const error = ref<string | null>(null)

const inviteLink = computed(() => {
  if (!inviteCode.value) return ''
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/join/${inviteCode.value}`
})

onMounted(async () => {
  await loadPairs()
})

const handleCreateInvite = async () => {
  creatingInvite.value = true
  error.value = null
  try {
    const code = await createInvite(relationshipNote.value || undefined)
    inviteCode.value = code
  } catch (err) {
    console.error('Error creating invite:', err)
    error.value = 'Failed to create invite. Please try again.'
  } finally {
    creatingInvite.value = false
  }
}

const copyInviteLink = () => {
  if (!inviteCode.value || !inviteLink.value) return
  navigator.clipboard.writeText(inviteLink.value)
}

const closeInviteModal = () => {
  showInviteModal.value = false
  inviteCode.value = null
  relationshipNote.value = ''
  error.value = null
}

const handleCreateSelfPair = async () => {
  creatingSelfPair.value = true
  error.value = null
  try {
    await createSelfPair()
    await loadPairs()
  } catch (err) {
    console.error('Error creating self pair:', err)
    error.value = 'Failed to create demo pair. Please try again.'
  } finally {
    creatingSelfPair.value = false
  }
}

const handleSetActivePair = async (pairId: string) => {
  try {
    await setActivePair(pairId)
  } catch (err) {
    console.error('Error setting active pair:', err)
    error.value = 'Failed to set active pair. Please try again.'
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Pairs</h1>
      <p class="text-gray-600 dark:text-gray-400">Manage who you're sharing memories with</p>
    </div>

    <div v-if="error" class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <p class="text-red-800 dark:text-red-200">{{ error }}</p>
    </div>

    <div class="mb-8 grid gap-4 sm:grid-cols-2">
      <LargeButton @click="showInviteModal = true">
        Create Invite Link
      </LargeButton>
      <LargeButton @click="handleCreateSelfPair" :disabled="creatingSelfPair">
        {{ creatingSelfPair ? 'Creating...' : 'Demo: Self Pair' }}
      </LargeButton>
    </div>

    <div v-if="pairs.length === 0" class="text-center py-16">
      <div class="text-6xl mb-4">🤝</div>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No pairs yet</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6 text-lg">
        Create an invite link to pair with someone
      </p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="pair in pairs"
        :key="pair.pair_id"
        @click="handleSetActivePair(pair.pair_id)"
        class="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 transition-all cursor-pointer"
        :class="[
          activePairId === pair.pair_id
            ? 'border-emerald-500 dark:border-emerald-400 shadow-lg'
            : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600'
        ]"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ pair.relationship === 'self' ? 'Demo (Self)' : pair.partner_name }}
              </h3>
              <span
                v-if="activePairId === pair.pair_id"
                class="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium"
              >
                Active
              </span>
            </div>
            <p class="text-gray-600 dark:text-gray-400">
              {{ pair.relationship }} • You are {{ pair.my_role }}
            </p>
          </div>
          <div class="text-3xl">
            {{ pair.my_role === 'senior' ? '👴' : '🧑' }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showInviteModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click.self="closeInviteModal"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Create Invite Link
        </h2>

        <div v-if="!inviteCode">
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Relationship (optional)
            </label>
            <input
              v-model="relationshipNote"
              type="text"
              placeholder="e.g., grandparent-grandchild"
              class="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div class="flex gap-3">
            <button
              @click="closeInviteModal"
              class="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="handleCreateInvite"
              :disabled="creatingInvite"
              class="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ creatingInvite ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </div>

        <div v-else class="space-y-6">
          <div>
            <p class="text-gray-600 dark:text-gray-400 mb-4 text-lg">
              Share this link with someone to pair with them:
            </p>
            <div class="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
              <p class="text-2xl font-mono text-center text-emerald-600 dark:text-emerald-400 font-bold tracking-wider">
                {{ inviteCode }}
              </p>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 break-all">
              {{ inviteLink }}
            </p>
          </div>

          <div class="flex gap-3">
            <button
              @click="copyInviteLink"
              class="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Copy Link
            </button>
            <button
              @click="closeInviteModal"
              class="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>