# Next Play

Plataforma social de gestión de backlog de entretenimiento: juegos, series, películas y anime.

## Stack

- **Frontend** — React 19 + Vite + Tailwind CSS (puerto 5173)
- **Backend** — Node.js + Express + Prisma ORM (puerto 3000)
- **Base de datos** — MariaDB
- **APIs externas** — IGDB (juegos), TMDB (series/películas/anime), Google Gemini (IA)

## Requisitos previos

- Node.js 20+
- MariaDB 10.x corriendo en local

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/BorjaZG/next-play.git
cd next-play
```

### 2. Configurar el backend

```bash
cd backend
npm install
```

Crea el archivo `backend/.env`:

```env
DATABASE_URL="mysql://usuario:password@localhost:3306/nextplay"
JWT_SECRET="cambia_esto_por_una_cadena_aleatoria_larga"
JWT_EXPIRES_IN="7d"
PORT=3000
FRONTEND_URL="http://localhost:5173"
TWITCH_CLIENT_ID="..."
TWITCH_CLIENT_SECRET="..."
TMDB_API_KEY="..."
GEMINI_API_KEY="..."
```

Crea la base de datos y ejecuta las migraciones:

```bash
mysql -u root -p -e "CREATE DATABASE nextplay CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
npx prisma migrate deploy
npx prisma generate
```

### 3. Configurar el frontend

```bash
cd ../frontend
npm install
```

Crea el archivo `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

## Arrancar en desarrollo

Abre dos terminales:

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

La app estará disponible en **http://localhost:5173**

## Obtener API Keys

| Servicio | Dónde obtenerla |
|---|---|
| IGDB (juegos) | [dev.twitch.tv](https://dev.twitch.tv/) — registra una app y obtén Client ID + Secret |
| TMDB (películas/series) | [themoviedb.org](https://www.themoviedb.org/settings/api) — solicita API Key v3 |
| Google Gemini (IA) | [aistudio.google.com](https://aistudio.google.com/app/apikey) — crea una API Key |

## Estructura del proyecto

```
next-play/
├── backend/          # API REST (Node.js + Express)
│   ├── prisma/       # Schema y migraciones de BD
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── services/ # IGDB, TMDB, Gemini
│       └── middleware/
└── frontend/         # SPA (React + Vite)
    └── src/
        ├── pages/
        ├── components/
        ├── store/    # Zustand
        └── services/ # Axios wrappers
```

## Autor

**Borja Zorrilla Gracia** — TFG DAM 2026
