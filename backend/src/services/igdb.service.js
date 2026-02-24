const axios = require('axios')

let accessToken = null
let tokenExpiry = null

// Obtener token de acceso de Twitch
const getTwitchToken = async () => {
  try {
    // Si ya tenemos un token válido, lo devolvemos
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
      return accessToken
    }

    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials'
      }
    })

    accessToken = response.data.access_token
    // El token expira en X segundos, guardamos el timestamp
    tokenExpiry = Date.now() + (response.data.expires_in * 1000)

    return accessToken

  } catch (error) {
    console.error('Error obteniendo token de Twitch:', error.response?.data || error.message)
    throw new Error('Error al autenticar con IGDB')
  }
}

// Buscar juegos en IGDB
const searchGames = async (query, limit = 10) => {
  try {
    const token = await getTwitchToken()

    const response = await axios.post(
      'https://api.igdb.com/v4/games',
      `
        search "${query}";
        fields name, cover.url, first_release_date, summary, 
               genres.name, platforms.name, involved_companies.company.name,
               rating, rating_count;
        limit ${limit};
      `,
      {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${token}`
        }
      }
    )

    return response.data.map(game => ({
      externalId: game.id.toString(),
      title: game.name,
      coverImage: game.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : null,
      metadata: {
        releaseDate: game.first_release_date 
          ? new Date(game.first_release_date * 1000).toISOString().split('T')[0]
          : null,
        summary: game.summary || null,
        genres: game.genres?.map(g => g.name) || [],
        platforms: game.platforms?.map(p => p.name) || [],
        developer: game.involved_companies?.[0]?.company?.name || null,
        rating: game.rating ? Math.round(game.rating) / 10 : null,
        ratingCount: game.rating_count || 0
      }
    }))

  } catch (error) {
    console.error('Error buscando juegos en IGDB:', error.response?.data || error.message)
    throw new Error('Error al buscar juegos')
  }
}

// Obtener detalles de un juego específico
const getGameById = async (gameId) => {
  try {
    const token = await getTwitchToken()

    const response = await axios.post(
      'https://api.igdb.com/v4/games',
      `
        where id = ${gameId};
        fields name, cover.url, first_release_date, summary,
               genres.name, platforms.name, involved_companies.company.name,
               rating, rating_count, screenshots.url;
        limit 1;
      `,
      {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.data || response.data.length === 0) {
      return null
    }

    const game = response.data[0]

    return {
      externalId: game.id.toString(),
      title: game.name,
      coverImage: game.cover?.url ? `https:${game.cover.url.replace('t_thumb', 't_cover_big')}` : null,
      metadata: {
        releaseDate: game.first_release_date 
          ? new Date(game.first_release_date * 1000).toISOString().split('T')[0]
          : null,
        summary: game.summary || null,
        genres: game.genres?.map(g => g.name) || [],
        platforms: game.platforms?.map(p => p.name) || [],
        developer: game.involved_companies?.[0]?.company?.name || null,
        rating: game.rating ? Math.round(game.rating) / 10 : null,
        ratingCount: game.rating_count || 0,
        screenshots: game.screenshots?.map(s => `https:${s.url.replace('t_thumb', 't_screenshot_big')}`) || []
      }
    }

  } catch (error) {
    console.error('Error obteniendo juego de IGDB:', error.response?.data || error.message)
    throw new Error('Error al obtener juego')
  }
}

module.exports = {
  searchGames,
  getGameById
}