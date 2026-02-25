import api from './api'

export const reviewService = {
  // Crear o actualizar reseña
  createOrUpdate: async (backlogItemId, reviewData) => {
    const response = await api.post(`/reviews/${backlogItemId}`, reviewData)
    return response.data
  },

  // Obtener todas las reseñas de un item
  getAll: async (backlogItemId) => {
    const response = await api.get(`/reviews/${backlogItemId}`)
    return response.data
  },

  // Obtener mi reseña de un item
  getMy: async (backlogItemId) => {
    const response = await api.get(`/reviews/${backlogItemId}/my`)
    return response.data
  },

  // Eliminar mi reseña
  delete: async (backlogItemId) => {
    const response = await api.delete(`/reviews/${backlogItemId}`)
    return response.data
  },
}