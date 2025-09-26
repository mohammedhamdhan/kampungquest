<template>
  <div class="space-y-6">
    <!-- Engagement features -->
    <DuoPackBanner />
    <ResumeChip />

    <!-- Mode-aware header -->
    <div>
      <h1 :class="[
        'font-bold text-gray-900 dark:text-gray-100',
        isSeniorMode ? 'text-4xl' : 'text-3xl'
      ]">
        Teach Quests
      </h1>

      <!-- Voice instruction for Senior Mode -->
      <VoiceHint
        v-if="isSeniorMode"
        text="Choose a skill to teach. You'll record yourself explaining how to do it step by step."
        :show-repeat="true"
        class="mt-4"
      />

      <!-- Coach card for Youth Mode -->
      <CoachCard v-if="isYouthMode && !coachCardDismissed" class="mt-4" @dismiss="dismissCoachCard">
        Help your senior choose something they know well. Ask them: "What's something you've done many times?"
      </CoachCard>
    </div>

    <!-- Youth Mode: Filters and Search -->
    <div v-if="isYouthMode" class="space-y-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <!-- Search bar -->
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search quests..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
          />
        </div>

        <!-- Filter tags -->
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="tag in tags"
            :key="tag"
            @click="toggleTag(tag)"
            :class="[
              'px-3 py-1 text-sm rounded-full border transition-colors',
              activeTags.includes(tag)
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900 dark:border-emerald-600 dark:text-emerald-200'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
            ]"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </div>

    <!-- Quest cards with mode-aware display -->
    <div :class="[
      isSeniorMode
        ? 'space-y-6' // Senior: Larger spacing, single column
        : 'grid grid-cols-1 md:grid-cols-2 gap-4' // Youth: Grid layout, smaller spacing
    ]">
      <QuestCard
        v-for="quest in filteredQuests"
        :key="quest.questId"
        :quest-id="quest.questId"
        :name="quest.name"
        :minutes="quest.minutes"
        :tags="quest.tags"
        :description="quest.description"
      />
    </div>

    <!-- Senior Mode: Limit to 3 cards above the fold -->
    <div v-if="isSeniorMode && quests.length > 3" class="text-center">
      <ModeAwareButton
        @click="showAllQuests = !showAllQuests"
        variant="outline"
        size="lg"
      >
        {{ showAllQuests ? 'Show Less' : 'Show More Quests' }}
      </ModeAwareButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMode } from '@/composables/useMode'
import QuestCard from '@/pages/_parts/QuestCard.vue'
import VoiceHint from '@/components/VoiceHint.vue'
import CoachCard from '@/components/CoachCard.vue'
import ModeAwareButton from '@/components/ModeAwareButton.vue'
import DuoPackBanner from '@/components/DuoPackBanner.vue'
import ResumeChip from '@/components/ResumeChip.vue'

const { isSeniorMode, isYouthMode } = useMode()

// Quest data
const quests = ref([
  {
    questId: 'teach_sew_button',
    name: 'How to sew on a button',
    minutes: 8,
    tags: ['Teach', 'Craft'],
    description: 'Learn to attach buttons securely'
  },
  {
    questId: 'teach_kopi_o',
    name: 'How to make kopi-O',
    minutes: 12,
    tags: ['Teach', 'Food'],
    description: 'Traditional Singapore black coffee'
  },
  {
    questId: 'teach_router_reset',
    name: 'How to reset your router',
    minutes: 5,
    tags: ['Tech'],
    description: 'Fix internet connection issues'
  },
  {
    questId: 'teach_fold_shirt',
    name: 'How to fold a shirt properly',
    minutes: 6,
    tags: ['Teach', 'Home'],
    description: 'Keep clothes neat and organized'
  },
  {
    questId: 'teach_tie_knot',
    name: 'How to tie a secure knot',
    minutes: 4,
    tags: ['Teach', 'Craft'],
    description: 'Essential knot-tying skills'
  }
])

// Youth mode controls
const searchQuery = ref('')
const activeTags = ref<string[]>([])
const tags = ['Teach', 'Story', 'Tech', 'Food', 'Craft', 'Home']

// Senior mode controls
const showAllQuests = ref(false)

// Coach card persistence
const coachCardDismissed = ref(false)

const toggleTag = (tag: string) => {
  const index = activeTags.value.indexOf(tag)
  if (index > -1) {
    activeTags.value.splice(index, 1)
  } else {
    activeTags.value.push(tag)
  }
}

const filteredQuests = computed(() => {
  let filtered = quests.value

  // Apply search filter (Youth mode only)
  if (isYouthMode.value && searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(quest =>
      quest.name.toLowerCase().includes(query) ||
      quest.description.toLowerCase().includes(query) ||
      quest.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Apply tag filter (Youth mode only)
  if (isYouthMode.value && activeTags.value.length > 0) {
    filtered = filtered.filter(quest =>
      quest.tags.some(tag => activeTags.value.includes(tag))
    )
  }

  // Senior mode: limit to 3 cards above the fold unless showing all
  if (isSeniorMode.value && !showAllQuests.value) {
    filtered = filtered.slice(0, 3)
  }

  return filtered
})

const dismissCoachCard = () => {
  coachCardDismissed.value = true
}
</script>