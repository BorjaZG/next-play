import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, X } from 'lucide-react'
import { searchService } from '../services/search.service'
import { backlogService } from '../services/backlog.service'
import { reviewService } from '../services/review.service'
import { followService } from '../services/follow.service'
import { useBacklogStore } from '../store/backlogStore'
import { useAuthStore } from '../store/authStore'
import Header from '../components/layout/Header'

const STATUS_OPTIONS = [
  { value: 'completed', label: 'Completado', color: 'bg-primary-green text-dark-bg' },
  { value: 'playing', label: 'En progreso', color: 'bg-blue-500 text-white' },
  { value: 'pending', label: 'Backlog', color: 'bg-yellow-500 text-dark-bg' },
  { value: 'abandoned', label: 'Abandonado', color: 'bg-red-500 text-white' },
]

const STATUS_LABELS = {
  completed: 'Completado',
  playing: 'En progreso',
  pending: 'Backlog',
  abandoned: 'Abandonado',
}

const STATUS_COLORS = {
  completed: 'text-primary-green',
  playing: 'text-blue-400',
  pending: 'text-yellow-400',
  abandoned: 'text-red-400',
}

function StarDisplay({ rating, total = 5 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`text-base ${i < rating ? 'star-filled' : 'star-empty'}`}>★</span>
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
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl transition-colors leading-none"
          style={{ color: i <= (hover || rating) ? '#e91e8c' : '#456' }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function RatingBar({ count, maxCount }) {
  const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0
  return (
    <div className="flex-1 h-8 bg-dark-elevated rounded-sm overflow-hidden flex items-end">
      <div
        className="w-full transition-all"
        style={{
          height: `${Math.max(pct, 4)}%`,
          background: '#e91e8c',
        }}
      />
    </div>
  )
}

export default function ItemDetail() {
  const { type, id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { items: backlogItems, fetchItems } = useBacklogStore()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [reviews, setReviews] = useState([])

  // My backlog entry for this item
  const myBacklogItem = backlogItems.find(
    i => i.externalId === id && i.contentType === type
  )
  const myReview = myBacklogItem?.reviews?.[0]

  // Log modal state
  const [showModal, setShowModal] = useState(false)
  const [modalStatus, setModalStatus] = useState(null)
  const [modalRating, setModalRating] = useState(0)
  const [modalText, setModalText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchItem()
    fetchItems()
  }, [type, id])

  useEffect(() => {
    if (id && type) {
      fetchStats()
      fetchReviews()
    }
  }, [id, type])

  const fetchItem = async () => {
    setLoading(true)
    try {
      const data = await searchService.getDetails(type, id)
      setItem(data.content || data.item || data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await followService.getItemStats(id, type)
      setStats(data)
    } catch {}
  }

  const fetchReviews = async () => {
    try {
      const data = await followService.getItemReviews(id, type, 8)
      setReviews(data.reviews || [])
    } catch {}
  }

  const openModal = () => {
    setModalStatus(myBacklogItem?.status || null)
    setModalRating(myReview?.rating || 0)
    setModalText(myReview?.reviewText || '')
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!modalStatus) return
    setSubmitting(true)
    try {
      let backlogItemId

      if (myBacklogItem) {
        // Update existing entry status
        if (myBacklogItem.status !== modalStatus) {
          await backlogService.updateStatus(myBacklogItem.id, modalStatus)
        }
        backlogItemId = myBacklogItem.id
      } else {
        // Add to backlog
        try {
          const res = await searchService.addToBacklog(type, id, { status: modalStatus, priority: 'medium' })
          backlogItemId = res.item.id
        } catch (err) {
          // Already exists case
          if (err.response?.data?.item) {
            backlogItemId = err.response.data.item.id
          } else {
            throw err
          }
        }
      }

      // Save review if rating provided
      if (modalRating > 0) {
        await reviewService.createOrUpdate(backlogItemId, {
          rating: modalRating,
          reviewText: modalText.trim(),
          tags: []
        })
      }

      setShowModal(false)
      fetchItems()
      fetchStats()
      fetchReviews()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
    </div>
  )

  if (!item) return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-3">No se encontró el contenido.</p>
        <button onClick={() => navigate(-1)} className="btn-secondary">Volver</button>
      </div>
    </div>
  )

  const releaseYear = item.metadata?.releaseDate
    ? new Date(item.metadata.releaseDate).getFullYear()
    : null

  const releaseFormatted = item.metadata?.releaseDate
    ? new Date(item.metadata.releaseDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  const devName = item.metadata?.developer || item.metadata?.studio || item.metadata?.creator

  const statsByStatus = stats?.stats?.byStatus || {}
  const avgRating = stats?.stats?.avgRating
  const totalRatings = stats?.stats?.totalRatings || 0
  const ratingDist = stats?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  const maxRatingCount = Math.max(...Object.values(ratingDist), 1)

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />

      {/* ── Hero ── */}
      <div className="relative">
        {/* Blurred background */}
        <div className="absolute inset-0 overflow-hidden" style={{ height: '460px' }}>
          {item.coverImage && (
            <img
              src={item.coverImage}
              alt=""
              className="w-full h-full object-cover scale-110"
              style={{ filter: 'blur(28px)', opacity: 0.35 }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/60 via-dark-bg/80 to-dark-bg" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-gray-500 hover:text-white mb-6 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <div className="flex gap-8">
            {/* Left – Cover + actions */}
            <div className="flex-shrink-0 w-36 sm:w-44">
              {/* Cover */}
              <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-2xl bg-dark-card">
                {item.coverImage ? (
                  <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-dark-elevated">
                    {type === 'game' ? '🎮' : type === 'series' ? '📺' : type === 'anime' ? '✨' : '🎬'}
                  </div>
                )}
              </div>

              {/* Log or review button */}
              <button
                onClick={openModal}
                className="w-full mt-3 py-2 rounded-md text-sm font-semibold transition-opacity hover:opacity-90"
                style={{ background: '#e91e8c', color: '#fff' }}
              >
                {myBacklogItem ? 'Actualizar log' : 'Log or review'}
              </button>

              {/* My rating display */}
              {myReview && (
                <div className="mt-2 flex justify-center">
                  <StarDisplay rating={myReview.rating} />
                </div>
              )}
              {!myReview && (
                <div className="mt-2 flex justify-center opacity-30">
                  <StarDisplay rating={0} />
                </div>
              )}

              {/* My status */}
              {myBacklogItem && (
                <div className="mt-2 text-center">
                  <span className={`text-xs font-medium ${STATUS_COLORS[myBacklogItem.status] || 'text-gray-400'}`}>
                    {STATUS_LABELS[myBacklogItem.status] || myBacklogItem.status}
                  </span>
                </div>
              )}

              {/* Status icon row */}
              <div className="mt-3 grid grid-cols-4 gap-1 text-center">
                {[
                  { label: 'Hecho', icon: '👾', status: 'completed' },
                  { label: 'Jugando', icon: '▶', status: 'playing' },
                  { label: 'Backlog', icon: '🗂', status: 'pending' },
                  { label: 'Wishlist', icon: '🎁', status: null },
                ].map(s => (
                  <div key={s.label} className="flex flex-col items-center gap-0.5">
                    <span className="text-base">{s.icon}</span>
                    <span className="text-gray-600 text-[9px] leading-tight">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – Info */}
            <div className="flex-1 min-w-0 pt-1">
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-2">
                {item.title || item.name}
              </h1>

              {/* Dev / Publisher + release */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {devName && (
                  <p className="text-gray-400 text-sm">
                    by <span className="text-gray-200">{devName}</span>
                  </p>
                )}
                {releaseFormatted && (
                  <span className="text-xs border border-gray-600 rounded px-2 py-0.5 text-gray-300">
                    <span className="text-gray-500 mr-1">Released</span>
                    {releaseFormatted}
                  </span>
                )}
              </div>

              {/* Description */}
              {item.metadata?.summary && (
                <p className="text-gray-300 text-sm leading-relaxed mb-5 max-w-2xl">
                  {item.metadata.summary}
                </p>
              )}

              {/* Genres */}
              {item.metadata?.genres?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs text-gray-500 uppercase tracking-wider w-20 flex-shrink-0">Géneros</span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.metadata.genres.map((g, i) => (
                      <span key={i} className="text-sm text-gray-300">
                        {i > 0 && <span className="text-gray-600 mr-1.5">·</span>}
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Platforms */}
              {item.metadata?.platforms?.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-xs text-gray-500 uppercase tracking-wider w-20 flex-shrink-0">Plataformas</span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.metadata.platforms.map((p, i) => (
                      <span
                        key={i}
                        className="text-xs border border-gray-700 rounded px-2 py-0.5 text-gray-300 bg-dark-elevated"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Seasons / Episodes */}
              {(item.metadata?.seasons || item.metadata?.episodes) && (
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
                  {item.metadata?.seasons && (
                    <span>{item.metadata.seasons} temporadas</span>
                  )}
                  {item.metadata?.episodes && (
                    <span>{item.metadata.episodes} episodios</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Avg Rating + bar chart */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-3">Avg Rating</p>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-white">
                {avgRating ?? '–'}
              </span>
              <div className="flex items-end gap-0.5 h-8 flex-1 max-w-[120px]">
                {[1, 2, 3, 4, 5].map(star => (
                  <RatingBar key={star} count={ratingDist[star] || 0} maxCount={maxRatingCount} />
                ))}
              </div>
              <div className="text-xs text-gray-600 self-end pb-0.5 flex justify-between w-16">
                <span>1★</span><span>5★</span>
              </div>
            </div>
          </div>

          {/* Status counts */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-3">Actividad</p>
            <div className="space-y-1.5">
              {[
                { key: 'completed', icon: '👾', label: 'Completados' },
                { key: 'playing', icon: '▶', label: 'Jugando' },
                { key: 'pending', icon: '🗂', label: 'Backlog' },
              ].map(s => (
                <div key={s.key} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-2">
                    <span>{s.icon}</span>{s.label}
                  </span>
                  <span className="text-white font-medium">{statsByStatus[s.key] ?? 0}</span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm pt-1 border-t border-dark-border">
                <span className="text-gray-400 flex items-center gap-2">
                  <span>★</span>Valoraciones
                </span>
                <span className="text-white font-medium">{totalRatings}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews count + total */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-dark-card border border-dark-border rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-white">{stats?.stats?.total ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total logs</p>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-white">{reviews.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Reseñas</p>
          </div>
          <div className="bg-dark-card border border-dark-border rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-white">{totalRatings}</p>
            <p className="text-xs text-gray-500 mt-0.5">Valoraciones</p>
          </div>
        </div>

        {/* ── Reviews section ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Reseñas</h2>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-600 text-sm">
              Sé el primero en reseñar este contenido
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-dark-card border border-dark-border rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-main flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {review.user?.username?.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="text-sm">
                          <span className="font-semibold text-white">{review.user?.username}</span>
                          <span className="text-gray-400"> reseñó </span>
                          <span className="text-gray-300">{item.title}</span>
                        </div>
                        <span className="text-xs text-gray-600 flex-shrink-0">
                          {new Date(review.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>

                      {/* Stars + status */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <StarDisplay rating={review.rating} />
                        {review.backlogItem?.status && (
                          <span className={`text-xs flex items-center gap-1 ${STATUS_COLORS[review.backlogItem.status] || 'text-gray-400'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                            {STATUS_LABELS[review.backlogItem.status] || review.backlogItem.status}
                          </span>
                        )}
                      </div>

                      {/* Review text */}
                      {review.reviewText && (
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {review.reviewText}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Log or Review Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-lg shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-border">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">{item.title}</h3>
                {releaseYear && (
                  <span className="text-gray-500 text-sm">{releaseYear}</span>
                )}
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-0">
              {/* Left – cover + status */}
              <div className="p-4 flex-shrink-0">
                <div className="w-28 aspect-[2/3] rounded-lg overflow-hidden shadow-lg bg-dark-elevated mb-3">
                  {item.coverImage ? (
                    <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">
                      {type === 'game' ? '🎮' : type === 'series' ? '📺' : type === 'anime' ? '✨' : '🎬'}
                    </div>
                  )}
                </div>

                {/* Status buttons */}
                <div className="space-y-1.5 w-28">
                  {STATUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setModalStatus(opt.value)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 transition-all border ${
                        modalStatus === opt.value
                          ? 'border-transparent ' + opt.color
                          : 'border-dark-border bg-dark-elevated text-gray-400 hover:border-gray-500 hover:text-white'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        opt.value === 'completed' ? 'bg-primary-green' :
                        opt.value === 'playing' ? 'bg-blue-400' :
                        opt.value === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                      }`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right – review form */}
              <div className="flex-1 p-4 min-w-0">
                {/* Rating */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-400 uppercase tracking-wider">Rating</label>
                    {modalRating > 0 && (
                      <button
                        onClick={() => setModalRating(0)}
                        className="text-xs text-gray-600 hover:text-gray-400 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        Quitar
                      </button>
                    )}
                  </div>
                  <StarPicker rating={modalRating} onChange={setModalRating} />
                </div>

                {/* Review text */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-400 uppercase tracking-wider">Reseña</label>
                  </div>
                  <textarea
                    value={modalText}
                    onChange={e => setModalText(e.target.value)}
                    placeholder="¿Qué te ha parecido..."
                    rows={4}
                    className="w-full bg-dark-elevated border border-dark-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-dark-border rounded-lg hover:border-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !modalStatus}
                    className="px-5 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
                    style={{ background: '#e91e8c' }}
                  >
                    {submitting ? 'Guardando...' : myBacklogItem ? 'Actualizar' : 'Crear log'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
