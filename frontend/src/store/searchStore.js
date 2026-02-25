import { create } from 'zustand'
import { searchService } from '../services/search.service'

export const useSearchStore = create((set, get) => ({
  results: [],
  loading: false,
  error: null,
  query: '',
  activeType: 'all',

  // Buscar contenido
  search: async (query, type = 'all') => {
    if (!query.trim()) {
      set({ results: [], query: '', error: null })
      return
    }

    set({ loading: true, error: null, query, activeType: type })
    
    try {
      const data = await searchService.search(query, type)
      set({ results: data.results, loading: false })
    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Error al buscar',
        loading: false,
        results: []
      })
    }
  },

  // Limpiar búsqueda
  clearSearch: () => {
    set({ results: [], query: '', error: null, activeType: 'all' })
  },

  // Cambiar tipo de búsqueda
  setType: (type) => {
    set({ activeType: type })
    if (get().query) {
      get().search(get().query, type)
    }
  },
}))