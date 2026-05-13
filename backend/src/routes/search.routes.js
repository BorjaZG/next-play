const express = require('express')
const router = express.Router()
const searchController = require('../controllers/search.controller')
const authMiddleware = require('../middleware/auth.middleware')

// Todas las rutas requieren autenticación
router.use(authMiddleware)

// GET /search?query=elden+ring&type=game
router.get('/', searchController.searchContent)

// GET /search/browse/:type?page=1&sortBy=popularity&genre=12
router.get('/browse/:type', searchController.browseContent)

// GET /search/genres/:type
router.get('/genres/:type', searchController.getGenresByType)

// GET /search/:type/:externalId
router.get('/:type/:externalId', searchController.getContentDetails)

// POST /search/:type/:externalId/add
router.post('/:type/:externalId/add', searchController.addContentToBacklog)

module.exports = router