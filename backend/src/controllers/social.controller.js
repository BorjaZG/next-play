const prisma = require('../lib/prisma')

// Obtener reseñas recientes de todos los usuarios (excepto el propio)
const getPublicReviews = async (req, res) => {
  try {
    const currentUserId = req.userId
    const limit = parseInt(req.query.limit) || 8

    const reviews = await prisma.review.findMany({
      where: {
        reviewText: { not: null },
        backlogItem: {
          userId: { not: currentUserId }
        }
      },
      include: {
        backlogItem: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            contentType: true,
            externalId: true,
            status: true,
            metadata: true,
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    res.json({ reviews })
  } catch (error) {
    console.error('Error en getPublicReviews:', error)
    res.status(500).json({ error: 'Error al obtener reseñas' })
  }
}

// Obtener listas públicas de todos los usuarios (excepto el propio)
const getPublicLists = async (req, res) => {
  try {
    const currentUserId = req.userId
    const limit = parseInt(req.query.limit) || 6

    const lists = await prisma.list.findMany({
      where: {
        isPublic: true,
        userId: { not: currentUserId }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    // Para cada lista, obtener las portadas de los primeros items
    const listsWithCovers = await Promise.all(lists.map(async (list) => {
      const itemIds = (list.items || []).slice(0, 5).map(i => i.backlogItemId)
      let covers = []

      if (itemIds.length > 0) {
        const backlogItems = await prisma.backlogItem.findMany({
          where: { id: { in: itemIds } },
          select: { coverImage: true, title: true }
        })
        covers = backlogItems.filter(b => b.coverImage).map(b => ({ coverImage: b.coverImage, title: b.title }))
      }

      return {
        id: list.id,
        name: list.name,
        description: list.description,
        itemCount: (list.items || []).length,
        user: list.user,
        covers
      }
    }))

    res.json({ lists: listsWithCovers })
  } catch (error) {
    console.error('Error en getPublicLists:', error)
    res.status(500).json({ error: 'Error al obtener listas' })
  }
}

// Obtener estadísticas globales de un item (externalId + contentType)
const getItemStats = async (req, res) => {
  try {
    const { externalId, contentType } = req.query

    if (!externalId || !contentType) {
      return res.status(400).json({ error: 'Faltan parámetros' })
    }

    const backlogItems = await prisma.backlogItem.findMany({
      where: { externalId, contentType },
      select: { id: true, status: true }
    })

    const ids = backlogItems.map(b => b.id)
    const statusCounts = {}
    for (const b of backlogItems) {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1
    }

    let avgRating = null
    let totalRatings = 0
    const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

    if (ids.length > 0) {
      const reviews = await prisma.review.findMany({
        where: { backlogItemId: { in: ids } },
        select: { rating: true }
      })
      if (reviews.length > 0) {
        totalRatings = reviews.length
        avgRating = Math.round((reviews.reduce((s, r) => s + r.rating, 0) / totalRatings) * 10) / 10
        reviews.forEach(r => { ratingDist[r.rating]++ })
      }
    }

    res.json({
      stats: {
        total: backlogItems.length,
        byStatus: statusCounts,
        avgRating,
        totalRatings
      },
      ratingDistribution: ratingDist
    })
  } catch (error) {
    console.error('Error en getItemStats:', error)
    res.status(500).json({ error: 'Error al obtener estadísticas' })
  }
}

// Obtener reseñas de la comunidad para un item concreto (externalId + contentType)
const getItemReviews = async (req, res) => {
  try {
    const { externalId, contentType } = req.query
    const limit = parseInt(req.query.limit) || 8

    if (!externalId || !contentType) {
      return res.status(400).json({ error: 'Faltan parámetros' })
    }

    const reviews = await prisma.review.findMany({
      where: {
        backlogItem: { externalId, contentType }
      },
      include: {
        user: { select: { id: true, username: true } },
        backlogItem: { select: { status: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    res.json({ reviews })
  } catch (error) {
    console.error('Error en getItemReviews:', error)
    res.status(500).json({ error: 'Error al obtener reseñas' })
  }
}

module.exports = { getPublicReviews, getPublicLists, getItemStats, getItemReviews }
