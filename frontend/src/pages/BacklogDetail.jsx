import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Loader2, Calendar, Users, Plus } from 'lucide-react'
import { backlogService } from '../services/backlog.service'
import { searchService } from '../services/search.service'
import { reviewService } from '../services/review.service'
import { useBacklogStore } from '../store/backlogStore'
import { useAuthStore } from '../store/authStore'
import StarRating from '../components/common/StarRating'
import Header from '../components/layout/Header'

const statusLabels = {
  pending: 'Pendiente',
  playing: 'En progreso',
  completed: 'Completado',
  abandoned: 'Abandonado',
}

const statusColors = {
  pending: 'bg-yellow-500',
  playing: 'bg-blue-500',
  completed: 'bg-green-500',
  abandoned: 'bg-red-500',
}

export default function BacklogDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { updateItemStatus, deleteItem, items: myBacklogItems } = useBacklogStore()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [hasReview, setHasReview] = useState(false)
  const [savingReview, setSavingReview] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [isInMyBacklog, setIsInMyBacklog] = useState(false)
  const [addingToBacklog, setAddingToBacklog] = useState(false)

  useEffect(() => {
    fetchItemDetails()
  }, [id])

  const fetchItemDetails = async () => {
    setLoading(true)
    try {
      // Obtener todos los items del backlog
      const data = await backlogService.getAll()
      const foundItem = data.items.find(i => i.id === parseInt(id))
      
      if (!foundItem) {
        navigate('/backlog')
        return
      }

      setItem(foundItem)
      setProgress(foundItem.progress || 0)
      setIsOwner(foundItem.userId === user.id)

      // Verificar si ya está en mi backlog (si no es mío)
      if (foundItem.userId !== user.id && foundItem.externalId) {
        const alreadyInBacklog = myBacklogItems.some(
          i => i.externalId === foundItem.externalId && i.contentType === foundItem.contentType
        )
        setIsInMyBacklog(alreadyInBacklog)
      }

      // Si tiene reseña y es mío, cargarla
      if (foundItem.userId === user.id && foundItem.reviews && foundItem.reviews.length > 0) {
        const myReview = foundItem.reviews[0]
        setRating(myReview.rating)
        setReviewText(myReview.reviewText || '')
        setHasReview(true)
      }
    } catch (error) {
      console.error('Error cargando item:', error)
      navigate('/backlog')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    await updateItemStatus(item.id, newStatus)
    setItem({ ...item, status: newStatus })
  }

  const handleProgressChange = async (newProgress) => {
    setProgress(newProgress)
    
    try {
      await backlogService.update(item.id, { progress: newProgress })
      setItem({ ...item, progress: newProgress })
    } catch (error) {
      console.error('Error actualizando progreso:', error)
    }
  }

  const handleSaveReview = async () => {
    if (rating === 0) {
      alert('Por favor, selecciona una valoración')
      return
    }

    setSavingReview(true)
    try {
      await reviewService.createOrUpdate(item.id, {
        rating,
        reviewText: reviewText.trim(),
        tags: []
      })
      
      setHasReview(true)
      alert('Reseña guardada correctamente')
      fetchItemDetails()
    } catch (error) {
      alert('Error al guardar la reseña')
    } finally {
      setSavingReview(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('¿Eliminar este item del backlog?')) {
      await deleteItem(item.id)
      navigate('/backlog')
    }
  }

  const handleAddToMyBacklog = async () => {
    if (!item.externalId) {
      alert('Este item no se puede añadir automáticamente')
      return
    }

    setAddingToBacklog(true)
    try {
      await searchService.addToBacklog(item.contentType, item.externalId, {
        status: 'pending',
        priority: 'medium'
      })
      
      setIsInMyBacklog(true)
      alert('¡Añadido a tu backlog!')
    } catch (error) {
      if (error.response?.data?.error?.includes('ya existe')) {
        setIsInMyBacklog(true)
        alert('Este item ya está en tu backlog')
      } else {
        alert('Error al añadir al backlog')
      }
    } finally {
      setAddingToBacklog(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-purple" />
      </div>
    )
  }

  if (!item) {
    return null
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Image */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {item.coverImage ? (
                <img
                  src={item.coverImage}
                  alt={item.title}
                  className="w-full rounded-xl shadow-2xl"
                />
              ) : (
                <div className="w-full aspect-[2/3] bg-dark-card rounded-xl flex items-center justify-center">
                  <span className="text-gray-600 text-6xl">🎮</span>
                </div>
              )}

              {/* Action buttons */}
              {isOwner ? (
                <button
                  onClick={handleDelete}
                  className="w-full mt-4 py-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Eliminar del backlog
                </button>
              ) : (
                <button
                  onClick={handleAddToMyBacklog}
                  disabled={addingToBacklog || isInMyBacklog}
                  className={`w-full mt-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                    isInMyBacklog
                      ? 'bg-green-500/20 text-green-500 border border-green-500/30 cursor-not-allowed'
                      : 'bg-gradient-main hover:opacity-90'
                  }`}
                >
                  {addingToBacklog ? (
                    'Añadiendo...'
                  ) : isInMyBacklog ? (
                    '✓ En tu backlog'
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Añadir a mi backlog
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Right column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and metadata */}
            <div>
              <h1 className="text-4xl font-bold mb-4">{item.title}</h1>
              
              <div className="flex flex-wrap gap-4 text-gray-400">
                {item.metadata?.releaseDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(item.metadata.releaseDate).getFullYear()}
                  </div>
                )}
                
                {item.metadata?.developer && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {item.metadata.developer}
                  </div>
                )}

                {item.metadata?.studio && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {item.metadata.studio}
                  </div>
                )}

                {item.metadata?.creator && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {item.metadata.creator}
                  </div>
                )}
              </div>

              {/* Genres */}
              {item.metadata?.genres && item.metadata.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
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

              {/* Summary */}
              {item.metadata?.summary && (
                <p className="text-gray-300 mt-6 leading-relaxed">
                  {item.metadata.summary}
                </p>
              )}
            </div>

            {/* SOLO SI ES PROPIETARIO - Estado */}
            {isOwner && (
              <div className="card">
                <h3 className="font-semibold mb-4">Estado</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(statusLabels).map(([status, label]) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`py-3 rounded-lg font-medium transition-all ${
                        item.status === status
                          ? `${statusColors[status]} text-white`
                          : 'bg-dark-hover text-gray-400 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SOLO SI ES PROPIETARIO - Progreso */}
            {isOwner && (
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Progreso</h3>
                  <span className="text-2xl font-bold text-primary-purple">
                    {progress}%
                  </span>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                  className="w-full h-3 bg-dark-hover rounded-lg appearance-none cursor-pointer 
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 
                    [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full 
                    [&::-webkit-slider-thumb]:bg-gradient-main [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6 
                    [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-main 
                    [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
                  style={{
                    background: `linear-gradient(to right, 
                      rgb(168, 85, 247) 0%, 
                      rgb(217, 70, 239) ${progress}%, 
                      rgb(42, 42, 42) ${progress}%, 
                      rgb(42, 42, 42) 100%)`
                  }}
                />
                
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            )}

            {/* SOLO SI ES PROPIETARIO - Mi valoración */}
            {isOwner && (
              <div className="card">
                <h3 className="font-semibold mb-4">Mi valoración</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Calificación
                    </label>
                    <StarRating 
                      rating={rating} 
                      onRatingChange={setRating}
                      size="lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Reseña (opcional)
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Escribe tu opinión sobre este contenido..."
                      rows={4}
                      className="w-full bg-dark-hover border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-purple resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSaveReview}
                    disabled={savingReview || rating === 0}
                    className="btn-primary w-full"
                  >
                    {savingReview ? 'Guardando...' : hasReview ? 'Actualizar reseña' : 'Guardar reseña'}
                  </button>
                </div>
              </div>
            )}

            {/* SI NO ES PROPIETARIO - Mostrar solo info */}
            {!isOwner && (
              <div className="card">
                <h3 className="font-semibold mb-4">Información del usuario</h3>
                <div className="space-y-3 text-gray-300">
                  <p><span className="text-gray-500">Estado:</span> {statusLabels[item.status] || 'Desconocido'}</p>
                  {item.progress > 0 && (
                    <p><span className="text-gray-500">Progreso:</span> {item.progress}%</p>
                  )}
                  {item.reviews && item.reviews.length > 0 && (
                    <>
                      <p className="flex items-center gap-2">
                        <span className="text-gray-500">Valoración:</span>
                        <StarRating rating={item.reviews[0].rating} readonly size="sm" />
                        <span>{item.reviews[0].rating}/5</span>
                      </p>
                      {item.reviews[0].reviewText && (
                        <div className="mt-4 p-4 bg-dark-hover rounded-lg">
                          <p className="text-sm text-gray-400 mb-2">Reseña:</p>
                          <p className="text-gray-300">{item.reviews[0].reviewText}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Platforms/Seasons info */}
            {(item.metadata?.platforms || item.metadata?.seasons) && (
              <div className="card">
                <h3 className="font-semibold mb-4">Información adicional</h3>
                
                {item.metadata?.platforms && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Plataformas</p>
                    <div className="flex flex-wrap gap-2">
                      {item.metadata.platforms.map((platform, index) => (
                        <span key={index} className="px-3 py-1 bg-dark-hover rounded-lg text-sm">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {item.metadata?.seasons && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Temporadas</p>
                    <p className="text-lg">{item.metadata.seasons} temporadas</p>
                  </div>
                )}

                {item.metadata?.episodes && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Episodios</p>
                    <p className="text-lg">{item.metadata.episodes} episodios</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}