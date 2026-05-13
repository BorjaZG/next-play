# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Next Play** is a full-stack backlog manager for games, series, movies, and anime. It features JWT auth, social features (follows), AI chat via Google Gemini, external search via IGDB (games) and TMDB (series/movies/anime), stats, and an achievement system.

## Architecture

Monorepo with two independent apps:

- `backend/` — Node.js + Express REST API (CommonJS), runs on port 3000
- `frontend/` — React 19 + Vite SPA (ESM), runs on port 5173

### Backend (`backend/src/`)

Standard MVC pattern:

- `index.js` — Express entry point, mounts all route prefixes
- `routes/` — Route definitions (thin, delegates to controllers)
- `controllers/` — Business logic
- `services/` — External API clients: `igdb.service.js`, `tmdb.service.js`, `ai.service.js`, `achievement.service.js`
- `middleware/auth.middleware.js` — JWT verification, attaches `req.user`
- `prisma/schema.prisma` — MariaDB schema via Prisma ORM

### Design System

Backloggd-inspired dark theme (`#14181c` bg, `#1c2228` cards, `#2c3440` borders/hover). Cover art in portrait `aspect-[2/3]` grids is the primary display pattern. Stars use green (`#00e054`). Custom CSS classes: `.cover-card` (hover overlay), `.section-title`, `.star-filled`, `.star-empty`. Tailwind custom tokens: `dark-{bg,card,hover,border,elevated}`, `primary-{purple,fuchsia,orange,green}`.

### Frontend (`frontend/src/`)

- `App.jsx` — Router config; public routes: `/`, `/login`, `/register`; all others wrapped in `<PrivateRoute>`
- `pages/` — One file per route/page
- `store/` — Zustand stores: `authStore`, `backlogStore`, `listStore`, `searchStore`, `socialStore`, `chatStore`
- `services/` — Axios wrappers per domain; `api.js` is the shared axios instance with JWT interceptor (reads token from `localStorage`)
- `components/layout/Header.jsx` — Main nav
- `components/common/`, `components/backlog/`, `components/search/` — Shared/domain components

### Auth flow

Backend issues JWT on login/register. Frontend stores token in `localStorage` and attaches it via axios interceptor. On 401, interceptor clears storage and redirects to `/login`.

## Development Commands

### Backend
```bash
cd backend
npm run dev    # nodemon, auto-restarts on changes
npm start      # production
npx prisma studio          # GUI database browser
npx prisma migrate dev     # run/create migrations
npx prisma generate        # regenerate Prisma client after schema changes
```

### Frontend
```bash
cd frontend
npm run dev    # Vite dev server (http://localhost:5173)
npm run build  # production build
npm run lint   # ESLint
npm run preview # preview production build
```

## Environment Variables

Backend requires `backend/.env`:

```env
DATABASE_URL="mysql://user:pass@localhost:3306/nextplay"
JWT_SECRET="..."
JWT_EXPIRES_IN="7d"
PORT=3000
FRONTEND_URL="http://localhost:5173"
TWITCH_CLIENT_ID="..."      # IGDB (games)
TWITCH_CLIENT_SECRET="..."  # IGDB (games)
TMDB_API_KEY="..."          # Movies/series/anime
GEMINI_API_KEY="..."        # Google Gemini AI
```

Frontend can use `frontend/.env` with:
```env
VITE_API_URL=http://localhost:3000
```

## Database

MariaDB via Prisma. Models: `User`, `BacklogItem`, `Review`, `List`, `Follow`, `Achievement`.

- `BacklogItem.contentType`: `game | series | anime | movie`
- `BacklogItem.status`: `pending | playing | completed | abandoned`
- `BacklogItem.priority`: `low | medium | high`
- `List.items`: stored as `Json` (array of `{ backlogItemId, addedAt }`)
- Achievements are checked and created automatically by `achievement.service.js` after relevant mutations

## API Base URLs

All backend routes are prefixed:
`/auth`, `/backlog`, `/reviews`, `/lists`, `/follows`, `/users`, `/search`, `/ai`, `/stats`

Health check: `GET /health`
