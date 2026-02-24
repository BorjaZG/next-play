const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Obtener todas las listas del usuario autenticado
const getMyLists = async (req, res) => {
  try {
    const lists = await prisma.list.findMany({
      where: {
        userId: req.userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Parsear el campo items (JSON) para cada lista
    const listsWithParsedItems = lists.map(list => ({
      ...list,
      itemCount: list.items.length
    }))

    res.json({ lists: listsWithParsedItems })

  } catch (error) {
    console.error('Error en getMyLists:', error)
    res.status(500).json({ 
      error: 'Error al obtener listas' 
    })
  }
}

// Obtener una lista específica con los detalles de los items
const getListById = async (req, res) => {
  try {
    const { id } = req.params

    const list = await prisma.list.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    })

    if (!list) {
      return res.status(404).json({ 
        error: 'Lista no encontrada' 
      })
    }

    // Obtener los detalles completos de cada item en la lista
    const itemIds = list.items.map(item => item.backlogItemId)
    
    const backlogItems = await prisma.backlogItem.findMany({
      where: {
        id: { in: itemIds },
        userId: req.userId
      },
      include: {
        reviews: true
      }
    })

    res.json({ 
      list: {
        ...list,
        backlogItems
      }
    })

  } catch (error) {
    console.error('Error en getListById:', error)
    res.status(500).json({ 
      error: 'Error al obtener lista' 
    })
  }
}

// Crear nueva lista
const createList = async (req, res) => {
  try {
    const { name, description, isPublic = false } = req.body

    if (!name) {
      return res.status(400).json({ 
        error: 'El nombre de la lista es obligatorio' 
      })
    }

    const list = await prisma.list.create({
      data: {
        userId: req.userId,
        name,
        description,
        items: [],
        isPublic
      }
    })

    res.status(201).json({ 
      message: 'Lista creada correctamente',
      list 
    })

  } catch (error) {
    console.error('Error en createList:', error)
    res.status(500).json({ 
      error: 'Error al crear lista' 
    })
  }
}

// Actualizar lista (nombre, descripción, privacidad)
const updateList = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, isPublic } = req.body

    // Verificar que la lista existe y pertenece al usuario
    const existingList = await prisma.list.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    })

    if (!existingList) {
      return res.status(404).json({ 
        error: 'Lista no encontrada' 
      })
    }

    const list = await prisma.list.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isPublic !== undefined && { isPublic })
      }
    })

    res.json({ 
      message: 'Lista actualizada',
      list 
    })

  } catch (error) {
    console.error('Error en updateList:', error)
    res.status(500).json({ 
      error: 'Error al actualizar lista' 
    })
  }
}

// Añadir item a una lista
const addItemToList = async (req, res) => {
  try {
    const { id } = req.params
    const { backlogItemId } = req.body

    if (!backlogItemId) {
      return res.status(400).json({ 
        error: 'backlogItemId es obligatorio' 
      })
    }

    // Verificar que la lista existe y pertenece al usuario
    const list = await prisma.list.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    })

    if (!list) {
      return res.status(404).json({ 
        error: 'Lista no encontrada' 
      })
    }

    // Verificar que el backlog item existe y pertenece al usuario
    const backlogItem = await prisma.backlogItem.findFirst({
      where: {
        id: backlogItemId,
        userId: req.userId
      }
    })

    if (!backlogItem) {
      return res.status(404).json({ 
        error: 'Item de backlog no encontrado' 
      })
    }

    // Verificar que el item no esté ya en la lista
    const itemExists = list.items.some(
      item => item.backlogItemId === backlogItemId
    )

    if (itemExists) {
      return res.status(400).json({ 
        error: 'El item ya está en la lista' 
      })
    }

    // Añadir el item a la lista
    const updatedItems = [
      ...list.items,
      {
        backlogItemId,
        addedAt: new Date().toISOString()
      }
    ]

    const updatedList = await prisma.list.update({
      where: { id: parseInt(id) },
      data: {
        items: updatedItems
      }
    })

    res.json({ 
      message: 'Item añadido a la lista',
      list: updatedList 
    })

  } catch (error) {
    console.error('Error en addItemToList:', error)
    res.status(500).json({ 
      error: 'Error al añadir item a la lista' 
    })
  }
}

// Eliminar item de una lista
const removeItemFromList = async (req, res) => {
  try {
    const { id, backlogItemId } = req.params

    // Verificar que la lista existe y pertenece al usuario
    const list = await prisma.list.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    })

    if (!list) {
      return res.status(404).json({ 
        error: 'Lista no encontrada' 
      })
    }

    // Eliminar el item de la lista
    const updatedItems = list.items.filter(
      item => item.backlogItemId !== parseInt(backlogItemId)
    )

    const updatedList = await prisma.list.update({
      where: { id: parseInt(id) },
      data: {
        items: updatedItems
      }
    })

    res.json({ 
      message: 'Item eliminado de la lista',
      list: updatedList 
    })

  } catch (error) {
    console.error('Error en removeItemFromList:', error)
    res.status(500).json({ 
      error: 'Error al eliminar item de la lista' 
    })
  }
}

// Eliminar lista completa
const deleteList = async (req, res) => {
  try {
    const { id } = req.params

    // Verificar que la lista existe y pertenece al usuario
    const list = await prisma.list.findFirst({
      where: {
        id: parseInt(id),
        userId: req.userId
      }
    })

    if (!list) {
      return res.status(404).json({ 
        error: 'Lista no encontrada' 
      })
    }

    await prisma.list.delete({
      where: { id: parseInt(id) }
    })

    res.json({ 
      message: 'Lista eliminada' 
    })

  } catch (error) {
    console.error('Error en deleteList:', error)
    res.status(500).json({ 
      error: 'Error al eliminar lista' 
    })
  }
}

module.exports = {
  getMyLists,
  getListById,
  createList,
  updateList,
  addItemToList,
  removeItemFromList,
  deleteList
}