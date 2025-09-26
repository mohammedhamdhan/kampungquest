import { VercelRequest, VercelResponse } from '@vercel/node'
import { createSupabaseForUser, supabaseService } from './lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Extract Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const supabase = await createSupabaseForUser(token)

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' })
    }

    // Parse request body
    const { pairId, questId, mediaPaths, ai, mood, visibility } = req.body

    // Validate required fields
    if (!pairId || !questId || !ai) {
      return res.status(400).json({ error: 'Missing required fields: pairId, questId, or ai' })
    }

    if (!ai.title || !ai.summary || !Array.isArray(ai.steps) || !Array.isArray(ai.materials)) {
      return res.status(400).json({ error: 'Invalid ai object structure' })
    }

    // Build media array from mediaPaths
    const media = (mediaPaths || []).map((item: any) => ({
      type: item.kind,
      path: item.path
    }))

    // Insert memory tile using service role to bypass RLS
    const { data: tile, error: insertError } = await supabaseService
      .from('memory_tiles')
      .insert({
        pair_id: pairId,
        quest_id: questId,
        title: ai.title,
        summary: ai.summary,
        steps_json: ai.steps,
        materials_json: ai.materials,
        tags: ai.tags || [],
        mood: mood || null,
        visibility: visibility || 'private',
        media: media,
        created_by: user.id
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Error inserting tile:', insertError)

      // Check if it's an RLS violation
      if (insertError.code === '42501' || insertError.message?.includes('permission denied')) {
        return res.status(403).json({ error: 'Permission denied - RLS policy violation' })
      }

      return res.status(500).json({ error: 'Failed to save tile' })
    }

    return res.status(200).json({ tileId: tile.id })

  } catch (error) {
    console.error('SaveTile handler error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}