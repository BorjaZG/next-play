const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

// Cargar variables de entorno
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares globales
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
app.use(express.json())

// Rutas
const authRoutes = require('./routes/auth.routes')
app.use('/auth', authRoutes)

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Next Play API funcionando correctamente',
    timestamp: new Date().toISOString()
  })
})

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})