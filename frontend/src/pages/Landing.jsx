import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import logo from "../assets/LogoNexPlay.webp";

import imgBacklog  from "../assets/backlog.png";
import imgReviews  from "../assets/reviews.png";
import imgSocial   from "../assets/social.png";
import imgLists    from "../assets/lists.png";
import imgAI       from "../assets/ai.png";
import imgStats    from "../assets/stats.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TYPE_LABEL = { movie: "Película", series: "Serie", anime: "Anime", game: "Juego" };

export default function Landing() {
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/public/trending`)
      .then((r) => r.json())
      .then((data) => setTrending(data.items || []))
      .catch(() => {});
  }, []);

  const stats = [
    { label: "Juegos", value: "30K+", color: "text-blue-500" },
    { label: "Series", value: "50K+", color: "text-green-500" },
    { label: "Valoraciones", value: "∞", color: "text-yellow-500" },
    { label: "Reviews", value: "∞", color: "text-purple-500" },
    { label: "Listas", value: "∞", color: "text-pink-500" },
  ];

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src={logo} alt="" className="h-8 w-auto mix-blend-screen" />
              <span className="text-xl font-bold bg-gradient-main bg-clip-text text-transparent tracking-tight">
                Next Play
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <a
                href="#features"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Características
              </a>
              <a
                href="#about"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Acerca de
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                Log In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="bg-gradient-main px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section con fondo de portadas */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url('/src/assets/hero-bg.jpg')`,
          }}
        />

        {/* Overlay oscuro para mejor legibilidad */}
        <div className="absolute inset-0 bg-dark-bg/85 z-0" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-6">
            <img src={logo} alt="" className="h-20 md:h-28 lg:h-36 w-auto mix-blend-screen" />
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
              Next Play
            </h2>
          </div>
          <p className="text-2xl md:text-3xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Descubre, colecciona y analiza tu entretenimiento
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate("/register")}
              className="bg-gradient-main px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Crear cuenta gratis
            </button>
            <span className="text-gray-400">o</span>
            <button
              onClick={() => navigate("/login")}
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              log in si ya tienes cuenta
            </button>
          </div>
        </div>
      </section>

      {/* Recently Trending - Simulado */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold">Tendencias recientes</h3>
          <a
            href="#"
            className="text-primary-purple hover:text-primary-fuchsia transition-colors"
          >
            Ver más
          </a>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {trending.length > 0
            ? trending.map((item) => (
                <div key={`${item.contentType}-${item.externalId}`} className="group relative">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden border border-gray-800 group-hover:border-gray-500 transition-colors">
                    {item.coverImage ? (
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-pink-900/20 flex items-center justify-center text-3xl">
                        {item.contentType === "game" ? "🎮" : item.contentType === "series" ? "📺" : item.contentType === "anime" ? "✨" : "🎬"}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                      <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">{item.title}</p>
                      <p className="text-gray-400 text-[10px] mt-0.5">{TYPE_LABEL[item.contentType]}</p>
                    </div>
                  </div>
                </div>
              ))
            : Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg border border-gray-800 animate-pulse"
                />
              ))}
        </div>
      </section>

      {/* What is Next Play? */}
      <section
        id="about"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <h3 className="text-4xl font-bold mb-6">¿Qué es Next Play?</h3>
        <p className="text-xl text-gray-400 max-w-4xl leading-relaxed">
          Next Play es tu plataforma definitiva para gestionar tu backlog de
          entretenimiento. Organiza juegos, series, películas y anime. Mantén tu
          backlog actualizado, valora el contenido que has consumido y añade lo
          que quieres experimentar a tu wishlist. Comparte tu viaje con amigos
          siguiéndoos mutuamente para estar al día con vuestras últimas
          experiencias.
        </p>
      </section>

      {/* Feature: Track your collection */}
      <section className="bg-dark-card border-y border-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="aspect-video rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
                <img src={imgBacklog} alt="Vista del backlog" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-4xl font-bold mb-6">
                Sigue tu colección personal
              </h3>
              <p className="text-xl text-gray-400 leading-relaxed">
                Registra todo el contenido que has consumido, estás consumiendo
                actualmente y quieres experimentar. Sé tan detallado como
                quieras con funciones como seguimiento de tiempo, journaling
                diario, plataformas y mucho más.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature: Express with reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-4xl font-bold mb-6">
              Expresa tus opiniones con reviews
            </h3>
            <p className="text-xl text-gray-400 leading-relaxed">
              Descubre qué piensa la comunidad con las reviews. Cada elemento
              tiene una valoración promedio basada en todas las valoraciones
              para darte una puntuación de calidad de un vistazo. Una vez estés
              listo, añade tu review para definir qué significa ese contenido
              para ti.
            </p>
          </div>
          <div>
            <div className="aspect-video rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
              <img src={imgReviews} alt="Sistema de reviews" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature: Keep up with friends */}
      <section className="bg-dark-card border-y border-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="aspect-video rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
                <img src={imgSocial} alt="Red social" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-4xl font-bold mb-6">
                Mantente al día con tus amigos
              </h3>
              <p className="text-xl text-gray-400 leading-relaxed">
                Sigue a otros usuarios para tener un feed de actividad
                todo-en-uno que te mantendrá actualizado con su último progreso.
                Contenido, reviews y listas de amigos aparecen directamente en
                tu página de inicio para que no te pierdas nada.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature: Lists */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-4xl font-bold mb-6">
              Crea y organiza con listas
            </h3>
            <p className="text-xl text-gray-400 leading-relaxed">
              Las listas te permiten crear colecciones personalizadas de
              contenido con opciones como seguimiento de progreso o rankings.
              Puedes compartir tu lista con la comunidad o mantenerla privada
              solo para ti.
            </p>
          </div>
          <div>
            <div className="aspect-video rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
              <img src={imgLists} alt="Listas personalizadas" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature: AI Assistant */}
      <section
        id="features"
        className="bg-dark-card border-y border-gray-800 py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="aspect-video rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
                <img src={imgAI} alt="Asistente IA" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-4xl font-bold mb-6">
                Asistente con Inteligencia Artificial
              </h3>
              <p className="text-xl text-gray-400 leading-relaxed">
                Recibe recomendaciones personalizadas basadas en tu backlog y
                preferencias. Nuestro asistente IA te ayuda a decidir qué jugar,
                ver o leer a continuación, y te proporciona insights sobre tu
                actividad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature: Statistics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-4xl font-bold mb-6">Analiza tu actividad</h3>
            <p className="text-xl text-gray-400 leading-relaxed">
              Visualiza estadísticas detalladas sobre tu consumo de
              entretenimiento. Descubre tus géneros favoritos, desarrolladores
              más jugados, actividad mensual y mucho más con gráficos
              interactivos.
            </p>
          </div>
          <div>
            <div className="aspect-video rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
              <img src={imgStats} alt="Estadísticas" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-main rounded-2xl p-12 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <h3 className="text-4xl md:text-5xl font-bold mb-6">
              ¿Listo para gestionar tu backlog?
            </h3>
            <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
              Únete a Next Play y empieza a organizar todo tu entretenimiento en
              un solo lugar
            </p>
            <button
              onClick={() => navigate("/register")}
              className="bg-white text-purple-600 px-10 py-5 rounded-lg font-bold text-xl hover:bg-gray-100 transition-colors inline-flex items-center gap-3 shadow-2xl"
            >
              Crear cuenta gratis
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-gray-400 text-sm">
              © 2026 Next Play. Todos los derechos reservados.
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Términos y Condiciones
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Contacto
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
