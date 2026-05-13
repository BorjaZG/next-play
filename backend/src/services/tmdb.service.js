const axios = require('axios')

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

// Buscar series
const searchSeries = async (query, limit = 10) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/tv`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        query,
        language: 'es-ES'
      }
    })

    return response.data.results.slice(0, limit).map(series => ({
      externalId: series.id.toString(),
      title: series.name,
      coverImage: series.poster_path ? `${TMDB_IMAGE_BASE}${series.poster_path}` : null,
      metadata: {
        releaseDate: series.first_air_date || null,
        summary: series.overview || null,
        genres: [], // Se completa con getSeriesById si es necesario
        rating: series.vote_average ? series.vote_average / 2 : null,
        ratingCount: series.vote_count || 0
      }
    }))

  } catch (error) {
    console.error('Error buscando series en TMDB:', error.response?.data || error.message)
    throw new Error('Error al buscar series')
  }
}

// Buscar películas
const searchMovies = async (query, limit = 10) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        query,
        language: 'es-ES'
      }
    })

    return response.data.results.slice(0, limit).map(movie => ({
      externalId: movie.id.toString(),
      title: movie.title,
      coverImage: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
      metadata: {
        releaseDate: movie.release_date || null,
        summary: movie.overview || null,
        genres: [],
        rating: movie.vote_average ? movie.vote_average / 2 : null,
        ratingCount: movie.vote_count || 0
      }
    }))

  } catch (error) {
    console.error('Error buscando películas en TMDB:', error.response?.data || error.message)
    throw new Error('Error al buscar películas')
  }
}

// Obtener detalles de una serie
const getSeriesById = async (seriesId) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/tv/${seriesId}`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: 'es-ES'
      }
    })

    const series = response.data

    return {
      externalId: series.id.toString(),
      title: series.name,
      coverImage: series.poster_path ? `${TMDB_IMAGE_BASE}${series.poster_path}` : null,
      metadata: {
        releaseDate: series.first_air_date || null,
        summary: series.overview || null,
        genres: series.genres?.map(g => g.name) || [],
        seasons: series.number_of_seasons || 0,
        episodes: series.number_of_episodes || 0,
        creator: series.created_by?.[0]?.name || null,
        rating: series.vote_average ? series.vote_average / 2 : null,
        ratingCount: series.vote_count || 0
      }
    }

  } catch (error) {
    console.error('Error obteniendo serie de TMDB:', error.response?.data || error.message)
    throw new Error('Error al obtener serie')
  }
}

// Obtener detalles de una película
const getMovieById = async (movieId) => {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: 'es-ES'
      }
    })

    const movie = response.data

    return {
      externalId: movie.id.toString(),
      title: movie.title,
      coverImage: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
      metadata: {
        releaseDate: movie.release_date || null,
        summary: movie.overview || null,
        genres: movie.genres?.map(g => g.name) || [],
        duration: movie.runtime || null,
        director: null, // Se podría obtener con /movie/{id}/credits
        rating: movie.vote_average ? movie.vote_average / 2 : null,
        ratingCount: movie.vote_count || 0
      }
    }

  } catch (error) {
    console.error('Error obteniendo película de TMDB:', error.response?.data || error.message)
    throw new Error('Error al obtener película')
  }
}

// Helper: mapear resultado de película TMDB
const mapMovie = (movie) => ({
  externalId: movie.id.toString(),
  contentType: 'movie',
  title: movie.title,
  coverImage: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
  metadata: {
    releaseDate: movie.release_date || null,
    genres: movie.genre_ids || [],
    rating: movie.vote_average ? movie.vote_average / 2 : null,
    ratingCount: movie.vote_count || 0
  }
})

// Helper: mapear resultado de serie TMDB
const mapSeries = (s, type = 'series') => ({
  externalId: s.id.toString(),
  contentType: type,
  title: s.name,
  coverImage: s.poster_path ? `${TMDB_IMAGE_BASE}${s.poster_path}` : null,
  metadata: {
    releaseDate: s.first_air_date || null,
    genres: s.genre_ids || [],
    rating: s.vote_average ? s.vote_average / 2 : null,
    ratingCount: s.vote_count || 0
  }
})

