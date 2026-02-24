# 🎮 Next Play API

> API REST completa para gestionar tu backlog de videojuegos, series, películas y anime con recomendaciones personalizadas impulsadas por IA.

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-brightgreen.svg)](https://www.prisma.io/)
[![MariaDB](https://img.shields.io/badge/MariaDB-10.11-blue.svg)](https://mariadb.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tech Stack](#-tech-stack)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Endpoints](#-endpoints)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Modelos de Datos](#-modelos-de-datos)
- [Sistema de Achievements](#-sistema-de-achievements)
- [IA y Recomendaciones](#-ia-y-recomendaciones)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características

### 🔐 Autenticación
- Registro y login de usuarios
- Autenticación basada en JWT
- Middleware de protección de rutas

### 📚 Gestión de Backlog
- CRUD completo de items (juegos, series, anime, películas)
- Estados: Pendiente, En progreso, Completado, Abandonado
- Sistema de prioridades y progreso
- Filtros por estado y tipo de contenido

### ⭐ Sistema de Reseñas
- Valoraciones de 1-5 estrellas
- Comentarios detallados
- Sistema de tags personalizados
- Estadísticas de ratings

### 📋 Listas Personalizadas
- Crear listas públicas o privadas
- Añadir/eliminar items de listas
- Organización por temáticas

### 👥 Red Social
- Seguir a otros usuarios
- Ver perfiles públicos
- Explorar backlogs de amigos
- Estadísticas sociales

### 🔍 Búsqueda Externa
- Integración con IGDB (videojuegos)
- Integración con TMDB (series, películas, anime)
- Metadata automática al añadir contenido
- Portadas y sinopsis oficiales

### 🤖 Asistente IA
- Chat conversacional con Google Gemini
- Recomendaciones personalizadas
- Análisis inteligente de patrones
- Consejos sobre estrategias y logros
- Comparaciones entre títulos

### 📊 Estadísticas Avanzadas
- Géneros y desarrolladores favoritos
- Actividad mensual
- Tasa de completitud
- Top valorados
- 12 achievements desbloqueables

---

## 🛠️ Tech Stack

### Backend
- **Node.js** (v20.x) - Runtime de JavaScript
- **Express** (v4.x) - Framework web minimalista
- **Prisma** (v5.x) - ORM de próxima generación

### Base de Datos
- **MariaDB** (v10.11) - Base de datos relacional

### Autenticación & Seguridad
- **JWT** - Autenticación basada en tokens
- **bcryptjs** - Hashing de contraseñas

### APIs Externas
- **IGDB API** - Base de datos de videojuegos
- **TMDB API** - Base de datos de películas y series
- **Google Gemini AI** - Asistente IA conversacional

### Herramientas de Desarrollo
- **Nodemon** - Auto-restart del servidor
- **dotenv** - Gestión de variables de entorno

---

## 📦 Instalación

### Requisitos Previos

- Node.js 20.x o superior
- MariaDB 10.11 o superior
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/BorjaZG/next-play.git
cd next-play/backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto:
```env
# Database
DATABASE_URL="mysql://usuario:password@localhost:3306/nextplay"

# JWT
JWT_SECRET="tu_secreto_super_seguro_aqui"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
FRONTEND_URL="http://localhost:5173"

# APIs Externas
TWITCH_CLIENT_ID="tu_twitch_client_id"
TWITCH_CLIENT_SECRET="tu_twitch_client_secret"
TMDB_API_KEY="tu_tmdb_api_key"
GEMINI_API_KEY="tu_gemini_api_key"
```

4. **Crear la base de datos**
```sql
CREATE DATABASE nextplay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. **Ejecutar migraciones**
```bash
npx prisma migrate dev
```

6. **Generar Prisma Client**
```bash
npx prisma generate
```

7. **Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

---

## ⚙️ Configuración

### Obtener API Keys

#### IGDB (Juegos)
1. Crear cuenta en [Twitch Developers](https://dev.twitch.tv/)
2. Registrar una aplicación
3. Obtener Client ID y Client Secret

#### TMDB (Series/Películas)
1. Crear cuenta en [TMDB](https://www.themoviedb.org/)
2. Ir a Settings → API
3. Solicitar API Key (v3 auth)

#### Google Gemini (IA)
1. Ir a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Crear API Key
3. Copiar la clave

---

## 🚀 Uso

### Health Check
```bash
GET http://localhost:3000/health
```

Respuesta:
```json
{
  "status": "OK",
  "message": "Next Play API funcionando correctamente",
  "timestamp": "2026-02-24T20:00:00.000Z"
}
```

### Ejemplo de Flujo Completo
```javascript
// 1. Registrarse
POST /auth/register
{
  "username": "gamer123",
  "email": "gamer@example.com",
  "password": "password123"
}

// 2. Login (obtener token)
POST /auth/login
{
  "email": "gamer@example.com",
  "password": "password123"
}

// 3. Buscar un juego
GET /search?query=elden+ring&type=game
Headers: Authorization: Bearer <token>

// 4. Añadir al backlog
POST /search/game/119133/add
Headers: Authorization: Bearer <token>
{
  "status": "pending",
  "priority": "high"
}

// 5. Actualizar progreso
PUT /backlog/1
Headers: Authorization: Bearer <token>
{
  "progress": 45,
  "status": "playing"
}

// 6. Escribir reseña
POST /reviews/1
Headers: Authorization: Bearer <token>
{
  "rating": 5,
  "reviewText": "¡Obra maestra!",
  "tags": ["masterpiece", "souls-like"]
}

// 7. Pedir recomendaciones a la IA
POST /ai/recommendations
Headers: Authorization: Bearer <token>
{
  "context": "Tengo 2 horas libres"
}
```

---

## 📡 Endpoints

### 🔐 Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Registrar nuevo usuario | ❌ |
| POST | `/auth/login` | Iniciar sesión | ❌ |
| GET | `/auth/me` | Obtener usuario autenticado | ✅ |

### 📚 Backlog

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/backlog` | Listar mi backlog | ✅ |
| GET | `/backlog?status=playing` | Filtrar por estado | ✅ |
| GET | `/backlog?contentType=game` | Filtrar por tipo | ✅ |
| POST | `/backlog` | Añadir item | ✅ |
| PUT | `/backlog/:id` | Actualizar item | ✅ |
| PATCH | `/backlog/:id/status` | Cambiar solo estado | ✅ |
| DELETE | `/backlog/:id` | Eliminar item | ✅ |

### ⭐ Reseñas

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/reviews/:backlogItemId` | Crear/actualizar reseña | ✅ |
| GET | `/reviews/:backlogItemId` | Ver todas las reseñas | ✅ |
| GET | `/reviews/:backlogItemId/my` | Ver mi reseña | ✅ |
| DELETE | `/reviews/:backlogItemId` | Eliminar mi reseña | ✅ |

### 📋 Listas

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/lists` | Ver mis listas | ✅ |
| GET | `/lists/:id` | Ver lista específica | ✅ |
| POST | `/lists` | Crear lista | ✅ |
| PUT | `/lists/:id` | Actualizar lista | ✅ |
| POST | `/lists/:id/items` | Añadir item a lista | ✅ |
| DELETE | `/lists/:id/items/:itemId` | Quitar item de lista | ✅ |
| DELETE | `/lists/:id` | Eliminar lista | ✅ |

### 👥 Follows

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/follows/:userId` | Seguir usuario | ✅ |
| DELETE | `/follows/:userId` | Dejar de seguir | ✅ |
| GET | `/follows/following` | Ver a quién sigo | ✅ |
| GET | `/follows/followers` | Ver mis seguidores | ✅ |
| GET | `/follows/:userId/check` | ¿Sigo a este usuario? | ✅ |

### 🔍 Búsqueda

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/search?query=...&type=game` | Buscar contenido | ✅ |
| GET | `/search/:type/:externalId` | Detalles de contenido | ✅ |
| POST | `/search/:type/:externalId/add` | Añadir a backlog | ✅ |

**Tipos válidos:** `game`, `series`, `anime`, `movie`, `all`

### 🤖 IA

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/ai/chat` | Chat con asistente | ✅ |
| POST | `/ai/recommendations` | Obtener recomendaciones | ✅ |
| GET | `/ai/analyze` | Analizar backlog | ✅ |

### 📊 Estadísticas

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/stats` | Estadísticas generales | ✅ |
| GET | `/stats/genres` | Top géneros | ✅ |
| GET | `/stats/developers` | Top desarrolladores | ✅ |
| GET | `/stats/activity` | Actividad mensual | ✅ |
| GET | `/stats/top-rated` | Mejor valorados | ✅ |
| GET | `/stats/achievements` | Logros del usuario | ✅ |

### 👤 Usuarios Públicos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/users/:userId` | Ver perfil público | ✅ |
| GET | `/users/:userId/backlog` | Ver backlog de usuario | ✅ |

---

## 📁 Estructura del Proyecto
```
backend/
├── prisma/
│   ├── schema.prisma          # Esquema de base de datos
│   └── migrations/            # Migraciones de Prisma
├── src/
│   ├── controllers/           # Lógica de negocio
│   │   ├── auth.controller.js
│   │   ├── backlog.controller.js
│   │   ├── review.controller.js
│   │   ├── list.controller.js
│   │   ├── follow.controller.js
│   │   ├── search.controller.js
│   │   ├── ai.controller.js
│   │   └── stats.controller.js
│   ├── routes/                # Definición de rutas
│   │   ├── auth.routes.js
│   │   ├── backlog.routes.js
│   │   ├── review.routes.js
│   │   ├── list.routes.js
│   │   ├── follow.routes.js
│   │   ├── user.routes.js
│   │   ├── search.routes.js
│   │   ├── ai.routes.js
│   │   └── stats.routes.js
│   ├── services/              # Servicios externos
│   │   ├── igdb.service.js    # API de videojuegos
│   │   ├── tmdb.service.js    # API de películas/series
│   │   ├── ai.service.js      # Google Gemini
│   │   └── achievement.service.js
│   ├── middleware/            # Middlewares
│   │   └── auth.middleware.js # Verificación JWT
│   └── index.js               # Punto de entrada
├── .env                       # Variables de entorno
├── .gitignore
├── package.json
└── README.md
```

---

## 🗄️ Modelos de Datos

### User
```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### BacklogItem
```prisma
model BacklogItem {
  id          Int      @id @default(autoincrement())
  userId      Int
  contentType String   // game, series, anime, movie
  externalId  String?
  title       String
  status      String   @default("pending") // pending, playing, completed, abandoned
  progress    Int      @default(0)
  priority    String   @default("medium") // low, medium, high
  coverImage  String?
  metadata    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Review
```prisma
model Review {
  id            Int      @id @default(autoincrement())
  userId        Int
  backlogItemId Int
  rating        Int      // 1-5
  reviewText    String?
  tags          Json?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### List
```prisma
model List {
  id          Int      @id @default(autoincrement())
  userId      Int
  name        String
  description String?
  items       Json     // Array de { backlogItemId, addedAt }
  isPublic    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Follow
```prisma
model Follow {
  id          Int      @id @default(autoincrement())
  followerId  Int
  followingId Int
  createdAt   DateTime @default(now())
  
  @@unique([followerId, followingId])
}
```

### Achievement
```prisma
model Achievement {
  id          Int      @id @default(autoincrement())
  userId      Int
  type        String
  title       String
  description String
  icon        String?
  unlockedAt  DateTime @default(now())
}
```

---

## 🏆 Sistema de Achievements

### Logros Disponibles (12)

| Icono | Nombre | Descripción | Condición |
|-------|--------|-------------|-----------|
| 🎮 | Primer Paso | Añadiste tu primer item | 1 item en backlog |
| ✅ | Completador | Completaste tu primer item | 1 completado |
| 🏆 | Completador | Completaste 10 items | 10 completados |
| 💎 | Completador Pro | Completaste 20 items | 20 completados |
| 📺 | Maratonista | Completaste 10 series | 10 series |
| 🎯 | Gamer Pro | Completaste 15 juegos | 15 juegos |
| ✨ | Otaku | Completaste 5 animes | 5 animes |
| ⭐ | Crítico | Escribiste tu primera reseña | 1 reseña |
| 📝 | Crítico Experto | Escribiste 10 reseñas | 10 reseñas |
| 📋 | Organizador | Creaste tu primera lista | 1 lista |
| 👥 | Social | Sigues a 5 usuarios | 5 follows |
| 🌟 | Popular | Tienes 10 seguidores | 10 seguidores |

Los logros se desbloquean **automáticamente** al cumplir las condiciones.

---

## 🤖 IA y Recomendaciones

### Capacidades del Asistente

El asistente IA (Google Gemini) puede:

✅ **Dar recomendaciones personalizadas**
- Basadas en tu backlog y reseñas
- Considerando tiempo disponible
- Análisis de patrones de consumo

✅ **Responder preguntas sobre juegos/series**
- Estrategias y tips
- Cómo conseguir logros
- Explicaciones de lore
- Comparaciones entre títulos

✅ **Analizar tu perfil**
- Géneros favoritos
- Desarrolladores preferidos
- Predicción de burnout
- Sugerencias de timing

### Ejemplo de Uso
```json
POST /ai/chat
{
  "message": "¿Cómo consigo todos los finales de Elden Ring?",
  "history": []
}
```

Respuesta:
```json
{
  "response": "¡Los finales de Elden Ring! Hay 6 finales diferentes...",
  "timestamp": "2026-02-24T20:00:00.000Z"
}
```

---

## 🧪 Testing
```bash
# Ejecutar tests (cuando estén implementados)
npm test

# Verificar base de datos
npx prisma studio
```

---

## 🚀 Deployment

### Variables de Entorno en Producción

Asegúrate de configurar todas las variables en tu plataforma de deployment:
```env
DATABASE_URL="mysql://..."
JWT_SECRET="..."
JWT_EXPIRES_IN="7d"
PORT=3000
FRONTEND_URL="https://tu-dominio.com"
TWITCH_CLIENT_ID="..."
TWITCH_CLIENT_SECRET="..."
TMDB_API_KEY="..."
GEMINI_API_KEY="..."
NODE_ENV="production"
```

### Plataformas Recomendadas

- **Railway** - Despliegue automático desde Git
- **Render** - Free tier generoso
- **DigitalOcean** - App Platform
- **Heroku** - Clásico y confiable

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 👤 Autor

**Borja Zorrilla Gracia**

- GitHub: [@BorjaZG](https://github.com/BorjaZG)
- Proyecto: Next Play - Sistema de gestión de backlog con IA

---

## 🙏 Agradecimientos

- [IGDB](https://www.igdb.com/) - API de videojuegos
- [TMDB](https://www.themoviedb.org/) - API de películas y series
- [Google Gemini](https://ai.google.dev/) - IA conversacional
- [Prisma](https://www.prisma.io/) - ORM de próxima generación
- [Express](https://expressjs.com/) - Framework web minimalista

---

<p align="center">
  Hecho con ❤️ y ☕ por Borja Zorrilla
</p>