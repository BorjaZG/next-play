import { Gamepad2, Tv, Clapperboard, Sparkles } from 'lucide-react'
import { useBacklogStore } from '../../store/backlogStore'

const contentTypes = [
  { value: '', label: 'Todos', icon: null },
  { value: 'game', label: 'Juegos', icon: Gamepad2 },
  { value: 'series', label: 'Series', icon: Tv },
  { value: 'anime', label: 'Anime', icon: Sparkles },
  { value: 'movie', label: 'Películas', icon: Clapperboard },
]

const statuses = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'playing', label: 'En progreso' },
  { value: 'completed', label: 'Completados' },
  { value: 'abandoned', label: 'Abandonados' },
]

const sortOptions = [
  { value: 'createdAt', label: 'Fecha añadido' },
  { value: 'updatedAt', label: 'Última actualización' },
  { value: 'title', label: 'Título (A-Z)' },
  { value: 'priority', label: 'Prioridad' },
]

export default function BacklogFilters() {
  const { filters, setFilters } = useBacklogStore()

  return (
    <div className="bg-dark-card rounded-xl p-6 space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <span>🔍</span>
        Filtros
      </h3>

      {/* Content Type Filter */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">Tipo</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {contentTypes.map(type => {
            const Icon = type.icon
            return (
              <button
                key={type.value}
                onClick={() => setFilters({ contentType: type.value })}
                className={`p-3 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                  filters.contentType === type.value
                    ? 'bg-primary-purple/20 border-primary-purple text-white'
                    : 'bg-dark-hover border-gray-700 text-gray-400 hover:border-gray-600'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span className="text-sm">{type.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">Estado</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {statuses.map(status => (
            <button
              key={status.value}
              onClick={() => setFilters({ status: status.value })}
              className={`p-3 rounded-lg border transition-colors ${
                filters.status === status.value
                  ? 'bg-primary-purple/20 border-primary-purple text-white'
                  : 'bg-dark-hover border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              <span className="text-sm">{status.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">Ordenar por</label>
        <select
          value={filters.orderBy}
          onChange={(e) => setFilters({ orderBy: e.target.value })}
          className="w-full bg-dark-hover border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-purple"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}