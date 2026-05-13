import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { searchService } from '../services/search.service'
import { backlogService } from '../services/backlog.service'
import { statsService } from '../services/stats.service'
import { followService } from '../services/follow.service'
import { useAuthStore } from '../store/authStore'
import Header from '../components/layout/Header'

function Stars({ rating }) {
  return (
    <span className="flex gap-px">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-sm ${i <= rating ? 'star-filled' : 'star-empty'}`}>★</span>
      ))}
    </span>
  )
}

const STATUS_LABELS = {
  completed: 'Completado',
  playing: 'En progreso',
  pending: 'Pendiente',
  abandoned: 'Abandonado',
}

const STATUS_COLORS = {
  completed: 'text-primary-green',
  playing: 'text-blue-400',
  pending: 'text-yellow-400',
  abandoned: 'text-red-400',
}

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const [stats, setStats] = useState(null)
  const [recentItems, setRecentItems] = useState([])
  const [publicReviews, setPublicReviews] = useState([])
  const [publicLists, setPublicLists] = useState([])

  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    loadHomeData()
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const loadHomeData = async () => {
    try {
      const [backlogData, generalStats, reviewsData, listsData] = await Promise.all([
        backlogService.getAll(),
        statsService.getGeneral().catch(() => null),
        followService.getPublicReviews(8).catch(() => ({ reviews: [] })),
        followService.getPublicLists(6).catch(() => ({ lists: [] })),
      ])

      setRecentItems((backlogData.items || []).slice(0, 8))
      if (generalStats) setStats(generalStats)
      setPublicReviews(reviewsData.reviews || [])
      setPublicLists(listsData.lists || [])
    } catch (err) {
      console.error('Error cargando home:', err)
    }
  }

  const handleSearchChange = (value) => {
    setSearchQuery(value)
    clearTimeout(debounceRef.current)
    if (value.trim().length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }
    setSearching(true)
    setShowDropdown(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchService.search(value)
        setSearchResults(data.results || [])
      } catch (e) {
        console.error(e)
      } finally {
        setSearching(false)
      }
    }, 350)
  }

  const handleResultClick = (item) => {
    setShowDropdown(false)
    setSearchQuery('')
    navigate(`/item/${item.contentType}/${item.externalId}`)
  }

  const statItems = [
    { label: 'Completados', value: stats?.backlog?.completed ?? 0 },
    { label: 'En progreso', value: stats?.backlog?.playing ?? 0 },
    { label: 'Reseñas', value: stats?.reviews?.total ?? 0 },
    { label: 'Backlog', value: stats?.backlog?.total ?? 0 },
    { label: 'Pendientes', value: stats?.backlog?.pending ?? 0 },
  ]

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* Welcome banner */}
        <div className="text-center py-6 mb-6 border-b border-dark-border">
          <p className="text-gray-400 text-sm mb-0.5">Bienvenido de nuevo</p>
          <h1 className="text-xl font-bold">
            <span className="text-primary-purple">{user?.username}</span>
            <span className="text-gray-400">, tu colección te espera...</span>
          </h1>
        </div>

        {/* Search bar */}
        <div ref={searchRef} className="relative max-w-xl mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            placeholder="Buscar juegos, series, películas, anime..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-card border border-dark-border rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gray-500"
          />
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
              {searching ? (
                <div className="p-4 text-center text-sm text-gray-500">Buscando...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <div
                    key={`${item.contentType}-${item.externalId}`}
                    onClick={() => handleResultClick(item)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-dark-hover cursor-pointer border-b border-dark-border last:border-0"
                  >
                    <div className="w-8 h-12 flex-shrink-0 rounded overflow-hidden bg-dark-elevated">
                      {item.coverImage
                        ? <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-base">🎮</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.title}</p>
                      <p className="text-xs text-gray-500 capitalize">
                        {item.contentType}
                        {item.metadata?.releaseDate && ` · ${new Date(item.metadata.releaseDate).getFullYear()}`}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">Sin resultados</div>
              )}
            </div>
          )}
        </div>

        {/* Profile stats */}
        <div className="flex justify-center gap-8 sm:gap-12 mb-8 pb-6 border-b border-dark-border">
          {statItems.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recently added */}
        {recentItems.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Añadido recientemente</h2>
              <button
                onClick={() => navigate('/backlog')}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Ver más
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {recentItems.map(item => (
                <div
                  key={item.id}
                  className="cover-card"
                  onClick={() => navigate(`/backlog/${item.id}`)}
                >
                  {item.coverImage ? (
                    <img src={item.coverImage} alt={item.title} loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-dark-elevated flex items-center justify-center text-2xl">
                      {item.contentType === 'game' ? '🎮' : item.contentType === 'series' ? '📺' : item.contentType === 'anime' ? '✨' : '🎬'}
                    </div>
                  )}
                  <div className="overlay">
                    <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Popular reviews from other users */}
        {publicReviews.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Reseñas populares</h2>
              <button
                onClick={() => navigate('/discover')}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Ver más
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publicReviews.map((review) => {
                const item = review.backlogItem
                const platformStr = item?.metadata?.platforms?.[0] || item?.metadata?.studio || item?.metadata?.developer || null
                return (
                  <div
                    key={review.id}
                    className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-gray-600 transition-colors cursor-pointer"
                    onClick={() => navigate(`/item/${item?.contentType}/${item?.externalId}`)}
                  >
                    <div className="flex gap-3">
                      {/* Cover */}
                      <div className="w-14 flex-shrink-0 rounded overflow-hidden">
                        {item?.coverImage ? (
                          <img src={item.coverImage} alt={item.title} className="w-full aspect-[2/3] object-cover" />
                        ) : (
                          <div className="w-full aspect-[2/3] bg-dark-elevated flex items-center justify-center text-xl">
                            {item?.contentType === 'game' ? '🎮' : item?.contentType === 'series' ? '📺' : item?.contentType === 'anime' ? '✨' : '🎬'}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Header: user + title + date */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-xs text-gray-300 leading-snug">
                            <span className="font-semibold text-white">{item?.user?.username}</span>
                            {' '}reseñó{' '}
                            <span className="font-semibold text-white">{item?.title}</span>
                          </p>
                          <span className="text-xs text-gray-600 flex-shrink-0">
                            {new Date(review.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>

                        {/* Stars + status + platform */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Stars rating={review.rating} />
                          {item?.status && (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-primary-green inline-block" />
                              <span className={`text-xs ${STATUS_COLORS[item.status] || 'text-gray-400'}`}>
                                {STATUS_LABELS[item.status] || item.status}
                              </span>
                            </>
                          )}
                          {platformStr && (
                            <span className="text-xs text-gray-500">en {platformStr}</span>
                          )}
                        </div>

                        {/* Review text */}
                        {review.reviewText && (
                          <p className="text-gray-300 text-xs leading-relaxed line-clamp-3">
                            {review.reviewText}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Public lists */}
        {publicLists.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold">Listas populares</h2>
              <button
                onClick={() => navigate('/lists')}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Ver más
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {publicLists.map((list) => (
                <div
                  key={list.id}
                  className="bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-gray-600 transition-colors cursor-pointer"
                  onClick={() => navigate(`/lists/${list.id}`)}
                >
                  {/* Cover mosaic */}
                  <div className="grid grid-cols-4 h-20">
                    {list.covers.slice(0, 4).map((c, i) => (
                      <div key={i} className="overflow-hidden">
                        <img src={c.coverImage} alt={c.title} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {Array.from({ length: Math.max(0, 4 - list.covers.length) }).map((_, i) => (
                      <div key={`empty-${i}`} className="bg-dark-elevated" />
                    ))}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="font-semibold text-sm truncate">{list.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      por <span className="text-gray-400">{list.user?.username}</span>
                      {' · '}{list.itemCount} items
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state — no social data yet */}
        {publicReviews.length === 0 && publicLists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm mb-3">No hay actividad de otros usuarios todavía.</p>
            <button onClick={() => navigate('/search')} className="btn-primary">
              Buscar contenido
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
