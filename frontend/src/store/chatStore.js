import { create } from 'zustand'
import { aiService } from '../services/ai.service'

export const useChatStore = create((set, get) => ({
  messages: [],
  loading: false,
  error: null,

  // Cargar historial desde localStorage
  loadHistory: () => {
    const saved = localStorage.getItem('chat_history')
    if (saved) {
      set({ messages: JSON.parse(saved) })
    }
  },

  // Guardar historial en localStorage
  saveHistory: (messages) => {
    localStorage.setItem('chat_history', JSON.stringify(messages))
  },

  // Enviar mensaje a la IA
  sendMessage: async (message) => {
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    }

    // Añadir mensaje del usuario
    const newMessages = [...get().messages, userMessage]
    set({ messages: newMessages, loading: true, error: null })

    try {
      // Preparar historial para la API (solo role y content)
      const history = newMessages.map(({ role, content }) => ({ role, content }))

      // Llamar a la IA
      const data = await aiService.chat(message, history)

      // Añadir respuesta de la IA
      const aiMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      }

      const updatedMessages = [...newMessages, aiMessage]
      set({ messages: updatedMessages, loading: false })
      
      // Guardar en localStorage
      get().saveHistory(updatedMessages)

    } catch (error) {
      set({ 
        error: error.response?.data?.error || 'Error al comunicarse con la IA',
        loading: false 
      })
    }
  },

  // Limpiar historial
  clearHistory: () => {
    set({ messages: [] })
    localStorage.removeItem('chat_history')
  },
}))