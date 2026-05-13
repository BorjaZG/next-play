import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { statsService } from '../services/stats.service'
import { backlogService } from '../services/backlog.service'
import Header from '../components/layout/Header'

const achievementIcons = {
  first_item: '🎮', first_completion: '✅', completionist_10: '🏆',
  completionist_20: '💎', marathonist: '📺', gamer_pro: '🎯',
  otaku: '✨', first_review: '⭐', reviewer: '📝',
  first_list: '📋', social: '👥', popular: '🌟',
}

const TABS = ['Backlog', 'Reseñas', 'Logros']

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-xs ${i <= rating ? 'star-filled' : 'star-empty'}`}>★</span>
      ))}
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('Backlog')
  const [stats, setStats] = useState(null)
  const [achievements, setAchievements] = useState(null)
  const [backlogItems, setBacklogItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [generalStats, achievementsData, backlogData] = await Promise.all([
        statsService.getGeneral(),
        statsService.getAchievements(),
        backlogService.getAll(),
      ])
      setStats(generalStats)
      setAchievements(achievementsData)
      setBacklogItems(backlogData.items || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const reviewedItems = backlogItems.filter(i => i.reviews?.length > 0)

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 mb-8 pb-8 border-b border-dark-border">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-main flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
            {user?.username?.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">{user?.username}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Miembro desde {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
                : 'hace poco'}
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-5 mt-3 text-sm">
              <div className="text-center">
                <div className="font-bold text-white">{stats?.backlog?.total ?? '-'}</div>
                <div className="text-xs text-gray-500">Items</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-primary-green">{stats?.backlog?.completed ?? '-'}</div>
                <div className="text-xs text-gray-500">Completados</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-400">{stats?.reviews?.averageRating ?? '-'}</div>
                <div className="text-xs text-gray-500">Valoración media</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-300">{stats?.social?.followers ?? '-'}</div>
                <div className="text-xs text-gray-500">Seguidores</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-300">{stats?.social?.following ?? '-'}</div>
                <div className="text-xs text-gray-500">Siguiendo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-dark-border mb-6">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-purple" />
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-24 text-center text-gray-600">Cargando...</div>
        ) : (
          <>
            {/* Tab: Backlog */}
            {activeTab === 'Backlog' && (
              <div>
                {/* Status breakdown */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Total', value: stats?.backlog?.total ?? 0, color: 'text-gray-300' },
                    { label: 'Pendiente', value: stats?.backlog?.pending ?? 0, color: 'text-yellow-400' },
                    { label: 'En progreso', value: stats?.backlog?.playing ?? 0, color: 'text-blue-400' },
                    { label: 'Completado', value: stats?.backlog?.completed ?? 0, color: 'text-primary-green' },
                  ].map(s => (
                    <div key={s.label} className="bg-dark-card border border-dark-border rounded-lg p-3 text-center">
                      <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                {backlogItems.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-gray-500 text-sm mb-3">Tu backlog está vacío.</p>
                    <button onClick={() => navigate('/search')} className="btn-primary">Buscar contenido</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {backlogItems.map(item => (
                      <div
                        key={item.id}
                        className="cover-card"
                        onClick={() => navigate(`/backlog/${item.id}`)}
                      >
                        {item.coverImage ? (
                          <img src={item.coverImage} alt={item.title} loading="lazy" />
                        ) : (
                          <div className="w-full h-full bg-dark-elevated flex items-center justify-center text-3xl">
                            {item.contentType === 'game' ? '🎮' : item.contentType === 'series' ? '📺' : item.contentType === 'anime' ? '✨' : '🎬'}
                          </div>
                        )}
                        <div className="overlay">
                          <p className="text-white text-xs font-semibold line-clamp-2 leading-tight mb-1">{item.title}</p>
                          {item.reviews?.[0] && <Stars rating={item.reviews[0].rating} />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Reseñas */}
            {activeTab === 'Reseñas' && (
              <div>
                {reviewedItems.length === 0 ? (
                  <div className="text-center py-16 text-gray-500 text-sm">
                    Aún no has escrito ninguna reseña.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviewedItems.map(item => {
                      const review = item.reviews[0]
                      return (
                        <div
                          key={item.id}
                          className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-gray-600 transition-colors cursor-pointer"
                          onClick={() => navigate(`/backlog/${item.id}`)}
                        >
                          <div className="flex gap-4">
                            <div className="w-14 flex-shrink-0 rounded overflow-hidden">
                              {item.coverImage ? (
                                <img src={item.coverImage} alt={item.title} className="w-full aspect-[2/3] object-cover" />
                              ) : (
                                <div className="w-full aspect-[2/3] bg-dark-elevated flex items-center justify-center text-xl">🎮</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                              <Stars rating={review.rating} />
                              {review.reviewText && (
                                <p className="text-gray-400 text-sm mt-2 line-clamp-3 leading-relaxed">
                                  {review.reviewText}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Logros */}
            {activeTab === 'Logros' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">
                    {achievements?.unlockedCount ?? 0} / {achievements?.totalAchievements ?? 12} desbloqueados
                  </p>
                  <div className="flex items-center gap-2 w-48">
                    <div className="flex-1 h-1.5 bg-dark-elevated rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-main"
                        style={{ width: `${achievements?.progress ?? 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{achievements?.progress ?? 0}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {achievements?.unlocked?.map(a => (
                    <div key={a.id} className="bg-dark-card border border-dark-border rounded-xl p-4 text-center">
                      <div className="text-3xl mb-2">{achievementIcons[a.type] || '🏅'}</div>
                      <h4 className="font-semibold text-sm mb-0.5">{a.title}</h4>
                      <p className="text-xs text-gray-500">{a.description}</p>
                    </div>
                  ))}
                  {Array.from({ length: (achievements?.totalAchievements ?? 12) - (achievements?.unlockedCount ?? 0) }).map((_, i) => (
                    <div key={`locked-${i}`} className="bg-dark-card border border-dark-border rounded-xl p-4 text-center opacity-30">
                      <div className="text-3xl mb-2">🔒</div>
                      <h4 className="font-semibold text-sm mb-0.5">???</h4>
                      <p className="text-xs text-gray-500">Bloqueado</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
