import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

interface UserPreferences {
  id: string
  user_id: string
  notifications_enabled: boolean
  notification_channel: 'in_app' | 'email' | 'whatsapp_link'
  nudge_timing: 'weeknight' | 'weekend'
  dnd_start_hour: number
  dnd_end_hour: number
  created_at: string
  updated_at: string
}

export function useUserPreferences() {
  const { user } = useAuth()

  const preferences = ref<UserPreferences | null>(null)
  const loading = ref(false)

  const defaultPreferences: Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
    notifications_enabled: true,
    notification_channel: 'in_app',
    nudge_timing: 'weeknight',
    dnd_start_hour: 21,
    dnd_end_hour: 8
  }

  // Check if current time is within Do Not Disturb hours
  const isInDndPeriod = computed(() => {
    if (!preferences.value) return false

    const now = new Date()
    const currentHour = now.getHours()
    const startHour = preferences.value.dnd_start_hour
    const endHour = preferences.value.dnd_end_hour

    // Handle overnight DND period (e.g., 9 PM to 8 AM)
    if (startHour > endHour) {
      return currentHour >= startHour || currentHour < endHour
    }

    // Handle same-day DND period (e.g., 1 PM to 5 PM)
    return currentHour >= startHour && currentHour < endHour
  })

  const notificationChannels = [
    { value: 'in_app', label: 'In-app notifications only', description: 'Show banners and popups within the app' },
    { value: 'email', label: 'Email reminders', description: 'Send gentle reminders to your email' },
    { value: 'whatsapp_link', label: 'WhatsApp message', description: 'Get a ready-to-send WhatsApp message' }
  ]

  const nudgeTimings = [
    { value: 'weeknight', label: 'Weeknights', description: 'Tuesday-Thursday evenings' },
    { value: 'weekend', label: 'Weekends', description: 'Saturday mornings' }
  ]

  const loadPreferences = async () => {
    if (!user.value) return

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.value.id)
        .single()

      if (error && error.code !== 'PGRST116') { // Not found is okay
        throw error
      }

      if (data) {
        preferences.value = data
      } else {
        // Create default preferences
        await createDefaultPreferences()
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      loading.value = false
    }
  }

  const createDefaultPreferences = async () => {
    if (!user.value) return

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.value.id,
          ...defaultPreferences
        })
        .select()
        .single()

      if (error) throw error
      preferences.value = data
    } catch (error) {
      console.error('Error creating default preferences:', error)
      throw error
    }
  }

  const updatePreferences = async (updates: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at'>>) => {
    if (!user.value || !preferences.value) return

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', preferences.value.id)
        .select()
        .single()

      if (error) throw error
      preferences.value = data
    } catch (error) {
      console.error('Error updating preferences:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const toggleNotifications = async () => {
    if (!preferences.value) return

    await updatePreferences({
      notifications_enabled: !preferences.value.notifications_enabled
    })
  }

  const setNotificationChannel = async (channel: 'in_app' | 'email' | 'whatsapp_link') => {
    await updatePreferences({ notification_channel: channel })
  }

  const setNudgeTiming = async (timing: 'weeknight' | 'weekend') => {
    await updatePreferences({ nudge_timing: timing })
  }

  const setDndHours = async (startHour: number, endHour: number) => {
    await updatePreferences({
      dnd_start_hour: startHour,
      dnd_end_hour: endHour
    })
  }

  // Get next appropriate time to send a nudge based on preferences
  const getNextNudgeTime = (): Date => {
    const now = new Date()
    const prefs = preferences.value

    if (!prefs) {
      // Default: tomorrow at 6 PM
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(18, 0, 0, 0)
      return tomorrow
    }

    let nextTime = new Date(now)

    if (prefs.nudge_timing === 'weeknight') {
      // Find next Tuesday-Thursday, 6 PM
      const dayOfWeek = now.getDay()
      let daysToAdd = 0

      if (dayOfWeek === 0 || dayOfWeek === 1) { // Sunday or Monday
        daysToAdd = 2 - dayOfWeek // Go to Tuesday
      } else if (dayOfWeek >= 2 && dayOfWeek <= 4) { // Tuesday-Thursday
        // If it's past 8 PM or in DND, go to next valid day
        if (now.getHours() >= 20 || isInDndPeriod.value) {
          daysToAdd = dayOfWeek === 4 ? 5 : 1 // If Thursday, go to next Tuesday
        }
      } else { // Friday-Saturday
        daysToAdd = 9 - dayOfWeek // Go to next Tuesday
      }

      nextTime.setDate(now.getDate() + daysToAdd)
      nextTime.setHours(18, 0, 0, 0)
    } else {
      // Weekend timing: Saturday 10 AM
      const dayOfWeek = now.getDay()
      let daysToAdd = 6 - dayOfWeek // Days until Saturday

      if (dayOfWeek === 6) { // Saturday
        if (now.getHours() >= 12 || isInDndPeriod.value) {
          daysToAdd = 7 // Next Saturday
        }
      } else if (dayOfWeek === 0) { // Sunday
        daysToAdd = 6 // Next Saturday
      }

      nextTime.setDate(now.getDate() + daysToAdd)
      nextTime.setHours(10, 0, 0, 0)
    }

    // Adjust for DND hours
    while (isTimeInDnd(nextTime, prefs)) {
      nextTime.setHours(nextTime.getHours() + 1)
    }

    return nextTime
  }

  const isTimeInDnd = (time: Date, prefs: UserPreferences): boolean => {
    const hour = time.getHours()
    const startHour = prefs.dnd_start_hour
    const endHour = prefs.dnd_end_hour

    if (startHour > endHour) {
      return hour >= startHour || hour < endHour
    }
    return hour >= startHour && hour < endHour
  }

  const getDndDisplayText = computed(() => {
    if (!preferences.value) return 'Not set'

    const start = preferences.value.dnd_start_hour
    const end = preferences.value.dnd_end_hour

    const formatHour = (hour: number) => {
      const period = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
      return `${displayHour} ${period}`
    }

    return `${formatHour(start)} - ${formatHour(end)}`
  })

  return {
    preferences: computed(() => preferences.value),
    loading: computed(() => loading.value),
    isInDndPeriod,
    notificationChannels,
    nudgeTimings,
    getDndDisplayText,
    loadPreferences,
    updatePreferences,
    toggleNotifications,
    setNotificationChannel,
    setNudgeTiming,
    setDndHours,
    getNextNudgeTime
  }
}