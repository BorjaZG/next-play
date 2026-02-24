const { PrismaClient } = require('@prisma/client')
const achievementService = require('../services/achievement.service')

const prisma = new PrismaClient()

// Obtener estadísticas generales del usuario
const getGeneralStats = async (req, res) => {
  try {
    const userId = req.userId

    // Contar items por estado
    const [total, completed, playing, pending, abandoned] = await Promise.all([
      prisma.backlogItem.count({ where: { userId } }),
      prisma.backlogItem.count({ where: { userId, status: 'completed' } }),
      prisma.backlogItem.count({ where: { userId, status: 'playing' } }),
      prisma.backlogItem.count({ where: { userId, status: 'pending' } }),
      prisma.backlogItem.count({ where: { userId, status: 'abandoned' } })
    ])

    // Contar por tipo de contenido
    const byType = await prisma.backlogItem.groupBy({
      by: ['contentType'],
      where: { userId },
      _count: true
    })

    // Calcular rating medio
    const reviews = await prisma.review.findMany({
      where: { userId },
      select: { rating: true }
    })

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    // Estadísticas sociales
    const [followingCount, followersCount, listsCount] = await Promise.all([
      prisma.follow.count({ where: { followerId: userId } }),
      prisma.follow.count({ where: { followingId: userId } }),
      prisma.list.count({ where: { userId } })
    ])

    res.json({
      backlog: {
        total,
        completed,
        playing,
        pending,
        abandoned,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      },
      byType: byType.reduce((acc, item) => {
        acc[item.contentType] = item._count
        return acc
      }, {}),
      reviews: {
        total: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10
      },
      social: {
        following: followingCount,
        followers: followersCount,
        lists: listsCount
      }
    })

  } catch (error) {
    console.error('Error en getGeneralStats:', error)
    res.status(500).json({ 
      error: 'Error al obtener estadísticas' 
    })
  }
}

// Obtener top géneros del usuario
const getTopGenres = async (req, res) => {
  try {
    const userId = req.userId
    const limit = parseInt(req.query.limit) || 10

    const items = await prisma.backlogItem.findMany({
      where: { userId },
      select: { metadata: true }
    })

    // Contar géneros
    const genreCounts = {}
    items.forEach(item => {
      const genres = item.metadata?.genres || []
      genres.forEach(genre => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1
      })
    })

    // Ordenar y limitar
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([genre, count]) => ({ genre, count }))

    res.json({ topGenres })

  } catch (error) {
    console.error('Error en getTopGenres:', error)
    res.status(500).json({ 
      error: 'Error al obtener géneros' 
    })
  }
}

// Obtener top desarrolladores/estudios
const getTopDevelopers = async (req, res) => {
  try {
    const userId = req.userId
    const limit = parseInt(req.query.limit) || 10

    const items = await prisma.backlogItem.findMany({
      where: { userId },
      select: { metadata: true, contentType: true }
    })

    // Contar desarrolladores/estudios/creadores
    const developerCounts = {}
    items.forEach(item => {
      const developer = item.metadata?.developer || 
                       item.metadata?.studio || 
                       item.metadata?.creator
      if (developer) {
        developerCounts[developer] = (developerCounts[developer] || 0) + 1
      }
    })

    // Ordenar y limitar
    const topDevelopers = Object.entries(developerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([developer, count]) => ({ developer, count }))

    res.json({ topDevelopers })

  } catch (error) {
    console.error('Error en getTopDevelopers:', error)
    res.status(500).json({ 
      error: 'Error al obtener desarrolladores' 
    })
  }
}

// Obtener actividad por mes
const getActivityByMonth = async (req, res) => {
  try {
    const userId = req.userId
    const months = parseInt(req.query.months) || 12

    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const completedItems = await prisma.backlogItem.findMany({
      where: {
        userId,
        status: 'completed',
        updatedAt: {
          gte: startDate
        }
      },
      select: {
        updatedAt: true,
        contentType: true
      },
      orderBy: {
        updatedAt: 'asc'
      }
    })

    // Agrupar por mes
    const monthlyActivity = {}
    completedItems.forEach(item => {
      const monthKey = item.updatedAt.toISOString().slice(0, 7) // YYYY-MM
      if (!monthlyActivity[monthKey]) {
        monthlyActivity[monthKey] = { total: 0, games: 0, series: 0, anime: 0, movies: 0 }
      }
      monthlyActivity[monthKey].total++
      
      const typeMap = {
        'game': 'games',
        'series': 'series',
        'anime': 'anime',
        'movie': 'movies'
      }
      
      const typeKey = typeMap[item.contentType] || item.contentType
      monthlyActivity[monthKey][typeKey] = (monthlyActivity[monthKey][typeKey] || 0) + 1
    })

    res.json({ monthlyActivity })

  } catch (error) {
    console.error('Error en getActivityByMonth:', error)
    res.status(500).json({ 
      error: 'Error al obtener actividad mensual' 
    })
  }
}

// Obtener mejores valorados
const getTopRated = async (req, res) => {
  try {
    const userId = req.userId
    const limit = parseInt(req.query.limit) || 10

    const topRated = await prisma.review.findMany({
      where: { userId },
      include: {
        backlogItem: {
          select: {
            id: true,
            title: true,
            contentType: true,
            coverImage: true
          }
        }
      },
      orderBy: {
        rating: 'desc'
      },
      take: limit
    })

    res.json({ 
      topRated: topRated.map(review => ({
        ...review.backlogItem,
        rating: review.rating,
        reviewText: review.reviewText,
        reviewedAt: review.createdAt
      }))
    })

  } catch (error) {
    console.error('Error en getTopRated:', error)
    res.status(500).json({ 
      error: 'Error al obtener mejor valorados' 
    })
  }
}

// Obtener logros del usuario
const getAchievements = async (req, res) => {
  try {
    const userId = req.userId

    // Verificar si hay nuevos logros
    const newAchievements = await achievementService.checkAndUnlockAchievements(userId)

    // Obtener todos los logros
    const achievements = await achievementService.getUserAchievements(userId)

    res.json({
      ...achievements,
      newlyUnlocked: newAchievements
    })

  } catch (error) {
    console.error('Error en getAchievements:', error)
    res.status(500).json({ 
      error: 'Error al obtener logros' 
    })
  }
}

module.exports = {
  getGeneralStats,
  getTopGenres,
  getTopDevelopers,
  getActivityByMonth,
  getTopRated,
  getAchievements
}