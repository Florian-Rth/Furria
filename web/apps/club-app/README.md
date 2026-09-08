# @furria/club-app

The internal member app of the Furrscher Carnevals Club e.V.: member master data, roles (Ämter),
groups, fees and payments, event planning, live show control, drinks kitty, shop, gallery and key
registry. React 19 (Compiler on) + TypeScript + Vite + TanStack Router/Query, themed exclusively
via [`@furria/ui`](../../packages/ui), later wrapped in **Capacitor** for native push, iOS live
activities and home-screen widgets.

```bash
cd web
pnpm install
pnpm dev:club-app     # club-app on http://localhost:3001 (proxies /api → :5100)
```

Start the API first (`cd server && docker compose up -d && dotnet run --project src/Furria.Api`);
nothing renders here without a session. In production the app is served by its own nginx on
`app.furria.de`, which proxies `/api/` to the `api` service, so client and API are always
same-origin and no CORS exists.

Every visible component comes from `@furria/ui` as a `Kk*` part, never from MUI directly
([ADR-0007](../../../docs/adr/0007-furria-ui-owns-every-visible-component.md)); the boundary is
lint-enforced by `apps/club-app/**` overrides in [`web/biome.json`](../../biome.json). The session
model (bearer tokens, refresh token in `localStorage` behind a port, a 401 as terminal) is
[ADR-0006](../../../docs/adr/0006-browser-session-storage-and-401-handling.md).

## Scope

CA-P0 builds the deployable, branded, authenticated shell and no domain feature: login, boot
state, route guard, the `/auth/me` overview, logout, plus the deploy chain. See
[`plan/club-app/p0-shell-and-session.md`](../../../plan/club-app/p0-shell-and-session.md). Test
rules are [`docs/web/TESTING.md`](../../../docs/web/TESTING.md): pure functions only.
