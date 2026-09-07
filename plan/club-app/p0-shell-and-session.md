---
status: shipped
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
within `ReuseGraceWindow` (30 s) is a plain 401, but **after** it revokes every live token in the
presented token's **family** (`RefreshTokenService.RevokeLiveFamilyAsync`). A family is the chain
one login started, so in practice that is one browser profile, not the Account's other devices.
Simultaneous refreshes are absorbed by the grace window; the real hazard is a **stale tab**
waking later with a cached token. Reading the token from storage inside the lock — never from a
captured variable — removes it: the losing tab finds the fresh token and skips its own refresh
entirely.

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

## As-built (CA-P0, 2026-09-07)

Built as the seven planned slices plus six follow-up commits (four fixes and one refactor
from review, one adding the helper tests review found missing). Final gates green from `web/`:
lint, typecheck, **674 tests** (19 ui + 153 club-app + 502 website), build. The plan held. The
decisions, deviations and traps worth carrying forward:

- **The plan and ADR-0006 were wrong about reuse detection, and both are corrected.** They said
  presenting a rotated refresh token after the grace window "revokes every session for the
  Account, on every device". `RefreshTokenService.RotateAsync` calls
  `RevokeLiveFamilyAsync(presented.FamilyId, …)`, which updates only rows with that `FamilyId`,
  and `IssueAsync` mints a **new** family per login. A family is therefore the rotation chain one
  login started: in practice one browser profile. Every other device keeps its own family and
  stays signed in. No UI copy ever claimed otherwise, so nothing user-facing changed. The
  Session section above and ADR-0006 now describe the code. (The plan's "**ADR-0005 needs an
  amendment**" line is also stale: the amendment landed in `06e2444`, before slice 1.)
- **The session store is a module-level singleton, and its first snapshot is computed
  synchronously at module evaluation.** `lib/api/session/session-store.ts` keeps `accessToken`,
  `accessTokenReceivedAtTicks`, `accessTokenLifetimeMs` and the storage port outside React, and
  publishes an immutable `SessionSnapshot { status, expired }` through `getSessionSnapshot` /
  `subscribeToSession` (`useSyncExternalStore`). The initial snapshot comes from
  `resolveStoredStatus()`, which reads the port at import time, because both route guards run in
  `beforeLoad`, before anything mounts: a snapshot that started `anonymous` and only became
  `restoring` in an effect would bounce every reload of a signed-in member through `/login`
  first. `subscribeToSessionEnd` is a second, separate channel for teardown that must not
  re-render.
- **A fourth session status shipped: `unavailable`, with its own `BootFailure` screen.**
  `decisions.md` pinned three. A boot refresh that fails **without** a 401 (server down,
  `RequestBlockedError`, the 15 s timeout) is not evidence that the session is over, and treating
  it as `anonymous` would clear a refresh token still valid for up to 30 days and demand a
  password over a transient outage. `restoreSession` therefore keeps the stored token and
  publishes `unavailable`; `SessionBoot` renders `BootFailure` (`KkBrandStage` + `KkAlert` +
  `Erneut versuchen`, copy `Die Verbindung zum Server ist fehlgeschlagen. Deine Anmeldung bleibt
  erhalten.`) whose retry calls `restoreSession` again. At boot, only a 401 ends the session.
  **This deviates from `decisions.md` deliberately, recorded here, not silent.**
- **A 401 is terminal in three places, not one.** `apiFetch` maps status 401 to
  `UnauthorizedError`; `withFreshAccessToken` and `refreshThroughLock` end the session when they
  see it; and `shouldRetryRequest` (`lib/api/retry-policy.ts`), wired as React Query's `retry`,
  returns `false` for it while retrying `RequestBlockedError` and 5xx exactly once. Without the
  third, Query's default policy would fire three more authenticated requests after the session
  had already been declared dead, each one a fresh 401.
- **Every session end clears the React Query cache.** `lib/query-client.ts` subscribes to
  `subscribeToSessionEnd` and calls `queryClient.clear()`. Without it the `['auth', 'me']` entry
  outlives sign-out, and on a shared machine the next person sees the previous member's name and
  e-mail rendered from cache before their own request returns. The clear used to sit in
  `useSignOut`, which meant a terminal 401 left the cache standing; on the store's end channel it
  covers every way a session dies. `finishSession` fires those listeners only when a session
  actually existed, so a repeated end is silent.
- **Cross-tab propagation is a `BroadcastChannel`, with a `storage` listener only as a
  fallback.** `session-broadcast.ts` posts `{ expired }` on `furria-club-app-session` whenever a
  session ends, and every tab's store adopts it through `finishSession` (never `endSession`, so
  the message cannot echo). The trap: **a `storage` event never fires in the tab that wrote it**,
  so `localStorage` alone can be a receive path but never a send path, and it carries no reason
  for the end. It is used only where `BroadcastChannel` is missing, and then only for the key
  being removed. The message body is parsed with `SessionEndMessageSchema` (a Zod
  `.catch({ expired: false })`) rather than trusted, because anything on the origin can post to
  a named channel.
