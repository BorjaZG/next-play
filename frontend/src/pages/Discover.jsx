import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, UserCheck, Search } from 'lucide-react'
import { useSocialStore } from '../store/socialStore'
import { followService } from '../services/follow.service'
import Header from '../components/layout/Header'

export default function Discover() {
  const navigate = useNavigate()
  const { following, fetchFollowing, followUser, unfollowUser } = useSocialStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchFollowing()
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await followService.getSuggestedUsers()
      setUsers(data.users)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const isFollowing = (userId) => following.some(f => f.id === userId)

  const handleFollowToggle = async (userId) => {
    if (isFollowing(userId)) await unfollowUser(userId)
    else await followUser(userId)
  }

  const filtered = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-xl font-bold mb-1">Descubrir usuarios</h1>
        <p className="text-sm text-gray-500 mb-6">Sigue a otros usuarios y ve qué están jugando</p>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre de usuario..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-card border border-dark-border rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gray-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-600 text-sm">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">
            {searchQuery ? `Sin resultados para "${searchQuery}"` : 'No hay usuarios disponibles'}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(user => (
              <div
                key={user.id}
                className="bg-dark-card border border-dark-border rounded-xl p-4 flex items-center gap-4 hover:border-gray-600 transition-colors"
              >
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full bg-gradient-main flex items-center justify-center text-xl font-bold text-white flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/users/${user.id}`)}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => navigate(`/users/${user.id}`)}
                >
                  <h3 className="font-semibold text-sm hover:text-primary-purple transition-colors">{user.username}</h3>
                  <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                    <span>{user.stats?.totalItems ?? 0} items</span>
                    <span>·</span>
                    <span>{user.stats?.completedItems ?? 0} completados</span>
                    <span>·</span>
                    <span>{user.stats?.followers ?? 0} seguidores</span>
                  </div>
                </div>

                {/* Follow button */}
                <button
                  onClick={() => handleFollowToggle(user.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                    isFollowing(user.id)
                      ? 'bg-dark-elevated border border-dark-border text-gray-400 hover:border-gray-500'
                      : 'bg-gradient-main text-white hover:opacity-90'
                  }`}
                >
                  {isFollowing(user.id)
                    ? <><UserCheck className="w-3.5 h-3.5" /> Siguiendo</>
                    : <><UserPlus className="w-3.5 h-3.5" /> Seguir</>
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
