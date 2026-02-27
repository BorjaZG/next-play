import { useEffect, useState } from 'react'
import { TrendingUp, Award, Star, Gamepad2, Tv, Film, Sparkles } from 'lucide-react'
import { statsService } from '../services/stats.service'
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Header from '../components/layout/Header'

const COLORS = {
  game: '#3B82F6',
  series: '#10B981',
  anime: '#EC4899',
  movie: '#8B5CF6',
}

const TYPE_ICONS = {
  game: Gamepad2,
  series: Tv,
  anime: Sparkles,
  movie: Film,
}

export default function Statistics() {
  const [stats, setStats] = useState(null)
  const [topGenres, setTopGenres] = useState([])
  const [topDevelopers, setTopDevelopers] = useState([])
  const [activity, setActivity] = useState([])
  const [topRated, setTopRated] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const [generalStats, genresData, developersData, activityData, topRatedData] = await Promise.all([
        statsService.getGeneral(),
        statsService.getTopGenres(10),
        statsService.getTopDevelopers(10),
        statsService.getActivity(6),
        statsService.getTopRated(5),
      ])

      setStats(generalStats)
      setTopGenres(genresData.topGenres)
      setTopDevelopers(developersData.topDevelopers)
      
      // Formatear actividad para el gráfico
      const formattedActivity = Object.entries(activityData.monthlyActivity).map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }),
        ...data
      }))
      setActivity(formattedActivity)
      
      setTopRated(topRatedData.topRated)
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <p className="text-gray-400">Cargando estadísticas...</p>
      </div>
    )
  }

  // Preparar datos para pie chart de distribución por tipo
  const typeDistribution = Object.entries(stats?.byType || {}).map(([type, count]) => ({
    name: type === 'game' ? 'Juegos' : type === 'series' ? 'Series' : type === 'anime' ? 'Anime' : 'Películas',
    value: count,
    color: COLORS[type]
  }))

  // Preparar datos para bar chart de estado
  const statusData = [
    { name: 'Completados', value: stats?.backlog?.completed || 0, color: '#10B981' },
    { name: 'En progreso', value: stats?.backlog?.playing || 0, color: '#3B82F6' },
    { name: 'Pendientes', value: stats?.backlog?.pending || 0, color: '#F59E0B' },
    { name: 'Abandonados', value: stats?.backlog?.abandoned || 0, color: '#EF4444' },
  ]

  return (
    <div className="min-h-screen bg-dark-bg">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Estadísticas</h1>
          <p className="text-gray-400">
            Análisis completo de tu backlog y actividad
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card text-center">
            <div className="text-primary-purple text-4xl mb-2">
              {stats?.backlog?.total || 0}
            </div>
            <p className="text-gray-400">Total items</p>
          </div>

          <div className="card text-center">
            <div className="text-green-500 text-4xl mb-2">
              {stats?.backlog?.completed || 0}
            </div>
            <p className="text-gray-400">Completados</p>
          </div>

          <div className="card text-center">
            <div className="text-yellow-500 text-4xl mb-2">
              {stats?.reviews?.averageRating || 0}
            </div>
            <p className="text-gray-400">Rating medio</p>
          </div>

          <div className="card text-center">
            <div className="text-blue-500 text-4xl mb-2">
              {stats?.backlog?.completionRate || 0}%
            </div>
            <p className="text-gray-400">Tasa finalización</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Actividad mensual */}
          {activity.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary-purple" />
                Completados por mes
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#F3F4F6' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#A855F7" strokeWidth={2} name="Total" />
                  <Line type="monotone" dataKey="games" stroke="#3B82F6" strokeWidth={2} name="Juegos" />
                  <Line type="monotone" dataKey="series" stroke="#10B981" strokeWidth={2} name="Series" />
                  <Line type="monotone" dataKey="anime" stroke="#EC4899" strokeWidth={2} name="Anime" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Distribución por tipo */}
          {typeDistribution.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-6">Distribución por tipo</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Estado del backlog */}
          <div className="card">
            <h2 className="text-xl font-bold mb-6">Estado del backlog</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top géneros */}
          {topGenres.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-6">Top géneros</h2>
              <div className="space-y-3">
                {topGenres.slice(0, 8).map((genre, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-300">{genre.genre}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-dark-hover rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-main"
                          style={{ width: `${(genre.count / topGenres[0].count) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-8 text-right">{genre.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top desarrolladores y Mejor valorados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top desarrolladores */}
          {topDevelopers.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-6">Top desarrolladores/estudios</h2>
              <div className="space-y-3">
                {topDevelopers.slice(0, 6).map((dev, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-dark-hover rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-primary-purple">#{index + 1}</span>
                      <span className="text-gray-300">{dev.developer}</span>
                    </div>
                    <span className="text-sm text-gray-500">{dev.count} items</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mejor valorados */}
          {topRated.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Mejor valorados
              </h2>
              <div className="space-y-3">
                {topRated.map((item, index) => {
                  const Icon = TYPE_ICONS[item.contentType] || Gamepad2
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-dark-hover rounded-lg">
                      <div className="w-12 h-16 bg-dark-bg rounded overflow-hidden flex-shrink-0">
                        {item.coverImage ? (
                          <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{item.title}</h4>
                        <p className="text-xs text-gray-500 capitalize">{item.contentType}</p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-yellow-500" />
                        <span className="font-bold">{item.rating}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}