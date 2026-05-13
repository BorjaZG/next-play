import { useEffect } from 'react'
import { useBacklogStore } from '../store/backlogStore'
import BacklogCard from '../components/backlog/BacklogCard'
import BacklogFilters from '../components/backlog/BacklogFilters'
import Header from '../components/layout/Header'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Backlog() {
  const navigate = useNavigate()
  const { items, loading, fetchItems, getStats } = useBacklogStore()

  useEffect(() => {
    fetchItems()
  }, [])

  const stats = getStats()

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">Mi Backlog</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {stats.total} items · {stats.completed} completados · {stats.playing} en progreso
            </p>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="btn-primary"
          >
            + Añadir
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-300' },
            { label: 'Pendiente', value: stats.pending, color: 'text-yellow-400' },
            { label: 'En progreso', value: stats.playing, color: 'text-blue-400' },
            { label: 'Completado', value: stats.completed, color: 'text-primary-green' },
          ].map(s => (
            <div key={s.label} className="bg-dark-card border border-dark-border rounded-lg p-3 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6">
          <BacklogFilters />
        </div>

        {/* Loading */}
        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 mb-4">Tu backlog está vacío.</p>
            <button onClick={() => navigate('/search')} className="btn-primary">
              Buscar contenido
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {items.map(item => (
                <BacklogCard key={item.id} item={item} />
              ))}
            </div>

            {loading && (
              <div className="flex justify-center mt-8">
                <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
