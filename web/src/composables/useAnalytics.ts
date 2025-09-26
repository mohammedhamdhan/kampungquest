import { supabase } from '@/lib/supabase'

export type AnalyticsEvent =
  | 'duo_pack_viewed'
  | 'duo_pack_started'
  | 'duo_pack_snoozed'
  | 'reminder_sent'
  | 'reminder_clicked'
  | 'streak_incremented'
  | 'milestone_achieved'
  | 'milestone_shared'
  | 'quest_session_resumed'
  | 'mode_selected'
  | 'coach_card_shown'
  | 'repeat_instruction_used'

interface AnalyticsData {
  event: AnalyticsEvent
  properties?: Record<string, any>
  referenceId?: string
}

export function useAnalytics() {
  const track = async (data: AnalyticsData) => {
    try {
      // Console logging for development
      console.log('Analytics Event:', data.event, data.properties)

      // In production, you might want to send to a real analytics service
      // For now, we'll store critical events in our notification_log table
      if (['reminder_sent', 'reminder_clicked', 'milestone_shared'].includes(data.event)) {
        const user = await supabase.auth.getUser()
        if (user.data.user) {
          await supabase
            .from('notification_log')
            .insert({
              user_id: user.data.user.id,
              notification_type: data.event,
              reference_id: data.referenceId || null
            })
        }
      }
    } catch (error) {
      // Fail silently - analytics should never break the app
      console.warn('Analytics tracking failed:', error)
    }
  }

  const trackDuoPackViewed = (duoPackId: string, theme?: string) => {
    track({
      event: 'duo_pack_viewed',
      referenceId: duoPackId,
      properties: { theme }
    })
  }

  const trackDuoPackStarted = (duoPackId: string, questId: string) => {
    track({
      event: 'duo_pack_started',
      referenceId: duoPackId,
      properties: { questId }
    })
  }

  const trackDuoPackSnoozed = (duoPackId: string, snoozeUntil: Date) => {
    track({
      event: 'duo_pack_snoozed',
      referenceId: duoPackId,
      properties: { snoozeUntil: snoozeUntil.toISOString() }
    })
  }

  const trackMilestoneAchieved = (milestoneType: string, pairId: string) => {
    track({
      event: 'milestone_achieved',
      referenceId: pairId,
      properties: { milestoneType }
    })
  }

  const trackMilestoneShared = (milestoneType: string, pairId: string) => {
    track({
      event: 'milestone_shared',
      referenceId: pairId,
      properties: { milestoneType }
    })
  }

  const trackStreakIncremented = (pairId: string, newStreak: number) => {
    track({
      event: 'streak_incremented',
      referenceId: pairId,
      properties: { newStreak }
    })
  }

  const trackQuestSessionResumed = (questId: string, step: string) => {
    track({
      event: 'quest_session_resumed',
      properties: { questId, step }
    })
  }

  return {
    track,
    trackDuoPackViewed,
    trackDuoPackStarted,
    trackDuoPackSnoozed,
    trackMilestoneAchieved,
    trackMilestoneShared,
    trackStreakIncremented,
    trackQuestSessionResumed
  }
}