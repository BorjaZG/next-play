import api from './api'

export const backlogService = {
  // Obtener todos los items del backlog
  getAll: async (filters = {}) => {
    const params = new URLSearchParams()
    
    if (filters.status) params.append('status', filters.status)
    if (filters.contentType) params.append('contentType', filters.contentType)
    if (filters.orderBy) params.append('orderBy', filters.orderBy)
    
    const response = await api.get(`/backlog?${params.toString()}`)
    return response.data
  },

  // Crear nuevo item
  create: async (itemData) => {
    const response = await api.post('/backlog', itemData)
    return response.data
  },

  // Actualizar item
  update: async (id, itemData) => {
    const response = await api.put(`/backlog/${id}`, itemData)
    return response.data
  },

  // Actualizar solo el estado
  updateStatus: async (id, status) => {
    const response = await api.patch(`/backlog/${id}/status`, { status })
    return response.data
  },

  // Eliminar item
  delete: async (id) => {
    const response = await api.delete(`/backlog/${id}`)
    return response.data
  },
}