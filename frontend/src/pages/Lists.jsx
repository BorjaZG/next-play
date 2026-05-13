import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Lock, Globe, Trash2 } from 'lucide-react'
import { useListStore } from '../store/listStore'
import Header from '../components/layout/Header'

export default function Lists() {
  const navigate = useNavigate()
  const { lists, loading, fetchLists, createList, deleteList } = useListStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true,
  })

  useEffect(() => {
    fetchLists()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    const result = await createList(formData)
    
    if (result.success) {
      setShowCreateModal(false)
      setFormData({ name: '', description: '', isPublic: true })
    } else {
      alert(result.error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar esta lista?')) {
      await deleteList(id)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-bold">Mis Listas</h1>
            <p className="text-sm text-gray-500 mt-0.5">Organiza tu contenido en colecciones</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Nueva lista
          </button>
        </div>

        {/* Lists */}
        {loading ? (
          <div className="text-center py-16 text-gray-600 text-sm">Cargando...</div>
        ) : lists.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm mb-3">No tienes listas aún.</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">Crear mi primera lista</button>
          </div>
        ) : (
          <div className="space-y-2">
            {lists.map(list => (
              <div
                key={list.id}
                className="bg-dark-card border border-dark-border rounded-xl p-4 flex items-center gap-4 hover:border-gray-600 transition-colors cursor-pointer"
                onClick={() => navigate(`/lists/${list.id}`)}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-dark-elevated flex items-center justify-center text-xl flex-shrink-0">
                  📋
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm truncate">{list.name}</h3>
                    {list.isPublic
                      ? <Globe className="w-3.5 h-3.5 text-primary-green flex-shrink-0" />
                      : <Lock className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
                    }
                  </div>
                  {list.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{list.description}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-0.5">{list.itemCount || 0} items</p>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(list.id) }}
                  className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-xl max-w-md w-full border border-dark-border shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-dark-border">
              <h3 className="font-semibold text-sm">Nueva lista</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white text-lg leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreate} className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Mi lista de favoritos"
                  className="w-full bg-dark-elevated border border-dark-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción opcional..."
                  rows={3}
                  className="w-full bg-dark-elevated border border-dark-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500 resize-none"
                />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-xs text-gray-400">Lista pública</span>
              </label>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 btn-secondary">Cancelar</button>
                <button type="submit" className="flex-1 btn-primary">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}