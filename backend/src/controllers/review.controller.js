const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Crear o actualizar reseña de un item
const createOrUpdateReview = async (req, res) => {
  try {
    const { backlogItemId } = req.params
    const { rating, reviewText, tags } = req.body

    // Validar rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'El rating debe estar entre 1 y 5' 
      })
    }

    // Verificar que el backlog item existe y pertenece al usuario
    const backlogItem = await prisma.backlogItem.findFirst({
      where: {
        id: parseInt(backlogItemId),
        userId: req.userId
      }
    })

    if (!backlogItem) {
      return res.status(404).json({ 
        error: 'Item de backlog no encontrado' 
      })
    }

    // Buscar si ya existe una reseña
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: req.userId,
        backlogItemId: parseInt(backlogItemId)
      }
    })

    let review

    if (existingReview) {
      // Actualizar reseña existente
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          reviewText,
          tags: tags || []
        }
      })
    } else {
      // Crear nueva reseña
      review = await prisma.review.create({
        data: {
          userId: req.userId,
          backlogItemId: parseInt(backlogItemId),
          rating,
          reviewText,
          tags: tags || []
        }
      })
    }

    res.status(existingReview ? 200 : 201).json({ 
      message: existingReview ? 'Reseña actualizada' : 'Reseña creada',
      review 
    })

  } catch (error) {
    console.error('Error en createOrUpdateReview:', error)
    res.status(500).json({ 
      error: 'Error al crear/actualizar reseña' 
    })
  }
}

// Obtener reseñas de un item
const getReviewsByItem = async (req, res) => {
  try {
    const { backlogItemId } = req.params

    const reviews = await prisma.review.findMany({
      where: {
        backlogItemId: parseInt(backlogItemId)
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({ reviews })

  } catch (error) {
    console.error('Error en getReviewsByItem:', error)
    res.status(500).json({ 
      error: 'Error al obtener reseñas' 
    })
  }
}

// Obtener mi reseña de un item específico
const getMyReview = async (req, res) => {
  try {
    const { backlogItemId } = req.params

    const review = await prisma.review.findFirst({
      where: {
        userId: req.userId,
        backlogItemId: parseInt(backlogItemId)
      }
    })

    if (!review) {
      return res.status(404).json({ 
        error: 'No has reseñado este item aún' 
      })
    }

    res.json({ review })

  } catch (error) {
    console.error('Error en getMyReview:', error)
    res.status(500).json({ 
      error: 'Error al obtener reseña' 
    })
  }
}

// Eliminar mi reseña
const deleteReview = async (req, res) => {
  try {
    const { backlogItemId } = req.params

    // Buscar la reseña
    const review = await prisma.review.findFirst({
      where: {
        userId: req.userId,
        backlogItemId: parseInt(backlogItemId)
      }
    })

    if (!review) {
      return res.status(404).json({ 
        error: 'Reseña no encontrada' 
      })
    }

    // Eliminar
    await prisma.review.delete({
      where: { id: review.id }
    })

    res.json({ 
      message: 'Reseña eliminada' 
    })

  } catch (error) {
    console.error('Error en deleteReview:', error)
    res.status(500).json({ 
      error: 'Error al eliminar reseña' 
    })
  }
}

module.exports = {
  createOrUpdateReview,
  getReviewsByItem,
  getMyReview,
  deleteReview
}