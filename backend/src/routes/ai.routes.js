const express = require('express')
const router = express.Router()
const aiController = require('../controllers/ai.controller')
const authMiddleware = require('../middleware/auth.middleware')

// Todas las rutas requieren autenticación
router.use(authMiddleware)

// POST /ai/recommendations - Obtener recomendaciones personalizadas
router.post('/recommendations', aiController.getRecommendations)

// POST /ai/chat - Chat conversacional con el asistente
router.post('/chat', aiController.chatWithAI)

// GET /ai/analyze - Analizar backlog con IA
router.get('/analyze', aiController.analyzeBacklog)

module.exports = router