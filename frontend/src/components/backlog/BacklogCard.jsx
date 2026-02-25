import { useState } from 'react'
import { Gamepad2, Tv, Clapperboard, Sparkles, MoreVertical, Trash2, Edit } from 'lucide-react'
import { useBacklogStore } from '../../store/backlogStore'
import { useNavigate } from 'react-router-dom'

const typeIcons = {
  game: Gamepad2,
  series: Tv,
  movie: Clapperboard,
  anime: Sparkles,
}

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  playing: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-500 border-green-500/30',
  abandoned: 'bg-red-500/20 text-red-500 border-red-500/30',
}

const statusLabels = {
  pending: 'Pendiente',
  playing: 'En progreso',
  completed: 'Completado',
  abandoned: 'Abandonado',
}

const priorityColors = {
  low: 'bg-gray-500/20 text-gray-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-primary-orange/20 text-primary-orange',
}

export default function BacklogCard({ item }) {
  const navigate = useNavigate()
  const { updateItemStatus, deleteItem } = useBacklogStore()
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(false)

  const TypeIcon = typeIcons[item.contentType] || Gamepad2

  const handleStatusChange = async (newStatus) => {
    setLoading(true)
    await updateItemStatus(item.id, newStatus)
    setLoading(false)
    setShowMenu(false)
  }

  const handleDelete = async () => {
    if (confirm('¿Eliminar este item del backlog?')) {
      setLoading(true)
      await deleteItem(item.id)
    }
  }

  const handleCardClick = (e) => {
    // No navegar si se hace click en el menú
    if (e.target.closest('.menu-button')) return
    navigate(`/backlog/${item.id}`)
  }

  return (
    <div 
      onClick={handleCardClick}
      className="card group cursor-pointer relative overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden rounded-lg mb-4">
        {item.coverImage ? (
          <img 
            src={item.coverImage} 
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-dark-hover flex items-center justify-center">
            <TypeIcon className="w-16 h-16 text-gray-600" />
          </div>
        )}
        
        {/* Progress bar */}
        {item.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/50">
            <div 
              className="h-full bg-gradient-main"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Title & Type */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-2 flex-1">
            {item.title}
          </h3>
          <TypeIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </div>

        {/* Status & Priority */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[item.status]}`}>
            {statusLabels[item.status]}
          </span>
          
          {item.priority !== 'medium' && (
            <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[item.priority]}`}>
              {item.priority === 'high' ? 'Alta' : 'Baja'} prioridad
            </span>
          )}

          {item.progress > 0 && (
            <span className="text-xs text-gray-400">
              {item.progress}%
            </span>
          )}
        </div>

        {/* Rating */}
        {item.reviews && item.reviews.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="text-sm text-gray-300">
              {item.reviews[0].rating}/5
            </span>
          </div>
        )}
      </div>

      {/* Menu button */}
      <div className="absolute top-4 right-4 menu-button">
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className="bg-black/60 backdrop-blur-sm p-2 rounded-lg hover:bg-black/80 transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {/* Dropdown menu */}
        {showMenu && (
          <div className="absolute top-12 right-0 bg-dark-card border border-gray-700 rounded-lg shadow-xl z-10 min-w-[180px]">
            <div className="p-2 space-y-1">
              <p className="text-xs text-gray-400 px-3 py-1">Cambiar estado</p>
              
              {['pending', 'playing', 'completed', 'abandoned'].map(status => (
                <button
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusChange(status)
                  }}
                  disabled={loading || item.status === status}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-dark-hover transition-colors text-sm
                    ${item.status === status ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {statusLabels[status]}
                </button>
              ))}

              <div className="border-t border-gray-700 my-1" />
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/backlog/${item.id}`)
                }}
                className="w-full text-left px-3 py-2 rounded hover:bg-dark-hover transition-colors text-sm flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Ver detalles
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
                disabled={loading}
                className="w-full text-left px-3 py-2 rounded hover:bg-red-500/10 transition-colors text-sm text-red-500 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0"
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(false)
          }}
        />
      )}
    </div>
  )
}