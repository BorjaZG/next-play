import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { statsService } from '../services/stats.service'
import { useBacklogStore } from '../store/backlogStore'
import { Calendar, Award, Star, TrendingUp } from 'lucide-react'
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

export default function Profile() {
  const { user } = useAuthStore()
  const { getStats } = useBacklogStore()
  const [stats, setStats] = useState(null)
  const [achievements, setAchievements] = useState(null)
  const [topRated, setTopRated] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    setLoading(true)
    try {
      const [generalStats, achievementsData, topRatedData] = await Promise.all([
        statsService.getGeneral(),
        statsService.getAchievements(),
        statsService.getTopRated(5),
      ])

      setStats(generalStats)
      setAchievements(achievementsData)
      setTopRated(topRatedData.topRated)
    } catch (error) {
      console.error('Error cargando perfil:', error)
    } finally {
      setLoading(false)
    }
  }

  const backlogStats = getStats()

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
        {/* Header con avatar y nombre */}
        <div className="bg-gradient-main rounded-xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-4xl font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{user?.username}</h1>
              <div className="flex items-center gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Miembro desde {new Date(user?.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-primary-purple text-4xl mb-2">
              {stats?.backlog.total || 0}
            </div>
            <p className="text-gray-400 text-sm">Total items</p>
          </div>
          
          <div className="card text-center">
            <div className="text-green-500 text-4xl mb-2">
              {stats?.backlog.completed || 0}
            </div>
            <p className="text-gray-400 text-sm">Completados</p>
          </div>
          
          <div className="card text-center">
            <div className="text-yellow-500 text-4xl mb-2">
              {stats?.reviews.averageRating || 0}
            </div>
            <p className="text-gray-400 text-sm">Valoración media</p>
          </div>
          
          <div className="card text-center">
            <div className="text-blue-500 text-4xl mb-2">
              {stats?.backlog.completionRate || 0}%
            </div>
            <p className="text-gray-400 text-sm">Tasa de finalización</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Achievements */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Award className="w-6 h-6 text-primary-purple" />
                Logros
              </h2>
              <span className="text-sm text-gray-400">
                {achievements?.unlockedCount || 0} / {achievements?.totalAchievements || 12}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="h-2 bg-dark-hover rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-main transition-all duration-500"
                  style={{ width: `${achievements?.progress || 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {achievements?.progress || 0}% completado
              </p>
            </div>

            {/* Achievements grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {achievements?.unlocked.map(achievement => (
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
              {Array.from({ length: (achievements?.totalAchievements || 12) - (achievements?.unlockedCount || 0) }).map((_, index) => (
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

          {/* Desglose y Favoritos */}
          <div className="space-y-8">
            {/* Estado del backlog */}
            <div className="card">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary-purple" />
                Desglose
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-green-500">Completados</span>
                    <span className="font-semibold">{stats?.backlog.completed || 0}</span>
                  </div>
                  <div className="h-2 bg-dark-hover rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500"
                      style={{ 
                        width: `${stats?.backlog.total > 0 
                          ? (stats.backlog.completed / stats.backlog.total * 100) 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-blue-500">En progreso</span>
                    <span className="font-semibold">{stats?.backlog.playing || 0}</span>
                  </div>
                  <div className="h-2 bg-dark-hover rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ 
                        width: `${stats?.backlog.total > 0 
                          ? (stats.backlog.playing / stats.backlog.total * 100) 
                          : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-yellow-500">Pendientes</span>
                    <span className="font-semibold">{stats?.backlog.pending || 0}</span>
                  </div>
                  <div className="h-2 bg-dark-hover rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500"
                      style={{ 
                        width: `${stats?.backlog.total > 0 
                          ? (stats.backlog.pending / stats.backlog.total * 100) 
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
                    {stats?.backlog.completionRate || 0}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.backlog.completed || 0} de {stats?.backlog.total || 0} items completados
                  </p>
                </div>
              </div>
            </div>

            {/* Favoritos */}
            <div className="card">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-primary-purple" />
                Favoritos
              </h2>
              
              {topRated.length > 0 ? (
                <div className="space-y-3">
                  {topRated.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-dark-hover rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <div className="flex-shrink-0 w-12 h-16 bg-dark-bg rounded overflow-hidden">
                        {item.coverImage ? (
                          <img 
                            src={item.coverImage} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 capitalize">
                          {item.contentType}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-yellow-500" />
                        <span className="font-semibold">{item.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Aún no has valorado ningún item</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}