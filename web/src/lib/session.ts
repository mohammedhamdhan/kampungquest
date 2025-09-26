import { supabase } from '@/lib/supabase'

export async function getAccessToken(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Error getting session:', error)
      return null
    }

    console.log('Session data:', data.session ? 'Session exists' : 'No session', data.session?.user?.email)
    return data.session?.access_token || null
  } catch (error) {
    console.error('Error fetching access token:', error)
    return null
  }
}