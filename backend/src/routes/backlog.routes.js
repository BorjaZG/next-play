const express = require('express')
const router = express.Router()
const backlogController = require('../controllers/backlog.controller')
const authMiddleware = require('../middleware/auth.middleware')

// Todas las rutas del backlog requieren autenticación
router.use(authMiddleware)

// GET /backlog - Listar mi backlog (con filtros opcionales)
router.get('/', backlogController.getMyBacklog)

// POST /backlog - Añadir item al backlog
router.post('/', backlogController.addItem)

// PUT /backlog/:id - Actualizar item completo
router.put('/:id', backlogController.updateItem)

// PATCH /backlog/:id/status - Cambiar solo el estado
router.patch('/:id/status', backlogController.updateStatus)

// DELETE /backlog/:id - Eliminar item
router.delete('/:id', backlogController.deleteItem)

module.exports = router