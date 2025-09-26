import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)
const loading = ref(true)

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value)

  const signInWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin + '/quests'
      }
    })

    if (error) {
      throw error
    }
  }

  const verifyOtp = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    })

    if (error) {
      throw error
    }

    if (data.user) {
      user.value = data.user
    }

    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    user.value = null
  }

  const getSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
        return
      }
      user.value = session?.user ?? null
    } catch (error) {
      console.error('Error in getSession:', error)
    } finally {
      loading.value = false
    }
  }

  const initAuth = () => {
    // Get initial session
    getSession()

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      console.log('Session access_token:', session?.access_token ? 'exists' : 'missing')
      user.value = session?.user ?? null
      loading.value = false
    })
  }

  // Initialize auth when composable is first used
  if (loading.value) {
    initAuth()
  }

  return {
    user: computed(() => user.value),
    loading: computed(() => loading.value),
    isAuthenticated,
    signInWithOtp,
    verifyOtp,
    signOut,
    initAuth
  }
}