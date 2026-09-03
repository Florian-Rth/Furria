---
status: ready
phase: CA-P0
pulls: B1 (identity foundation)
---

# CA-P0 — Shell & Session

The Club-App's first phase: a deployable, branded, authenticated shell. It consumes exactly
one backend slice — [B1](../server/identity-foundation.md) — and adds no domain feature.

This file covers **only CA-P0**. The Club-App master plan is deliberately not written yet;
the backend inventory it would sequence lives in [plan/server/master-plan.md](../server/master-plan.md).

---

## Why this first

The website could ship fully static. The Club-App cannot: nothing renders before a session
exists. B1 is also the only backend slice that exists, so CA-P0 both consumes it and validates
it end-to-end from a real client instead of from integration tests alone.

**Consequence to keep in view:** until B5 (Einladung & Onboarding) ships there is no way to
create a second Account. CA-P0 delivers an app that only the bootstrap admin can log into.
That is expected, not a defect.

---

## Decisions pinned (2026-09-04 grilling)

### Deployment

**Own host, own nginx.** `app.furria.de` serves the SPA and proxies `/api/` to the `api`
service, mirroring the website's `deploy/default.conf.template`. Same-origin per app: no CORS,
first-party cookies remain possible even though we do not use them.

**The full deploy chain ships in this phase** — Dockerfile, nginx template, runtime-config
entrypoint, a `club-app` service in `docker-compose.example.yml`, and a CD job pushing
`furria-club-app`. The `cd.yml` paths-filter `web: web/**` **must** be split into `website` and
`club-app` filters regardless of scope: today a club-app-only commit would rebuild and redeploy
the shipped website image.

### Session

Bound by [ADR-0005](../../docs/adr/0005-auth-aspnet-identity-bearer-tokens.md) — bearer tokens,
never cookies, because three first-party SPAs plus a Capacitor shell make cookie auth fragile.

**Access token in memory, refresh token in `localStorage` behind a port.** ADR-0005 says
"tokens live in memory with the refresh flow recovering the session", which cannot hold for both
tokens — a reload would destroy the very token meant to recover the session. The port has one
implementation today; the Capacitor build swaps it for native secure storage. **ADR-0005 needs
an amendment recording this.**

**No "Angemeldet bleiben" toggle.** One storage behaviour, one auth path to test. Logout is the
explicit exit and already revokes server-side.

**A 401 is terminal.** It never triggers a refresh and is never retried. Clear both tokens, go
to login. Therefore the client must *prevent* expiry rather than discover it:

- **Boot:** a stored refresh token triggers one refresh before the app renders.
- **Before each request:** if the access token's remaining lifetime is under the margin, refresh
  through the lock first.
- **Any 401 from a normal request:** terminal — logout.

**Never compare the server's `accessTokenExpiresAt` to the device clock.** Under "401 = logout"
a phone running two minutes slow would produce an instant, unexplainable logout. Capture the
remaining lifetime at the moment of receipt (`expiresAt − Date.now()`) and count it down
locally, so a constant skew cancels on both sides of the subtraction.

**Cross-tab refresh uses `navigator.locks` and always re-reads storage inside the lock.** B1
rotates refresh tokens with family-based reuse detection: presenting an already-rotated token
within `ReuseGraceWindow` (30 s) is a plain 401, but **after** it revokes every session for the
Account, on every device. Simultaneous refreshes are absorbed by the grace window; the real
hazard is a **stale tab** waking later with a cached token. Reading the token from storage
inside the lock — never from a captured variable — removes it: the losing tab finds the fresh
token and skips its own refresh entirely.

### Code boundaries

**The Club-App gets its own API client** in `src/lib/api`, with the auth layer. The website's
stays untouched: it is anonymous-only and must not be able to break on auth work. ~40 lines of
`buildApiUrl` / error plumbing are duplicated deliberately.

**`@furria/ui` exports Furria components, never MUI-named ones.** The lib grows our own
vocabulary (`Kk*`) — some substantial, some a thin well-styled MUI component. `theme.components.Mui*`
keys stay as MUI's config API; that is a config key, not an exported component.

**Guardrails are machine-enforced, not reviewed.** Scoped to `apps/club-app/**` in `biome.json`
so the shipped website is untouched:

- `noRestrictedImports` bans every `@mui/material/*` import except `Stack`, `Grid` and `Box` —
  layout primitives carry no Furria pixels, and the `/frontend-work` rules that mandate them
  keep working unchanged.
