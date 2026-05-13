import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import logo from '../assets/LogoNexPlay.webp'

export default function Register() {
  const navigate = useNavigate()
  const { register, loading, error, clearError } = useAuthStore()
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await register(formData.username, formData.email, formData.password)
    
    if (result.success) {
      navigate('/home')
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={logo} alt="Next Play" className="h-14 w-auto mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Tu colección, tu universo</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          {/* Tabs */}
          <div className="flex gap-1 bg-dark-elevated rounded-lg p-1 mb-6">
            <Link
              to="/login"
              className="flex-1 py-2 text-sm font-medium text-gray-400 text-center hover:text-white rounded-md transition-colors"
            >
              Iniciar sesión
            </Link>
            <button className="flex-1 py-2 text-sm font-medium bg-dark-card rounded-md text-white">
              Registrarse
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Nombre de usuario</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="tu_usuario"
                className="w-full px-3 py-2.5 bg-dark-elevated border border-dark-border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                className="w-full px-3 py-2.5 bg-dark-elevated border border-dark-border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-dark-elevated border border-dark-border rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-600 mt-1">Mínimo 6 caracteres</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3"
            >
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 mt-4">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-purple hover:text-primary-fuchsia transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}