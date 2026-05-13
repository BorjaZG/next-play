import api from './api'

export const followService = {
  // Seguir a un usuario
  follow: async (userId) => {
    const response = await api.post(`/follows/${userId}`)
    return response.data
  },

  // Dejar de seguir a un usuario
  unfollow: async (userId) => {
    const response = await api.delete(`/follows/${userId}`)
    return response.data
  },

  // Obtener usuarios que sigo
  getFollowing: async () => {
    const response = await api.get('/follows/following')
    return response.data
  },

  // Obtener mis seguidores
  getFollowers: async () => {
    const response = await api.get('/follows/followers')
    return response.data
  },

  // Verificar si sigo a un usuario
  checkIfFollowing: async (userId) => {
    const response = await api.get(`/follows/${userId}/check`)
    return response.data
  },

  // Obtener perfil público de un usuario
  getUserProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`)
    return response.data
  },

  // Obtener backlog público de un usuario
  getUserBacklog: async (userId) => {
    const response = await api.get(`/users/${userId}/backlog`)
    return response.data
  },

  // Obtener usuarios sugeridos
  getSuggestedUsers: async () => {
    const response = await api.get('/follows/suggested')
    return response.data
  },

  // Obtener reseñas públicas de otros usuarios
  getPublicReviews: async (limit = 8) => {
    const response = await api.get(`/social/reviews?limit=${limit}`)
    return response.data
  },

  // Obtener listas públicas de otros usuarios
  getPublicLists: async (limit = 6) => {
    const response = await api.get(`/social/lists?limit=${limit}`)
    return response.data
  },

  // Obtener estadísticas globales de un item concreto
  getItemStats: async (externalId, contentType) => {
    const response = await api.get(`/social/item-stats?externalId=${externalId}&contentType=${contentType}`)
    return response.data
  },

  // Obtener reseñas de la comunidad para un item concreto
  getItemReviews: async (externalId, contentType, limit = 8) => {
    const response = await api.get(`/social/item-reviews?externalId=${externalId}&contentType=${contentType}&limit=${limit}`)
    return response.data
  },
}