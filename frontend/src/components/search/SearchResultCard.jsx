import { useState } from 'react'
import { Plus, Check, X } from 'lucide-react'
import { searchService } from '../../services/search.service'
import { useBacklogStore } from '../../store/backlogStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function SearchResultCard({ item }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const { fetchItems } = useBacklogStore()

  const handleAddToBacklog = async (status = 'pending', priority = 'medium') => {
    setLoading(true)
    try {
      await searchService.addToBacklog(item.contentType, item.externalId, { status, priority })
      setAdded(true)
      setShowModal(false)
      fetchItems()
      setTimeout(() => setAdded(false), 3000)
    } catch (error) {
      if (error.response?.data?.error?.includes('ya existe')) {
        setAdded(true)
        setShowModal(false)
      } else {
        toast.error(error.response?.data?.error || 'Error al añadir al backlog')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = () => {
    navigate(`/item/${item.contentType}/${item.externalId}`)
  }

  return (
    <>
      <div className="group relative">
        {/* Cover */}
        <div className="cover-card" onClick={handleCardClick}>
          {item.coverImage ? (
            <img src={item.coverImage} alt={item.title} loading="lazy" />
          ) : (
            <div className="w-full h-full bg-dark-elevated flex items-center justify-center text-3xl">
              {item.contentType === 'game' ? '🎮' : item.contentType === 'series' ? '📺' : item.contentType === 'anime' ? '✨' : '🎬'}
            </div>
          )}

          {/* Type tag */}
          <div className="absolute top-2 left-2">
            <span className="text-xs bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-full text-gray-300 capitalize">
              {item.contentType}
            </span>
          </div>

          {/* Hover overlay */}
          <div className="overlay">
            <p className="text-white text-xs font-semibold line-clamp-2 leading-tight mb-1">{item.title}</p>
            {item.metadata?.releaseDate && (
              <p className="text-gray-400 text-xs">{new Date(item.metadata.releaseDate).getFullYear()}</p>
            )}
          </div>

          {/* Quick add button */}
          <button
            onClick={(e) => { e.stopPropagation(); if (!added) setShowModal(true) }}
            disabled={loading || added}
            className={`absolute bottom-2 right-2 p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
              added
                ? 'bg-primary-green text-dark-bg'
                : 'bg-black/70 backdrop-blur-sm text-white hover:bg-primary-purple'
            }`}
            title={added ? 'Añadido' : 'Añadir al backlog'}
          >
            {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Title */}
        <div className="mt-1.5 px-0.5">
          <p
            className="text-xs text-gray-300 line-clamp-1 cursor-pointer hover:text-white transition-colors"
            onClick={handleCardClick}
          >
            {item.title}
          </p>
          {item.metadata?.releaseDate && (
            <p className="text-xs text-gray-500">{new Date(item.metadata.releaseDate).getFullYear()}</p>
          )}
        </div>
      </div>

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-xl max-w-sm w-full border border-dark-border shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-border">
              <h3 className="font-semibold text-sm">Añadir al backlog</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 flex gap-4">
              <div className="w-16 flex-shrink-0 rounded-md overflow-hidden">
                {item.coverImage ? (
                  <img src={item.coverImage} alt={item.title} className="w-full aspect-[2/3] object-cover" />
                ) : (
                  <div className="w-full aspect-[2/3] bg-dark-elevated flex items-center justify-center text-xl">🎮</div>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-gray-400 capitalize mb-3">{item.contentType}</p>
                <div className="space-y-2">
                  <button
                    onClick={() => handleAddToBacklog('pending', 'medium')}
                    className="w-full text-left px-3 py-2 rounded-lg bg-dark-elevated hover:bg-dark-hover text-xs transition-colors"
                  >
                    📌 Pendiente
                  </button>
                  <button
                    onClick={() => handleAddToBacklog('playing', 'high')}
                    className="w-full text-left px-3 py-2 rounded-lg bg-dark-elevated hover:bg-dark-hover text-xs transition-colors"
                  >
                    ▶️ En progreso
                  </button>
                  <button
                    onClick={() => handleAddToBacklog('completed', 'medium')}
                    className="w-full text-left px-3 py-2 rounded-lg bg-dark-elevated hover:bg-dark-hover text-xs transition-colors"
                  >
                    ✅ Completado
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
