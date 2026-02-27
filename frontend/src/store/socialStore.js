import { create } from 'zustand'
import { followService } from '../services/follow.service'

export const useSocialStore = create((set, get) => ({
  following: [],
  followers: [],
  suggestedUsers: [],
  loading: false,
  error: null,

  // Obtener usuarios que sigo
  fetchFollowing: async () => {
    set({ loading: true, error: null })
    try {
      const data = await followService.getFollowing()
      set({ following: data.following, loading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Error al cargar seguidos',
        loading: false 
      })
    }
  },

  // Obtener mis seguidores
  fetchFollowers: async () => {
    set({ loading: true, error: null })
    try {
      const data = await followService.getFollowers()
      set({ followers: data.followers, loading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Error al cargar seguidores',
        loading: false 
      })
    }
  },

  // Seguir usuario
  followUser: async (userId) => {
    try {
      await followService.follow(userId)
      // Refrescar lista de seguidos
      await get().fetchFollowing()
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error 
      }
    }
  },

  // Dejar de seguir
  unfollowUser: async (userId) => {
    try {
      await followService.unfollow(userId)
      // Refrescar lista de seguidos
      await get().fetchFollowing()
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error 
      }
    }
  },
}))