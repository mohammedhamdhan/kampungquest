<template>
  <div
    v-if="showCelebration"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click="closeCelebration"
  >
    <div
      :class="[
        'bg-white rounded-xl shadow-2xl max-w-md w-full relative overflow-hidden',
        'transform transition-all duration-300',
        isSeniorMode ? 'p-8' : 'p-6'
      ]"
      @click.stop
    >
      <!-- Confetti background -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-yellow-50 to-orange-50"></div>
        <div class="confetti-animation">
          <div class="confetti" v-for="i in 20" :key="i"></div>
        </div>
      </div>

      <!-- Content -->
      <div class="relative text-center">
        <!-- Close button -->
        <button
          @click="closeCelebration"
          class="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close celebration"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>

        <!-- Emoji -->
        <div :class="[
          'mb-4',
          isSeniorMode ? 'text-6xl' : 'text-5xl'
        ]">
          {{ milestoneData.emoji }}
        </div>

        <!-- Title -->
        <h2 :class="[
          'font-bold text-gray-900 mb-2',
          isSeniorMode ? 'text-3xl' : 'text-2xl'
        ]">
          {{ milestoneData.title }}
        </h2>

        <!-- Description -->
        <p :class="[
          'text-gray-600 mb-6',
          isSeniorMode ? 'text-lg' : 'text-base'
        ]">
          {{ milestoneData.description }}
        </p>

        <!-- Partner info -->
        <div v-if="partnerName" :class="[
          'bg-emerald-50 rounded-lg p-3 mb-6',
          isSeniorMode ? 'p-4' : 'p-3'
        ]">
          <p :class="[
            'text-emerald-800 font-medium',
            isSeniorMode ? 'text-base' : 'text-sm'
          ]">
            {{ isSeniorMode ? `You and ${partnerName} are making great progress together!` : `Great teamwork with ${partnerName}!` }}
          </p>
        </div>

        <!-- Voice celebration for Senior Mode -->
        <VoiceHint
          v-if="isSeniorMode"
          :text="`Congratulations! You've achieved ${milestoneData.title.toLowerCase()}. ${milestoneData.description}`"
          :show-repeat="false"
          :auto-play="true"
          class="mb-6"
        />

        <!-- Actions -->
        <div :class="[
          'space-y-3',
          isSeniorMode ? 'space-y-4' : 'space-y-3'
        ]">
          <ModeAwareButton
            @click="shareAchievement"
            :size="isSeniorMode ? 'lg' : 'md'"
            variant="primary"
            full-width
          >
            📱 Share with Family
          </ModeAwareButton>

          <ModeAwareButton
            @click="closeCelebration"
            :size="isSeniorMode ? 'lg' : 'md'"
            variant="outline"
            full-width
          >
            Continue Learning
          </ModeAwareButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMode } from '@/composables/useMode'
import { useStreaks } from '@/composables/useStreaks'
import { usePairing } from '@/composables/usePairing'
import ModeAwareButton from '@/components/ModeAwareButton.vue'
import VoiceHint from '@/components/VoiceHint.vue'

interface Props {
  milestoneType?: string
  partnerName?: string
  showCelebration: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  share: [milestoneType: string]
}>()

const { isSeniorMode } = useMode()
const { getMilestoneDisplayText } = useStreaks()

const milestoneData = computed(() => {
  if (!props.milestoneType) {
    return { title: 'Achievement!', description: 'Great work!', emoji: '🎉' }
  }
  return getMilestoneDisplayText(props.milestoneType)
})

const closeCelebration = () => {
  emit('close')
}

const shareAchievement = () => {
  if (props.milestoneType) {
    emit('share', props.milestoneType)
  }
  closeCelebration()
}
</script>

<style scoped>
.confetti-animation {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.confetti {
  position: absolute;
  width: 8px;
  height: 8px;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f, #4dabf7);
  border-radius: 50%;
  animation: confetti-fall 3s ease-in-out infinite;
}

.confetti:nth-child(odd) {
  background: linear-gradient(45deg, #ff8cc8, #8cc8ff, #ffd93d);
  animation-delay: -1s;
}

.confetti:nth-child(even) {
  background: linear-gradient(45deg, #6bcf7f, #ff6b6b, #a29bfe);
  animation-delay: -2s;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }

  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

.confetti:nth-child(1) { left: 10%; animation-duration: 3s; }
.confetti:nth-child(2) { left: 20%; animation-duration: 2.5s; animation-delay: -0.5s; }
.confetti:nth-child(3) { left: 30%; animation-duration: 3.5s; animation-delay: -1.2s; }
.confetti:nth-child(4) { left: 40%; animation-duration: 2.8s; animation-delay: -0.8s; }
.confetti:nth-child(5) { left: 50%; animation-duration: 3.2s; animation-delay: -1.5s; }
.confetti:nth-child(6) { left: 60%; animation-duration: 2.6s; animation-delay: -0.3s; }
.confetti:nth-child(7) { left: 70%; animation-duration: 3.1s; animation-delay: -1.8s; }
.confetti:nth-child(8) { left: 80%; animation-duration: 2.9s; animation-delay: -0.9s; }
.confetti:nth-child(9) { left: 90%; animation-duration: 3.3s; animation-delay: -1.1s; }
.confetti:nth-child(10) { left: 15%; animation-duration: 2.7s; animation-delay: -0.6s; }
.confetti:nth-child(11) { left: 25%; animation-duration: 3.4s; animation-delay: -1.4s; }
.confetti:nth-child(12) { left: 35%; animation-duration: 2.4s; animation-delay: -0.7s; }
.confetti:nth-child(13) { left: 45%; animation-duration: 3.6s; animation-delay: -1.6s; }
.confetti:nth-child(14) { left: 55%; animation-duration: 2.8s; animation-delay: -0.4s; }
.confetti:nth-child(15) { left: 65%; animation-duration: 3.0s; animation-delay: -1.3s; }
.confetti:nth-child(16) { left: 75%; animation-duration: 2.5s; animation-delay: -1.0s; }
.confetti:nth-child(17) { left: 85%; animation-duration: 3.2s; animation-delay: -0.2s; }
.confetti:nth-child(18) { left: 95%; animation-duration: 2.9s; animation-delay: -1.7s; }
.confetti:nth-child(19) { left: 5%; animation-duration: 3.1s; animation-delay: -0.1s; }
.confetti:nth-child(20) { left: 95%; animation-duration: 2.6s; animation-delay: -1.9s; }
</style>