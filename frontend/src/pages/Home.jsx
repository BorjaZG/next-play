import { useNavigate } from 'react-router-dom'
import { useBacklogStore } from '../store/backlogStore'
import { useEffect } from 'react'
import Header from '../components/layout/Header'

export default function Home() {
  const navigate = useNavigate()
  const { getStats, items, fetchItems } = useBacklogStore()

  useEffect(() => {
    if (items.length === 0) {
      fetchItems()
    }
  }, [])

  const stats = getStats()

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-4xl font-bold mb-4">¡Bienvenido a Next Play! 🎮</h2>
          <p className="text-gray-400 text-lg mb-12">
            Tu gestor personal de contenido
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
            <div className="bg-dark-card rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-2">Total</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-dark-card rounded-xl p-6">
              <p className="text-yellow-500 text-sm mb-2">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
            </div>
            <div className="bg-dark-card rounded-xl p-6">
              <p className="text-blue-500 text-sm mb-2">En progreso</p>
              <p className="text-3xl font-bold text-blue-500">{stats.playing}</p>
            </div>
            <div className="bg-dark-card rounded-xl p-6">
              <p className="text-green-500 text-sm mb-2">Completados</p>
              <p className="text-3xl font-bold text-green-500">{stats.completed}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/backlog')}
              className="btn-primary"
            >
              Ver mi Backlog
            </button>
            <button
              onClick={() => navigate('/search')}
              className="btn-secondary"
            >
              Buscar contenido
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}