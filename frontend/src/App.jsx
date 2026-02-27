import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Backlog from './pages/Backlog'
import Search from './pages/Search'
import BacklogDetail from './pages/BacklogDetail'
import Lists from './pages/Lists'
import ListDetail from './pages/ListDetail'
import Profile from './pages/Profile'
import Discover from './pages/Discover'
import UserProfile from './pages/UserProfile'
import Following from './pages/Following'
import Followers from './pages/Followers'
import PrivateRoute from './components/PrivateRoute'
import Header from './components/layout/Header'
import AIChat from './pages/AIChat'
import Statistics from './pages/Statistics'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/ai-chat"
          element={
            <PrivateRoute>
              <AIChat />
            </PrivateRoute>
          }
        />

        <Route
          path="/statistics"
          element={
            <PrivateRoute>
              <Statistics />
            </PrivateRoute>
          }
        />
        
        <Route
          path="/backlog"
          element={
            <PrivateRoute>
              <div>
                <Header />
                <Backlog />
              </div>
            </PrivateRoute>
          }
        />

        <Route
          path="/backlog/:id"
          element={
            <PrivateRoute>
              <BacklogDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/search"
          element={
            <PrivateRoute>
              <Search />
            </PrivateRoute>
          }
        />

        <Route
          path="/lists"
          element={
            <PrivateRoute>
              <Lists />
            </PrivateRoute>
          }
        />

        <Route
          path="/lists/:id"
          element={
            <PrivateRoute>
              <ListDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route
          path="/discover"
          element={
            <PrivateRoute>
              <Discover />
            </PrivateRoute>
          }
        />

        <Route
          path="/users/:id"
          element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          }
        />

        <Route
          path="/following"
          element={
            <PrivateRoute>
              <Following />
            </PrivateRoute>
          }
        />

        <Route
          path="/followers"
          element={
            <PrivateRoute>
              <Followers />
            </PrivateRoute>
          }
        />
        
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App