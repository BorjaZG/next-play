const igdbService = require('../services/igdb.service')
const tmdbService = require('../services/tmdb.service')

// Buscar contenido en todas las APIs
const searchContent = async (req, res) => {
  try {
    const { query, type } = req.query

    if (!query) {
      return res.status(400).json({ 
        error: 'El parámetro query es obligatorio' 
      })
    }

    let results = []

    // Si no se especifica tipo, buscar en todas las APIs
    if (!type || type === 'all') {
      const [games, series, movies] = await Promise.all([
        igdbService.searchGames(query, 5).catch(() => []),
        tmdbService.searchSeries(query, 5).catch(() => []),
        tmdbService.searchMovies(query, 5).catch(() => [])
      ])

      results = [
        ...games.map(item => ({ ...item, contentType: 'game' })),
        ...series.map(item => ({ ...item, contentType: 'series' })),
        ...movies.map(item => ({ ...item, contentType: 'movie' }))
      ]
    } else {
      // Buscar solo en la API especificada
      switch (type) {
        case 'game':
          const games = await igdbService.searchGames(query, 10)
          results = games.map(item => ({ ...item, contentType: 'game' }))
          break

        case 'series':
          const series = await tmdbService.searchSeries(query, 10)
          results = series.map(item => ({ ...item, contentType: 'series' }))
          break

        case 'movie':
          const movies = await tmdbService.searchMovies(query, 10)
          results = movies.map(item => ({ ...item, contentType: 'movie' }))
          break

        case 'anime':
          // Por ahora, anime usa TMDB como series
          const anime = await tmdbService.searchSeries(query, 10)
          results = anime.map(item => ({ ...item, contentType: 'anime' }))
          break

        default:
          return res.status(400).json({ 
            error: 'Tipo inválido. Usa: game, series, movie, anime o all' 
          })
      }
    }

    res.json({ 
      query,
      type: type || 'all',
      count: results.length,
      results 
    })

  } catch (error) {
    console.error('Error en searchContent:', error)
    res.status(500).json({ 
      error: 'Error al buscar contenido',
      message: error.message 
    })
  }
}

// Obtener detalles de un item específico por ID y tipo
const getContentDetails = async (req, res) => {
  try {
    const { type, externalId } = req.params

    let content = null

    switch (type) {
      case 'game':
        content = await igdbService.getGameById(externalId)
        if (content) content.contentType = 'game'
        break

      case 'series':
      case 'anime':
        content = await tmdbService.getSeriesById(externalId)
        if (content) content.contentType = type
        break

      case 'movie':
        content = await tmdbService.getMovieById(externalId)
        if (content) content.contentType = 'movie'
        break

      default:
        return res.status(400).json({ 
          error: 'Tipo inválido. Usa: game, series, movie o anime' 
        })
    }

    if (!content) {
      return res.status(404).json({ 
        error: 'Contenido no encontrado' 
      })
    }

    res.json({ content })

  } catch (error) {
    console.error('Error en getContentDetails:', error)
    res.status(500).json({ 
      error: 'Error al obtener detalles del contenido',
      message: error.message 
    })
  }
}

// Añadir contenido al backlog directamente desde la búsqueda
const addContentToBacklog = async (req, res) => {
  try {
    const { type, externalId } = req.params
    const { status = 'pending', priority = 'medium' } = req.body

    // Obtener los detalles del contenido
    let content = null

    switch (type) {
      case 'game':
        content = await igdbService.getGameById(externalId)
        break
      case 'series':
      case 'anime':
        content = await tmdbService.getSeriesById(externalId)
        break
      case 'movie':
        content = await tmdbService.getMovieById(externalId)
        break
      default:
        return res.status(400).json({ 
          error: 'Tipo inválido' 
        })
    }

    if (!content) {
      return res.status(404).json({ 
        error: 'Contenido no encontrado en la API externa' 
      })
    }

    // Crear el item en el backlog
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()

    // Verificar si ya existe en el backlog
    const existingItem = await prisma.backlogItem.findFirst({
      where: {
        userId: req.userId,
        externalId: content.externalId,
        contentType: type
      }
    })

    if (existingItem) {
      return res.status(400).json({ 
        error: 'Este contenido ya está en tu backlog',
        item: existingItem 
      })
    }

    const item = await prisma.backlogItem.create({
      data: {
        userId: req.userId,
        contentType: type,
        externalId: content.externalId,
        title: content.title,
        status,
        priority,
        coverImage: content.coverImage,
        metadata: content.metadata
      }
    })

    res.status(201).json({ 
      message: 'Contenido añadido al backlog',
      item 
    })

  } catch (error) {
    console.error('Error en addContentToBacklog:', error)
    res.status(500).json({ 
      error: 'Error al añadir contenido al backlog',
      message: error.message 
    })
  }
}

module.exports = {
  searchContent,
  getContentDetails,
  addContentToBacklog
}