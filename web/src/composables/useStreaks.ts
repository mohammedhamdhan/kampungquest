import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { usePairing } from './usePairing'
import { useAnalytics } from './useAnalytics'

interface PairStreak {
  id: string
  pair_id: string
  current_streak: number
  longest_streak: number
  last_activity_week: string
  total_tiles_completed: number
}

interface Milestone {
  id: string
  pair_id: string
  milestone_type: string
  achieved_at: string
  shared_at?: string
}

export function useStreaks() {
  const { user } = useAuth()
  const { activePair } = usePairing()
  const analytics = useAnalytics()

  const pairStreak = ref<PairStreak | null>(null)
  const milestones = ref<Milestone[]>([])
  const loading = ref(false)

  // Get start of current week (Monday)
  const getCurrentWeekStart = (): string => {
    const now = new Date()
    const monday = new Date(now)
    const diff = now.getDay() - 1 // Monday is day 1
    monday.setDate(now.getDate() - diff)
    monday.setHours(0, 0, 0, 0)
    return monday.toISOString().split('T')[0]
  }

  // Format streak for display
  const streakDisplay = computed(() => {
    if (!pairStreak.value || pairStreak.value.current_streak === 0) {
      return null
    }

    const weeks = pairStreak.value.current_streak
    const emoji = weeks >= 4 ? '🔥' : weeks >= 2 ? '⭐' : '✨'
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ${emoji}`
  })

  // Check if milestone should be celebrated
  const getMilestoneType = (totalTiles: number): string | null => {
    if (totalTiles === 3) return 'tiles_3'
    if (totalTiles === 6) return 'tiles_6'
    if (totalTiles === 12) return 'tiles_12'
    if (totalTiles === 25) return 'tiles_25'
    if (totalTiles === 50) return 'tiles_50'
    return null
  }

  const getStreakMilestoneType = (streak: number): string | null => {
    if (streak === 4) return 'streak_4'
    if (streak === 12) return 'streak_12'
    if (streak === 26) return 'streak_26'
    return null
  }

  const loadPairStreak = async () => {
    if (!activePair.value) return

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('pair_streaks')
        .select('*')
        .eq('pair_id', activePair.value.pair_id)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found error is okay
        throw error
      }

      if (data) {
        pairStreak.value = data
      } else {
        // Initialize streak for new pair
        const { data: newStreak, error: insertError } = await supabase
          .from('pair_streaks')
          .insert({
            pair_id: activePair.value.pair_id,
            current_streak: 0,
            longest_streak: 0,
            last_activity_week: null,
            total_tiles_completed: 0
          })
          .select()
          .single()

        if (insertError) throw insertError
        pairStreak.value = newStreak
      }

      // Also load milestones
      await loadMilestones()
    } catch (error) {
      console.error('Error loading pair streak:', error)
    } finally {
      loading.value = false
    }
  }

  const loadMilestones = async () => {
    if (!activePair.value) return

    try {
      const { data, error } = await supabase
        .from('pair_milestones')
        .select('*')
        .eq('pair_id', activePair.value.pair_id)
        .order('achieved_at', { ascending: false })

      if (error) throw error
      milestones.value = data || []
    } catch (error) {
      console.error('Error loading milestones:', error)
    }
  }

  const incrementTileCount = async () => {
    if (!pairStreak.value || !activePair.value) return

    const currentWeekStart = getCurrentWeekStart()
    const lastActivityWeek = pairStreak.value.last_activity_week

    let newStreak = pairStreak.value.current_streak
    let shouldIncrementStreak = false

    // Check if this is a new week
    if (lastActivityWeek !== currentWeekStart) {
      // Check if last activity was last week (continuous streak)
      const lastWeek = new Date(currentWeekStart)
      lastWeek.setDate(lastWeek.getDate() - 7)
      const lastWeekString = lastWeek.toISOString().split('T')[0]

      if (lastActivityWeek === lastWeekString) {
        // Continuous streak
        newStreak += 1
        shouldIncrementStreak = true
      } else if (lastActivityWeek === null || lastActivityWeek < lastWeekString) {
        // Reset streak, start new one
        newStreak = 1
        shouldIncrementStreak = true
      }
    }

    const newTotalTiles = pairStreak.value.total_tiles_completed + 1

    try {
      const { data, error } = await supabase
        .from('pair_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, pairStreak.value.longest_streak),
          last_activity_week: currentWeekStart,
          total_tiles_completed: newTotalTiles,
          updated_at: new Date().toISOString()
        })
        .eq('id', pairStreak.value.id)
        .select()
        .single()

      if (error) throw error

      pairStreak.value = data

      // Track analytics
      if (shouldIncrementStreak) {
        analytics.trackStreakIncremented(activePair.value.pair_id, newStreak)
      }

      // Check for new milestones
      await checkForNewMilestones(newTotalTiles, newStreak)

    } catch (error) {
      console.error('Error incrementing tile count:', error)
      throw error
    }
  }

  const checkForNewMilestones = async (totalTiles: number, currentStreak: number) => {
    if (!activePair.value) return

    const existingMilestoneTypes = milestones.value.map(m => m.milestone_type)
    const newMilestones: string[] = []

    // Check tile milestones
    const tileMilestone = getMilestoneType(totalTiles)
    if (tileMilestone && !existingMilestoneTypes.includes(tileMilestone)) {
      newMilestones.push(tileMilestone)
    }

    // Check streak milestones
    const streakMilestone = getStreakMilestoneType(currentStreak)
    if (streakMilestone && !existingMilestoneTypes.includes(streakMilestone)) {
      newMilestones.push(streakMilestone)
    }

    // Create new milestone records
    for (const milestoneType of newMilestones) {
      try {
        const { data, error } = await supabase
          .from('pair_milestones')
          .insert({
            pair_id: activePair.value.pair_id,
            milestone_type: milestoneType
          })
          .select()
          .single()

        if (error) throw error

        milestones.value.unshift(data)
        analytics.trackMilestoneAchieved(milestoneType, activePair.value.pair_id)
      } catch (error) {
        console.error('Error creating milestone:', error)
      }
    }

    return newMilestones
  }

  const markMilestoneShared = async (milestoneId: string) => {
    try {
      const { error } = await supabase
        .from('pair_milestones')
        .update({
          shared_at: new Date().toISOString()
        })
        .eq('id', milestoneId)

      if (error) throw error

      // Update local state
      const milestone = milestones.value.find(m => m.id === milestoneId)
      if (milestone) {
        milestone.shared_at = new Date().toISOString()

        if (activePair.value) {
          analytics.trackMilestoneShared(milestone.milestone_type, activePair.value.pair_id)
        }
      }
    } catch (error) {
      console.error('Error marking milestone as shared:', error)
    }
  }

  // Get display text for milestone
  const getMilestoneDisplayText = (milestoneType: string): { title: string; description: string; emoji: string } => {
    switch (milestoneType) {
      case 'tiles_3':
        return {
          title: 'First 3 Skills!',
          description: 'You\'ve saved your first 3 skills together',
          emoji: '🎉'
        }
      case 'tiles_6':
        return {
          title: 'Half Dozen!',
          description: 'You\'ve preserved 6 valuable skills',
          emoji: '🌟'
        }
      case 'tiles_12':
        return {
          title: 'Dozen Skills!',
          description: 'You\'ve documented 12 amazing skills',
          emoji: '✨'
        }
      case 'tiles_25':
        return {
          title: 'Quarter Century!',
          description: 'An incredible 25 skills preserved',
          emoji: '🏆'
        }
      case 'tiles_50':
        return {
          title: 'Half Century!',
          description: '50 skills - what an amazing library!',
          emoji: '👑'
        }
      case 'streak_4':
        return {
          title: '1 Month Streak!',
          description: 'Active together for 4 weeks in a row',
          emoji: '🔥'
        }
      case 'streak_12':
        return {
          title: '3 Month Streak!',
          description: '12 weeks of continuous learning',
          emoji: '💪'
        }
      case 'streak_26':
        return {
          title: '6 Month Streak!',
          description: 'Half a year of dedication!',
          emoji: '🎯'
        }
      default:
        return {
          title: 'Achievement!',
          description: 'You\'ve reached a milestone',
          emoji: '🎊'
        }
    }
  }

  return {
    pairStreak: computed(() => pairStreak.value),
    milestones: computed(() => milestones.value),
    streakDisplay,
    loading: computed(() => loading.value),
    loadPairStreak,
    incrementTileCount,
    markMilestoneShared,
    getMilestoneDisplayText,
    checkForNewMilestones
  }
}