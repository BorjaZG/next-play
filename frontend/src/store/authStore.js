import { create } from 'zustand'
import { authService } from '../services/auth.service'

export const useAuthStore = create((set) => ({
  user: authService.getCurrentUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  error: null,

  // Login
  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const data = await authService.login(email, password)
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false,
      })
      return { success: true }
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Error al iniciar sesión',
        loading: false,
      })
      return { success: false, error: error.response?.data?.error }
    }
  },

  // Register
  register: async (username, email, password) => {
    set({ loading: true, error: null })
    try {
      const data = await authService.register(username, email, password)
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false,
      })
      return { success: true }
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Error al registrarse',
        loading: false,
      })
      return { success: false, error: error.response?.data?.error }
    }
  },

  // Logout
  logout: () => {
    authService.logout()
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    })
  },

  // Clear error
  clearError: () => set({ error: null }),
}))