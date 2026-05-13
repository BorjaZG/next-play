import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, UserCheck } from 'lucide-react'
import { useSocialStore } from '../store/socialStore'
import Header from '../components/layout/Header'

export default function Followers() {
  const navigate = useNavigate()
  const { following, followers, fetchFollowing, fetchFollowers, followUser } = useSocialStore()

  useEffect(() => {
    fetchFollowing()
    fetchFollowers()
  }, [])

  const isFollowing = (userId) => following.some(f => f.id === userId)

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-1 border-b border-dark-border mb-6">
          <button
            onClick={() => navigate('/following')}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors"
          >
            Siguiendo ({following.length})
          </button>
          <button className="px-4 py-2.5 text-sm font-medium text-white relative">
            Seguidores ({followers.length})
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-purple" />
          </button>
        </div>

        {followers.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">Aún no tienes seguidores.</div>
        ) : (
          <div className="space-y-2">
            {followers.map(user => (
              <div key={user.id} className="bg-dark-card border border-dark-border rounded-xl p-4 flex items-center gap-4 hover:border-gray-600 transition-colors">
                <div
                  className="w-10 h-10 rounded-full bg-gradient-main flex items-center justify-center text-base font-bold text-white flex-shrink-0 cursor-pointer"
                  onClick={() => navigate(`/users/${user.id}`)}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/users/${user.id}`)}>
                  <p className="text-sm font-semibold hover:text-primary-purple transition-colors">{user.username}</p>
                </div>
                {isFollowing(user.id) ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-500 border border-dark-border">
                    <UserCheck className="w-3.5 h-3.5" /> Siguiendo
                  </span>
                ) : (
                  <button
                    onClick={() => followUser(user.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-gradient-main text-white hover:opacity-90 transition-opacity"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Seguir
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}