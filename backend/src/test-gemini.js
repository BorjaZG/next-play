const { GoogleGenerativeAI } = require('@google/generative-ai')
require('dotenv').config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

async function listModels() {
  try {
    const models = await genAI.listModels()
    console.log('Modelos disponibles:')
    models.forEach(model => {
      console.log(`- ${model.name}`)
      console.log(`  Soporta: ${model.supportedGenerationMethods.join(', ')}`)
    })
  } catch (error) {
    console.error('Error:', error.message)
  }
}

listModels()