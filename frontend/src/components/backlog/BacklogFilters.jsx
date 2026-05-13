import { useBacklogStore } from '../../store/backlogStore'

const types = [
  { value: '', label: 'Todo' },
  { value: 'game', label: '🎮 Juegos' },
  { value: 'series', label: '📺 Series' },
  { value: 'anime', label: '✨ Anime' },
  { value: 'movie', label: '🎬 Películas' },
]

const statuses = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'playing', label: 'En progreso' },
  { value: 'completed', label: 'Completado' },
  { value: 'abandoned', label: 'Abandonado' },
]

const sorts = [
  { value: 'createdAt', label: 'Más recientes' },
  { value: 'updatedAt', label: 'Última actualización' },
  { value: 'title', label: 'Título A-Z' },
]

export default function BacklogFilters() {
  const { filters, setFilters } = useBacklogStore()

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Type filter */}
      <div className="flex gap-1 bg-dark-elevated rounded-lg p-1">
        {types.map(t => (
          <button
            key={t.value}
            onClick={() => setFilters({ contentType: t.value })}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              (filters.contentType || '') === t.value
                ? 'bg-dark-card text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <select
        value={filters.status || ''}
        onChange={(e) => setFilters({ status: e.target.value })}
        className="bg-dark-elevated border border-dark-border text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500"
      >
        {statuses.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={filters.orderBy || 'createdAt'}
        onChange={(e) => setFilters({ orderBy: e.target.value })}
        className="bg-dark-elevated border border-dark-border text-gray-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500"
      >
        {sorts.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </div>
  )
}