- A Grit plugin (alongside the four in `web/biome-plugins/`) bans design-bearing `sx` keys —
  `color`, `backgroundColor`, `font*`, `borderRadius`, `boxShadow`, `border*` — and raw hex or
  px literals. Layout `sx` (`m*`, `p*`, `gap`, `width`, `alignItems`, `justifyContent`) stays free.

The point is structural: a page that needs a styled thing cannot inline it, so it must exist in
`@furria/ui`, so every page gets the same one. UI drift becomes impossible rather than discouraged.

### Product surface

**No placeholders.** The nav carries only routes that exist. It grows one entry per later phase.
The thirteen domains in the design handoff are not pre-rendered as dead pages.

**Login works fully. The other two entry points ship as disabled buttons** — "Einladungs-Code
einlösen" and "Passwort vergessen?" are visible so the screen's final shape is right, and
disabled because neither backend exists. No form is built against an endpoint whose contract
B5 has not pinned.

**A branded boot state, not a splash sequence.** It is shown for exactly as long as the
bootstrap refresh takes — no minimum duration, no animation, on a tool people open many times
a day. The mock's animated sequence is deferred to the Capacitor shell, where a native splash
slot exists and cold starts are genuinely slow.

---

## The login mock

Copied to [`docs/design/app-login/`](../../docs/design/app-login/) as a per-page bundle
(`preview.html` + `src/`). It carries three directions — A *Bühne*, B *Mitgliedsausweis*,
C *Plakat* — but `preview.html` renders only **A** plus its desktop split-screen.

**It is inspiration, not a target.** It was authored without knowledge of the design system or
of the decisions above. The screen is built from `kkTokens`/`kkTheme` and `Kk*` components from
the ground up; the mock contributes layout ideas only.

**Contradictions in it that must not reach the codebase:**

| Mock | Ruling |
|---|---|
| `"Benutzername oder E-Mail"`, value `m.schulz` | **Email only.** ADR-0005 dropped `account.username`; B1 ships `LoginRequest { Email, Password }` with an `EmailAddress()` validator |
| `HELAU` (direction B footer) | The Narrenruf is **"Gross - Furria!"** — `CONTEXT.md` is explicit that Helau/Alaaf are local heresy |
| `SEIT 1963`, `Nº 128` | The club is est. **1971**; sessions are numbered from it, so 2026/27 is Session **Nº 56** |
| `Angemeldet bleiben` toggle | Dropped — see Session decisions |

A `README.md` recording this belongs in the bundle, per the convention the other bundles follow.

---

## Slices

Each is a commit; each leaves the app working.

1. **Scaffold** — `@furria/club-app` package, Vite (port 3001, `/api` proxy to :5100), tsconfig,
   TanStack Router + Query, `@furria/ui` wired, vitest on `environment: 'node'`.
2. **Guardrails** — `biome.json` overrides scoped to `apps/club-app/**`; the `sx` Grit plugin.
   Lands before any component so nothing is written against the old rules.
3. **Deploy chain** — Dockerfile, `deploy/`, compose service, CD job, paths-filter split.
4. **Session core** — the storage port, lifetime tracking, the Web Locks refresh, the API client.
   This is where the phase's pure functions and therefore its tests live.
5. **UI components** — the `Kk*` parts login and shell need, in `@furria/ui`.
6. **Login page** — form wired to `POST /auth/login`, the two disabled entry points, error states.
7. **Shell & guard** — app shell, boot state, route guard with `returnTo`, the `/auth/me` overview,
   logout wired to `POST /auth/logout`.

---

## Done when

- A member logs in at `app.furria.de`, reloads, and is still logged in.
- Two tabs open for an hour do not log each other out.
- Logging out revokes server-side; the other tab's next request lands on the login screen.
- `pnpm lint typecheck test build` clean; a `@mui/material/Button` import in club-app code
  **fails lint**, and so does `sx={{ color: '#E11D2A' }}`.
- The club-app image builds and serves behind nginx with the `/api` proxy working.
- A club-app commit does not redeploy the website.

---

## Out of scope, deliberately

Any domain feature (all of B2–B12) · invitation redemption and password reset flows (B5) ·
permission-gated nav beyond "authenticated" (B4) · the animated splash (Capacitor) ·
the Club-App master plan · Capacitor itself.
