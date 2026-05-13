import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Loader2, Plus, Check } from 'lucide-react'
import { backlogService } from '../services/backlog.service'
import { searchService } from '../services/search.service'
import { reviewService } from '../services/review.service'
import { followService } from '../services/follow.service'
import { useBacklogStore } from '../store/backlogStore'
import { useAuthStore } from '../store/authStore'
import Header from '../components/layout/Header'

const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',   dot: 'bg-yellow-400', text: 'text-yellow-400',  border: 'border-yellow-400/40', bg: 'bg-yellow-400/10' },
  playing:   { label: 'En progreso', dot: 'bg-blue-400',   text: 'text-blue-400',    border: 'border-blue-400/40',   bg: 'bg-blue-400/10'   },
  completed: { label: 'Completado',  dot: 'bg-primary-green', text: 'text-primary-green', border: 'border-primary-green/40', bg: 'bg-primary-green/10' },
  abandoned: { label: 'Abandonado',  dot: 'bg-red-400',    text: 'text-red-400',     border: 'border-red-400/40',    bg: 'bg-red-400/10'    },
}

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-base ${i <= rating ? 'star-filled' : 'star-empty'}`}>★</span>
      ))}
    </div>
  )
}

function StarPicker({ rating, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i === rating ? 0 : i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl leading-none transition-colors"
          style={{ color: i <= (hover || rating) ? '#e91e8c' : '#456' }}
        >
          ★
        </button>
      ))}
    </div>
  )
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
  const [reviewSaved, setReviewSaved] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [isInMyBacklog, setIsInMyBacklog] = useState(false)
  const [addingToBacklog, setAddingToBacklog] = useState(false)
  const [communityReviews, setCommunityReviews] = useState([])

  useEffect(() => { fetchItemDetails() }, [id]) // eslint-disable-line

  const fetchItemDetails = async () => {
    setLoading(true)
    try {
      const data = await backlogService.getAll()
      const foundItem = data.items.find(i => i.id === parseInt(id))
      if (!foundItem) { navigate('/backlog'); return }

      setItem(foundItem)
      setProgress(foundItem.progress || 0)
      setIsOwner(foundItem.userId === user.id)

      if (foundItem.userId !== user.id && foundItem.externalId) {
        setIsInMyBacklog(myBacklogItems.some(
          i => i.externalId === foundItem.externalId && i.contentType === foundItem.contentType
        ))
      }

      if (foundItem.userId === user.id && foundItem.reviews?.length > 0) {
        const r = foundItem.reviews[0]
        setRating(r.rating)
        setReviewText(r.reviewText || '')
        setHasReview(true)
      }

      if (foundItem.externalId && foundItem.contentType) {
        followService.getItemReviews(foundItem.externalId, foundItem.contentType, 8)
          .then(d => setCommunityReviews((d.reviews || []).filter(r => r.user?.id !== user.id)))
          .catch(() => {})
      }
    } catch {
      navigate('/backlog')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    if (item.status === newStatus) return
    await updateItemStatus(item.id, newStatus)
    setItem({ ...item, status: newStatus })
  }

  const handleProgressChange = async (val) => {
    setProgress(val)
    try { await backlogService.update(item.id, { progress: val }) } catch {}
  }

  const handleSaveReview = async () => {
    if (!rating) return
    setSavingReview(true)
    try {
      await reviewService.createOrUpdate(item.id, { rating, reviewText: reviewText.trim(), tags: [] })
      setHasReview(true)
      setReviewSaved(true)
      setTimeout(() => setReviewSaved(false), 3000)
    } catch {}
    finally { setSavingReview(false) }
  }

  const handleDelete = async () => {
    if (confirm('¿Eliminar este item del backlog?')) {
      await deleteItem(item.id)
      navigate('/backlog')
    }
  }

  const handleAddToMyBacklog = async () => {
    if (!item.externalId) return
    setAddingToBacklog(true)
    try {
      await searchService.addToBacklog(item.contentType, item.externalId, { status: 'pending', priority: 'medium' })
      setIsInMyBacklog(true)
    } catch (err) {
      if (err.response?.data?.error?.includes('ya existe')) setIsInMyBacklog(true)
    } finally {
      setAddingToBacklog(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
    </div>
  )
  if (!item) return null

  const currentStatus = STATUS_CONFIG[item.status]
  const review = item.reviews?.[0]
  const devName = item.metadata?.developer || item.metadata?.studio || item.metadata?.creator
  const releaseYear = item.metadata?.releaseDate ? new Date(item.metadata.releaseDate).getFullYear() : null
  const typeEmoji = item.contentType === 'game' ? '🎮' : item.contentType === 'series' ? '📺' : item.contentType === 'anime' ? '✨' : '🎬'

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />

      {/* ── Hero ── */}
      <div className="relative">
        {/* Blurred background */}
        <div className="absolute inset-0 overflow-hidden" style={{ height: '440px' }}>
          {item.coverImage && (
            <img
              src={item.coverImage}
              alt=""
              className="w-full h-full object-cover scale-110"
              style={{ filter: 'blur(28px)', opacity: 0.3 }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/60 via-dark-bg/80 to-dark-bg" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-gray-500 hover:text-white mb-6 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <div className="flex gap-7">
            {/* Left column */}
            <div className="flex-shrink-0 w-36 sm:w-44">
              {/* Cover */}
              <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-2xl bg-dark-card">
                {item.coverImage ? (
                  <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-dark-elevated">
                    {typeEmoji}
                  </div>
                )}
              </div>

              {/* Status badge */}
              {currentStatus && (
                <div className={`mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded-md border text-xs font-medium ${currentStatus.text} ${currentStatus.border} ${currentStatus.bg}`}>
                  <span className={`w-2 h-2 rounded-full ${currentStatus.dot}`} />
                  {currentStatus.label}
                </div>
              )}

              {/* My rating */}
              {isOwner && hasReview && (
                <div className="mt-2 flex justify-center">
                  <StarDisplay rating={rating} />
                </div>
              )}

              {/* Action button */}
              <div className="mt-3">
                {isOwner ? (
                  <button
                    onClick={handleDelete}
                    className="w-full py-2 rounded-lg bg-dark-card border border-dark-border text-red-400 text-xs hover:border-red-500/50 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar
                  </button>
                ) : (
                  <button
                    onClick={handleAddToMyBacklog}
                    disabled={addingToBacklog || isInMyBacklog}
                    className={`w-full py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      isInMyBacklog
                        ? 'bg-primary-green/20 text-primary-green border border-primary-green/30 cursor-default'
                        : 'bg-gradient-main text-white hover:opacity-90'
                    }`}
                  >
                    {isInMyBacklog
                      ? <><Check className="w-3.5 h-3.5" /> En tu backlog</>
                      : addingToBacklog ? 'Añadiendo...'
                      : <><Plus className="w-3.5 h-3.5" /> Añadir a mi backlog</>
                    }
                  </button>
                )}
              </div>
            </div>

            {/* Right column — item info */}
            <div className="flex-1 min-w-0 pt-1">
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-2">
                {item.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                {releaseYear && <span className="text-gray-400 text-sm">{releaseYear}</span>}
                {devName && (
                  <>
                    <span className="text-gray-600">·</span>
                    <span className="text-gray-300 text-sm">{devName}</span>
                  </>
                )}
                <span className="text-gray-600">·</span>
                <span className="text-gray-500 text-sm capitalize">{item.contentType}</span>
              </div>

              {item.metadata?.summary && (
                <p className="text-gray-300 text-sm leading-relaxed mb-4 max-w-2xl">
                  {item.metadata.summary}
                </p>
              )}

              {item.metadata?.genres?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs text-gray-500 uppercase tracking-wider w-20 flex-shrink-0">Géneros</span>
                  <div className="flex flex-wrap gap-1">
                    {item.metadata.genres.map((g, i) => (
                      <span key={i} className="text-sm text-gray-300">
                        {i > 0 && <span className="text-gray-600 mr-1.5">·</span>}
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.metadata?.platforms?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider w-20 flex-shrink-0">Plataformas</span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.metadata.platforms.map((p, i) => (
                      <span key={i} className="text-xs border border-gray-700 rounded px-2 py-0.5 text-gray-300 bg-dark-elevated">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(item.metadata?.seasons || item.metadata?.episodes) && (
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
                  {item.metadata?.seasons && <span>{item.metadata.seasons} temporadas</span>}
                  {item.metadata?.episodes && <span>{item.metadata.episodes} episodios</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">

        {/* Owner controls */}
        {isOwner && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            {/* Left: status + progress */}
            <div className="space-y-4">
              {/* Status selector */}
              <div className="bg-dark-card border border-dark-border rounded-xl p-5">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Estado</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={`py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all border ${
                        item.status === s
                          ? `${cfg.bg} ${cfg.border} ${cfg.text}`
                          : 'bg-dark-elevated border-dark-border text-gray-500 hover:border-gray-500 hover:text-gray-300'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div className="bg-dark-card border border-dark-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Progreso</p>
                  <span className="text-sm font-bold text-primary-purple">{progress}%</span>
                </div>
                <input
                  type="range"
                  min="0" max="100"
                  value={progress}
                  onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-primary-purple [&::-webkit-slider-thumb]:cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #A855F7 0%, #A855F7 ${progress}%, #2c3440 ${progress}%, #2c3440 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1.5">
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>
            </div>

            {/* Right: review */}
            <div className="bg-dark-card border border-dark-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  {hasReview ? 'Tu reseña' : 'Escribir reseña'}
                </p>
                {hasReview && (
                  <span className="text-xs text-primary-green bg-primary-green/10 border border-primary-green/20 px-2 py-0.5 rounded-full">
                    Guardada
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <StarPicker rating={rating} onChange={setRating} />

                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="¿Qué te ha parecido?"
                  rows={4}
                  className="w-full bg-dark-elevated border border-dark-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none"
                />

                <button
                  onClick={handleSaveReview}
                  disabled={savingReview || !rating}
                  className={`px-5 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    reviewSaved
                      ? 'text-primary-green bg-primary-green/10 border border-primary-green/20'
                      : 'text-white hover:opacity-90'
                  }`}
                  style={reviewSaved ? {} : { background: '#e91e8c' }}
                >
                  {reviewSaved
                    ? <><Check className="w-4 h-4" /> Guardado</>
                    : savingReview ? 'Guardando...'
                    : hasReview ? 'Actualizar reseña' : 'Guardar reseña'
                  }
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Non-owner: view only */}
        {!isOwner && review && (
          <div className="bg-dark-card border border-dark-border rounded-xl p-5 mb-8">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Reseña del propietario</p>
            <div className="flex items-center gap-3 mb-3">
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${STATUS_CONFIG[item.status]?.text} ${STATUS_CONFIG[item.status]?.border} ${STATUS_CONFIG[item.status]?.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[item.status]?.dot}`} />
                {STATUS_CONFIG[item.status]?.label}
              </span>
              {item.progress > 0 && (
                <span className="text-xs text-gray-400">{item.progress}% completado</span>
              )}
            </div>
            <StarDisplay rating={review.rating} />
            {review.reviewText && (
              <p className="text-gray-300 text-sm leading-relaxed mt-2">{review.reviewText}</p>
            )}
          </div>
        )}

        {/* Community reviews */}
        {communityReviews.length > 0 && (
          <div>
            <h2 className="text-base font-semibold mb-4">Reseñas de la comunidad</h2>
            <div className="space-y-3">
              {communityReviews.map(r => (
                <div key={r.id} className="bg-dark-card border border-dark-border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-main flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {r.user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-sm font-semibold text-white">{r.user?.username}</span>
                        <span className="text-xs text-gray-600 flex-shrink-0">
                          {new Date(r.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <StarDisplay rating={r.rating} />
                        {r.backlogItem?.status && STATUS_CONFIG[r.backlogItem.status] && (
                          <span className={`text-xs flex items-center gap-1 ${STATUS_CONFIG[r.backlogItem.status].text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full inline-block ${STATUS_CONFIG[r.backlogItem.status].dot}`} />
                            {STATUS_CONFIG[r.backlogItem.status].label}
                          </span>
                        )}
                      </div>
                      {r.reviewText && (
                        <p className="text-gray-300 text-sm leading-relaxed">{r.reviewText}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
