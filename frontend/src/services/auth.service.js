import api from './api'

export const authService = {
  // Registrar nuevo usuario
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
    })
    return response.data
  },

  // Iniciar sesión
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    })
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    return response.data
  },

  // Obtener usuario autenticado
  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token')
  },

  // Obtener usuario del localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },
}