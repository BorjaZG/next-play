const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Definición de todos los logros disponibles
const ACHIEVEMENTS = {
  FIRST_ITEM: {
    type: 'first_item',
    title: 'Primer Paso',
    description: 'Añadiste tu primer item al backlog',
    icon: '🎮'
  },
  FIRST_COMPLETION: {
    type: 'first_completion',
    title: 'Completador',
    description: 'Completaste tu primer item',
    icon: '✅'
  },
  COMPLETIONIST_10: {
    type: 'completionist_10',
    title: 'Completador',
    description: 'Completaste 10 items',
    icon: '🏆'
  },
  COMPLETIONIST_20: {
    type: 'completionist_20',
    title: 'Completador Pro',
    description: 'Completaste 20 items',
    icon: '💎'
  },
  MARATHONIST: {
    type: 'marathonist',
    title: 'Maratonista',
    description: 'Completaste 10 series completas',
    icon: '📺'
  },
  GAMER_PRO: {
    type: 'gamer_pro',
    title: 'Gamer Pro',
    description: 'Completaste 15 juegos',
    icon: '🎯'
  },
  OTAKU: {
    type: 'otaku',
    title: 'Otaku',
    description: 'Completaste 5 animes',
    icon: '✨'
  },
  FIRST_REVIEW: {
    type: 'first_review',
    title: 'Crítico',
    description: 'Escribiste tu primera reseña',
    icon: '⭐'
  },
  REVIEWER: {
    type: 'reviewer',
    title: 'Crítico Experto',
    description: 'Escribiste 10 reseñas',
    icon: '📝'
  },
  FIRST_LIST: {
    type: 'first_list',
    title: 'Organizador',
    description: 'Creaste tu primera lista personalizada',
    icon: '📋'
  },
  SOCIAL: {
    type: 'social',
    title: 'Social',
    description: 'Sigues a 5 usuarios',
    icon: '👥'
  },
  POPULAR: {
    type: 'popular',
    title: 'Popular',
    description: 'Tienes 10 seguidores',
    icon: '🌟'
  }
}

// Verificar y desbloquear logros para un usuario
const checkAndUnlockAchievements = async (userId) => {
  try {
    const newAchievements = []

    // Obtener estadísticas del usuario
    const [backlogCount, completedCount, reviewCount, listCount, followingCount, followersCount] = await Promise.all([
      prisma.backlogItem.count({ where: { userId } }),
      prisma.backlogItem.count({ where: { userId, status: 'completed' } }),
      prisma.review.count({ where: { userId } }),
      prisma.list.count({ where: { userId } }),
      prisma.follow.count({ where: { followerId: userId } }),
      prisma.follow.count({ where: { followingId: userId } })
    ])

    // Contar por tipo de contenido completado
    const completedByType = await prisma.backlogItem.groupBy({
      by: ['contentType'],
      where: { userId, status: 'completed' },
      _count: true
    })

    const completedGames = completedByType.find(t => t.contentType === 'game')?._count || 0
    const completedSeries = completedByType.find(t => t.contentType === 'series')?._count || 0
    const completedAnime = completedByType.find(t => t.contentType === 'anime')?._count || 0

    // Verificar logros
    const achievementsToCheck = [
      { condition: backlogCount >= 1, achievement: ACHIEVEMENTS.FIRST_ITEM },
      { condition: completedCount >= 1, achievement: ACHIEVEMENTS.FIRST_COMPLETION },
      { condition: completedCount >= 10, achievement: ACHIEVEMENTS.COMPLETIONIST_10 },
      { condition: completedCount >= 20, achievement: ACHIEVEMENTS.COMPLETIONIST_20 },
      { condition: completedSeries >= 10, achievement: ACHIEVEMENTS.MARATHONIST },
      { condition: completedGames >= 15, achievement: ACHIEVEMENTS.GAMER_PRO },
      { condition: completedAnime >= 5, achievement: ACHIEVEMENTS.OTAKU },
      { condition: reviewCount >= 1, achievement: ACHIEVEMENTS.FIRST_REVIEW },
      { condition: reviewCount >= 10, achievement: ACHIEVEMENTS.REVIEWER },
      { condition: listCount >= 1, achievement: ACHIEVEMENTS.FIRST_LIST },
      { condition: followingCount >= 5, achievement: ACHIEVEMENTS.SOCIAL },
      { condition: followersCount >= 10, achievement: ACHIEVEMENTS.POPULAR }
    ]

    for (const check of achievementsToCheck) {
      if (check.condition) {
        // Verificar si ya tiene este logro
        const existing = await prisma.achievement.findFirst({
          where: {
            userId,
            type: check.achievement.type
          }
        })

        // Si no lo tiene, desbloquearlo
        if (!existing) {
          const newAchievement = await prisma.achievement.create({
            data: {
              userId,
              type: check.achievement.type,
              title: check.achievement.title,
              description: check.achievement.description,
              icon: check.achievement.icon
            }
          })
          newAchievements.push(newAchievement)
        }
      }
    }

    return newAchievements

  } catch (error) {
    console.error('Error verificando achievements:', error)
    return []
  }
}

// Obtener todos los logros de un usuario
const getUserAchievements = async (userId) => {
  try {
    const unlocked = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: 'desc' }
    })

    // Calcular logros disponibles vs desbloqueados
    const totalAchievements = Object.keys(ACHIEVEMENTS).length
    const unlockedCount = unlocked.length

    return {
      unlocked,
      unlockedCount,
      totalAchievements,
      progress: Math.round((unlockedCount / totalAchievements) * 100)
    }

  } catch (error) {
    console.error('Error obteniendo achievements:', error)
    throw new Error('Error al obtener logros')
  }
}

module.exports = {
  checkAndUnlockAchievements,
  getUserAchievements,
  ACHIEVEMENTS
}