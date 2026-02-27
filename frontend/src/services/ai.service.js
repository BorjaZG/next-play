import api from './api'

export const aiService = {
  // Chat conversacional con la IA
  chat: async (message, history = []) => {
    const response = await api.post('/ai/chat', {
      message,
      history
    })
    return response.data
  },

  // Obtener recomendaciones personalizadas
  getRecommendations: async (context = '') => {
    const response = await api.post('/ai/recommendations', {
      context
    })
    return response.data
  },

  // Analizar backlog completo
  analyzeBacklog: async () => {
    const response = await api.get('/ai/analyze')
    return response.data
  },
}