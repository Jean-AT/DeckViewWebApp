# DeckViewWebApp

Frontend del dashboard DevOps interno **DeckView** — diseño basado en [crafter.run](https://crafter.run/en)
(Space Grotesk + JetBrains Mono, dark-first con tokens HSL, hairline borders, brackets en cards).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4 (tokens shadcn-style propios, dark/light)
- TanStack Query v5 · React Router · react-hook-form + zod
- Recharts (dashboard) · lucide-react

## Desarrollo

```bash
npm install
npm run dev          # http://localhost:5173 (proxy /api → http://localhost:3000)
```

Requiere el backend (`DeckView`) corriendo en `localhost:3000`. El primer usuario registrado
queda como ADMIN.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | `tsc -b` + build de producción (`dist/`) |
| `npm run preview` | Sirve el build localmente |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |

## Estructura

```
src/
  components/ui/      badge, button, card, field, modal, spinner, stat, toast…
  components/layout/  AppShell (top nav tabs + tema + usuario)
  features/           auth, dashboard, projects, tickets, users, audit
  queries/            hooks TanStack Query por entidad
  lib/                api client (refresh single-flight), auth, tokens, format, meta
```

## Producción

`Dockerfile` multi-stage: build con Node → servido por Nginx. Nginx proxy-ea `/api` al backend
(`BACKEND_URL`, default `http://localhost:3000`) y hace fallback SPA a `index.html`.

```bash
docker build -t deckview-webapp .
docker run -p 8080:80 -e BACKEND_URL=http://backend:3000 deckview-webapp
```

## Docs

- `HANDOFF.md` — estado del proyecto y contexto para continuar el desarrollo.
- Plan de diseño completo: repo `DeckView` → `plan-implementacion-frontend.md`.