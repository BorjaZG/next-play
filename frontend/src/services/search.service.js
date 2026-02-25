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
}