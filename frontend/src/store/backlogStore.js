import { create } from 'zustand'
import { backlogService } from '../services/backlog.service'

export const useBacklogStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,
  filters: {
    status: '',
    contentType: '',
    orderBy: 'createdAt',
  },

  // Obtener items
  fetchItems: async () => {
    set({ loading: true, error: null })
    try {
      const data = await backlogService.getAll(get().filters)
      set({ items: data.items, loading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Error al cargar el backlog',
        loading: false 
      })
    }
  },

  // Establecer filtros
  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters } })
    get().fetchItems()
  },

  // Actualizar estado de un item
  updateItemStatus: async (id, status) => {
    try {
      const updatedItem = await backlogService.updateStatus(id, status)
      
      set({
        items: get().items.map(item => 
          item.id === id ? { ...item, ...updatedItem.item } : item
        )
      })
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error 
      }
    }
  },

  // Eliminar item
  deleteItem: async (id) => {
    try {
      await backlogService.delete(id)
      set({ items: get().items.filter(item => item.id !== id) })
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error 
      }
    }
  },

  // Calcular contadores
  getStats: () => {
    const items = get().items
    return {
      total: items.length,
      pending: items.filter(i => i.status === 'pending').length,
      playing: items.filter(i => i.status === 'playing').length,
      completed: items.filter(i => i.status === 'completed').length,
    }
  },
}))