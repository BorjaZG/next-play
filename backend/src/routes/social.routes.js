const express = require('express')
const router = express.Router()
const { getPublicReviews, getPublicLists, getItemStats, getItemReviews } = require('../controllers/social.controller')
const authMiddleware = require('../middleware/auth.middleware')

router.use(authMiddleware)

// GET /social/reviews - Reseñas públicas recientes de otros usuarios
router.get('/reviews', getPublicReviews)

// GET /social/lists - Listas públicas de otros usuarios
router.get('/lists', getPublicLists)

// GET /social/item-stats - Stats de la comunidad para un item
router.get('/item-stats', getItemStats)

// GET /social/item-reviews - Reseñas de la comunidad para un item
router.get('/item-reviews', getItemReviews)

module.exports = router
