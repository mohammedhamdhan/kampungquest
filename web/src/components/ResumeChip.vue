<template>
  <div
    v-if="resumableSessions.length > 0"
    :class="[
      'mb-4',
      isSeniorMode ? 'mb-6' : 'mb-4'
    ]"
  >
    <h3 :class="[
      'font-medium text-gray-700 dark:text-gray-300 mb-3',
      isSeniorMode ? 'text-lg' : 'text-base'
    ]">
      Continue where you left off
    </h3>

    <div :class="[
      'space-y-2',
      isSeniorMode ? 'space-y-3' : 'space-y-2'
    ]">
      <div
        v-for="session in resumableSessions"
        :key="session.id"
        @click="resumeSession(session.id)"
        :class="[
          'relative overflow-hidden bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl cursor-pointer transition-all duration-300',
          'hover:from-amber-100 hover:to-yellow-100 hover:border-amber-300 hover:shadow-lg hover:scale-[1.02]',
          'dark:from-amber-900/30 dark:to-yellow-900/30 dark:border-amber-700 dark:hover:from-amber-900/40 dark:hover:to-yellow-900/40',
          'backdrop-blur-sm border-2',
          isSeniorMode ? 'p-5' : 'p-4'
        ]"
        role="button"
        tabindex="0"
        :aria-label="`Resume ${sessionInfo.questName} at ${sessionInfo.stepDisplay}`"
        @keydown.enter="resumeSession(session.id)"
        @keydown.space.prevent="resumeSession(session.id)"
      >
        <!-- Decorative elements -->
        <div class="absolute top-2 right-2 w-3 h-3 bg-amber-300/30 rounded-full animate-pulse"></div>
        <div class="absolute bottom-2 left-2 w-2 h-2 bg-yellow-400/40 rounded-full animate-bounce"></div>

        <div class="relative z-10 flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <div class="flex items-center justify-center w-8 h-8 bg-amber-400/20 rounded-xl backdrop-blur-sm">
                <span class="text-amber-600 dark:text-amber-400">⏸️</span>
              </div>
              <h4 :class="[
                'font-semibold text-amber-900 dark:text-amber-100 drop-shadow-sm',
                isSeniorMode ? 'text-xl' : 'text-lg'
              ]">
                {{ getSessionDisplayInfo(session).questName }}
              </h4>
            </div>

            <div class="flex items-center gap-4 text-sm text-amber-700 dark:text-amber-300">
              <span>{{ getSessionDisplayInfo(session).stepDisplay }}</span>
              <span>•</span>
              <span>{{ getSessionDisplayInfo(session).timeAgo }}</span>
            </div>

            <!-- Voice instruction for Senior Mode -->
            <VoiceHint
              v-if="isSeniorMode && resumableSessions.length === 1"
              :text="`You can continue working on ${getSessionDisplayInfo(session).questName} where you left off.`"
              :show-repeat="false"
              class="mt-2"
            />
          </div>

          <div class="flex items-center gap-2 ml-4">
            <!-- Resume button -->
            <ModeAwareButton
              @click.stop="resumeSession(session.id)"
              :size="isSeniorMode ? 'md' : 'sm'"
              variant="primary"
              class="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {{ isSeniorMode ? '▶️ Continue' : 'Resume' }}
            </ModeAwareButton>

            <!-- Dismiss button (Youth Mode) -->
            <button
              v-if="isYouthMode"
              @click.stop="dismissSession(session.id)"
              class="p-1 text-amber-500 hover:text-amber-700 rounded transition-colors"
              aria-label="Dismiss resume suggestion"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Coach tip for Youth Mode -->
    <CoachCard v-if="isYouthMode && resumableSessions.length > 0" class="mt-3">
      Help them continue their unfinished lesson, or suggest starting something new if they prefer.
    </CoachCard>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMode } from '@/composables/useMode'
import { useQuestSession } from '@/composables/useQuestSession'
import ModeAwareButton from '@/components/ModeAwareButton.vue'
import VoiceHint from '@/components/VoiceHint.vue'
import CoachCard from '@/components/CoachCard.vue'

const router = useRouter()
const { isSeniorMode, isYouthMode } = useMode()
const {
  resumableSessions,
  loadActiveSessions,
  resumeQuestSession,
  deleteQuestSession,
  getSessionDisplayInfo
} = useQuestSession()

onMounted(() => {
  loadActiveSessions()
})

const resumeSession = async (sessionId: string) => {
  try {
    const sessionInfo = await resumeQuestSession(sessionId)
    if (!sessionInfo) return

    // Navigate to the appropriate step
    if (sessionInfo.currentStep === 'record') {
      router.push(`/teach/${sessionInfo.questId}`)
    } else if (sessionInfo.currentStep === 'review') {
      // Navigate to review with session data
      router.push({
        path: '/review',
        state: {
          transcript: sessionInfo.sessionData.transcript || '',
          audioPath: sessionInfo.sessionData.audioPath || null,
          photoPaths: sessionInfo.sessionData.photoPaths || [],
          questId: sessionInfo.questId
        }
      })
    }
  } catch (error) {
    console.error('Error resuming session:', error)
  }
}

const dismissSession = async (sessionId: string) => {
  const session = resumableSessions.value.find(s => s.id === sessionId)
  if (!session) return

  try {
    await deleteQuestSession(session.quest_id)
  } catch (error) {
    console.error('Error dismissing session:', error)
  }
}
</script>