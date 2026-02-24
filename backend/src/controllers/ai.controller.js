const { PrismaClient } = require('@prisma/client')
const aiService = require('../services/ai.service')

const prisma = new PrismaClient()

// Obtener recomendaciones personalizadas
const getRecommendations = async (req, res) => {
  try {
    const userId = req.userId
    const { context } = req.body

    // Obtener el backlog del usuario
    const backlog = await prisma.backlogItem.findMany({
      where: { userId },
      include: {
        reviews: true
      }
    })

    if (backlog.length === 0) {
      return res.status(400).json({
        error: 'No tienes items en tu backlog para analizar'
      })
    }

    // Obtener todas las reseñas del usuario
    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        backlogItem: {
          select: {
            title: true,
            contentType: true
          }
        }
      }
    })

    // Generar recomendaciones
    const recommendations = await aiService.generateRecommendations(
      backlog,
      reviews,
      context
    )

    res.json(recommendations)

  } catch (error) {
    console.error('Error en getRecommendations:', error)
    res.status(500).json({
      error: 'Error al generar recomendaciones',
      message: error.message
    })
  }
}

// Chat conversacional con el asistente
const chatWithAI = async (req, res) => {
  try {
    const userId = req.userId
    const { message, history = [] } = req.body

    if (!message) {
      return res.status(400).json({
        error: 'El mensaje es obligatorio'
      })
    }

    // Obtener el backlog del usuario
    const backlog = await prisma.backlogItem.findMany({
      where: { userId },
      include: {
        reviews: true
      }
    })

    // Generar respuesta
    const response = await aiService.chat(message, backlog, history)

    res.json({
      response,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error en chatWithAI:', error)
    res.status(500).json({
      error: 'Error al procesar el mensaje',
      message: error.message
    })
  }
}

// Analizar backlog con IA
const analyzeBacklog = async (req, res) => {
  try {
    const userId = req.userId

    // Obtener el backlog del usuario
    const backlog = await prisma.backlogItem.findMany({
      where: { userId },
      include: {
        reviews: true
      }
    })

    if (backlog.length === 0) {
      return res.status(400).json({
        error: 'No tienes items en tu backlog para analizar'
      })
    }

    // Obtener reseñas
    const reviews = await prisma.review.findMany({
      where: { userId }
    })

    // Generar análisis
    const analysis = await aiService.analyzeBacklog(backlog, reviews)

    res.json(analysis)

  } catch (error) {
    console.error('Error en analyzeBacklog:', error)
    res.status(500).json({
      error: 'Error al analizar backlog',
      message: error.message
    })
  }
}

module.exports = {
  getRecommendations,
  chatWithAI,
  analyzeBacklog
}