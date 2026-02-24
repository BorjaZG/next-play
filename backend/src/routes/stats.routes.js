const express = require('express')
const router = express.Router()
const statsController = require('../controllers/stats.controller')
const authMiddleware = require('../middleware/auth.middleware')

// Todas las rutas requieren autenticación
router.use(authMiddleware)

// GET /stats - Estadísticas generales
router.get('/', statsController.getGeneralStats)

// GET /stats/genres - Top géneros
router.get('/genres', statsController.getTopGenres)

// GET /stats/developers - Top desarrolladores
router.get('/developers', statsController.getTopDevelopers)

// GET /stats/activity - Actividad mensual
router.get('/activity', statsController.getActivityByMonth)

// GET /stats/top-rated - Mejor valorados
router.get('/top-rated', statsController.getTopRated)

// GET /stats/achievements - Logros del usuario
router.get('/achievements', statsController.getAchievements)

module.exports = router