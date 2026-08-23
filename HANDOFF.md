# HANDOFF — DeckViewWebApp (frontend)

## Estado: COMPLETO (F0–F8) ✅

Repositorio: `/home/jean/WebstormProjects/DeckViewWebApp` (rama `main`, sin gitflow).
Remote: `https://github.com/Jean-AT/DeckViewWebApp.git`.
Backend de referencia: `/home/jean/IdeaProjects/DeckView` (completo y testeado).
Plan de diseño: `/home/jean/IdeaProjects/DeckView/plan-implementacion-frontend.md`.

**Verificación final:** `npm run lint` 0 errores · `npm run typecheck` limpio ·
`npm test` 15/15 · `npm run build` OK (bundle principal 345 kB con code-splitting por ruta).

## Lo implementado

- **F0 Scaffold + design system:** Vite + Tailwind 4, tokens HSL dark-first (`src/index.css`,
  light vía `html.light` + toggle persistido), Space Grotesk + JetBrains Mono, componentes UI
  (`badge, button, card, field, modal, spinner, stat, status-dot, section-header, empty-state, toast`),
  AppShell con top-nav tabs estilo crafter.run.
- **F1 Auth:** login + register públicos (1er registro = ADMIN), refresh single-flight en
  `src/lib/api.ts`, rutas protegidas, roles en `src/lib/auth.tsx`.
- **F2 Dashboard:** stats (proyectos, deploys 24h, success rate, tickets abiertos), área
  "deploys últimos 14 días" + donut éxito/fallo (Recharts), deployments recientes.
- **F3 Proyectos:** grid de cards con brackets + último estado, modal crear/editar
  (providerConfig JSON con hints por proveedor), detalle con tabla de deployments,
  **Sync** (solo ADMIN) y **Trigger** (ADMIN/DEV) con manejo de `SyncResult`, delete.
- **F4 Credenciales (solo ADMIN):** listar masked previews, add/test/rotate/revoke —
  endpoints exactos `/projects/:projectId/credentials[/:provider[/test]]`.
- **F5 Tickets:** lista con filtros (status/priority/project), modal crear, detalle con
  transición de estado, delete (solo ADMIN).
- **F6 Usuarios (solo ADMIN):** CRUD + badges de rol + reset password; protege self-role-change
  y self-delete igual que el backend.
- **F7 Pulido:** empty states, skeletons/spinners, toasts, ErrorBoundary, lazy-loading por ruta,
  responsive (nav mobile), dark/light QA.
- **F8 Calidad:** Vitest (format/cn/badge), ESLint flat config, Dockerfile multi-stage + nginx
  (proxy `/api` → `$BACKEND_URL` + fallback SPA), Jenkinsfile espejo del backend.

## API del backend consumida (base `/api`, Bearer token)

- Auth: `POST /auth/register|login|refresh`, `GET /auth/me`.
- Users (ADMIN): `GET/POST /users`, `GET/PATCH/DELETE /users/:id`, `PATCH /users/:id/password`.
- Projects: `GET/POST /projects`, `GET/PATCH/DELETE /projects/:id`,
  `GET /projects/:id/deployments`, `POST /projects/:id/sync` (ADMIN),
  `POST /projects/:id/trigger` (ADMIN/DEV).
- Credentials (ADMIN): `GET/POST /projects/:pid/credentials`, `PUT/DELETE .../:provider`,
  `POST .../:provider/test`.
- Tickets: `GET/POST /tickets` (filtros status/priority/projectId/assignedTo),
  `GET/PATCH/DELETE /tickets/:id`.
- Audit (ADMIN): `GET /audit-logs` (filtros action/resourceType/userId).

## Decisiones tomadas

- Dark por defecto + toggle (`localStorage['dv_theme'] === 'light'` activa light).
- lucide-react v1.x no trae brand icons → `GitBranch` para GitHub Actions.
- `@hookform/resolvers` + zod v4 para formularios.
- Restos incompatibles de sesión previa eliminados: `auth-pages.tsx`, `ui/form.tsx`,
  `ui/status-dot.tsx` (duplicados); se conservaron `error-boundary.tsx` (integrado en main)
  y `badge.test.tsx`.

## Posibles siguientes pasos

- Webhooks de Jenkins/Vercel ya existen en el backend; el frontend podría mostrar estado
  "live" con polling corto o SSE.
- Auditoría: los filtros actuales son inputs de texto; se podrían poblar selects dinámicos.
- Cobertura de tests de componentes con mocked API (msw).

## Comandos

```bash
npm run dev        # puerto 5173, proxy /api → localhost:3000
npm run build      # tsc -b && vite build
npm run lint
npm run typecheck
npm test
```