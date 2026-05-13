import { useState } from 'react'
import { useBacklogStore } from '../../store/backlogStore'
import { useNavigate } from 'react-router-dom'
import { MoreVertical, Trash2, CheckCircle, Clock, Play, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useConfirm } from '../../hooks/useConfirm'

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-500', dot: 'bg-yellow-500' },
  playing: { label: 'En progreso', color: 'bg-blue-500', dot: 'bg-blue-500' },
  completed: { label: 'Completado', color: 'bg-primary-green', dot: 'bg-primary-green' },
  abandoned: { label: 'Abandonado', color: 'bg-red-500', dot: 'bg-red-500' },
}

function StarDisplay({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-xs ${i <= rating ? 'star-filled' : 'star-empty'}`}>★</span>
      ))}
    </div>
  )
}

export default function BacklogCard({ item }) {
  const navigate = useNavigate()
  const { updateItemStatus, deleteItem } = useBacklogStore()
  const confirm = useConfirm()
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(false)

  const status = statusConfig[item.status] || statusConfig.pending
  const review = item.reviews?.[0]

  const handleStatusChange = async (newStatus, e) => {
    e.stopPropagation()
    setLoading(true)
    await updateItemStatus(item.id, newStatus)
    setLoading(false)
    setShowMenu(false)
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    const ok = await confirm(`¿Eliminar "${item.title}" del backlog?`)
    if (!ok) return
    setLoading(true)
    await deleteItem(item.id)
    toast.success('Item eliminado')
  }

  return (
    <div className="group relative">
      {/* Cover */}
      <div
        className="cover-card"
        onClick={() => navigate(`/backlog/${item.id}`)}
      >
        {item.coverImage ? (
          <img src={item.coverImage} alt={item.title} loading="lazy" />
        ) : (
          <div className="w-full h-full bg-dark-elevated flex items-center justify-center text-4xl">
            {item.contentType === 'game' ? '🎮' : item.contentType === 'series' ? '📺' : item.contentType === 'anime' ? '✨' : '🎬'}
          </div>
        )}

        {/* Status dot */}
        <div className={`absolute top-2 left-2 w-2.5 h-2.5 rounded-full ${status.dot} ring-2 ring-dark-bg`} title={status.label} />

        {/* Progress bar */}
        {item.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div className="h-full bg-primary-green" style={{ width: `${item.progress}%` }} />
          </div>
        )}

        {/* Hover overlay */}
        <div className="overlay">
          <p className="text-white text-xs font-semibold line-clamp-2 leading-tight mb-1">{item.title}</p>
          {review && <StarDisplay rating={review.rating} />}
        </div>

        {/* Menu button */}
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
          className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dropdown — fuera de cover-card para evitar overflow-hidden */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false) }} />
          <div className="absolute top-8 right-0 bg-dark-card border border-dark-border rounded-lg shadow-xl z-20 min-w-[160px] py-1">
            <p className="text-xs text-gray-500 px-3 py-1.5">Cambiar estado</p>
            {Object.entries(statusConfig).map(([s, cfg]) => (
              <button
                key={s}
                onClick={(e) => handleStatusChange(s, e)}
                disabled={loading || item.status === s}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-dark-hover transition-colors flex items-center gap-2 ${item.status === s ? 'text-gray-500 cursor-default' : 'text-gray-300'}`}
              >
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </button>
            ))}
            <div className="border-t border-dark-border my-1" />
            <button
              onClick={handleDelete}
              disabled={loading}
              className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-dark-hover transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-3 h-3" />
              Eliminar
            </button>
          </div>
        </>
      )}

      {/* Title below cover */}
      <div className="mt-1.5 px-0.5">
        <p
          className="text-xs text-gray-300 line-clamp-1 cursor-pointer hover:text-white transition-colors"
          onClick={() => navigate(`/backlog/${item.id}`)}
        >
          {item.title}
        </p>
        {review && (
          <div className="mt-0.5">
            <StarDisplay rating={review.rating} />
          </div>
        )}
      </div>
    </div>
  )
}
