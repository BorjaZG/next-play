const express = require('express')
const router = express.Router()
const listController = require('../controllers/list.controller')
const authMiddleware = require('../middleware/auth.middleware')

// Todas las rutas requieren autenticación
router.use(authMiddleware)

// GET /lists - Obtener todas mis listas
router.get('/', listController.getMyLists)

// GET /lists/:id - Obtener una lista específica con sus items
router.get('/:id', listController.getListById)

// POST /lists - Crear nueva lista
router.post('/', listController.createList)

// PUT /lists/:id - Actualizar lista (nombre, descripción, privacidad)
router.put('/:id', listController.updateList)

// POST /lists/:id/items - Añadir item a la lista
router.post('/:id/items', listController.addItemToList)

// DELETE /lists/:id/items/:backlogItemId - Eliminar item de la lista
router.delete('/:id/items/:backlogItemId', listController.removeItemFromList)

// DELETE /lists/:id - Eliminar lista completa
router.delete('/:id', listController.deleteList)

module.exports = router