import { useAuthStore } from '../../store/authStore'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-dark-card border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-main bg-clip-text text-transparent">
              Next Play
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link 
              to="/backlog" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Mi Backlog
            </Link>
            <Link 
              to="/search" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Buscar
            </Link>
            <Link 
              to="/lists" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Listas
            </Link>
            <Link 
              to="/stats" 
              className="text-gray-300 hover:text-white transition-colors"
            >
              Estadísticas
            </Link>
          </nav>

          {/* User menu */}
          <div className="flex items-center gap-4">
            <Link 
              to="/profile"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:block">{user?.username}</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-dark-hover px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:block">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}