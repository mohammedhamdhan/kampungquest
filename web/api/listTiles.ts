import { VercelRequest, VercelResponse } from '@vercel/node'
import { createSupabaseForUser, supabaseService } from './lib/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
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

    const pairId = req.query.pairId as string

    if (pairId) {
      const { data: pairCheck } = await supabaseService
        .from('pairs')
        .select('id')
        .eq('id', pairId)
        .or(`senior_id.eq.${user.id},youth_id.eq.${user.id}`)
        .single()

      if (!pairCheck) {
        return res.status(403).json({ error: 'Access denied to this pair' })
      }
    }

    const query = supabaseService
      .from('memory_tiles')
      .select('id, title, summary, steps_json, materials_json, created_at, media, pair_id')
      .order('created_at', { ascending: false })

    if (pairId) {
      query.eq('pair_id', pairId)
    } else {
      const { data: userPairs } = await supabaseService
        .from('pairs')
        .select('id')
        .or(`senior_id.eq.${user.id},youth_id.eq.${user.id}`)

      const pairIds = (userPairs || []).map(p => p.id)
      if (pairIds.length > 0) {
        query.in('pair_id', pairIds)
      } else {
        return res.status(200).json([])
      }
    }

    const { data: tiles, error: tilesError } = await query

    if (tilesError) {
      console.error('Error fetching tiles:', tilesError)
      return res.status(500).json({ error: 'Failed to fetch tiles' })
    }

    // Process tiles and generate signed URLs for media
    const processedTiles = await Promise.all(
      (tiles || []).map(async (tile) => {
        const mediaWithUrls = await Promise.all(
          (tile.media || []).map(async (mediaItem: any) => {
            try {
              const { data: signedUrlData, error: signedUrlError } = await supabaseService.storage
                .from('media')
                .createSignedUrl(mediaItem.path, 3600) // 1 hour TTL

              if (signedUrlError || !signedUrlData?.signedUrl) {
                console.error('Error creating signed URL:', signedUrlError)
                return {
                  kind: mediaItem.type,
                  url: null // Failed to create signed URL
                }
              }

              return {
                kind: mediaItem.type,
                url: signedUrlData.signedUrl
              }
            } catch (error) {
              console.error('Error processing media item:', error)
              return {
                kind: mediaItem.type,
                url: null
              }
            }
          })
        )

        return {
          id: tile.id,
          title: tile.title,
          summary: tile.summary,
          steps: tile.steps_json || [],
          materials: tile.materials_json || [],
          created_at: tile.created_at,
          media: mediaWithUrls.filter(item => item.url !== null) // Only include successful URLs
        }
      })
    )

    return res.status(200).json(processedTiles)

  } catch (error) {
    console.error('ListTiles handler error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}