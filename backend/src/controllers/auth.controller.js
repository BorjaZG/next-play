const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Registrar nuevo usuario
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body

    // Validar que vengan todos los campos
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Todos los campos son obligatorios' 
      })
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      })
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    })

    if (existingUser) {
      return res.status(400).json({ 
        error: 'El email o username ya están en uso' 
      })
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    })

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      user,
      token
    })

  } catch (error) {
    console.error('Error en register:', error)
    res.status(500).json({ 
      error: 'Error al registrar usuario' 
    })
  }
}

// Login de usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validar que vengan los campos
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son obligatorios' 
      })
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({ 
        error: 'Credenciales incorrectas' 
      })
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Credenciales incorrectas' 
      })
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      token
    })

  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ 
      error: 'Error al iniciar sesión' 
    })
  }
}

// Obtener datos del usuario autenticado
const getMe = async (req, res) => {
  try {
    // req.userId viene del middleware de autenticación
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    })

    if (!user) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      })
    }

    res.json({ user })

  } catch (error) {
    console.error('Error en getMe:', error)
    res.status(500).json({ 
      error: 'Error al obtener datos del usuario' 
    })
  }
}

module.exports = {
  register,
  login,
  getMe
}