- **The storage port writes and reads back, and a failed write ends the session on the spot.**
  `writeRefreshToken` returns a boolean (`writeStoredToken` re-reads the key it just set), and
  `adoptTokens` ends the session and throws `SessionPersistenceError` when it is `false`. A
  swallowed write was the one client bug that could revoke a token family **server-side**: the
  rotated token would be lost while the superseded one stayed in storage, and the next boot would
  present an already-rotated token well past the 30 s grace window, which is precisely what reuse
  detection revokes a family for. Failing loudly costs one re-login; failing quietly costs the
  family. Safari private mode and a full quota make this a real path, not a theoretical one.
- **The login route's search schema must round-trip through itself, and the first one did not.**
  Review found *every* visit to `/login` landing in the error boundary: `expired` was parsed by a
  `.transform()` into a boolean, so an absent parameter produced `false`, TanStack Router
  re-serialised the validated object and fed it back to `validateSearch`, and `false` matched
  none of the input union's members. The rule now is that the schema's output is always valid
  input: `expired` is the literal `1` (`EXPIRED_FLAG`) or absent, `returnTo` is normalised
  through `toReturnToParam`, and both end in `.catch(undefined).optional()` so an unparseable
  parameter degrades to absent instead of throwing. `buildLoginSearch` is the only writer and
  produces exactly what the schema accepts.
- **`returnTo` drops any target pointing at `/login`, and sign-out no longer navigates itself.**
  The guard builds its search from `location.href`, so before the fix each bounce off `/login`
  embedded the previous URL and the parameter grew without bound. `toReturnToParam` returns
  `undefined` when the sanitised path's pathname is `LOGIN_PATH`. `useSignOut` now only ends the
  session and lets `_app`'s guard perform the single redirect; its own `navigate` used to race
  the guard and produce the same nesting from the other side.
