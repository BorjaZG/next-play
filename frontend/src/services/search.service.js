import api from './api'

export const searchService = {
  // Buscar contenido (juegos, series, películas, anime)
  search: async (query, type = 'all') => {
    const params = new URLSearchParams()
    params.append('query', query)
    if (type && type !== 'all') {
      params.append('type', type)
    }
    
    const response = await api.get(`/search?${params.toString()}`)
    return response.data
  },

  // Obtener detalles de un contenido específico
  getDetails: async (type, externalId) => {
    const response = await api.get(`/search/${type}/${externalId}`)
    return response.data
  },

  // Añadir contenido al backlog desde búsqueda
  addToBacklog: async (type, externalId, data = {}) => {
    const response = await api.post(`/search/${type}/${externalId}/add`, data)
    return response.data
  },

  // Listar contenido paginado (browse mode)
  browse: async (type, page = 1, sortBy = 'popularity', genre = null) => {
    const params = new URLSearchParams({ page, sortBy })
    if (genre) params.append('genre', genre)
    const response = await api.get(`/search/browse/${type}?${params.toString()}`)
    return response.data
  },

  // Obtener géneros por tipo
  getGenres: async (type) => {
    const response = await api.get(`/search/genres/${type}`)
    return response.data
  },
}