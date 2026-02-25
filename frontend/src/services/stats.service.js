import api from './api'

export const statsService = {
  // Obtener estadísticas generales
  getGeneral: async () => {
    const response = await api.get('/stats')
    return response.data
  },

  // Obtener top géneros
  getTopGenres: async (limit = 10) => {
    const response = await api.get(`/stats/genres?limit=${limit}`)
    return response.data
  },

  // Obtener top desarrolladores
  getTopDevelopers: async (limit = 10) => {
    const response = await api.get(`/stats/developers?limit=${limit}`)
    return response.data
  },

  // Obtener actividad mensual
  getActivity: async (months = 12) => {
    const response = await api.get(`/stats/activity?months=${months}`)
    return response.data
  },

  // Obtener mejor valorados
  getTopRated: async (limit = 10) => {
    const response = await api.get(`/stats/top-rated?limit=${limit}`)
    return response.data
  },

  // Obtener achievements
  getAchievements: async () => {
    const response = await api.get('/stats/achievements')
    return response.data
  },
}