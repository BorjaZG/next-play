import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, UserPlus } from 'lucide-react'
import { useSocialStore } from '../store/socialStore'
import Header from '../components/layout/Header'

export default function Followers() {
  const navigate = useNavigate()
  const { following, followers, fetchFollowing, fetchFollowers, followUser } = useSocialStore()

  useEffect(() => {
    fetchFollowing()
    fetchFollowers()
  }, [])

  const isFollowing = (userId) => {
    return following.some(f => f.id === userId)
  }

  const handleFollowBack = async (userId) => {
    await followUser(userId)
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button 
            onClick={() => navigate('/following')}
            className="px-4 py-3 text-gray-400 hover:text-white transition-colors"
          >
            Siguiendo ({following.length})
          </button>
          <button className="px-4 py-3 border-b-2 border-primary-purple font-semibold">
            Seguidores ({followers.length})
          </button>
        </div>

        {/* Followers list */}
        {followers.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg mb-4">
              Aún no tienes seguidores
            </p>
            <p className="text-gray-500 text-sm">
              Comparte contenido y sigue a otros usuarios para construir tu red
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {followers.map(user => (
              <div key={user.id} className="card">
                <div className="flex items-start gap-4 mb-4">
                  <div 
                    className="w-16 h-16 rounded-full bg-gradient-main flex items-center justify-center text-2xl font-bold flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
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
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/users/${user.id}`)}
                    className="flex-1 py-2 bg-dark-hover rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Ver perfil
                  </button>
                  
                  {!isFollowing(user.id) && (
                    <button
                      onClick={() => handleFollowBack(user.id)}
                      className="flex-1 py-2 bg-gradient-main rounded-lg hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Seguir también
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}