- **The access-token countdown reads both clocks and counts the LARGER elapsed time, because
  either clock alone silently loses the session.** `adoptTokens` stamps the receipt twice, on
  `Date.now()` (`accessTokenReceivedAtMs`) and on `performance.now()`
  (`accessTokenReceivedAtTicks`), and the pure `resolveElapsedLifetime`
  (`lib/api/session/session-lifetime.ts`) returns `Math.max(0, wallClockElapsed,
  monotonicElapsed)`. Both hazards end identically: the store believes a dead token is fresh,
  sends it, takes a 401, and since **a 401 is terminal** it deletes a refresh token still valid
  for up to 30 days and demands a password. The monotonic hazard is the one that actually
  shipped and was caught in the CA-P0 regression audit: **`performance.now()` does not advance
  while a macOS or iOS host is suspended.** Chromium and WebKit base it on `mach_absolute_time`,
  and 783 hours of suspend measured as invisible to it on the build machine. A lid closed longer
  than the 15 min access-token lifetime therefore leaves a monotonic-only countdown at a few
  seconds. Worse, no user action is needed to trigger it: React Query's `refetchOnReconnect`
  defaults to `true`, so waking the machine fires the request itself, and the resulting session
  end broadcasts a sign-out to every other tab. `Date.now()` alone carries the mirrored hazard:
  a backward clock correction makes the elapsed time look *smaller* than it was, with the same
  ending. A suspended host inflates the wall-clock reading, a backward correction leaves the
  monotonic reading intact, so the maximum catches both, and the error stays one-sided by
  design: too large an elapsed time refreshes early and costs one request, too small forces a
  re-login. Both readings remain differences taken on **one** clock against **its own** earlier
  stamp, so the standing ban on comparing the server's `accessTokenExpiresAt` to the device
  clock is untouched. The cap and the floor stay: `captureRemainingLifetime` clamps the captured
  lifetime to `MAX_TRUSTED_LIFETIME_MS` (15 min, the server's own access-token lifetime) so a
  device clock hours fast degrades to an early refresh rather than a token believed valid
  forever, and `isAccessTokenStale` still requires `MIN_REFRESH_INTERVAL_MS` (60 s) of elapsed
  time so a permanently-stale token cannot refresh on every single request. The decision lives
  in a pure function precisely so the four branches (suspend, backward correction, forward jump,
  both clocks agreeing) are covered by literal fixtures in `session-lifetime.test.ts`; the store
  wiring around it is not testable under the repo's rules.
- **Two clock hazards survive the maximum, both accepted deliberately.** A suspend and a
  backward wall-clock correction landing in the *same* wake window make both readings
  under-report at once, and a maximum of two sources has no third to fall back on: the store
  then sends a dead token, takes the terminal 401 and destroys a refresh token still valid for
  weeks. Closing it needs a time source neither suspend nor an NTP step can move, which the
  platform does not offer, so the residue is one forced re-login in a compound scenario, never
  data loss. Separately, `MIN_REFRESH_INTERVAL_MS` is measured on the same maximum, so a wall
  clock stepping repeatedly forward satisfies the 60 s floor immediately and the client rotates
  more often than intended. Measuring the floor on the monotonic clock alone would fix that and
  reintroduce the worse bug, because a suspended host freezes that clock and the floor would
  then block the very post-wake refresh this accounting exists to trigger. The extra rotations
  are harmless: each presents the newest stored token, so server-side reuse detection never
  fires.
- **The refresh lock may decline to refresh at all, and degrades where `navigator.locks` is
  absent.** Inside the lock the store re-reads the token; if it changed while waiting **and** the
  in-memory access token is still fresh, it returns that token and performs no request. If no
  token is stored any more, it ends the session as expired. Where `navigator.locks` is missing
  (`withRefreshLock`) the call falls back to an in-tab promise dedupe rather than refreshing
  unguarded, which is weaker than the lock but never worse than no serialisation at all.
- **The guardrail plugin is a floor, not a proof, and its largest hole is the hoisted style
  object.** `web/biome-plugins/noDesignSx.grit` matches syntax, never values, so
  `const styles = { color: 'red' }` plus `sx={styles}` passes: catching it needs the scope or
  type resolution a GritQL matcher does not have. Same for a value behind a variable or a call,
  colour spellings outside the plugin's list (`lab()`, `var(--brand)`), and any design prop on a
  `Kk*` component other than `color`/`bgcolor`. The full list is in
  `web/biome-plugins/README.md` → "Known bypasses"; the real guarantee is that `@furria/ui`
  exposes no raw design prop. Review hardened what *is* syntactic: an object property literally
  named `sx` anywhere (so `slotProps={{ root: { sx: … } }}` is reached), template literals and
  colour functions and bare colour names in the value regex, and a rule on the `color` and
  `bgcolor` JSX attributes, which `pnpm typecheck` does not reject because `color` is a legacy
  HTML attribute.
- **Homes a later phase needs:** `apiFetch` / `buildApiUrl` (`lib/api/api-fetch.ts`);
  `RequestBlockedError` / `UnauthorizedError` / `ServerFailureError` (`lib/api/api-error.ts`);
  `shouldRetryRequest` (`lib/api/retry-policy.ts`); `getSessionSnapshot`, `subscribeToSession`,
  `subscribeToSessionEnd`, `setSessionStoragePort`, `hasStoredSession`, `ensureFreshAccessToken`,
  `withFreshAccessToken`, `signIn`, `signOut`, `restoreSession`
  (`lib/api/session/session-store.ts`); `SessionStoragePort` +
  `createLocalStorageSessionStoragePort` (`lib/api/session/session-storage-port.ts`, the
  Capacitor swap point); `sanitizeReturnTo`, `toReturnToParam`, `LOGIN_PATH`
  (`lib/return-to.ts`); `sessionAt` (`lib/club.ts`, duplicated from the website); `useMeQuery`,
  `AppShell`, `SessionBoot`, `useSessionSnapshot` (`features/session`); `buildLoginSearch`,
  `LoginSearchSchema`, `EXPIRED_FLAG` (`features/login`). In `@furria/ui`: `KkText`,
  `KkHeading`, `KkButton`, `KkTextField`, `KkAlert`, `KkIcon`, `KkIconButton`, `KkAvatar`,
  `KkBrandLockup`, `KkThemeColorMeta`, the `KkSx` type, and the `KkBrandStage`, `KkSplitLayout`
  and `KkAppShell` kits.
- **Outstanding:** the session layer's wiring carries no automated test by rule
  ([docs/web/TESTING.md](../../docs/web/TESTING.md) allows pure functions only), so the Web Locks
  orchestration, the boot states, the route guards, the cross-tab channel and the login form are
  covered only by the pure helpers underneath them. Nothing in CI exercises the deploy chain
  either: the club-app image, the nginx `/api` proxy and the split CD paths-filter are verified
  by the first real deploy, not by `pnpm build`. And until B5 there is still exactly one Account,
  so the shared-machine and multi-device paths were reasoned about rather than walked.

---

## Out of scope, deliberately

Any domain feature (all of B2–B12) · invitation redemption and password reset flows (B5) ·
permission-gated nav beyond "authenticated" (B4) · the animated splash (Capacitor) ·
the Club-App master plan · Capacitor itself.
