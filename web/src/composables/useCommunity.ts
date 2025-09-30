import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

interface PublicTile {
  id: string
  title: string
  summary: string
  steps_json: string[]
  media: Array<{ type: string; path: string; url?: string }>
  created_at: string
  created_by: string
}

interface Submission {
  id: string
  tile_id: string
  submitted_by: string
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  reviewed_at?: string
  rejection_reason?: string
}

export function useCommunity() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const publicTiles = ref<PublicTile[]>([])
  const submissions = ref<Submission[]>([])

  /**
   * Load all public tiles for community wall
   */
  const loadPublicTiles = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('memory_tiles')
        .select('*')
        .eq('visibility', 'public')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) throw fetchError

      // Generate signed URLs for media
      const tilesWithMedia = await Promise.all(
        (data || []).map(async (tile) => {
          if (tile.media && Array.isArray(tile.media)) {
            const mediaWithUrls = await Promise.all(
              tile.media.map(async (item: any) => {
                try {
                  const { data: urlData } = await supabase.storage
                    .from('tiles')
                    .createSignedUrl(item.path, 3600)

                  return {
                    ...item,
                    url: urlData?.signedUrl || null
                  }
                } catch {
                  return { ...item, url: null }
                }
              })
            )
            return { ...tile, media: mediaWithUrls }
          }
          return tile
        })
      )

      publicTiles.value = tilesWithMedia
      return publicTiles.value
    } catch (err: any) {
      error.value = err.message || 'Failed to load public tiles'
      console.error('Load public tiles error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Submit a tile to the community wall
   */
  const submitToWall = async (tileId: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: rpcError } = await supabase
        .rpc('submit_to_community_wall', { p_tile_id: tileId })

      if (rpcError) throw rpcError

      return { success: true, submissionId: data }
    } catch (err: any) {
      error.value = err.message || 'Failed to submit tile'
      console.error('Submit tile error:', err)
      return { success: false, submissionId: null }
    } finally {
      loading.value = false
    }
  }

  /**
   * Report a public tile
   */
  const reportTile = async (
    tileId: string,
    reason: 'inappropriate' | 'spam' | 'copyright' | 'other',
    details?: string
  ) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: rpcError } = await supabase
        .rpc('report_tile', {
          p_tile_id: tileId,
          p_reason: reason,
          p_details: details || null
        })

      if (rpcError) throw rpcError

      return { success: true, reportId: data }
    } catch (err: any) {
      error.value = err.message || 'Failed to report tile'
      console.error('Report tile error:', err)
      return { success: false, reportId: null }
    } finally {
      loading.value = false
    }
  }

  /**
   * Load pending submissions (for moderators)
   */
  const loadPendingSubmissions = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('public_submissions')
        .select(`
          *,
          tile:memory_tiles(id, title, summary, created_by)
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false })

      if (fetchError) throw fetchError

      submissions.value = data || []
      return submissions.value
    } catch (err: any) {
      error.value = err.message || 'Failed to load submissions'
      console.error('Load submissions error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Approve a submission (moderator action)
   */
  const approveSubmission = async (submissionId: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: rpcError } = await supabase
        .rpc('approve_submission', { p_submission_id: submissionId })

      if (rpcError) throw rpcError

      if (!data) {
        throw new Error('Failed to approve submission')
      }

      // Remove from pending list
      submissions.value = submissions.value.filter(s => s.id !== submissionId)

      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to approve submission'
      console.error('Approve submission error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Reject a submission (moderator action)
   */
  const rejectSubmission = async (submissionId: string, reason?: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: rpcError } = await supabase
        .rpc('reject_submission', {
          p_submission_id: submissionId,
          p_reason: reason || null
        })

      if (rpcError) throw rpcError

      if (!data) {
        throw new Error('Failed to reject submission')
      }

      // Remove from pending list
      submissions.value = submissions.value.filter(s => s.id !== submissionId)

      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to reject submission'
      console.error('Reject submission error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    publicTiles: computed(() => publicTiles.value),
    submissions: computed(() => submissions.value),
    loadPublicTiles,
    submitToWall,
    reportTile,
    loadPendingSubmissions,
    approveSubmission,
    rejectSubmission
  }
}