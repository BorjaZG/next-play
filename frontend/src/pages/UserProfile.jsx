import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, UserCheck } from 'lucide-react'
import { followService } from '../services/follow.service'
import { useSocialStore } from '../store/socialStore'
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

export default function UserProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { following, followUser, unfollowUser, fetchFollowing } = useSocialStore()
  const [profile, setProfile] = useState(null)
  const [backlog, setBacklog] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Backlog')
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    fetchFollowing()
    fetchUserData()
  }, [id])

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const [profileData, backlogData] = await Promise.all([
        followService.getUserProfile(id),
        followService.getUserBacklog(id),
      ])
      setProfile(profileData.user)
      setBacklog(backlogData.items)
    } catch {
      navigate('/discover')
    } finally {
      setLoading(false)
    }
  }

  const isFollowing = following.some(f => f.id === parseInt(id))

  const handleFollowToggle = async () => {
    if (isFollowing) await unfollowUser(parseInt(id))
    else await followUser(parseInt(id))
  }

  const reviewedItems = backlog.filter(i => i.reviews?.length > 0)

  if (loading) return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <p className="text-gray-600 text-sm">Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-500 hover:text-white mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 mb-8 pb-8 border-b border-dark-border">
          <div className="w-20 h-20 rounded-full bg-gradient-main flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
            {profile?.username?.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 flex-wrap">
              <h1 className="text-2xl font-bold">{profile?.username}</h1>
              <button
                onClick={handleFollowToggle}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isFollowing
                    ? 'bg-dark-elevated border border-dark-border text-gray-300 hover:border-gray-500'
                    : 'bg-gradient-main text-white hover:opacity-90'
                }`}
              >
                {isFollowing ? <><UserCheck className="w-4 h-4" /> Siguiendo</> : <><UserPlus className="w-4 h-4" /> Seguir</>}
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-1">
              Miembro desde {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
                : '-'}
            </p>

            <div className="flex flex-wrap gap-5 mt-3 text-sm">
              <div className="text-center">
                <div className="font-bold text-white">{profile?.stats?.totalItems ?? 0}</div>
                <div className="text-xs text-gray-500">Items</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-primary-green">{profile?.stats?.completedItems ?? 0}</div>
                <div className="text-xs text-gray-500">Completados</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-400">{profile?.stats?.averageRating ?? '-'}</div>
                <div className="text-xs text-gray-500">Valoración media</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-300">{profile?.stats?.followers ?? 0}</div>
                <div className="text-xs text-gray-500">Seguidores</div>
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
                activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-purple" />}
            </button>
          ))}
        </div>

        {/* Tab: Backlog */}
        {activeTab === 'Backlog' && (
          backlog.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm">Este usuario aún no tiene items en su backlog.</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {backlog.map(item => (
                <div
                  key={item.id}
                  className="cover-card"
                  onClick={() => setSelectedItem(item)}
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
          )
        )}

        {/* Tab: Reseñas */}
        {activeTab === 'Reseñas' && (
          reviewedItems.length === 0 ? (
            <div className="text-center py-16 text-gray-500 text-sm">Este usuario aún no ha escrito reseñas.</div>
          ) : (
            <div className="space-y-3">
              {reviewedItems.map(item => {
                const review = item.reviews[0]
                return (
                  <div
                    key={item.id}
                    className="bg-dark-card border border-dark-border rounded-xl p-4 hover:border-gray-600 transition-colors cursor-pointer"
                    onClick={() => setSelectedItem(item)}
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
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full bg-gradient-main flex items-center justify-center text-xs font-bold">
                            {profile?.username?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs text-gray-400">{profile?.username}</span>
                          <span className="text-gray-600">·</span>
                          <span className="text-xs text-gray-500 capitalize">{item.contentType}</span>
                        </div>
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
          )
        )}

        {/* Tab: Logros */}
        {activeTab === 'Logros' && (
          <div>
            <p className="text-sm text-gray-500 mb-4">
              {profile?.achievements?.unlockedCount ?? 0} / {profile?.achievements?.totalAchievements ?? 12} desbloqueados
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {profile?.achievements?.unlocked?.map(a => (
                <div key={a.id} className="bg-dark-card border border-dark-border rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">{achievementIcons[a.type] || '🏅'}</div>
                  <h4 className="font-semibold text-sm mb-0.5">{a.title}</h4>
                  <p className="text-xs text-gray-500">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Item preview modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-dark-card border border-dark-border rounded-2xl max-w-md w-full p-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex gap-4">
              <div className="w-24 flex-shrink-0 rounded-lg overflow-hidden">
                {selectedItem.coverImage ? (
                  <img src={selectedItem.coverImage} alt={selectedItem.title} className="w-full aspect-[2/3] object-cover" />
                ) : (
                  <div className="w-full aspect-[2/3] bg-dark-elevated flex items-center justify-center text-3xl">🎮</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base mb-1">{selectedItem.title}</h3>
                <p className="text-xs text-gray-500 capitalize mb-2">{selectedItem.contentType}</p>
                {selectedItem.reviews?.[0] && (
                  <>
                    <Stars rating={selectedItem.reviews[0].rating} />
                    {selectedItem.reviews[0].reviewText && (
                      <p className="text-sm text-gray-300 mt-2 leading-relaxed line-clamp-4">
                        {selectedItem.reviews[0].reviewText}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="w-full mt-4 py-2 rounded-lg bg-dark-elevated border border-dark-border text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
