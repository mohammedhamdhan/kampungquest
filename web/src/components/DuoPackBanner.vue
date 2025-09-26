<template>
  <div
    v-if="shouldShowDuoPack"
    :class="[
      'relative overflow-hidden rounded-2xl mb-6 text-white shadow-2xl transform hover:scale-[1.02] transition-all duration-300',
      'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600',
      'border border-white/20 backdrop-blur-sm',
      isSeniorMode ? 'p-8' : 'p-6'
    ]"
  >
    <!-- Animated background patterns -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- Floating particles -->
      <div class="absolute top-4 left-4 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
      <div class="absolute top-8 right-12 w-1 h-1 bg-yellow-300/40 rounded-full animate-ping"></div>
      <div class="absolute bottom-6 left-16 w-3 h-3 bg-pink-300/30 rounded-full animate-bounce"></div>
      <div class="absolute bottom-4 right-6 w-2 h-2 bg-blue-300/40 rounded-full animate-pulse delay-1000"></div>

      <!-- Gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>

      <!-- Decorative shapes -->
      <div class="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-sm"></div>
      <div class="absolute -bottom-8 -left-8 w-20 h-20 bg-pink-400/20 rounded-full blur-md"></div>
    </div>
    <div class="relative z-10 flex items-start justify-between">
      <div class="flex-1">
        <!-- Header with improved styling -->
        <div class="flex items-center gap-3 mb-4">
          <div class="flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl backdrop-blur-sm">
            <span class="text-2xl">🎯</span>
          </div>
          <div>
            <h3 :class="[
              'font-bold text-white drop-shadow-sm',
              isSeniorMode ? 'text-2xl' : 'text-xl'
            ]">
              This Week's Duo Pack
            </h3>
            <p :class="[
              'text-white/80 font-medium',
              isSeniorMode ? 'text-base' : 'text-sm'
            ]">
              {{ currentDuoPack?.theme || 'Two skills to learn together' }}
            </p>
          </div>
        </div>

        <!-- Quest list with enhanced design -->
        <div :class="[
          'space-y-3 mb-6',
          isSeniorMode ? 'space-y-4' : 'space-y-3'
        ]">
          <div
            v-for="(quest, index) in questDetails"
            :key="quest.questId"
            :class="[
              'flex items-center gap-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 transition-all duration-300 hover:bg-white/30 hover:scale-105 hover:shadow-lg',
              isSeniorMode ? 'p-4' : 'p-3'
            ]"
          >
            <!-- Quest number -->
            <div :class="[
              'flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-white font-bold shadow-lg',
              isSeniorMode ? 'w-10 h-10 text-lg' : 'w-8 h-8 text-sm'
            ]">
              {{ index + 1 }}
            </div>

            <!-- Quest details -->
            <div class="flex-1">
              <h4 :class="[
                'font-semibold text-white drop-shadow-sm',
                isSeniorMode ? 'text-lg' : 'text-base'
              ]">
                {{ quest.name }}
              </h4>
              <div class="flex items-center gap-2 mt-1">
                <span :class="[
                  'inline-flex items-center gap-1 bg-white/20 rounded-full px-2 py-1 text-xs font-medium text-white/90',
                  isSeniorMode ? 'px-3 py-1.5 text-sm' : ''
                ]">
                  ⏱️ {{ quest.minutes }} min
                </span>
                <span :class="[
                  'inline-flex items-center gap-1 bg-emerald-400/30 rounded-full px-2 py-1 text-xs font-medium text-white/90',
                  isSeniorMode ? 'px-3 py-1.5 text-sm' : ''
                ]">
                  {{ quest.difficulty === 'easy' ? '✨ Easy' : quest.difficulty === 'medium' ? '⭐ Medium' : '💪 Advanced' }}
                </span>
              </div>
            </div>

            <!-- Category icon -->
            <div class="flex-shrink-0">
              <span class="text-2xl">{{ getCategoryEmoji(quest.category) }}</span>
            </div>
          </div>
        </div>

        <!-- Voice hint for Senior Mode -->
        <VoiceHint
          v-if="isSeniorMode"
          :text="`This week we suggest learning ${questDetails.map(q => q.name).join(' and ')}.`"
          :show-repeat="false"
          class="mb-4"
        />

        <!-- Coach card for Youth Mode -->
        <CoachCard v-if="isYouthMode" class="mb-4">
          These are skills your senior might enjoy teaching. Ask which one interests them more!
        </CoachCard>
      </div>

      <!-- Close button with enhanced styling -->
      <button
        @click="dismiss"
        class="relative z-20 ml-4 p-2 hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/20"
        aria-label="Dismiss duo pack"
      >
        <svg class="w-5 h-5 text-white/80 hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- Actions with enhanced styling -->
    <div :class="[
      'relative z-10 space-y-3',
      isSeniorMode ? 'space-y-4' : 'space-y-3'
    ]">
      <!-- Primary actions -->
      <div :class="[
        'grid gap-3',
        isSeniorMode ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
      ]">
        <ModeAwareButton
          v-for="(quest, index) in questDetails"
          :key="`start-${quest.questId}`"
          @click="startQuest(quest.questId)"
          :size="isSeniorMode ? 'lg' : 'md'"
          variant="secondary"
          class="bg-white/95 text-gray-900 hover:bg-white hover:shadow-xl hover:scale-105 font-semibold transition-all duration-300 backdrop-blur-sm border border-white/50"
        >
          <span class="flex items-center gap-2">
            <span class="text-lg">{{ index === 0 ? '🚀' : '⭐' }}</span>
            Start: {{ quest.name }}
          </span>
        </ModeAwareButton>
      </div>

      <!-- Snooze options -->
      <div class="flex justify-center">
        <div :class="[
          'inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20',
          isSeniorMode ? 'gap-3 p-2' : ''
        ]">
          <ModeAwareButton
            @click="snooze('later_today')"
            :size="isSeniorMode ? 'md' : 'sm'"
            variant="ghost"
            class="text-white/90 hover:bg-white/20 hover:text-white font-medium transition-all duration-300 hover:scale-105"
          >
            <span class="flex items-center gap-1">
              <span>🕐</span>
              Later today
            </span>
          </ModeAwareButton>
          <div class="w-px h-4 bg-white/30"></div>
          <ModeAwareButton
            @click="snooze('this_weekend')"
            :size="isSeniorMode ? 'md' : 'sm'"
            variant="ghost"
            class="text-white/90 hover:bg-white/20 hover:text-white font-medium transition-all duration-300 hover:scale-105"
          >
            <span class="flex items-center gap-1">
              <span>🌅</span>
              This weekend
            </span>
          </ModeAwareButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDuoPack } from '@/composables/useDuoPack'
