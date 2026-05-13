import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserMinus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useConfirm } from '../hooks/useConfirm'
import { useSocialStore } from '../store/socialStore'
import Header from '../components/layout/Header'

export default function Following() {
  const navigate = useNavigate()
  const { following, followers, fetchFollowing, fetchFollowers, unfollowUser } = useSocialStore()
  const confirm = useConfirm()

  useEffect(() => {
    fetchFollowing()
    fetchFollowers()
  }, [])

  const handleUnfollow = async (userId, username) => {
    const ok = await confirm(`¿Dejar de seguir a ${username}?`)
    if (!ok) return
    await unfollowUser(userId)
    toast.success(`Dejaste de seguir a ${username}`)
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-1 border-b border-dark-border mb-6">
          <button className="px-4 py-2.5 text-sm font-medium text-white relative">
            Siguiendo ({following.length})
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-purple" />
          </button>
          <button
            onClick={() => navigate('/followers')}
            className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-300 transition-colors"
          >
            Seguidores ({followers.length})
          </button>
        </div>

        {following.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm mb-3">No sigues a nadie aún.</p>
            <button onClick={() => navigate('/discover')} className="btn-primary">Descubrir usuarios</button>
          </div>
        ) : (
          <div className="space-y-2">
            {following.map(user => (
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
                <button
                  onClick={() => handleUnfollow(user.id, user.username)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 border border-dark-border hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  Dejar de seguir
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}