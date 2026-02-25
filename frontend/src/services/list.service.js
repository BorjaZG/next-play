import api from './api'

export const listService = {
  // Obtener todas mis listas
  getAll: async () => {
    const response = await api.get('/lists')
    return response.data
  },

  // Obtener una lista específica
  getById: async (id) => {
    const response = await api.get(`/lists/${id}`)
    return response.data
  },

  // Crear nueva lista
  create: async (listData) => {
    const response = await api.post('/lists', listData)
    return response.data
  },

  // Actualizar lista
  update: async (id, listData) => {
    const response = await api.put(`/lists/${id}`, listData)
    return response.data
  },

  // Añadir item a lista
  addItem: async (listId, backlogItemId) => {
    const response = await api.post(`/lists/${listId}/items`, { backlogItemId })
    return response.data
  },

  // Eliminar item de lista
  removeItem: async (listId, backlogItemId) => {
    const response = await api.delete(`/lists/${listId}/items/${backlogItemId}`)
    return response.data
  },

  // Eliminar lista
  delete: async (id) => {
    const response = await api.delete(`/lists/${id}`)
    return response.data
  },
}