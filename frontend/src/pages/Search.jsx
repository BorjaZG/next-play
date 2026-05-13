import { useState, useEffect, useRef } from 'react'
import { Search as SearchIcon, Loader2, ChevronLeft, ChevronRight, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { searchService } from '../services/search.service'
import SearchResultCard from '../components/search/SearchResultCard'
import Header from '../components/layout/Header'

const CONTENT_TYPES = [
  { value: 'all', label: 'Todo' },
  { value: 'game', label: '🎮 Juegos' },
  { value: 'series', label: '📺 Series' },
  { value: 'anime', label: '✨ Anime' },
  { value: 'movie', label: '🎬 Películas' },
]

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularidad' },
  { value: 'rating', label: 'Valoración' },
  { value: 'newest', label: 'Más recientes' },
]

function formatTotal(n) {
  if (!n) return ''
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return n.toString()
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 2
  const left = Math.max(1, page - delta)
  const right = Math.min(totalPages, page + delta)

  if (left > 1) { pages.push(1); if (left > 2) pages.push('...') }
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < totalPages) { if (right < totalPages - 1) pages.push('...'); pages.push(totalPages) }

  return (
    <div className="flex items-center justify-center gap-1 mt-10">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-gray-600 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-gradient-main text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-hover'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function Search() {
  const [inputValue, setInputValue] = useState('')
  const [activeType, setActiveType] = useState('all')

  // Search mode
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  // Browse mode
  const [browseResults, setBrowseResults] = useState([])
  const [browseLoading, setBrowseLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Filters
  const [sortBy, setSortBy] = useState('popularity')
  const [genres, setGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showGenreMenu, setShowGenreMenu] = useState(false)

  const debounceRef = useRef(null)
  const sortMenuRef = useRef(null)
  const genreMenuRef = useRef(null)

  const isBrowseMode = activeType !== 'all'

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) setShowSortMenu(false)
      if (genreMenuRef.current && !genreMenuRef.current.contains(e.target)) setShowGenreMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Load genres when type changes
  useEffect(() => {
    setSelectedGenre(null)
    setGenres([])
    if (activeType !== 'all') {
      searchService.getGenres(activeType).then(data => setGenres(data.genres || [])).catch(() => {})
    }
  }, [activeType])

  // Browse mode: load content on type/page/sort/genre change
  useEffect(() => {
    if (!isBrowseMode) return
    loadBrowse()
  }, [activeType, page, sortBy, selectedGenre]) // eslint-disable-line

  const loadBrowse = async () => {
    setBrowseLoading(true)
    setBrowseResults([])
    try {
      const data = await searchService.browse(activeType, page, sortBy, selectedGenre)
      setBrowseResults(data.results || [])
      setTotalResults(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error(err)
    } finally {
      setBrowseLoading(false)
    }
  }

  // Search mode: debounced search
  const handleInputChange = (value) => {
    setInputValue(value)
    clearTimeout(debounceRef.current)
    if (value.trim().length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const type = activeType === 'all' ? 'all' : activeType
        const data = await searchService.search(value, type)
        setSearchResults(data.results || [])
      } catch (e) { console.error(e) }
      finally { setSearching(false) }
    }, 350)
  }

  const handleTypeChange = (type) => {
    setActiveType(type)
    setPage(1)
    setSortBy('popularity')
    // If searching, re-search with new type
    if (inputValue.trim().length >= 2) {
      handleInputChange(inputValue)
    }
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSortChange = (value) => {
    setSortBy(value)
    setPage(1)
    setShowSortMenu(false)
  }

  const handleGenreChange = (id) => {
    setSelectedGenre(id)
    setPage(1)
    setShowGenreMenu(false)
  }

  const isSearchMode = inputValue.trim().length >= 2
  const results = isSearchMode ? searchResults : browseResults
  const loading = isSearchMode ? searching : browseLoading

  const typeLabel = CONTENT_TYPES.find(t => t.value === activeType)?.label || ''
  const sortLabel = SORT_OPTIONS.find(s => s.value === sortBy)?.label || 'Popularidad'
  const genreLabel = genres.find(g => g.id === selectedGenre)?.name || 'Todos los géneros'

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search bar */}
        <div className="mb-5">
          <div className="relative max-w-2xl mx-auto">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Buscar juegos, series, anime, películas..."
              className="w-full pl-10 pr-4 py-3 bg-dark-card border border-dark-border rounded-xl text-white placeholder-gray-600 text-sm focus:outline-none focus:border-gray-500"
            />
          </div>
        </div>

        {/* Type tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <div className="flex gap-1 bg-dark-card rounded-lg p-1">
            {CONTENT_TYPES.map(type => (
              <button
                key={type.value}
                onClick={() => handleTypeChange(type.value)}
                className={`px-4 py-2 rounded-md text-xs font-medium transition-colors ${
                  activeType === type.value
                    ? 'bg-dark-elevated text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Browse mode: filter bar + count */}
        {isBrowseMode && !isSearchMode && (
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            {/* Count */}
            <p className="text-sm text-gray-400">
              {browseLoading ? (
                <span className="text-gray-600">Cargando...</span>
              ) : (
                <>
                  <span className="text-white font-semibold">{formatTotal(totalResults)}</span>
                  {' '}{typeLabel.replace(/^\S+\s/, '')}
                </>
              )}
            </p>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />

              {/* Genre filter */}
              <div ref={genreMenuRef} className="relative">
                <button
                  onClick={() => setShowGenreMenu(!showGenreMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-card border border-dark-border rounded-lg text-xs text-gray-300 hover:border-gray-500 transition-colors"
                >
                  {genreLabel}
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>
                {showGenreMenu && genres.length > 0 && (
                  <div className="absolute right-0 top-full mt-1 bg-dark-card border border-dark-border rounded-xl shadow-xl z-30 min-w-[180px] max-h-60 overflow-y-auto py-1">
                    <button
                      onClick={() => handleGenreChange(null)}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-dark-hover transition-colors ${!selectedGenre ? 'text-white' : 'text-gray-400'}`}
                    >
                      Todos los géneros
                    </button>
                    {genres.map(g => (
                      <button
                        key={g.id}
                        onClick={() => handleGenreChange(g.id)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-dark-hover transition-colors ${selectedGenre === g.id ? 'text-white' : 'text-gray-400'}`}
                      >
                        {g.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort by */}
              <div ref={sortMenuRef} className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-card border border-dark-border rounded-lg text-xs text-gray-300 hover:border-gray-500 transition-colors"
                >
                  {sortLabel}
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>
                {showSortMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-dark-card border border-dark-border rounded-xl shadow-xl z-30 w-40 py-1">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleSortChange(opt.value)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-dark-hover transition-colors ${sortBy === opt.value ? 'text-white' : 'text-gray-400'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
          </div>
        ) : results.length > 0 ? (
          <>
            {isSearchMode && (
              <p className="text-xs text-gray-500 mb-4">{results.length} resultados para "{inputValue}"</p>
            )}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
              {results.map((item, index) => (
                <SearchResultCard
                  key={`${item.contentType}-${item.externalId}-${index}`}
                  item={{ ...item, contentType: item.contentType || activeType }}
                />
              ))}
            </div>

            {/* Pagination (browse mode only) */}
            {isBrowseMode && !isSearchMode && (
              <Pagination page={page} totalPages={Math.min(totalPages, 500)} onChange={handlePageChange} />
            )}
          </>
        ) : isSearchMode ? (
          <div className="text-center py-24">
            <p className="text-gray-500 text-sm">Sin resultados para "{inputValue}"</p>
          </div>
        ) : isBrowseMode ? (
          <div className="text-center py-24 text-gray-600 text-sm">
            No se encontraron resultados
          </div>
        ) : (
          <div className="text-center py-24">
            <SearchIcon className="w-12 h-12 mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500 text-sm">Busca contenido o selecciona una categoría</p>
          </div>
        )}
      </div>
    </div>
  )
}
