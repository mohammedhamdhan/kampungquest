import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export type VisibilityLevel = 'private' | 'family' | 'public'

interface Tile {
  id: string
  title: string
  visibility: VisibilityLevel
  blur_faces: boolean
  deleted_at: string | null
  created_at: string
}

export function usePrivacy() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const deletedTiles = ref<Tile[]>([])

  /**
   * Update visibility for a single tile
   */
  const updateTileVisibility = async (tileId: string, visibility: VisibilityLevel) => {
    loading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase
        .from('memory_tiles')
        .update({ visibility })
        .eq('id', tileId)

      if (updateError) throw updateError

      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to update visibility'
      console.error('Update visibility error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Toggle blur faces for a tile
   */
  const toggleBlurFaces = async (tileId: string, blurFaces: boolean) => {
    loading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase
        .from('memory_tiles')
        .update({ blur_faces: blurFaces })
        .eq('id', tileId)

      if (updateError) throw updateError

      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to update blur setting'
      console.error('Update blur error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Bulk update all tiles for a pair to a specific visibility
   */
  const bulkUpdateVisibility = async (pairId: string, visibility: VisibilityLevel) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: rpcError } = await supabase
        .rpc('bulk_update_visibility', {
          p_pair_id: pairId,
          p_new_visibility: visibility
        })

      if (rpcError) throw rpcError

      return { success: true, count: data }
    } catch (err: any) {
      error.value = err.message || 'Failed to bulk update visibility'
      console.error('Bulk update error:', err)
      return { success: false, count: 0 }
    } finally {
      loading.value = false
    }
  }

  /**
   * Soft delete a tile
   */
  const deleteTile = async (tileId: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: rpcError } = await supabase
        .rpc('soft_delete_tile', { tile_id: tileId })

      if (rpcError) throw rpcError

      if (!data) {
        throw new Error('Failed to delete tile. You may not have permission.')
      }

      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to delete tile'
      console.error('Delete tile error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Restore a soft-deleted tile (within 7 days)
   */
  const restoreTile = async (tileId: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: rpcError } = await supabase
        .rpc('restore_tile', { tile_id: tileId })

      if (rpcError) throw rpcError

      if (!data) {
        throw new Error('Failed to restore tile. It may have been deleted more than 7 days ago.')
      }

      // Remove from deletedTiles list
      deletedTiles.value = deletedTiles.value.filter(t => t.id !== tileId)

      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to restore tile'
      console.error('Restore tile error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Load recently deleted tiles (within 7 days)
   */
  const loadDeletedTiles = async () => {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data, error: fetchError } = await supabase
        .from('memory_tiles')
        .select('id, title, visibility, blur_faces, deleted_at, created_at')
        .eq('created_by', user.id)
        .not('deleted_at', 'is', null)
        .gte('deleted_at', sevenDaysAgo.toISOString())
        .order('deleted_at', { ascending: false })

      if (fetchError) throw fetchError

      deletedTiles.value = (data || []) as Tile[]
      return deletedTiles.value
    } catch (err: any) {
      error.value = err.message || 'Failed to load deleted tiles'
      console.error('Load deleted tiles error:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Permanently delete tiles older than 7 days (cleanup)
   */
  const purgeOldDeletedTiles = async () => {
    try {
      const { data, error: rpcError } = await supabase
        .rpc('purge_old_deleted_tiles')

      if (rpcError) throw rpcError

      return { success: true, count: data }
    } catch (err: any) {
      console.error('Purge error:', err)
      return { success: false, count: 0 }
    }
  }

  /**
   * Update user's default visibility preference
   */
  const updateDefaultVisibility = async (visibility: VisibilityLevel) => {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: updateError } = await supabase
        .from('users')
        .update({ default_visibility: visibility })
        .eq('id', user.id)

      if (updateError) throw updateError

      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to update default visibility'
      console.error('Update default visibility error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete user account and all associated data
   */
  const deleteAccount = async () => {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // First, delete all user's tiles (this will cascade to related data)
      const { error: tilesError } = await supabase
        .from('memory_tiles')
        .delete()
        .eq('created_by', user.id)

      if (tilesError) throw tilesError

      // Delete user record (will cascade to pairs, preferences, etc.)
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)

      if (userError) throw userError

      // Sign out
      await supabase.auth.signOut()

      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to delete account'
      console.error('Delete account error:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  const canRestore = computed(() => (deletedAt: string) => {
    const deleted = new Date(deletedAt)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return deleted >= sevenDaysAgo
  })

  return {
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    deletedTiles: computed(() => deletedTiles.value),
    canRestore,
    updateTileVisibility,
    toggleBlurFaces,
    bulkUpdateVisibility,
    deleteTile,
    restoreTile,
    loadDeletedTiles,
    purgeOldDeletedTiles,
    updateDefaultVisibility,
    deleteAccount
  }
}