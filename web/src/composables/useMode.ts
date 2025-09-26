import { ref, computed, watch } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { UserRole } from '@/types'

// Global reactive state for current mode
const currentMode = ref<UserRole>('senior')
const userSavedRole = ref<UserRole | null>(null)
const loading = ref(false)

export function useMode() {
  const { user, isAuthenticated } = useAuth()

  // Load user's saved role from database
  const loadUserRole = async () => {
    if (!user.value) return

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.value.id)
        .single()

      if (error) {
        console.error('Error loading user role:', error)
        return
      }

      userSavedRole.value = data?.role || 'senior'

      // On login, set current mode to user's saved role unless already set by session toggle
      const sessionMode = sessionStorage.getItem('sessionMode') as UserRole | null
      if (!sessionMode) {
        currentMode.value = userSavedRole.value
      }
    } catch (err) {
      console.error('Failed to load user role:', err)
      userSavedRole.value = 'senior'
    } finally {
      loading.value = false
    }
  }

  // Update user's saved role in database
  const updateUserRole = async (role: UserRole) => {
    if (!user.value) return

    loading.value = true
    try {
      const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', user.value.id)

      if (error) throw error

      userSavedRole.value = role
      // Also update current mode if user is updating their saved role
      currentMode.value = role
      sessionStorage.removeItem('sessionMode') // Clear session override
    } catch (err) {
      console.error('Failed to update user role:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Toggle current mode for this session only
  const toggleMode = () => {
    const newMode = currentMode.value === 'senior' ? 'youth' : 'senior'
    setSessionMode(newMode)
  }

  // Set specific mode for this session
  const setSessionMode = (mode: UserRole) => {
    currentMode.value = mode
    sessionStorage.setItem('sessionMode', mode)

    // Track analytics
    try {
      // TODO: Add analytics tracking here
      console.log('Mode selected:', mode)
    } catch (err) {
      console.warn('Analytics tracking failed:', err)
    }
  }

  // Reset to user's saved role
  const resetToSavedRole = () => {
    if (userSavedRole.value) {
      currentMode.value = userSavedRole.value
      sessionStorage.removeItem('sessionMode')
    }
  }

  // Initialize mode state when user changes
  watch(
    () => user.value?.id,
    (userId) => {
      if (userId) {
        loadUserRole()
      } else {
        // Clear state on logout
        userSavedRole.value = null
        currentMode.value = 'senior'
        sessionStorage.removeItem('sessionMode')
      }
    },
    { immediate: true }
  )

  // Load session mode on initial load
  const sessionMode = sessionStorage.getItem('sessionMode') as UserRole | null
  if (sessionMode && ['senior', 'youth'].includes(sessionMode)) {
    currentMode.value = sessionMode
  }

  // Mode-specific UI configurations
  const isSeniorMode = computed(() => currentMode.value === 'senior')
  const isYouthMode = computed(() => currentMode.value === 'youth')

  const modeConfig = computed(() => ({
    // Text sizes (Tailwind classes)
    textSize: {
      base: isSeniorMode.value ? 'text-lg' : 'text-base',
      large: isSeniorMode.value ? 'text-2xl' : 'text-xl',
      heading: isSeniorMode.value ? 'text-4xl' : 'text-3xl'
    },

    // Button sizes
    buttonSize: {
      padding: isSeniorMode.value ? 'px-8 py-4' : 'px-4 py-2',
      minHeight: isSeniorMode.value ? 'min-h-[48px]' : 'min-h-[40px]'
    },

    // Layout configurations
    maxChoicesPerScreen: isSeniorMode.value ? 3 : 6,
    showCoachCards: isYouthMode.value,
    showVoiceHints: isSeniorMode.value,
    showQuickActions: isYouthMode.value,

    // Display preferences
    compactLayout: isYouthMode.value,
    progressiveDisclosure: isSeniorMode.value
  }))

  return {
    // Current state
    currentMode: computed(() => currentMode.value),
    userSavedRole: computed(() => userSavedRole.value),
    loading: computed(() => loading.value),

    // Mode checks
    isSeniorMode,
    isYouthMode,

    // Actions
    toggleMode,
    setSessionMode,
    updateUserRole,
    resetToSavedRole,
    loadUserRole,

    // Configuration
    modeConfig
  }
}