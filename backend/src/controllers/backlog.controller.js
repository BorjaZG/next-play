const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Obtener todos los items del backlog del usuario autenticado
const getMyBacklog = async (req, res) => {
  try {
    const { status, contentType, orderBy = 'createdAt' } = req.query

    // Construir filtros dinámicos
    const where = {
      userId: req.userId
    }

    if (status) {
      where.status = status
    }

    if (contentType) {
      where.contentType = contentType
    }

    // Obtener items
    const items = await prisma.backlogItem.findMany({
      where,
      orderBy: {
        [orderBy]: 'desc'
      },
      include: {
        reviews: true
      }
    })

    res.json({ items })

  } catch (error) {
    console.error('Error en getMyBacklog:', error)
    res.status(500).json({ 
      error: 'Error al obtener el backlog' 
    })
  }
}

// Añadir un nuevo item al backlog
const addItem = async (req, res) => {
  try {
    const { 
      contentType, 
      externalId, 
      title, 
      status = 'pending',
      priority = 'medium',
      coverImage,
      metadata 
    } = req.body

    // Validaciones
    if (!contentType || !title) {
      return res.status(400).json({ 
        error: 'contentType y title son obligatorios' 
      })
    }

    const validTypes = ['game', 'series', 'anime', 'movie']
    if (!validTypes.includes(contentType)) {
      return res.status(400).json({ 
        error: 'contentType debe ser: game, series, anime o movie' 
      })
    }

    // Crear item
    const item = await prisma.backlogItem.create({
      data: {
        userId: req.userId,
        contentType,
        externalId,
        title,
        status,
        priority,
        coverImage,
        metadata: metadata || {}
      }
    })

    res.status(201).json({ 
      message: 'Item añadido al backlog',
      item 
    })

  } catch (error) {
    console.error('Error en addItem:', error)
    res.status(500).json({ 
      error: 'Error al añadir item al backlog' 
    })
  }
}

// Actualizar un item del backlog
const updateItem = async (req, res) => {
  try {
    const { id } = req.params
    const { title, status, progress, priority, coverImage, metadata } = req.body

    // Verificar que el item existe y pertenece al usuario
    const existingItem = await prisma.backlogItem.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    })

    if (!existingItem) {
      return res.status(404).json({ 
        error: 'Item no encontrado' 
      })
    }

    // Actualizar
    const item = await prisma.backlogItem.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(status && { status }),
        ...(progress !== undefined && { progress }),
        ...(priority && { priority }),
        ...(coverImage && { coverImage }),
        ...(metadata && { metadata })
      }
    })

    res.json({ 
      message: 'Item actualizado',
      item 
    })

  } catch (error) {
    console.error('Error en updateItem:', error)
    res.status(500).json({ 
      error: 'Error al actualizar item' 
    })
  }
}

// Cambiar solo el estado de un item
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ 
        error: 'El campo status es obligatorio' 
      })
    }

    const validStatuses = ['pending', 'playing', 'completed', 'abandoned']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'status debe ser: pending, playing, completed o abandoned' 
      })
    }

    // Verificar que el item existe y pertenece al usuario
    const existingItem = await prisma.backlogItem.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    })

    if (!existingItem) {
      return res.status(404).json({ 
        error: 'Item no encontrado' 
      })
    }

    // Actualizar solo el estado
    const item = await prisma.backlogItem.update({
      where: { id: parseInt(id) },
      data: { status }
    })

    res.json({ 
      message: 'Estado actualizado',
      item 
    })

  } catch (error) {
    console.error('Error en updateStatus:', error)
    res.status(500).json({ 
      error: 'Error al actualizar estado' 
    })
  }
}

// Eliminar un item del backlog
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params

    // Verificar que el item existe y pertenece al usuario
    const existingItem = await prisma.backlogItem.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    })

    if (!existingItem) {
      return res.status(404).json({ 
        error: 'Item no encontrado' 
      })
    }

    // Eliminar
    await prisma.backlogItem.delete({
      where: { id: parseInt(id) }
    })

    res.json({ 
      message: 'Item eliminado del backlog' 
    })

  } catch (error) {
    console.error('Error en deleteItem:', error)
    res.status(500).json({ 
      error: 'Error al eliminar item' 
    })
  }
}

module.exports = {
  getMyBacklog,
  addItem,
  updateItem,
  updateStatus,
  deleteItem
}