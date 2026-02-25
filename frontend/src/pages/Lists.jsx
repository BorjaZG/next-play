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
    isPublic: false,
  })

  useEffect(() => {
    fetchLists()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    const result = await createList(formData)
    
    if (result.success) {
      setShowCreateModal(false)
      setFormData({ name: '', description: '', isPublic: false })
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mis Listas</h1>
            <p className="text-gray-400">
              Organiza tu contenido en colecciones temáticas
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva lista
          </button>
        </div>

        {/* Lists grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400">Cargando...</p>
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">
              No tienes listas aún
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Crear mi primera lista
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map(list => (
              <div
                key={list.id}
                className="card group cursor-pointer relative"
                onClick={() => navigate(`/lists/${list.id}`)}
              >
                {/* Privacy badge */}
                <div className="absolute top-4 right-4 z-10">
                  {list.isPublic ? (
                    <Globe className="w-5 h-5 text-green-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-500" />
                  )}
                </div>

                {/* Preview images */}
                <div className="grid grid-cols-2 gap-2 mb-4 h-48">
                  {list.items?.slice(0, 4).map((item, index) => (
                    <div key={index} className="bg-dark-hover rounded-lg overflow-hidden">
                      {/* Aquí irían las portadas de los items */}
                      <div className="w-full h-full bg-gradient-main opacity-20" />
                    </div>
                  ))}
                  {(!list.items || list.items.length === 0) && (
                    <div className="col-span-2 bg-dark-hover rounded-lg flex items-center justify-center h-full">
                      <span className="text-gray-600 text-4xl">📋</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {list.name}
                  </h3>
                  
                  {list.description && (
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {list.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{list.itemCount || 0} items</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(list.id)
                      }}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Crear nueva lista</h3>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Mi lista de favoritos"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción opcional..."
                  rows={3}
                  className="w-full bg-dark-hover border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-purple resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-400">
                  Lista pública (visible para otros usuarios)
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-dark-hover rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  Crear lista
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}