import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { LogOut, User, Sparkles, Search, Menu, X } from 'lucide-react'
import logo from '../../assets/LogoNexPlay.webp'

const navLinks = [
  { to: '/backlog', label: 'Mi Backlog' },
  { to: '/search', label: 'Buscar' },
  { to: '/lists', label: 'Listas' },
  { to: '/discover', label: 'Descubrir' },
  { to: '/following', label: 'Social' },
  { to: '/stats', label: 'Stats' },
]

export default function Header() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="bg-dark-card border-b border-dark-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2 flex-shrink-0">
            <img src={logo} alt="Next Play" className="h-12 w-auto mix-blend-screen" />
          </Link>

          {/* Nav (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isActive(link.to)
                    ? 'text-white bg-dark-hover'
                    : 'text-gray-400 hover:text-white hover:bg-dark-hover'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/ai-chat"
              className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1 ${
                isActive('/ai-chat')
                  ? 'text-primary-purple bg-dark-hover'
                  : 'text-gray-400 hover:text-primary-purple hover:bg-dark-hover'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              IA
            </Link>
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2">
            <Link
              to="/search"
              className="p-2 text-gray-400 hover:text-white hover:bg-dark-hover rounded-md transition-colors"
            >
              <Search className="w-4 h-4" />
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-gray-400 hover:text-white hover:bg-dark-hover transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-main flex items-center justify-center text-xs font-bold text-white">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block">{user?.username}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-white hover:bg-dark-hover rounded-md transition-colors"
              title="Salir"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-dark-border bg-dark-card px-4 py-3 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                isActive(link.to)
                  ? 'text-white bg-dark-hover'
                  : 'text-gray-400 hover:text-white hover:bg-dark-hover'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/ai-chat"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-1 px-3 py-2 rounded-md text-sm text-gray-400 hover:text-primary-purple hover:bg-dark-hover transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            IA
          </Link>
        </div>
      )}
    </header>
  )
}
