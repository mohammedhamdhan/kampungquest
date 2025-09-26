import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { PairWithPartner, PairInvite, UserRole } from '@/types'

const pairs = ref<PairWithPartner[]>([])
const activePairId = ref<string | null>(null)
const loading = ref(false)

export function usePairing() {
  const activePair = computed(() =>
    pairs.value.find(p => p.pair_id === activePairId.value) || null
  )

  const loadPairs = async () => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('user_pairs_view')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      pairs.value = data || []

      const { data: userData } = await supabase
        .from('users')
        .select('active_pair_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single()

      if (userData?.active_pair_id && pairs.value.some(p => p.pair_id === userData.active_pair_id)) {
        activePairId.value = userData.active_pair_id
      } else if (pairs.value.length > 0) {
        activePairId.value = pairs.value[0].pair_id
      }
    } catch (error) {
      console.error('Error loading pairs:', error)
    } finally {
      loading.value = false
    }
  }

  const setActivePair = async (pairId: string) => {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) return

    try {
      const { error } = await supabase
        .from('users')
        .update({ active_pair_id: pairId })
        .eq('id', user.id)

      if (error) throw error
      activePairId.value = pairId
    } catch (error) {
      console.error('Error setting active pair:', error)
      throw error
    }
  }

  const createInvite = async (relationshipNote?: string): Promise<string> => {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Not authenticated')

    // Check if migration has been run by testing for pair_invites table
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      const inviterRole: UserRole = userData?.role || 'senior'
      const code = await generateInviteCode()

      const { data, error } = await supabase
        .from('pair_invites')
        .insert({
          code,
          inviter_id: user.id,
          inviter_role: inviterRole,
          relationship_note: relationshipNote || null
        })
        .select('code')
        .single()

      if (error) throw error
      return data.code
    } catch (error: any) {
      // If migration not run, show helpful error
      if (error.message?.includes('pair_invites') || error.message?.includes('role')) {
        throw new Error('Database migration required. Please run the migration in Supabase SQL Editor first.')
      }
      throw error
    }
  }

  const acceptInvite = async (code: string): Promise<{ pairId: string; inviterName: string }> => {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Not authenticated')

    const { data: invite, error: inviteError } = await supabase
      .from('pair_invites')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (inviteError || !invite) {
      throw new Error('Invalid or expired invite code')
    }

    // Try to get inviter details, but don't fail if we can't
    let inviterName = 'Someone'
    try {
      const { data: inviter, error: inviterError } = await supabase
        .from('users')
        .select('id, display_name, email, role')
        .eq('id', invite.inviter_id)
        .single()

      if (!inviterError && inviter) {
        inviterName = inviter.display_name || inviter.email?.split('@')[0] || 'Someone'
      }
    } catch (err) {
      // If we can't get inviter details due to RLS, just use a default name
      console.warn('Could not fetch inviter details:', err)
    }

    if (invite.used_by) {
      throw new Error('This invite has already been used')
    }

    if (invite.inviter_id === user.id) {
      throw new Error('You cannot accept your own invite')
    }

    const expiresAt = new Date(invite.expires_at)
    const now = new Date()

    if (expiresAt <= now) {
      throw new Error(`This invite expired on ${expiresAt.toLocaleDateString()} at ${expiresAt.toLocaleTimeString()}`)
    }

    const { data: currentUserData } = await supabase
      .from('users')
      .select('role, display_name')
      .eq('id', user.id)
      .single()

    const seniorId = invite.inviter_role === 'senior' ? invite.inviter_id : user.id
    const youthId = invite.inviter_role === 'senior' ? user.id : invite.inviter_id

    const { data: newPair, error: pairError } = await supabase
      .from('pairs')
      .insert({
        senior_id: seniorId,
        youth_id: youthId,
        relationship: invite.relationship_note || 'family'
      })
      .select('id')
      .single()

    if (pairError) throw pairError

    await supabase
      .from('pair_invites')
      .update({
        used_by: user.id,
        used_at: new Date().toISOString()
      })
      .eq('id', invite.id)

    await supabase
      .from('users')
      .update({ active_pair_id: newPair.id })
      .eq('id', user.id)

    await loadPairs()
    activePairId.value = newPair.id

    return {
      pairId: newPair.id,
      inviterName: inviterName
    }
  }

  const generateInviteCode = async (): Promise<string> => {
    const { data, error } = await supabase.rpc('generate_invite_code')
    if (error) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      let code = ''
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return code
    }
    return data
  }

  const createSelfPair = async () => {
    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Not authenticated')

    // Get user's role to place them in the correct position
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = userData?.role || 'senior'

    // For self-pairs, only fill the field corresponding to the user's role
    // This ensures the view returns the correct role
    const { data: newPair, error } = await supabase
      .from('pairs')
      .insert({
        senior_id: userRole === 'senior' ? user.id : null,
        youth_id: userRole === 'youth' ? user.id : null,
        relationship: 'self'
      })
      .select('id')
      .single()

    if (error) throw error

    await supabase
      .from('users')
      .update({ active_pair_id: newPair.id })
      .eq('id', user.id)

    await loadPairs()
    activePairId.value = newPair.id
  }

  return {
    pairs: computed(() => pairs.value),
    activePair,
    activePairId: computed(() => activePairId.value),
    loading: computed(() => loading.value),
    loadPairs,
    setActivePair,
    createInvite,
    acceptInvite,
    createSelfPair
  }
}