// Listar películas paginadas (nuestra página = 3 páginas TMDB = ~60 resultados)
const browseMovies = async (page = 1, sortBy = 'popularity.desc', genreId = null) => {
  try {
    const startPage = (page - 1) * 3 + 1
    const params = {
      api_key: process.env.TMDB_API_KEY,
      language: 'es-ES',
      sort_by: sortBy,
      ...(genreId ? { with_genres: genreId } : {})
    }

    const pages = await Promise.all([
      axios.get(`${TMDB_BASE_URL}/discover/movie`, { params: { ...params, page: startPage } }),
      axios.get(`${TMDB_BASE_URL}/discover/movie`, { params: { ...params, page: startPage + 1 } }),
      axios.get(`${TMDB_BASE_URL}/discover/movie`, { params: { ...params, page: startPage + 2 } }),
    ])

    const results = pages.flatMap(p => p.data.results).slice(0, 60).map(mapMovie)
    const total = pages[0].data.total_results || 0
    return { results, total }
  } catch (error) {
    console.error('Error en browseMovies:', error.message)
    throw new Error('Error al listar películas')
  }
}

// Listar series paginadas
const browseSeries = async (page = 1, sortBy = 'popularity.desc', genreId = null) => {
  try {
    const startPage = (page - 1) * 3 + 1
    const params = {
      api_key: process.env.TMDB_API_KEY,
      language: 'es-ES',
      sort_by: sortBy,
      ...(genreId ? { with_genres: genreId } : {})
    }

    const pages = await Promise.all([
      axios.get(`${TMDB_BASE_URL}/discover/tv`, { params: { ...params, page: startPage } }),
      axios.get(`${TMDB_BASE_URL}/discover/tv`, { params: { ...params, page: startPage + 1 } }),
      axios.get(`${TMDB_BASE_URL}/discover/tv`, { params: { ...params, page: startPage + 2 } }),
    ])

    const results = pages.flatMap(p => p.data.results).slice(0, 60).map(s => mapSeries(s, 'series'))
    const total = pages[0].data.total_results || 0
    return { results, total }
  } catch (error) {
    console.error('Error en browseSeries:', error.message)
    throw new Error('Error al listar series')
  }
}

// Listar anime paginado (series japonesas de animación)
const browseAnime = async (page = 1, sortBy = 'popularity.desc', genreId = null) => {
  try {
    const startPage = (page - 1) * 3 + 1
    const params = {
      api_key: process.env.TMDB_API_KEY,
      language: 'es-ES',
      sort_by: sortBy,
      with_original_language: 'ja',
      with_genres: genreId || '16',  // 16 = Animation
    }

    const pages = await Promise.all([
      axios.get(`${TMDB_BASE_URL}/discover/tv`, { params: { ...params, page: startPage } }),
      axios.get(`${TMDB_BASE_URL}/discover/tv`, { params: { ...params, page: startPage + 1 } }),
      axios.get(`${TMDB_BASE_URL}/discover/tv`, { params: { ...params, page: startPage + 2 } }),
    ])

    const results = pages.flatMap(p => p.data.results).slice(0, 60).map(s => mapSeries(s, 'anime'))
    const total = pages[0].data.total_results || 0
    return { results, total }
  } catch (error) {
    console.error('Error en browseAnime:', error.message)
    throw new Error('Error al listar anime')
  }
}

// Obtener géneros de TMDB
const getTMDBGenres = async (type = 'movie') => {
  try {
    const endpoint = type === 'movie' ? '/genre/movie/list' : '/genre/tv/list'
    const response = await axios.get(`${TMDB_BASE_URL}${endpoint}`, {
      params: { api_key: process.env.TMDB_API_KEY, language: 'es-ES' }
    })
    return response.data.genres || []
  } catch {
    return []
  }
}

module.exports = {
  searchSeries,
  searchMovies,
  getSeriesById,
  getMovieById,
  browseMovies,
  browseSeries,
  browseAnime,
  getTMDBGenres
}