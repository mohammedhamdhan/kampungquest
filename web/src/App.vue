<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModeToggle from '@/components/ModeToggle.vue'
import PairIndicator from '@/components/PairIndicator.vue'
import StreakChip from '@/components/StreakChip.vue'
import MilestoneCelebration from '@/components/MilestoneCelebration.vue'
import ShareCard from '@/components/ShareCard.vue'
import { useAuth } from '@/composables/useAuth'
import { useStreaks } from '@/composables/useStreaks'
import { usePairing } from '@/composables/usePairing'

const { user, signOut, initAuth } = useAuth()
const { streakDisplay, loadPairStreak, milestones } = useStreaks()
const { activePair } = usePairing()

// Milestone celebration state
const showMilestoneCelebration = ref(false)
const celebrationMilestone = ref<string | null>(null)

// Share card state
const showShareCard = ref(false)
const shareCardData = ref<{
  type: 'milestone' | 'tile'
  milestoneType?: string
  tileTitle?: string
}>({ type: 'milestone' })

onMounted(async () => {
  initAuth()

  // Load streak data when app mounts and user is available
  if (user.value && activePair.value) {
    await loadPairStreak()
  }
})

const handleStreakClick = () => {
  // Show streak details or navigate to achievements page
  console.log('Streak clicked - could show streak details modal')
}

const showMilestone = (milestoneType: string) => {
  celebrationMilestone.value = milestoneType
  showMilestoneCelebration.value = true
}

const closeMilestoneCelebration = () => {
  showMilestoneCelebration.value = false
  celebrationMilestone.value = null
}

const handleMilestoneShare = (milestoneType: string) => {
  shareCardData.value = {
    type: 'milestone',
    milestoneType
  }
  showShareCard.value = true
}

const closeShareCard = () => {
  showShareCard.value = false
}

const handleShared = () => {
  // Track that the milestone was shared
  console.log('Milestone shared successfully')
}
</script>

<template>
  <div class="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 via-cyan-50 to-indigo-100 text-gray-800 dark:from-emerald-950 dark:via-gray-900 dark:to-indigo-950 dark:text-gray-50 transition-all duration-700">
    <!-- Animated background elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <!-- Floating orbs -->
      <div class="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl animate-pulse"></div>
      <div class="absolute top-40 right-20 w-48 h-48 bg-gradient-to-r from-cyan-400/15 to-blue-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div class="absolute bottom-40 left-1/4 w-24 h-24 bg-gradient-to-r from-indigo-400/25 to-purple-400/25 rounded-full blur-xl animate-pulse delay-2000"></div>
      <div class="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-teal-400/20 to-emerald-400/20 rounded-full blur-2xl animate-pulse delay-500"></div>

      <!-- Subtle pattern overlay -->
      <div class="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style="background-image: radial-gradient(circle at 1px 1px, rgba(16,185,129,0.3) 1px, transparent 0); background-size: 20px 20px;"></div>
    </div>

    <header class="relative z-10 border-b border-emerald-200/30 dark:border-emerald-800/30 bg-white/70 dark:bg-gray-900/70 shadow-2xl backdrop-blur-xl"
            style="background-image: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(240,253,250,0.9) 100%); backdrop-filter: blur(20px)">
      <div class="max-w-6xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo/Brand -->
          <router-link
            to="/"
            class="flex items-center gap-4 text-3xl font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent hover:scale-110 transition-all duration-500 group relative"
          >
            <!-- Logo background glow -->
            <div class="absolute -inset-2 bg-gradient-to-r from-emerald-400/20 via-teal-400/20 to-cyan-400/20 rounded-2xl blur-lg group-hover:blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

            <div class="relative flex items-center gap-4">
              <!-- Enhanced icon container -->
              <div class="relative transform group-hover:rotate-12 transition-transform duration-500">
                <div class="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 rounded-2xl blur-md opacity-40 group-hover:opacity-70 transition-opacity animate-pulse"></div>
                <div class="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl shadow-xl">
                  <svg class="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                  </svg>
                </div>

                <!-- Floating sparkles -->
                <div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
                <div class="absolute -bottom-1 -left-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-500"></div>
              </div>

              <!-- Enhanced text -->
              <div class="flex flex-col">
                <span class="drop-shadow-lg text-2xl lg:text-3xl tracking-tight">KampungQuest</span>
                <span class="text-xs font-medium text-emerald-600/70 dark:text-emerald-400/70 tracking-wider uppercase">Connecting Generations</span>
              </div>
            </div>
          </router-link>

          <!-- Right Side Navigation -->
          <div class="flex items-center gap-3">
            <!-- Streak Chip -->
            <StreakChip
              v-if="user && activePair"
              :streak-display="streakDisplay"
              @click="handleStreakClick"
            />

            <!-- Pair Indicator -->
            <PairIndicator v-if="user" />

            <!-- User Menu -->
            <div v-if="user" class="flex items-center gap-4">
              <router-link
                to="/profile"
                class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                  <span class="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {{ user.email?.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <span class="hidden sm:block">{{ user.email }}</span>
              </router-link>

              <button
                @click="signOut"
                class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Sign out
              </button>
            </div>

            <!-- Mode Toggle -->
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>

    <main class="relative z-10 mx-auto px-4 py-12" :class="$route.name === 'Profile' ? 'max-w-6xl' : 'max-w-2xl'">
      <!-- Content container with glass effect -->
      <div class="relative">
        <!-- Subtle content background -->
        <div class="absolute inset-0 bg-white/30 dark:bg-gray-900/30 rounded-3xl backdrop-blur-sm border border-white/20 dark:border-gray-800/20 shadow-2xl"></div>

        <!-- Content -->
        <div class="relative z-10 p-8 rounded-3xl">
          <router-view />
        </div>
      </div>
    </main>

    <!-- Global Modals -->
    <MilestoneCelebration
      :show-celebration="showMilestoneCelebration"
      :milestone-type="celebrationMilestone"
      :partner-name="activePair?.partner_name"
      @close="closeMilestoneCelebration"
      @share="handleMilestoneShare"
    />

    <ShareCard
      :show-card="showShareCard"
      :type="shareCardData.type"
      :milestone-type="shareCardData.milestoneType"
      :tile-title="shareCardData.tileTitle"
      @close="closeShareCard"
      @shared="handleShared"
    />
  </div>
</template>
