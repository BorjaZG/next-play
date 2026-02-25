import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { listService } from '../services/list.service'
import { backlogService } from '../services/backlog.service'
import Header from '../components/layout/Header'

export default function ListDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [list, setList] = useState(null)
  const [backlogItems, setBacklogItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    fetchListDetails()
    fetchBacklogItems()
  }, [id])

  const fetchListDetails = async () => {
    try {
      const data = await listService.getById(id)
      setList(data.list)
    } catch (error) {
      console.error('Error:', error)
      navigate('/lists')
    } finally {
      setLoading(false)
    }
  }

  const fetchBacklogItems = async () => {
    try {
      const data = await backlogService.getAll()
      setBacklogItems(data.items)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/lists')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a listas
        </button>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{list?.name}</h1>
            {list?.description && (
              <p className="text-gray-400">{list.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-2">
              {list?.fullItems?.length || 0} items
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Añadir items
          </button>
        </div>

        {list?.fullItems && list.fullItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {list.fullItems.map(item => (
              <div key={item.id} className="card group relative">
                <div className="relative h-64 overflow-hidden rounded-lg mb-4">
                  {item.coverImage ? (
                    <img 
                      src={item.coverImage} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-dark-hover flex items-center justify-center">
                      <span className="text-6xl">🎮</span>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold mb-2">{item.title}</h3>
                
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="absolute top-2 right-2 p-2 bg-red-500/10 backdrop-blur-sm rounded-lg hover:bg-red-500/20"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">Esta lista está vacía</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              Añadir items
            </button>
          </div>
        )}
      </div>

      {/* Modal añadir items */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Añadir items de tu backlog</h3>
            
            <div className="space-y-2">
              {backlogItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleAddItem(item.id)}
                  className="w-full flex items-center gap-4 p-3 bg-dark-hover rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {item.coverImage && (
                    <img 
                      src={item.coverImage} 
                      alt={item.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                  )}
                  <span className="text-left">{item.title}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddModal(false)}
              className="w-full mt-4 py-3 bg-dark-hover rounded-lg hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}