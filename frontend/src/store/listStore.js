import { create } from 'zustand'
import { listService } from '../services/list.service'

export const useListStore = create((set, get) => ({
  lists: [],
  loading: false,
  error: null,

  // Obtener todas las listas
  fetchLists: async () => {
    set({ loading: true, error: null })
    try {
      const data = await listService.getAll()
      set({ lists: data.lists, loading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Error al cargar listas',
        loading: false 
      })
    }
  },

  // Crear lista
  createList: async (listData) => {
    try {
      const data = await listService.create(listData)
      set({ lists: [...get().lists, data.list] })
      return { success: true, list: data.list }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error 
      }
    }
  },

  // Actualizar lista
  updateList: async (id, listData) => {
    try {
      const data = await listService.update(id, listData)
      set({
        lists: get().lists.map(list => 
          list.id === id ? data.list : list
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

  // Eliminar lista
  deleteList: async (id) => {
    try {
      await listService.delete(id)
      set({ lists: get().lists.filter(list => list.id !== id) })
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error 
      }
    }
  },

  // Añadir item a lista
  addItemToList: async (listId, backlogItemId) => {
    try {
      await listService.addItem(listId, backlogItemId)
      await get().fetchLists()
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error 
      }
    }
  },
}))