const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const authMiddleware = require('../middleware/auth.middleware')

// POST /auth/register - Registrar nuevo usuario
router.post('/register', authController.register)

// POST /auth/login - Iniciar sesión
router.post('/login', authController.login)

// Ruta protegida
router.get('/me', authMiddleware, authController.getMe)

module.exports = router