import { useMode } from '@/composables/useMode'
import ModeAwareButton from '@/components/ModeAwareButton.vue'
import VoiceHint from '@/components/VoiceHint.vue'
import CoachCard from '@/components/CoachCard.vue'

const router = useRouter()
const { isSeniorMode, isYouthMode } = useMode()
const {
  currentDuoPack,
  questDetails,
  shouldShowDuoPack,
  loadCurrentDuoPack,
  markAsViewed,
  startQuest: startDuoPackQuest,
  snoozeUntilLater,
  dismissDuoPack
} = useDuoPack()

onMounted(async () => {
  await loadCurrentDuoPack()
  // Don't auto-mark as viewed - only mark when user interacts
})

const startQuest = async (questId: string) => {
  await markAsViewed() // Mark as viewed when user starts a quest
  await startDuoPackQuest(questId)
  router.push(`/teach/${questId}`)
}

const snooze = async (option: 'later_today' | 'this_weekend') => {
  await markAsViewed() // Mark as viewed when user snoozes
  await snoozeUntilLater(option)
}

const dismiss = async () => {
  await markAsViewed() // Mark as viewed when user dismisses
  await dismissDuoPack()
}

const getCategoryEmoji = (category: string): string => {
  const emojis: Record<string, string> = {
    food: '🍳',
    craft: '✂️',
    tech: '💻',
    home: '🏠'
  }
  return emojis[category] || '📚'
}
</script>