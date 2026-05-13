const express = require('express')
const router = express.Router()
const axios = require('axios')

const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMG = 'https://image.tmdb.org/t/p/w500'

// GET /public/trending — últimas novedades sin autenticación
router.get('/trending', async (req, res) => {
  try {
    const key = process.env.TMDB_API_KEY
    const params = { api_key: key, language: 'es-ES' }

    const [moviesRes, seriesRes, animeRes] = await Promise.all([
      axios.get(`${TMDB_BASE}/discover/movie`, {
        params: { ...params, sort_by: 'primary_release_date.desc', 'vote_count.gte': 50 }
      }),
      axios.get(`${TMDB_BASE}/discover/tv`, {
        params: { ...params, sort_by: 'first_air_date.desc', 'vote_count.gte': 50 }
      }),
      axios.get(`${TMDB_BASE}/discover/tv`, {
        params: { ...params, sort_by: 'popularity.desc', with_original_language: 'ja', with_genres: '16' }
      }),
    ])

    const map = (item, type) => ({
      externalId: item.id.toString(),
      contentType: type,
      title: item.title || item.name,
      coverImage: item.poster_path ? `${IMG}${item.poster_path}` : null,
    })

    const movies = moviesRes.data.results.filter(i => i.poster_path).slice(0, 2).map(i => map(i, 'movie'))
    const series = seriesRes.data.results.filter(i => i.poster_path).slice(0, 2).map(i => map(i, 'series'))
    const anime  = animeRes.data.results.filter(i => i.poster_path).slice(0, 2).map(i => map(i, 'anime'))

    res.json({ items: [...movies, ...anime, ...series] })
  } catch (error) {
    console.error('Error en /public/trending:', error.message)
    res.status(500).json({ items: [] })
  }
})

module.exports = router
