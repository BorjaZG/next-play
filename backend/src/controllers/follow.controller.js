const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Seguir a un usuario
const followUser = async (req, res) => {
  try {
    const { userId } = req.params
    const followerId = req.userId

    // No puedes seguirte a ti mismo
    if (parseInt(userId) === followerId) {
      return res.status(400).json({ 
        error: 'No puedes seguirte a ti mismo' 
      })
    }

    // Verificar que el usuario a seguir existe
    const userToFollow = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    })

    if (!userToFollow) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      })
    }

    // Verificar si ya lo sigues
    const existingFollow = await prisma.follow.findFirst({
      where: {
        followerId,
        followingId: parseInt(userId)
      }
    })

    if (existingFollow) {
      return res.status(400).json({ 
        error: 'Ya sigues a este usuario' 
      })
    }

    // Crear el follow
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId: parseInt(userId)
      }
    })

    res.status(201).json({ 
      message: `Ahora sigues a ${userToFollow.username}`,
      follow 
    })

  } catch (error) {
    console.error('Error en followUser:', error)
    res.status(500).json({ 
      error: 'Error al seguir usuario' 
    })
  }
}

// Dejar de seguir a un usuario
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params
    const followerId = req.userId

    // Buscar el follow
    const follow = await prisma.follow.findFirst({
      where: {
        followerId,
        followingId: parseInt(userId)
      }
    })

    if (!follow) {
      return res.status(404).json({ 
        error: 'No sigues a este usuario' 
      })
    }

    // Eliminar el follow
    await prisma.follow.delete({
      where: { id: follow.id }
    })

    res.json({ 
      message: 'Has dejado de seguir a este usuario' 
    })

  } catch (error) {
    console.error('Error en unfollowUser:', error)
    res.status(500).json({ 
      error: 'Error al dejar de seguir' 
    })
  }
}

// Obtener la lista de usuarios que sigo
const getFollowing = async (req, res) => {
  try {
    const userId = req.userId

    const following = await prisma.follow.findMany({
      where: {
        followerId: userId
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({ 
      following: following.map(f => ({
        ...f.following,
        followedAt: f.createdAt
      }))
    })

  } catch (error) {
    console.error('Error en getFollowing:', error)
    res.status(500).json({ 
      error: 'Error al obtener seguidos' 
    })
  }
}

// Obtener la lista de usuarios que me siguen
const getFollowers = async (req, res) => {
  try {
    const userId = req.userId

    const followers = await prisma.follow.findMany({
      where: {
        followingId: userId
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json({ 
      followers: followers.map(f => ({
        ...f.follower,
        followedAt: f.createdAt
      }))
    })

  } catch (error) {
    console.error('Error en getFollowers:', error)
    res.status(500).json({ 
      error: 'Error al obtener seguidores' 
    })
  }
}

// Verificar si sigo a un usuario específico
const checkIfFollowing = async (req, res) => {
  try {
    const { userId } = req.params
    const followerId = req.userId

    const follow = await prisma.follow.findFirst({
      where: {
        followerId,
        followingId: parseInt(userId)
      }
    })

    res.json({ 
      isFollowing: !!follow 
    })

  } catch (error) {
    console.error('Error en checkIfFollowing:', error)
    res.status(500).json({ 
      error: 'Error al verificar follow' 
    })
  }
}

// Obtener perfil público de un usuario
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        username: true,
        createdAt: true
      }
    })

    if (!user) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      })
    }

    // Contar estadísticas
    const [backlogCount, completedCount, followersCount, followingCount] = await Promise.all([
      prisma.backlogItem.count({
        where: { userId: parseInt(userId) }
      }),
      prisma.backlogItem.count({
        where: { 
          userId: parseInt(userId),
          status: 'completed'
        }
      }),
      prisma.follow.count({
        where: { followingId: parseInt(userId) }
      }),
      prisma.follow.count({
        where: { followerId: parseInt(userId) }
      })
    ])

    // Verificar si el usuario autenticado sigue a este usuario
    let isFollowing = false
    if (req.userId) {
      const follow = await prisma.follow.findFirst({
        where: {
          followerId: req.userId,
          followingId: parseInt(userId)
        }
      })
      isFollowing = !!follow
    }

    res.json({ 
      user: {
        ...user,
        stats: {
          totalItems: backlogCount,
          completedItems: completedCount,
          followers: followersCount,
          following: followingCount
        },
        isFollowing
      }
    })

  } catch (error) {
    console.error('Error en getUserProfile:', error)
    res.status(500).json({ 
      error: 'Error al obtener perfil' 
    })
  }
}

// Obtener el backlog público de un usuario
const getUserBacklog = async (req, res) => {
  try {
    const { userId } = req.params
    const { status, contentType } = req.query

    const where = {
      userId: parseInt(userId)
    }

    if (status) {
      where.status = status
    }

    if (contentType) {
      where.contentType = contentType
    }

    const items = await prisma.backlogItem.findMany({
      where,
      include: {
        reviews: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    res.json({ items })

  } catch (error) {
    console.error('Error en getUserBacklog:', error)
    res.status(500).json({ 
      error: 'Error al obtener backlog del usuario' 
    })
  }
}

module.exports = {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  checkIfFollowing,
  getUserProfile,
  getUserBacklog
}