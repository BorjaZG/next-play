import { useEffect } from 'react'
import { useBacklogStore } from '../store/backlogStore'
import BacklogCard from '../components/backlog/BacklogCard'
import BacklogFilters from '../components/backlog/BacklogFilters'
import { Loader2 } from 'lucide-react'

export default function Backlog() {
  const { items, loading, fetchItems, getStats } = useBacklogStore()

  useEffect(() => {
    fetchItems()
  }, [])

  const stats = getStats()

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-purple" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg pb-20">
      {/* Header con stats */}
      <div className="bg-dark-card border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold mb-6">Mi Backlog</h1>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-dark-bg rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Total</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-500 text-sm mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-500">{stats.pending}</p>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-500 text-sm mb-1">En progreso</p>
              <p className="text-3xl font-bold text-blue-500">{stats.playing}</p>
            </div>
            
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-500 text-sm mb-1">Completados</p>
              <p className="text-3xl font-bold text-green-500">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Filters */}
          <BacklogFilters />

          {/* Items Grid */}
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-4">
                No tienes items en tu backlog aún
              </p>
              <p className="text-gray-500">
                Comienza añadiendo juegos, series o películas que quieras ver
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map(item => (
                <BacklogCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {/* Loading overlay when filtering */}
          {loading && items.length > 0 && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <Loader2 className="w-12 h-12 animate-spin text-primary-purple" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}