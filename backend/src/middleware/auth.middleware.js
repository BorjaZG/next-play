const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Token no proporcionado' 
      })
    }

    // El token viene en formato: "Bearer eyJhbGci..."
    const token = authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ 
        error: 'Formato de token inválido' 
      })
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Guardar el userId en el request para usarlo en las rutas
    req.userId = decoded.userId

    // Continuar con la siguiente función
    next()

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado' 
      })
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido' 
      })
    }

    return res.status(500).json({ 
      error: 'Error al verificar token' 
    })
  }
}

module.exports = authMiddleware