import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { usePairing } from './usePairing'
import { useMode } from './useMode'
import { useAnalytics } from './useAnalytics'
import type { UserRole } from '@/types'

interface DuoPack {
  id: string
  quest_ids: string[]
  theme: string
  week_start: string
}

interface QuestInfo {
  questId: string
  name: string
  minutes: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: 'food' | 'craft' | 'tech' | 'home'
}

export function useDuoPack() {
  const { user } = useAuth()
  const { activePair } = usePairing()
  const { currentMode } = useMode()
  const analytics = useAnalytics()

  const currentDuoPack = ref<DuoPack | null>(null)
  const questDetails = ref<QuestInfo[]>([])
  const loading = ref(false)
  const hasViewed = ref(false)
  const hasSnoozed = ref(false)
  const snoozeUntil = ref<Date | null>(null)

  // Quest database - in production this would come from a proper quest system
  const questDatabase: Record<string, QuestInfo> = {
    'teach_sew_button': {
      questId: 'teach_sew_button',
      name: 'How to sew on a button',
      minutes: 8,
      difficulty: 'easy',
      category: 'craft'
    },
    'teach_kopi_o': {
      questId: 'teach_kopi_o',
      name: 'How to make kopi-O',
      minutes: 12,
      difficulty: 'medium',
      category: 'food'
    },
    'teach_router_reset': {
      questId: 'teach_router_reset',
      name: 'How to reset your router',
      minutes: 5,
      difficulty: 'easy',
      category: 'tech'
    },
    'teach_fold_shirt': {
      questId: 'teach_fold_shirt',
      name: 'How to fold a shirt properly',
      minutes: 6,
      difficulty: 'easy',
      category: 'home'
    },
    'teach_tie_knot': {
      questId: 'teach_tie_knot',
      name: 'How to tie a secure knot',
      minutes: 4,
      difficulty: 'easy',
      category: 'craft'
    }
  }

  const shouldShowDuoPack = computed(() => {
    if (!currentDuoPack.value || !activePair.value) return false
    if (hasSnoozed.value && snoozeUntil.value && new Date() < snoozeUntil.value) return false
    return !hasViewed.value
  })

  const loadCurrentDuoPack = async () => {
    if (!activePair.value) return

    loading.value = true
    try {
      // Get current week's duo pack
      const { data: duoPackData, error: duoPackError } = await supabase
        .rpc('get_current_duo_pack')

      if (duoPackError) throw duoPackError

      if (duoPackData && duoPackData.length > 0) {
        const pack = duoPackData[0]
        currentDuoPack.value = pack

        // Load quest details
        questDetails.value = pack.quest_ids
          .map((questId: string) => questDatabase[questId])
          .filter(Boolean)

        // Check if user has already interacted with this duo pack
        await checkUserInteractions(pack.id)
      }
    } catch (error) {
      console.error('Error loading duo pack:', error)
    } finally {
      loading.value = false
    }
  }

  const checkUserInteractions = async (duoPackId: string) => {
    if (!user.value || !activePair.value) return

    try {
      const { data, error } = await supabase
        .from('duo_pack_interactions')
        .select('action, snooze_until')
        .eq('duo_pack_id', duoPackId)
        .eq('pair_id', activePair.value.pair_id)
        .eq('user_id', user.value.id)

      if (error) throw error

      const interactions = data || []
      hasViewed.value = interactions.some(i => i.action === 'viewed')

      const snoozeInteraction = interactions.find(i => i.action === 'snoozed')
      if (snoozeInteraction && snoozeInteraction.snooze_until) {
        hasSnoozed.value = true
        snoozeUntil.value = new Date(snoozeInteraction.snooze_until)
      }
    } catch (error) {
      console.error('Error checking interactions:', error)
    }
  }

  const markAsViewed = async () => {
    if (!currentDuoPack.value || !user.value || !activePair.value || hasViewed.value) return

    try {
      await supabase
        .from('duo_pack_interactions')
        .upsert({
          duo_pack_id: currentDuoPack.value.id,
          pair_id: activePair.value.pair_id,
          user_id: user.value.id,
          action: 'viewed'
        })

      hasViewed.value = true
      analytics.trackDuoPackViewed(currentDuoPack.value.id, currentDuoPack.value.theme)
    } catch (error) {
      console.error('Error marking duo pack as viewed:', error)
    }
  }

  const startQuest = async (questId: string) => {
    if (!currentDuoPack.value || !user.value || !activePair.value) return

    try {
      await supabase
        .from('duo_pack_interactions')
        .upsert({
          duo_pack_id: currentDuoPack.value.id,
          pair_id: activePair.value.pair_id,
          user_id: user.value.id,
          action: 'started'
        })

      analytics.trackDuoPackStarted(currentDuoPack.value.id, questId)
    } catch (error) {
      console.error('Error recording duo pack start:', error)
    }
  }

  const snoozeUntilLater = async (snoozeOption: 'later_today' | 'this_weekend') => {
    if (!currentDuoPack.value || !user.value || !activePair.value) return

    const now = new Date()
    let snoozeDate: Date

    if (snoozeOption === 'later_today') {
      // Snooze until 6 PM today, or 6 PM tomorrow if it's already past 6 PM
      snoozeDate = new Date(now)
      snoozeDate.setHours(18, 0, 0, 0)
      if (snoozeDate <= now) {
        snoozeDate.setDate(snoozeDate.getDate() + 1)
      }
    } else {
      // Snooze until next Saturday at 10 AM
      snoozeDate = new Date(now)
      const daysUntilSaturday = (6 - now.getDay()) % 7 || 7
      snoozeDate.setDate(now.getDate() + daysUntilSaturday)
      snoozeDate.setHours(10, 0, 0, 0)
    }

    try {
      await supabase
        .from('duo_pack_interactions')
        .upsert({
          duo_pack_id: currentDuoPack.value.id,
          pair_id: activePair.value.pair_id,
          user_id: user.value.id,
          action: 'snoozed',
          snooze_until: snoozeDate.toISOString()
        })

      hasSnoozed.value = true
      snoozeUntil.value = snoozeDate
      analytics.trackDuoPackSnoozed(currentDuoPack.value.id, snoozeDate)
    } catch (error) {
      console.error('Error snoozing duo pack:', error)
    }
  }

  const dismissDuoPack = async () => {
    if (!currentDuoPack.value || !user.value || !activePair.value) return

    try {
      await supabase
        .from('duo_pack_interactions')
        .upsert({
          duo_pack_id: currentDuoPack.value.id,
          pair_id: activePair.value.pair_id,
          user_id: user.value.id,
          action: 'dismissed'
        })

      hasViewed.value = true // Hide the banner
    } catch (error) {
      console.error('Error dismissing duo pack:', error)
    }
  }

  // Personalized quest selection based on mode and history
  const getPersonalizedQuests = (availableQuests: QuestInfo[], userMode: UserRole, completedCategories: string[]): QuestInfo[] => {
    let filtered = [...availableQuests]

    // Senior Mode: prefer easier and shorter quests
    if (userMode === 'senior') {
      filtered = filtered
        .filter(q => q.difficulty === 'easy' && q.minutes <= 10)
        .sort((a, b) => a.minutes - b.minutes)
    }

    // Diversify categories - if pair has many of one category, suggest different ones
    const overRepresentedCategories = completedCategories
      .reduce((acc, cat) => {
        acc[cat] = (acc[cat] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const mostCommonCategory = Object.entries(overRepresentedCategories)
      .sort(([,a], [,b]) => b - a)[0]?.[0]

    if (mostCommonCategory && overRepresentedCategories[mostCommonCategory] >= 3) {
      // If they have 3+ of one category, prioritize different categories
      filtered = filtered
        .sort((a, b) => {
          const aIsDifferent = a.category !== mostCommonCategory ? 1 : 0
          const bIsDifferent = b.category !== mostCommonCategory ? 1 : 0
          return bIsDifferent - aIsDifferent
        })
    }

    return filtered.slice(0, 2)
  }

  return {
    currentDuoPack: computed(() => currentDuoPack.value),
    questDetails: computed(() => questDetails.value),
    loading: computed(() => loading.value),
    shouldShowDuoPack,
    loadCurrentDuoPack,
    markAsViewed,
    startQuest,
    snoozeUntilLater,
    dismissDuoPack,
    getPersonalizedQuests
  }
}