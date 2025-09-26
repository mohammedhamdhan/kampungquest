import { VercelRequest, VercelResponse } from '@vercel/node'
import { createSupabaseForUser, supabaseService } from './lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization
    console.log('ensurePair: authHeader:', authHeader ? 'present' : 'missing')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('ensurePair: Invalid authorization header')
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    console.log('ensurePair: token length:', token.length)

    const supabase = await createSupabaseForUser(token)

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('ensurePair: getUser result:', user ? `user: ${user.email}` : `error: ${userError?.message}`)

    if (userError || !user) {
      console.log('ensurePair: Authentication failed')
      return res.status(401).json({ error: 'Invalid token or user not found' })
    }

    // Look for existing pairs where this user is a member
    // Use service role to bypass RLS policies that may cause recursion
    const { data: existingPairs, error: searchError } = await supabaseService
      .from('pairs')
      .select('id')
      .or(`senior_id.eq.${user.id},youth_id.eq.${user.id}`)
      .limit(1)

    if (searchError) {
      console.error('Error searching for pairs:', searchError)
      return res.status(500).json({ error: 'Failed to search for existing pairs' })
    }

    // If a pair exists, return it
    if (existingPairs && existingPairs.length > 0) {
      return res.status(200).json({ pairId: existingPairs[0].id })
    }

    // Ensure user exists in users table
    const { error: upsertUserError } = await supabaseService
      .from('users')
      .upsert({
        id: user.id,
        display_name: user.email?.split('@')[0] || 'User',
        role: 'senior'
      }, {
        onConflict: 'id'
      })

    if (upsertUserError) {
      console.error('Error upserting user:', upsertUserError)
      return res.status(500).json({ error: 'Failed to create user record' })
    }

    // Create a new self-pair (both senior and youth are the same user)
    // Use service role to bypass RLS
    const { data: newPair, error: createError } = await supabaseService
      .from('pairs')
      .insert({
        senior_id: user.id,
        youth_id: user.id,
        relationship: 'self'
      })
      .select('id')
      .single()

    if (createError) {
      console.error('Error creating pair:', createError)
      return res.status(500).json({ error: 'Failed to create pair' })
    }

    return res.status(200).json({ pairId: newPair.id })

  } catch (error) {
    console.error('EnsurePair handler error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}