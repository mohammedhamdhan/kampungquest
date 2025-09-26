import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { usePairing } from './usePairing'
import { useAnalytics } from './useAnalytics'

interface QuestSession {
  id: string
  user_id: string
  quest_id: string
  pair_id: string
  current_step: 'record' | 'review' | 'complete'
  session_data: {
    transcript?: string
    audioPath?: string
    photoPaths?: string[]
    selectedLanguage?: string
    questName?: string
  }
  last_activity: string
  completed_at?: string
}

export function useQuestSession() {
  const { user } = useAuth()
  const { activePair } = usePairing()
  const analytics = useAnalytics()

  const activeSessions = ref<QuestSession[]>([])
  const loading = ref(false)

  // Check if session is still resumable (within 48 hours)
  const isSessionResumable = (session: QuestSession): boolean => {
    const lastActivity = new Date(session.last_activity)
    const now = new Date()
    const hoursSince = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)
    return hoursSince <= 48 && !session.completed_at
  }

  const resumableSessions = computed(() => {
    return activeSessions.value.filter(isSessionResumable)
  })

  const loadActiveSessions = async () => {
    if (!user.value) return

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('quest_sessions')
        .select('*')
        .eq('user_id', user.value.id)
        .is('completed_at', null)
        .order('last_activity', { ascending: false })

      if (error) throw error

      activeSessions.value = data || []
    } catch (error) {
      console.error('Error loading quest sessions:', error)
    } finally {
      loading.value = false
    }
  }

  const saveQuestSession = async (
    questId: string,
    currentStep: 'record' | 'review' | 'complete',
    sessionData: QuestSession['session_data']
  ) => {
    if (!user.value || !activePair.value) return

    try {
      const { data, error } = await supabase
        .from('quest_sessions')
        .upsert({
          user_id: user.value.id,
          quest_id: questId,
          pair_id: activePair.value.pair_id,
          current_step: currentStep,
          session_data: sessionData,
          last_activity: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Update local state
      const existingIndex = activeSessions.value.findIndex(s => s.quest_id === questId)
      if (existingIndex >= 0) {
        activeSessions.value[existingIndex] = data
      } else {
        activeSessions.value.unshift(data)
      }

      return data
    } catch (error) {
      console.error('Error saving quest session:', error)
      throw error
    }
  }

  const resumeQuestSession = async (sessionId: string) => {
    const session = activeSessions.value.find(s => s.id === sessionId)
    if (!session) return null

    // Track analytics
    analytics.trackQuestSessionResumed(session.quest_id, session.current_step)

    return {
      questId: session.quest_id,
      currentStep: session.current_step,
      sessionData: session.session_data
    }
  }

  const completeQuestSession = async (questId: string) => {
    if (!user.value) return

    try {
      const { error } = await supabase
        .from('quest_sessions')
        .update({
          completed_at: new Date().toISOString(),
          current_step: 'complete'
        })
        .eq('user_id', user.value.id)
        .eq('quest_id', questId)

      if (error) throw error

      // Remove from active sessions
      activeSessions.value = activeSessions.value.filter(s => s.quest_id !== questId)
    } catch (error) {
      console.error('Error completing quest session:', error)
    }
  }

  const deleteQuestSession = async (questId: string) => {
    if (!user.value) return

    try {
      const { error } = await supabase
        .from('quest_sessions')
        .delete()
        .eq('user_id', user.value.id)
        .eq('quest_id', questId)

      if (error) throw error

      // Remove from active sessions
      activeSessions.value = activeSessions.value.filter(s => s.quest_id !== questId)
    } catch (error) {
      console.error('Error deleting quest session:', error)
    }
  }

  // Clean up old sessions (older than 7 days)
  const cleanupOldSessions = async () => {
    if (!user.value) return

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    try {
      const { error } = await supabase
        .from('quest_sessions')
        .delete()
        .eq('user_id', user.value.id)
        .is('completed_at', null)
        .lt('last_activity', sevenDaysAgo.toISOString())

      if (error) throw error
    } catch (error) {
      console.error('Error cleaning up old sessions:', error)
    }
  }

  // Get display info for a session
  const getSessionDisplayInfo = (session: QuestSession) => {
    const questName = session.session_data?.questName || session.quest_id
    const lastActivity = new Date(session.last_activity)
    const now = new Date()

    // Calculate time ago
    const diffMs = now.getTime() - lastActivity.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    let timeAgo = ''
    if (diffDays > 0) {
      timeAgo = diffDays === 1 ? '1 day ago' : `${diffDays} days ago`
    } else if (diffHours > 0) {
      timeAgo = diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
    } else {
      timeAgo = 'Less than an hour ago'
    }

    // Step display
    const stepDisplay = {
      record: 'Step 1: Recording',
      review: 'Step 2: Review',
      complete: 'Complete'
    }

    return {
      questName,
      timeAgo,
      stepDisplay: stepDisplay[session.current_step],
      canResume: isSessionResumable(session)
    }
  }

  return {
    activeSessions: computed(() => activeSessions.value),
    resumableSessions,
    loading: computed(() => loading.value),
    loadActiveSessions,
    saveQuestSession,
    resumeQuestSession,
    completeQuestSession,
    deleteQuestSession,
    cleanupOldSessions,
    getSessionDisplayInfo,
    isSessionResumable
  }
}