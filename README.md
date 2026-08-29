# DeckViewWebApp

Frontend del dashboard DevOps interno **DeckView**. Centraliza proyectos, deploys y tickets de Jenkins, Vercel, GitHub Actions, AWS y Firebase.

Diseño dark-first inspirado en [crafter.run](https://crafter.run/en) (Space Grotesk + JetBrains Mono).

El backend vive en [Jean-AT/DeckView](https://github.com/Jean-AT/DeckView) y tiene que estar corriendo para que la API responda.

![Dashboard](docs/screenshots/dashboard.png)

## Capturas

| Login | Proyectos |
|---|---|
| ![Login](docs/screenshots/login.png) | ![Projects](docs/screenshots/projects.png) |

| Tickets | Detalle de proyecto |
|---|---|
| ![Tickets](docs/screenshots/tickets.png) | ![Project detail](docs/screenshots/project-detail.png) |

## Qué incluye

- **Auth** — login / registro. El primer usuario del backend queda como ADMIN.
- **Dashboard** — proyectos, deploys 24h, success rate, tickets abiertos y gráficos.
- **Projects** — CRUD, historial de deployments, sync (ADMIN) y credenciales enmascaradas.
- **Tickets** — incidencias (los deploys fallidos las crean solos), filtros y transiciones.
- **Users / Audit** — solo ADMIN: roles y bitácora de mutaciones.

Roles: `ADMIN` · `DEVELOPER` · `VIEWER`.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS 4 · TanStack Query · React Router · Recharts

## Requisitos

- [Docker](https://docs.docker.com/get-docker/) y Docker Compose
- Backend DeckView en `http://localhost:3000` ([repo](https://github.com/Jean-AT/DeckView))

## Arranque con Docker

En cualquier máquina local:

```bash
git clone https://github.com/Jean-AT/DeckViewWebApp.git
cd DeckViewWebApp
docker compose up --build
```

Frontend: [http://localhost:8080](http://localhost:8080)

Nginx sirve el SPA y proxy-ea `/api` y `/health` al backend del host (`host.docker.internal:3000`). No hace falta `VITE_API_URL` en Docker.

Si el backend está en otra URL o puerto:

```bash
BACKEND_URL=http://host.docker.internal:3000 PORT=8080 docker compose up --build
```

Copia `.env.example` a `.env` si quieres dejar esas variables fijas.

```bash
docker compose down
```

## Desarrollo (sin Docker)

El backend tiene que estar en `localhost:3000`. Vite proxy-ea `/api` hacia ahí.

```bash
cp .env.example .env
npm install
npm run dev          # http://localhost:5173
```

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | `tsc -b` + build de producción (`dist/`) |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |

## Variables

| Variable | Dónde | Default | Para qué |
|---|---|---|---|
| `VITE_API_URL` | Vite (build / dev) | `/api` | Base de la API en el browser |
| `BACKEND_URL` | Docker / Nginx | `http://host.docker.internal:3000` | Destino del proxy `/api` (sin barra final) |
| `PORT` | Docker Compose | `8080` | Puerto del frontend en el host |

`VITE_*` se hornea en el build. En Docker no la cambies: el browser habla con `/api` y Nginx reenvía al backend.

## Estructura

```
src/
  components/ui/      badge, button, card, field, modal, spinner, stat, toast…
  components/layout/  AppShell (nav, tema, usuario)
  features/           auth, dashboard, projects, tickets, users, audit
  queries/            hooks TanStack Query
  lib/                api client, auth, tokens, format, meta
```
