import { useState } from 'react'
import { Gamepad2, Tv, Clapperboard, Sparkles, Plus, Check } from 'lucide-react'
import { searchService } from '../../services/search.service'
import { useBacklogStore } from '../../store/backlogStore'

const typeIcons = {
  game: Gamepad2,
  series: Tv,
  movie: Clapperboard,
  anime: Sparkles,
}

const typeColors = {
  game: 'text-blue-400',
  series: 'text-green-400',
  movie: 'text-purple-400',
  anime: 'text-pink-400',
}

export default function SearchResultCard({ item }) {
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const { fetchItems } = useBacklogStore()

  const TypeIcon = typeIcons[item.contentType] || Gamepad2

  const handleAddToBacklog = async (status = 'pending', priority = 'medium') => {
    setLoading(true)
    
    try {
      await searchService.addToBacklog(item.contentType, item.externalId, {
        status,
        priority
      })
      
      setAdded(true)
      setShowModal(false)
      
      // Refrescar el backlog
      fetchItems()
      
      // Resetear después de 3 segundos
      setTimeout(() => setAdded(false), 3000)
    } catch (error) {
      alert(error.response?.data?.error || 'Error al añadir al backlog')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="card group relative">
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

          {/* Type badge */}
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2">
            <TypeIcon className={`w-4 h-4 ${typeColors[item.contentType]}`} />
            <span className="text-xs capitalize">{item.contentType}</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-2">
            {item.title}
          </h3>

          {/* Metadata */}
          <div className="space-y-2 text-sm text-gray-400">
            {item.metadata?.releaseDate && (
              <p>📅 {new Date(item.metadata.releaseDate).getFullYear()}</p>
            )}
            
            {item.metadata?.developer && (
              <p>🎮 {item.metadata.developer}</p>
            )}
            
            {item.metadata?.creator && (
              <p>🎬 {item.metadata.creator}</p>
            )}
            
            {item.metadata?.studio && (
              <p>🏢 {item.metadata.studio}</p>
            )}

            {item.metadata?.rating && (
              <p>⭐ {item.metadata.rating}/10</p>
            )}

            {item.metadata?.genres && item.metadata.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.metadata.genres.slice(0, 3).map((genre, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-dark-hover rounded text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Add button */}
          <button
            onClick={() => setShowModal(true)}
            disabled={loading || added}
            className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
              added
                ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                : 'bg-gradient-main hover:opacity-90'
            }`}
          >
            {loading ? (
              'Añadiendo...'
            ) : added ? (
              <>
                <Check className="w-5 h-5" />
                Añadido al backlog
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Añadir a mi backlog
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal para seleccionar estado */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Añadir a mi backlog</h3>
            
            <div className="mb-4">
              <img 
                src={item.coverImage} 
                alt={item.title}
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
              <h4 className="font-semibold">{item.title}</h4>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Estado inicial
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAddToBacklog('pending', 'medium')}
                    className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors"
                  >
                    Pendiente
                  </button>
                  <button
                    onClick={() => handleAddToBacklog('playing', 'high')}
                    className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    En progreso
                  </button>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2 bg-dark-hover rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}