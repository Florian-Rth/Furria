# REFACTOR-PLAN — Right-size the setup before feature work

Outcome of the architecture review (2026-07-17). Agreed scope: backend test-harness honesty,
backend service doctrine, frontend app shell, frontend ceremony flattening. The shared API
client (review candidate #4) is deferred until a second API consumer exists.

Guiding rule: **everything in the repo has a caller.** Aspirational designs live in docs,
clearly marked as planned — not as dead code or analyzer messages pointing at phantom types.

## A — Backend: test harness honesty

- **A1. Delete zero-caller infrastructure**: `Tests.Common/Polling.cs`,
  `Tests.Common/Builder/AliasRegistry.cs`, `Tests.Common/SeedsAliasesAttribute.cs`.
  Each returns together with its first caller; the reference implementations stay in git
  history and their contracts stay specced in TESTING.md (planned section).
- **A2. Remove MET007 (`DanglingAliasAnalyzer`) + its tests.** It polices
  `IdOf`/`ClientFor`/`NameOf` calls that exist nowhere and depends on the deleted
  `[SeedsAliases]` attribute. It is restored in the same commit that builds the
  `TestContextBuilder`. Update `AnalyzerReleases.*.md` accordingly.
- **A3. Reword MET005's message** so it stops naming the unbuilt `TestContextBuilder`
  (e.g. "…seed and assert through the Tests.Common harness, never a DbContext").
- **A4. Keep `DatabaseResetService` + fixture wiring unchanged** — it is deep, correct, and a
  guarded no-op until the first entity lands. Keep MET001–MET006: they enforce rules that
  bind from day one.
- **A5. Rewrite `docs/server/TESTING.md`** into two explicit parts:
  - *Built today*: fixture, container, reset wiring, MET001–006, and a real example in the
    current shape (`UnlockPreviewTests` style, no builder).
  - *Planned — build with the first entity*: `TestContextBuilder`, `Expected` DSL,
    `JwtMinter`, `FakeMessageBus`, `Polling`, MET007. The current top-of-file example test
    moves here, clearly labeled as target design.
- **A6. Kill stringly-typed config drift**: expose the connection-string name as a constant
  (e.g. `AppDbConnection.Name` in Infrastructure) and the `PreviewAccess` section name as a
  constant on `PreviewAccessOptions`; use both in production DI **and** in
  `ApiTestFixture.ConfigureWebHost` so a rename can't silently split the two sides.

## B — Backend: service doctrine

- **B1. Delete `IPreviewAccessService`.** Register and inject the sealed
  `PreviewAccessService` directly (`UnlockPreview`, `ServiceCollectionExtensions`, the unit
  test already uses the concrete class). Under ADR-0001 (no mocks) a one-implementation
  interface buys nothing — it is pure indirection.
- **B2. Update the `backend-work` skill**: replace the `I<Entity>Service` interface
  convention with — services are sealed concrete classes, injected directly; introduce an
  interface only when a genuine second implementation exists, never for mocking.

## C — Frontend: app shell

- **C1. `PageLayout` in `@furria/ui`** — compound component: root (`Container maxWidth="md"`
  + vertical `Stack`, `py: 8`), `PageLayout.Header`, `PageLayout.Content`. Replaces
  `DevHomeLayout` and `LegalPageLayout` (both deleted); `DevHomePage` and `LegalPage`
  migrate. `TeaserLayout` stays feature-internal — the full-bleed hero with confetti
  clipping is genuinely a different shape, not a `PageLayout` variant.
- **C2. `KkThemeProvider` in `@furria/ui`** — bundles `ThemeProvider theme={kkTheme}` +
  `CssBaseline enableColorScheme`. Used by the app root and every test, so theme/baseline
  config can never drift between app and tests (and later apps get it for free).
- **C3. `renderWithProviders` in `apps/website/src/test/render.tsx`** — wraps
  `KkThemeProvider` + fresh `QueryClient` (mutation retries off) + `PreviewAccessProvider`.
  All four existing component test files migrate to it; per-file provider wrappers die.
- **C4. Give `packages/ui` its own test run** — vitest config + `test` script; move
  `confetti-pieces.test.ts` from the website app into `packages/ui` next to its source.
  Root `pnpm -r test` then covers the package.
- **C5. Route-level test for `/`** — the currently untested orchestration (granted →
  `DevHomePage`; CTA opens dialog) via TanStack Router memory history +
  `renderWithProviders`.
- **C6. Update the `frontend-work` skill**: `renderWithProviders` is the mandatory test
  wrapper; `PageLayout` now actually exists as described.

## D — Frontend: ceremony flattening

- **D1. Delete the four constant-returning content hooks.**
  - `landing`/`dev-home`: copy moves as a module-level const into the page component file
    (ADR-0002: German copy lives directly in components). `landing/types.ts` dies with it.
  - `legal`: content becomes plain exported constants (`impressum-content.ts`,
    `datenschutz-content.ts`); the two routes import the constants instead of calling hooks.
- **D2. Drop per-component `index.tsx` barrels** (5 files re-exporting one symbol). The
  feature `index.ts` imports component files directly. Component folders remain only where
  `internal/` parts exist; `PreviewAccessDialog/` collapses to a single file + test.
- **D3. Co-locate inferred types with their schemas**: `UnlockForm`/`UnlockPreviewResponse`
  move into `schemas.ts` via `z.infer` next to each schema; `PreviewAccessValue` moves next
  to the context in `preview-access-context.ts`; `preview-access/types.ts` is deleted.
  `DevHomeApp` moves next to its only consumer (`AppStatusCard`).
- **D4. Update the `frontend-work` skill**: static copy is plain constants, hooks only where
  logic/state exists; no per-component barrels; inferred types live beside their schemas
  (`types.ts` only for schema-less shared types).

## Deliberately not doing

- Shared API client (#4): one endpoint, one consumer — extract when the second API feature
  lands.
- CORS: dev uses the Vite proxy, production is same-origin — nothing to add.
- `Result<T>` / ProblemDetails: with the first real domain feature.
- club-app/event-app scaffolds + shared Vite preset: when app #2 becomes real.

## Verification

- `server/`: `dotnet build` (warnings-as-errors incl. analyzers), `dotnet test`,
  `dotnet csharpier format .`
- `web/`: `pnpm lint`, `pnpm typecheck`, `pnpm test` (now incl. `packages/ui`), `pnpm build`
- Final pass with `dotnet-code-reviewer` / `react-code-reviewer` agents on the diff.
