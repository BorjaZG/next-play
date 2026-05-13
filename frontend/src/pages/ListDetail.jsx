import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Globe, Lock } from 'lucide-react'
import { listService } from '../services/list.service'
import { backlogService } from '../services/backlog.service'
import { useAuthStore } from '../store/authStore'
import Header from '../components/layout/Header'

export default function ListDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [list, setList] = useState(null)
  const [backlogItems, setBacklogItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchListDetails()
  }, [id])

  const fetchListDetails = async () => {
    try {
      const data = await listService.getById(id)
      setList(data.list)
    } catch (error) {
      console.error('Error:', error)
      navigate(-1)
    } finally {
      setLoading(false)
    }
  }

  const fetchBacklogItems = async () => {
    try {
      const data = await backlogService.getAll()
      setBacklogItems(data.items || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleAddItem = async (backlogItemId) => {
    await listService.addItem(id, backlogItemId)
    fetchListDetails()
    setShowAddModal(false)
  }

  const handleRemoveItem = async (backlogItemId) => {
    if (confirm('¿Eliminar este item de la lista?')) {
      await listService.removeItem(id, backlogItemId)
      fetchListDetails()
    }
  }

  const handleOpenAddModal = () => {
    fetchBacklogItems()
    setShowAddModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <p className="text-gray-500 text-sm">Cargando...</p>
      </div>
    )
  }

  const isOwner = list?.userId === user?.id || list?.user?.id === user?.id

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

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{list?.name}</h1>
              {list?.isPublic
                ? <Globe className="w-4 h-4 text-primary-green" />
                : <Lock className="w-4 h-4 text-gray-600" />
              }
            </div>
            {list?.description && (
              <p className="text-gray-400 text-sm mb-1">{list.description}</p>
            )}
            <p className="text-xs text-gray-500">
              {list?.user?.username && !isOwner && (
                <span>
                  por <span
                    className="text-gray-400 hover:text-white cursor-pointer"
                    onClick={() => navigate(`/users/${list.user.id}`)}
                  >{list.user.username}</span>
                  {' · '}
                </span>
              )}
              {list?.fullItems?.length || 0} items
            </p>
          </div>

          {isOwner && (
            <button
              onClick={handleOpenAddModal}
              className="btn-primary flex items-center gap-1.5 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              Añadir
            </button>
          )}
        </div>

        {/* Items grid */}
        {list?.fullItems && list.fullItems.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
            {list.fullItems.map(item => (
              <div
                key={item.id}
                className="cover-card group"
                onClick={() => navigate(`/backlog/${item.id}`)}
              >
                {item.coverImage ? (
                  <img src={item.coverImage} alt={item.title} loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-dark-elevated flex items-center justify-center text-2xl">
                    {item.contentType === 'game' ? '🎮' : item.contentType === 'series' ? '📺' : item.contentType === 'anime' ? '✨' : '🎬'}
                  </div>
                )}
                <div className="overlay">
                  <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">{item.title}</p>
                </div>
                {isOwner && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.id) }}
                    className="absolute top-1 right-1 p-1 bg-black/70 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm mb-3">Esta lista está vacía.</p>
            {isOwner && (
              <button onClick={handleOpenAddModal} className="btn-primary">
                Añadir items
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal añadir items — solo para el dueño */}
      {showAddModal && isOwner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-xl max-w-md w-full max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-dark-border">
              <h3 className="font-semibold text-sm">Añadir de tu backlog</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white text-lg leading-none">&times;</button>
            </div>
            <div className="p-3 space-y-1">
              {backlogItems.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">Tu backlog está vacío.</p>
              ) : backlogItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleAddItem(item.id)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-dark-hover transition-colors text-left"
                >
                  <div className="w-8 h-12 flex-shrink-0 rounded overflow-hidden bg-dark-elevated">
                    {item.coverImage
                      ? <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-sm">🎮</div>
                    }
                  </div>
                  <span className="text-sm text-gray-300 truncate">{item.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
