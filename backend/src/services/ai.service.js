const { GoogleGenerativeAI } = require('@google/generative-ai')

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

// Generar recomendaciones personalizadas basadas en el backlog
const generateRecommendations = async (userBacklog, userReviews, context = '') => {
  try {
    const prompt = `
Eres un asistente experto en videojuegos, series, películas y anime. Tu tarea es analizar el backlog del usuario y dar recomendaciones personalizadas.

**Backlog del usuario:**
${JSON.stringify(userBacklog, null, 2)}

**Reseñas del usuario:**
${JSON.stringify(userReviews, null, 2)}

**Contexto adicional:** ${context || 'El usuario quiere saber qué debería jugar/ver a continuación.'}

**Instrucciones:**
1. Analiza los géneros favoritos del usuario basándote en sus items completados y mejor valorados
2. Identifica patrones en sus gustos (tipo de contenido, desarrolladores, estudios, géneros)
3. Da 3-5 recomendaciones específicas del contenido que ya tiene en su backlog pendiente
4. Ordena las recomendaciones por prioridad basándote en sus gustos
5. Explica brevemente por qué cada recomendación encaja con sus gustos

**Formato de respuesta:**
Responde en formato JSON con esta estructura:
{
  "analysis": "Breve análisis de los gustos del usuario (2-3 líneas)",
  "recommendations": [
    {
      "title": "Nombre del juego/serie",
      "reason": "Por qué debería jugarlo/verlo ahora",
      "priority": "high/medium/low"
    }
  ]
}
    `.trim()

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Intentar parsear la respuesta como JSON
    try {
      // Limpiar markdown si existe
      const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      return JSON.parse(jsonText)
    } catch (parseError) {
      // Si no es JSON válido, devolver como texto
      return {
        analysis: text,
        recommendations: []
      }
    }

  } catch (error) {
    console.error('Error generando recomendaciones:', error)
    throw new Error('Error al generar recomendaciones con IA')
  }
}

// Chat conversacional con el asistente
const chat = async (userMessage, userBacklog, conversationHistory = []) => {
  try {
    // Construir el contexto del chat
    const systemContext = `
Eres un asistente experto y apasionado de videojuegos, series, películas y anime. Tu nombre es "Next Play Assistant".

**Tu propósito:**
- Ayudar al usuario con CUALQUIER duda sobre videojuegos, series, películas o anime
- Dar recomendaciones personalizadas basadas en su backlog
- Responder preguntas sobre estrategias, logros, secretos, lore, builds, easter eggs
- Comparar juegos/series y explicar diferencias
- Dar tips para completar juegos o encontrar objetos/logros
- Hablar sobre la industria del gaming, estudios, desarrolladores
- Recomendar contenido similar al que le gusta

**Backlog actual del usuario:**
${JSON.stringify(userBacklog.slice(0, 15), null, 2)}
${userBacklog.length > 15 ? `\n...y ${userBacklog.length - 15} items más en su backlog` : ''}

**Estadísticas del backlog:**
- Total de items: ${userBacklog.length}
- Completados: ${userBacklog.filter(i => i.status === 'completed').length}
- En progreso: ${userBacklog.filter(i => i.status === 'playing').length}
- Pendientes: ${userBacklog.filter(i => i.status === 'pending').length}

**Cómo responder:**
1. Si te preguntan sobre su backlog o recomendaciones → usa la información de arriba
2. Si te preguntan sobre un juego/serie específico → responde con tu conocimiento general
3. Si te piden ayuda con logros/secretos/estrategias → da consejos útiles y específicos
4. Si te piden comparaciones → analiza pros y contras
5. Si te piden explicaciones de lore/historia → explica de forma clara
6. Sé conversacional, amigable y entusiasta
7. Si no sabes algo específico, admítelo honestamente
8. Si te preguntan algo fuera de gaming/entretenimiento → redirige amablemente al tema

**Tono:** Amigable, entusiasta, útil. Como un amigo gamer experto.
**Longitud:** Respuestas concisas pero completas (2-4 párrafos máximo, excepto si piden algo muy detallado)
    `.trim()

    // Construir el historial de la conversación
    let fullPrompt = systemContext + '\n\n**Conversación:**\n'
    
    conversationHistory.forEach(msg => {
      fullPrompt += `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}\n`
    })
    
    fullPrompt += `Usuario: ${userMessage}\nAsistente:`

    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()

    return text.trim()

  } catch (error) {
    console.error('Error en chat con IA:', error)
    throw new Error('Error al procesar el mensaje')
  }
}

// Analizar estadísticas del backlog
const analyzeBacklog = async (userBacklog, userReviews) => {
  try {
    const prompt = `
Eres un analista de datos experto. Analiza el backlog del usuario y genera insights interesantes.

**Backlog:**
${JSON.stringify(userBacklog, null, 2)}

**Reseñas:**
${JSON.stringify(userReviews, null, 2)}

**Genera un análisis que incluya:**
1. Géneros más populares en el backlog
2. Desarrolladores/estudios favoritos
3. Plataformas más usadas
4. Tendencias temporales (años de lanzamiento)
5. Patrones de completitud (qué termina y qué abandona)
6. Recomendación sobre qué priorizar

**Formato de respuesta:**
Responde en formato JSON con esta estructura:
{
  "topGenres": ["género1", "género2", "género3"],
  "topDevelopers": ["dev1", "dev2"],
  "completionRate": número_entre_0_y_100,
  "insights": [
    "Insight 1",
    "Insight 2",
    "Insight 3"
  ],
  "recommendation": "Texto con recomendación general"
}
    `.trim()

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    try {
      const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      return JSON.parse(jsonText)
    } catch (parseError) {
      return {
        topGenres: [],
        topDevelopers: [],
        completionRate: 0,
        insights: [text],
        recommendation: 'No se pudo generar análisis detallado'
      }
    }

  } catch (error) {
    console.error('Error analizando backlog:', error)
    throw new Error('Error al analizar backlog con IA')
  }
}

module.exports = {
  generateRecommendations,
  chat,
  analyzeBacklog
}