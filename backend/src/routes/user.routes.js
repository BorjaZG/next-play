const express = require('express')
const router = express.Router()
const followController = require('../controllers/follow.controller')
const authMiddleware = require('../middleware/auth.middleware')

// Rutas públicas (pueden requerir autenticación opcional)
router.use(authMiddleware)

// GET /users/:userId - Obtener perfil público de un usuario
router.get('/:userId', followController.getUserProfile)

// GET /users/:userId/backlog - Obtener backlog público de un usuario
router.get('/:userId/backlog', followController.getUserBacklog)

module.exports = router