import { useState } from 'react'
import { Search as SearchIcon, Loader2 } from 'lucide-react'
import { useSearchStore } from '../store/searchStore'
import SearchResultCard from '../components/search/SearchResultCard'
import Header from '../components/layout/Header'

const contentTypes = [
  { value: 'all', label: 'Todos', emoji: '🔍' },
  { value: 'game', label: 'Juegos', emoji: '🎮' },
  { value: 'series', label: 'Series', emoji: '📺' },
  { value: 'anime', label: 'Anime', emoji: '✨' },
  { value: 'movie', label: 'Películas', emoji: '🎬' },
]

export default function Search() {
  const [inputValue, setInputValue] = useState('')
  const { results, loading, query, activeType, search, setType } = useSearchStore()

  const handleSearch = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      search(inputValue, activeType)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Buscar y añadir contenido</h1>
          <p className="text-gray-400">
            Encuentra juegos, series, anime y películas para añadir a tu backlog
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Buscar juegos, series, anime..."
              className="w-full pl-12 pr-4 py-4 bg-dark-card border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-purple focus:ring-1 focus:ring-primary-purple"
            />
          </div>
        </form>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {contentTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setType(type.value)}
              className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeType === type.value
                  ? 'bg-gradient-main text-white'
                  : 'bg-dark-card text-gray-400 hover:text-white hover:bg-dark-hover'
              }`}
            >
              <span className="mr-2">{type.emoji}</span>
              {type.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-purple" />
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-gray-400 mb-6">
              {results.length} resultados para "{query}"
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((item, index) => (
                <SearchResultCard key={`${item.contentType}-${item.externalId}-${index}`} item={item} />
              ))}
            </div>
          </>
        ) : query ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-2">
              No se encontraron resultados para "{query}"
            </p>
            <p className="text-gray-500">
              Intenta con otro término de búsqueda
            </p>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-gradient-main bg-clip-text text-transparent mb-4">
              <SearchIcon className="w-16 h-16 mx-auto opacity-50" />
            </div>
            <p className="text-gray-400 text-lg mb-2">
              Busca contenido para añadir a tu backlog
            </p>
            <p className="text-gray-500">
              Usa la barra de búsqueda para encontrar juegos, series, anime o películas
            </p>
          </div>
        )}

        {/* Call to action si no hay búsqueda */}
        {!query && !loading && (
          <div className="mt-12 bg-gradient-main/10 border border-primary-purple/30 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold mb-2">¿No encuentras lo que buscas?</h3>
            <p className="text-gray-400 mb-4">
              Puedes añadir contenido manualmente si no aparece en los resultados
            </p>
            <button className="btn-secondary">
              Añadir manualmente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}