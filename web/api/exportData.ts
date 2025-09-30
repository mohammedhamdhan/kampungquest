import { VercelRequest, VercelResponse } from '@vercel/node'
import { createSupabaseForUser, supabaseService } from './lib/supabase'
import JSZip from 'jszip'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.substring(7)
    const supabase = await createSupabaseForUser(token)

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token or user not found' })
    }

    const { pairId } = req.body

    if (!pairId) {
      return res.status(400).json({ error: 'Missing required field: pairId' })
    }

    // Verify user has access to this pair
    const { data: pair, error: pairError } = await supabase
      .from('pairs')
      .select('*')
      .eq('id', pairId)
      .or(`senior_id.eq.${user.id},youth_id.eq.${user.id}`)
      .single()

    if (pairError || !pair) {
      return res.status(403).json({ error: 'Access denied to this pair' })
    }

    // Fetch all tiles for this pair (including deleted ones for complete export)
    const { data: tiles, error: tilesError } = await supabase
      .from('memory_tiles')
      .select('*')
      .eq('pair_id', pairId)
      .order('created_at', { ascending: false })

    if (tilesError) {
      console.error('Error fetching tiles:', tilesError)
      return res.status(500).json({ error: 'Failed to fetch tiles' })
    }

    // Create ZIP file
    const zip = new JSZip()

    // Add manifest JSON
    const manifest = {
      exportedAt: new Date().toISOString(),
      exportedBy: user.id,
      pairId: pairId,
      relationship: pair.relationship,
      tileCount: tiles?.length || 0,
      tiles: tiles || []
    }

    zip.file('manifest.json', JSON.stringify(manifest, null, 2))

    // Add tiles data as separate JSON
    zip.file('tiles.json', JSON.stringify(tiles || [], null, 2))

    // Fetch and add media files
    if (tiles && tiles.length > 0) {
      const mediaFolder = zip.folder('media')

      for (const tile of tiles) {
        if (tile.media && Array.isArray(tile.media)) {
          for (let i = 0; i < tile.media.length; i++) {
            const mediaItem = tile.media[i]

            try {
              // Get signed URL for media
              const { data: urlData, error: urlError } = await supabase
                .storage
                .from('tiles')
                .createSignedUrl(mediaItem.path, 3600) // 1 hour expiry

              if (!urlError && urlData?.signedUrl) {
                // Fetch media file
                const response = await fetch(urlData.signedUrl)
                if (response.ok) {
                  const blob = await response.blob()
                  const arrayBuffer = await blob.arrayBuffer()
                  const buffer = Buffer.from(arrayBuffer)

                  // Extract filename from path
                  const filename = mediaItem.path.split('/').pop() || `tile_${tile.id}_media_${i}`
                  mediaFolder?.file(filename, buffer)
                }
              }
            } catch (error) {
              console.error('Error fetching media:', error)
              // Continue with other files even if one fails
            }
          }
        }
      }
    }

    // Generate ZIP
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    })

    // Set headers for download
    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename="kampungquest_data_${pairId}.zip"`)
    res.setHeader('Content-Length', zipBuffer.length.toString())

    return res.status(200).send(zipBuffer)

  } catch (error) {
    console.error('ExportData handler error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}