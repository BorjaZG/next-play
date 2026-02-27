const express = require('express')
const router = express.Router()
const followController = require('../controllers/follow.controller')
const authMiddleware = require('../middleware/auth.middleware')

// Todas las rutas requieren autenticación
router.use(authMiddleware)

// POST /follows/:userId - Seguir a un usuario
router.post('/:userId', followController.followUser)

// DELETE /follows/:userId - Dejar de seguir a un usuario
router.delete('/:userId', followController.unfollowUser)

// GET /follows/following - Obtener usuarios que sigo
router.get('/following', followController.getFollowing)

// GET /follows/followers - Obtener mis seguidores
router.get('/followers', followController.getFollowers)

// GET /follows/suggested - Obtener usuarios sugeridos para seguir
router.get('/suggested', followController.getSuggestedUsers)

// GET /follows/:userId/check - Verificar si sigo a un usuario
router.get('/:userId/check', followController.checkIfFollowing)

module.exports = router