import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, UserPlus, UserCheck, Search } from 'lucide-react'
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
    } catch (error) {
      console.error('Error cargando usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const isFollowing = (userId) => {
    return following.some(f => f.id === userId)
  }

  const handleFollowToggle = async (userId) => {
    if (isFollowing(userId)) {
      await unfollowUser(userId)
    } else {
      await followUser(userId)
    }
  }

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Descubrir usuarios</h1>
          <p className="text-gray-400">
            Encuentra y sigue a otros usuarios para ver qué están jugando
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar usuarios..."
              className="w-full pl-12 pr-4 py-3 bg-dark-card border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-purple"
            />
          </div>
        </div>

        {/* Users grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400">Cargando usuarios...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className="card hover:border-gray-700 transition-colors"
              >
                {/* Avatar */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-main flex items-center justify-center text-2xl font-bold flex-shrink-0">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-semibold text-lg cursor-pointer hover:text-primary-purple transition-colors truncate"
                      onClick={() => navigate(`/users/${user.id}`)}
                    >
                      {user.username}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {user.stats?.totalItems || 0} items
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center text-sm">
                  <div>
                    <p className="text-gray-400">Items</p>
                    <p className="font-semibold">{user.stats?.totalItems || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Completados</p>
                    <p className="font-semibold text-green-500">{user.stats?.completedItems || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Seguidores</p>
                    <p className="font-semibold">{user.stats?.followers || 0}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/users/${user.id}`)}
                    className="flex-1 py-2 bg-dark-hover rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Ver perfil
                  </button>
                  
                  <button
                    onClick={() => handleFollowToggle(user.id)}
                    className={`flex-1 py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 ${
                      isFollowing(user.id)
                        ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                        : 'bg-gradient-main text-white'
                    }`}
                  >
                    {isFollowing(user.id) ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Siguiendo
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Seguir
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}