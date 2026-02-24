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

module.exports = {
  searchSeries,
  searchMovies,
  getSeriesById,
  getMovieById
}