import { X, Plus, Check } from 'lucide-react'
import { useState } from 'react'
import { searchService } from '../../services/search.service'
import { useBacklogStore } from '../../store/backlogStore'

export default function ItemPreviewModal({ item, onClose }) {
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const { fetchItems } = useBacklogStore()

  const handleAdd = async () => {
    if (!item.externalId) {
      alert('Este item no se puede añadir automáticamente')
      return
    }

    setAdding(true)
    try {
      await searchService.addToBacklog(item.contentType, item.externalId, {
        status: 'pending',
        priority: 'medium'
      })
      
      setAdded(true)
      fetchItems()
      
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      if (error.response?.data?.error?.includes('ya existe')) {
        setAdded(true)
        alert('Este item ya está en tu backlog')
      } else {
        alert('Error al añadir al backlog')
      }
      setAdding(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-dark-card border-b border-gray-800 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold">Vista previa</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-hover rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Image */}
            <div className="md:col-span-1">
              {item.coverImage ? (
                <img 
                  src={item.coverImage} 
                  alt={item.title}
                  className="w-full rounded-xl"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-dark-hover rounded-xl flex items-center justify-center">
                  <span className="text-6xl">🎮</span>
                </div>
              )}

              {/* Add button */}
              <button
                onClick={handleAdd}
                disabled={adding || added}
                className={`w-full mt-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                  added
                    ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                    : 'bg-gradient-main hover:opacity-90'
                }`}
              >
                {adding ? (
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

            {/* Details */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
                
                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                  {item.metadata?.releaseDate && (
                    <span>📅 {new Date(item.metadata.releaseDate).getFullYear()}</span>
                  )}
                  {item.metadata?.developer && (
                    <span>🎮 {item.metadata.developer}</span>
                  )}
                  {item.metadata?.creator && (
                    <span>🎬 {item.metadata.creator}</span>
                  )}
                  {item.metadata?.studio && (
                    <span>🏢 {item.metadata.studio}</span>
                  )}
                  {item.metadata?.rating && (
                    <span>⭐ {item.metadata.rating}/10</span>
                  )}
                </div>

                {/* Genres */}
                {item.metadata?.genres && item.metadata.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.metadata.genres.map((genre, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-dark-hover rounded-full text-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary - ESTA ES LA SINOPSIS */}
              {item.metadata?.summary && (
                <div>
                  <h3 className="font-semibold mb-2">Sinopsis</h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    {item.metadata.summary}
                  </p>
                </div>
              )}

              {/* Estado del usuario */}
              {item.status && (
                <div className="p-4 bg-dark-hover rounded-lg">
                  <h3 className="font-semibold mb-2">Estado del usuario</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>
                      <span className="text-gray-500">Estado:</span>{' '}
                      <span className={`${
                        item.status === 'completed' ? 'text-green-500' :
                        item.status === 'playing' ? 'text-blue-500' :
                        'text-yellow-500'
                      }`}>
                        {item.status === 'completed' ? 'Completado' :
                         item.status === 'playing' ? 'En progreso' :
                         item.status === 'pending' ? 'Pendiente' : 'Abandonado'}
                      </span>
                    </p>
                    {item.progress > 0 && (
                      <p>
                        <span className="text-gray-500">Progreso:</span> {item.progress}%
                      </p>
                    )}
                    {item.reviews && item.reviews.length > 0 && (
                      <p>
                        <span className="text-gray-500">Valoración:</span> ⭐ {item.reviews[0].rating}/5
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Review */}
              {item.reviews && item.reviews.length > 0 && item.reviews[0].reviewText && (
                <div>
                  <h3 className="font-semibold mb-2">Reseña del usuario</h3>
                  <p className="text-gray-300 bg-dark-hover p-4 rounded-lg italic text-sm">
                    "{item.reviews[0].reviewText}"
                  </p>
                </div>
              )}

              {/* Additional info */}
              {(item.metadata?.platforms || item.metadata?.seasons || item.metadata?.episodes) && (
                <div>
                  <h3 className="font-semibold mb-2">Información adicional</h3>
                  
                  {item.metadata?.platforms && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-400">Plataformas:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.metadata.platforms.map((platform, index) => (
                          <span key={index} className="px-2 py-1 bg-dark-hover rounded text-xs">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.metadata?.seasons && (
                    <p className="text-sm">
                      <span className="text-gray-400">Temporadas:</span> {item.metadata.seasons}
                    </p>
                  )}

                  {item.metadata?.episodes && (
                    <p className="text-sm">
                      <span className="text-gray-400">Episodios:</span> {item.metadata.episodes}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}