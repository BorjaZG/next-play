const express = require('express')
const router = express.Router()
const searchController = require('../controllers/search.controller')
const authMiddleware = require('../middleware/auth.middleware')

// Todas las rutas requieren autenticación
router.use(authMiddleware)

// GET /search?query=elden+ring&type=game
// Buscar contenido en las APIs externas
router.get('/', searchController.searchContent)

// GET /search/:type/:externalId
// Obtener detalles completos de un contenido específico
router.get('/:type/:externalId', searchController.getContentDetails)

// POST /search/:type/:externalId/add
// Añadir contenido al backlog directamente desde la búsqueda
router.post('/:type/:externalId/add', searchController.addContentToBacklog)

module.exports = router