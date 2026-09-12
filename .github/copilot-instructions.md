# DeckView WebApp instructions

## Project scope

- This repository is the React frontend for DeckView.
- The backend lives in `Jean-AT/DeckView` and must be available for authenticated or data-backed UI work.
- Keep frontend changes in this repository; do not edit the backend repository from this workspace.

## Local configuration

- Development frontend: `http://localhost:5173`
- Docker frontend: `http://localhost:8080`
- Backend API: `http://localhost:3000`
- Backend health endpoint: `http://localhost:3000/health`
- Vite proxies `/api` and `/health` to the backend during development.
- Docker Compose uses PostgreSQL internally at `postgres:5432`, exposes it on host port `5433`, and uses Redis on host port `6379`.
- Do not change `VITE_API_URL` away from `/api` for Docker builds.
- If ports `3000` or `5433` are occupied, stop only the conflicting service after confirming it is unrelated to DeckView. Do not remove volumes or delete containers belonging to another project without explicit approval.

## Required validation

For frontend code changes, run the smallest applicable checks:

```bash
npm run typecheck
npm test -- --run
```

Run `npm run lint` and `npm run build` when changing shared components, routing, configuration, or build behavior.

For UI changes, use Playwright when available:

- Check the relevant route at desktop and mobile widths.
- Check the browser console for errors.
- Check network requests for failed `/api` calls.
- Check keyboard focus and accessible names for interactive controls.
- Do not claim authenticated-page validation unless the backend is healthy and a real test account can log in.

## Authentication and authorization

- The backend refresh endpoint returns refreshed tokens; restore the user with `/api/auth/me` after refresh.
- Keep access and refresh tokens in the existing token helpers. Do not introduce a second token store.
- Respect roles: `ADMIN`, `DEVELOPER`, and `VIEWER`.
- Admin-only routes must remain protected by the existing route guard.
- Use test accounts only for local validation; never commit credentials, tokens, or production data.

## UI and accessibility

- Follow the existing dark-first design, Tailwind conventions, Space Grotesk display font, and JetBrains Mono utility font.
- Use semantic HTML and existing UI primitives before adding new patterns.
- Icon-only buttons need an accessible label.
- Form controls need associated labels, meaningful `name`, correct `type`, and `autocomplete`.
- Preserve visible `focus-visible` states.
- Use `aria-live="polite"` for asynchronous status and toast updates.
- Use `Intl.DateTimeFormat` and `Intl.NumberFormat` for displayed dates and numbers.
- Keep destructive actions behind confirmation or undo.

## Git and pull requests

- Work on a feature branch; do not modify `main` directly.
- Keep changes surgical and avoid unrelated refactors.
- Include this trailer on commits:

```text
Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>
```

- Before creating or updating a pull request, ensure tests and typechecking pass.
- Agent Merge owns the final merge once the pull request is approved, checks are green, and the branch is mergeable. Do not merge it manually when Agent Merge is enabled.
