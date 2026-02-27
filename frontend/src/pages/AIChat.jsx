import { useEffect, useState, useRef } from 'react'
import { Send, Trash2, Sparkles, Loader2 } from 'lucide-react'
import { useChatStore } from '../store/chatStore'
import Header from '../components/layout/Header'

const quickSuggestions = [
  "¿Qué debería jugar ahora?",
  "Dame recomendaciones basadas en mi backlog",
  "¿Cuánto tiempo me llevará completar mi backlog?",
  "¿Qué juegos/series son similares a los que he completado?",
  "Analiza mi backlog y dame insights",
]

export default function AIChat() {
  const { messages, loading, sendMessage, clearHistory, loadHistory } = useChatStore()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    await sendMessage(input.trim())
    setInput('')
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleQuickSuggestion = (suggestion) => {
    setInput(suggestion)
  }

  const handleTextareaChange = (e) => {
    setInput(e.target.value)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }

  const handleClearHistory = () => {
    if (confirm('¿Eliminar todo el historial de chat?')) {
      clearHistory()
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Header />
      
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary-purple" />
              Asistente IA
            </h1>
            <p className="text-gray-400 mt-1">
              Pregúntame sobre tu backlog, pide recomendaciones o consejos
            </p>
          </div>
          
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <Sparkles className="w-16 h-16 mx-auto text-primary-purple mb-4 opacity-50" />
              <h2 className="text-2xl font-bold mb-2">¡Hola! Soy tu asistente de Next Play</h2>
              <p className="text-gray-400 mb-6">
                Puedo ayudarte a decidir qué jugar, darte recomendaciones personalizadas y más
              </p>
              
              {/* Quick suggestions */}
              <div className="max-w-2xl mx-auto">
                <p className="text-sm text-gray-500 mb-3">Prueba con estas preguntas:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickSuggestion(suggestion)}
                      className="px-4 py-2 bg-dark-card border border-gray-700 rounded-lg hover:border-primary-purple transition-colors text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-main text-white'
                        : 'bg-dark-card border border-gray-700'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-primary-purple" />
                        <span className="text-xs text-gray-500">Asistente IA</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-dark-card border border-gray-700 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary-purple" />
                      <span className="text-gray-400">Escribiendo...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="bg-dark-card border border-gray-700 rounded-xl p-4">
          {messages.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Sugerencias rápidas:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickSuggestion(suggestion)}
                    className="px-3 py-1 bg-dark-hover border border-gray-700 rounded-lg hover:border-primary-purple transition-colors text-xs"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder="Escribe tu pregunta... (Enter para enviar, Shift+Enter para nueva línea)"
              className="flex-1 bg-dark-hover border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-purple resize-none min-h-[50px] max-h-[200px]"
              rows={1}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-gradient-main px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}