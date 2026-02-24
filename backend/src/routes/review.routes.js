const express = require('express')
const router = express.Router()
const reviewController = require('../controllers/review.controller')
const authMiddleware = require('../middleware/auth.middleware')

// Todas las rutas requieren autenticación
router.use(authMiddleware)

// POST /reviews/:backlogItemId - Crear o actualizar reseña
router.post('/:backlogItemId', reviewController.createOrUpdateReview)

// GET /reviews/:backlogItemId - Obtener todas las reseñas de un item
router.get('/:backlogItemId', reviewController.getReviewsByItem)

// GET /reviews/:backlogItemId/my - Obtener mi reseña de un item
router.get('/:backlogItemId/my', reviewController.getMyReview)

// DELETE /reviews/:backlogItemId - Eliminar mi reseña
router.delete('/:backlogItemId', reviewController.deleteReview)

module.exports = router