import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="bg-dark-card border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold bg-gradient-main bg-clip-text text-transparent">
              Next Play
            </h1>
            
            <div className="flex items-center gap-4">
              <span className="text-gray-400">Hola, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-dark-hover px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <h2 className="text-4xl font-bold mb-4">¡Bienvenido a Next Play! 🎮</h2>
          <p className="text-gray-400 text-lg mb-8">
            Has iniciado sesión correctamente como <span className="text-primary-purple font-semibold">{user?.username}</span>
          </p>
          
          <div className="bg-dark-card rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">Sprint 1 - Completado ✅</h3>
            <p className="text-gray-400 mb-6">
              La autenticación funciona correctamente. En los próximos sprints añadiremos:
            </p>
            <ul className="text-left text-gray-300 space-y-2">
              <li>📚 Sprint 2: Vista de Backlog</li>
              <li>🔍 Sprint 3: Búsqueda y añadir contenido</li>
              <li>📝 Sprint 4: Vista de detalle</li>
              <li>📋 Sprint 5: Listas y perfil</li>
              <li>👥 Sprint 6: Red social</li>
              <li>🤖 Sprint 7: Chat con IA</li>
              <li>📊 Sprint 8: Estadísticas</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}