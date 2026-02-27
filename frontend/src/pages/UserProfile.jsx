import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, UserCheck, Calendar, Award, TrendingUp, Users } from 'lucide-react'
import { followService } from '../services/follow.service'
import { useSocialStore } from '../store/socialStore'
import ItemPreviewModal from '../components/backlog/ItemPreviewModal'
import Header from '../components/layout/Header'

const achievementIcons = {
  first_item: '🎮',
  first_completion: '✅',
  completionist_10: '🏆',
  completionist_20: '💎',
  marathonist: '📺',
  gamer_pro: '🎯',
  otaku: '✨',
  first_review: '⭐',
  reviewer: '📝',
  first_list: '📋',
  social: '👥',
  popular: '🌟',
}

export default function UserProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { following, followUser, unfollowUser, fetchFollowing } = useSocialStore()
  
  const [profile, setProfile] = useState(null)
  const [backlog, setBacklog] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    fetchFollowing()
    fetchUserData()
  }, [id])

  // Refrescar cuando cambie el estado de following
  useEffect(() => {
    if (profile) {
      fetchUserData()
    }
  }, [following])

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const [profileData, backlogData] = await Promise.all([
        followService.getUserProfile(id),
        followService.getUserBacklog(id)
      ])
      
      setProfile(profileData.user)
      setBacklog(backlogData.items)
    } catch (error) {
      console.error('Error:', error)
      navigate('/discover')
    } finally {
      setLoading(false)
    }
  }

  const isFollowing = following.some(f => f.id === parseInt(id))

  const handleFollowToggle = async () => {
    if (isFollowing) {
      await unfollowUser(parseInt(id))
    } else {
      await followUser(parseInt(id))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <p className="text-gray-400">Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/discover')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        {/* Profile header */}
        <div className="bg-gradient-main rounded-xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-4xl font-bold">
                  {profile?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{profile?.username}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {profile?.createdAt 
                          ? `Miembro desde ${new Date(profile.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`
                          : 'Miembro'
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{profile?.stats?.followers || 0} seguidores</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{profile?.stats?.following || 0} siguiendo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Follow button */}
              <button
                onClick={handleFollowToggle}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                  isFollowing
                    ? 'bg-white/10 backdrop-blur-sm hover:bg-white/20'
                    : 'bg-white text-purple-600 hover:bg-gray-100'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-5 h-5" />
                    Siguiendo
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Seguir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-primary-purple text-3xl mb-1">
              {profile?.stats?.totalItems || 0}
            </div>
            <p className="text-gray-400 text-sm">Total items</p>
          </div>
          
          <div className="card text-center">
            <div className="text-green-500 text-3xl mb-1">
              {profile?.stats?.completedItems || 0}
            </div>
            <p className="text-gray-400 text-sm">Completados</p>
          </div>
          
          <div className="card text-center">
            <div className="text-yellow-500 text-3xl mb-1">
              {profile?.stats?.averageRating || 0}
            </div>
            <p className="text-gray-400 text-sm">Puntuación media</p>
          </div>
          
          <div className="card text-center">
            <div className="text-blue-500 text-3xl mb-1">
              {profile?.stats?.completionRate || 0}%
            </div>
            <p className="text-gray-400 text-sm">Tasa finalización</p>
          </div>
        </div>

        {/* Achievements y Desglose */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Achievements */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Award className="w-6 h-6 text-primary-purple" />
                Logros
              </h2>
              <span className="text-sm text-gray-400">
                {profile?.achievements?.unlockedCount || 0} / {profile?.achievements?.totalAchievements || 12}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="h-2 bg-dark-hover rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-main transition-all duration-500"
                  style={{ width: `${profile?.achievements?.progress || 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {profile?.achievements?.progress || 0}% completado
              </p>
            </div>

            {/* Achievements grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {profile?.achievements?.unlocked.map(achievement => (
                <div
                  key={achievement.id}
                  className="bg-dark-hover rounded-lg p-4 text-center"
                >
                  <div className="text-3xl mb-2">
                    {achievementIcons[achievement.type] || '🏅'}
                  </div>
                  <h4 className="font-semibold text-sm mb-1">
                    {achievement.title}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {achievement.description}
                  </p>
                </div>
              ))}
              
              {/* Locked achievements */}
              {Array.from({ 
                length: (profile?.achievements?.totalAchievements || 12) - (profile?.achievements?.unlockedCount || 0) 
              }).map((_, index) => (
                <div
                  key={`locked-${index}`}
                  className="bg-dark-hover rounded-lg p-4 text-center opacity-30"
                >
                  <div className="text-3xl mb-2">🔒</div>
                  <h4 className="font-semibold text-sm mb-1">???</h4>
                  <p className="text-xs text-gray-500">Bloqueado</p>
                </div>
              ))}
            </div>
          </div>

          {/* Desglose */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary-purple" />
              Desglose del backlog
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-green-500">Completados</span>
                  <span className="font-semibold">{profile?.stats?.completedItems || 0}</span>
                </div>
                <div className="h-2 bg-dark-hover rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500"
                    style={{ 
                      width: `${profile?.stats?.totalItems > 0 
                        ? (profile.stats.completedItems / profile.stats.totalItems * 100) 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-blue-500">En progreso</span>
                  <span className="font-semibold">{profile?.stats?.playingItems || 0}</span>
                </div>
                <div className="h-2 bg-dark-hover rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500"
                    style={{ 
                      width: `${profile?.stats?.totalItems > 0 
                        ? (profile.stats.playingItems / profile.stats.totalItems * 100) 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-yellow-500">Pendientes</span>
                  <span className="font-semibold">{profile?.stats?.pendingItems || 0}</span>
                </div>
                <div className="h-2 bg-dark-hover rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500"
                    style={{ 
                      width: `${profile?.stats?.totalItems > 0 
                        ? (profile.stats.pendingItems / profile.stats.totalItems * 100) 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-1">Tasa de finalización</p>
                <p className="text-3xl font-bold text-primary-purple">
                  {profile?.stats?.completionRate || 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {profile?.stats?.completedItems || 0} de {profile?.stats?.totalItems || 0} items completados
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Backlog */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            Backlog de {profile?.username}
          </h2>

          {backlog.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400">
                Este usuario aún no ha añadido items a su backlog
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {backlog.map(item => (
                <div 
                  key={item.id} 
                  className="card cursor-pointer hover:border-gray-600 transition-colors"
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden rounded-lg mb-4">
                    {item.coverImage ? (
                      <img 
                        src={item.coverImage} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-dark-hover flex items-center justify-center">
                        <span className="text-6xl">🎮</span>
                      </div>
                    )}
                    
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
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg line-clamp-2">
                      {item.title}
                    </h3>

                    {item.status && (
                      <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                        item.status === 'completed' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                        item.status === 'playing' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' :
                        item.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                        'bg-red-500/20 text-red-500 border border-red-500/30'
                      }`}>
                        {item.status === 'completed' ? 'Completado' :
                         item.status === 'playing' ? 'En progreso' :
                         item.status === 'pending' ? 'Pendiente' : 'Abandonado'}
                      </span>
                    )}

                    {item.reviews && item.reviews.length > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm text-gray-300">
                          {item.reviews[0].rating}/5
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de vista previa */}
      {selectedItem && (
        <ItemPreviewModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  )
}