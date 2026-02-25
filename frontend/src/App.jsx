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
import PrivateRoute from './components/PrivateRoute'
import Header from './components/layout/Header'

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
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
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
        
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App