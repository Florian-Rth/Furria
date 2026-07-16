# SETUP-PLAN — furria repository bootstrap

> **Status: DRAFT — being refined via grill-with-docs.**
> Docs/rules files (CONTEXT.md, ADRs, CLAUDE.md, skills, this plan) are maintained directly.
> Everything below under "Phase 1–3" is **plan only** — implementation starts on explicit go.

## 1. Decisions locked (grilling session 2026-07-16)

| # | Decision | Choice | Recorded in |
|---|----------|--------|-------------|
| 1 | Infra services | **Postgres only** (no TimescaleDB, no RabbitMQ) | this plan, CLAUDE.md |
| 2 | .NET product name | **`Furria`** (`Furria.Core`, `Furria.Api`, …) | this plan |
| 3 | Solution format | **`.slnx`** | this plan |
| 4 | Test-system depth now | **Step 1 only**: analyzers + wiring + Tests.Common drop-ins + `ApiTestFixture` + one trivial endpoint test. JWT/builder/Expected grow with the first real feature | ADR-0001, docs/server/TESTING.md |
| 5 | Web structure | **pnpm workspace**: `apps/*` + `packages/ui`, shared code source-consumed via `workspace:*` (no per-package build) | this plan |
| 6 | club-app / event-app | **README stubs only** — no package.json, nothing to keep green | this plan |
| 7 | Router | **TanStack Router** (file-based, type-safe, pairs with Zod validation) | this plan |
| 8 | i18n | **German-only, no i18n framework** | ADR-0002, frontend-work skill |
| 9 | Storybook | **Never** — removed from frontend-work skill | frontend-work skill |
| 10 | CI | **GitHub Actions from day one** (backend + web jobs) | this plan |
| 11 | Staging dirs | `test-setup/` absorbed into `server/` then deleted; `design-handoff/` → `docs/design/` (done) with mock-usage rules (done) | docs/design/README.md |
| 12 | ADRs | 0001 no-mocks testing, 0002 german-only UI | docs/adr/ |
| 13 | Mitgliedschaftsart | **4 types incl. Passiv** — DBML enum corrected | CONTEXT.md, docs/design/FCC-Schema.txt |
| 14 | Postgres image | **`postgres:18-alpine`** for compose AND Testcontainers | this plan |
| 15 | Dev ports | **API :5100**, route prefix `/api`; Vite (:3000) proxies `/api` → 5100 — no CORS | this plan |
| 16 | Fonts | **Self-hosted via `@fontsource`** (anton + archivo) — GDPR-clean, no Google CDN | this plan |
| 17 | Theme | **ONE theme for all apps** (Corporate Identity) — no per-app variants, radius **14** (club-app value) everywhere; light + dark via MUI colorSchemes | this plan, frontend-work skill |
| 18 | Dependency versions | **pnpm catalog** in pnpm-workspace.yaml — one place to bump, no drift | this plan |
| 19 | Health endpoint | `GET /api/health` → `{ "status": "ok", "version": "<InformationalVersion>" }` | this plan |
| 20 | React stack day one | Compiler ON, TanStack Query now, React Hook Form deferred to first form | this plan |
| 21 | Vitest env | **happy-dom** | this plan |
| 22 | Website v0 | **German teaser landing** (masthead wordmark, two-tone Anton headline, pill button) — proves theme/fonts/router, not the full mock | this plan |

Environment verified: .NET SDK 10.0.109, Node 24.13.0, pnpm 11.13.1, Docker 29.6.1.
Context7 MCP is not connected in this session — library docs via official web docs when needed.

## 2. Open questions

None — all resolved (see §1). Plan awaits explicit go for implementation.

## 3. Target repo tree

```
furria/
├── .github/workflows/ci.yml
├── .gitignore / .gitattributes                  (done)
├── CLAUDE.md / CONTEXT.md / README.md
├── docs/
│   ├── adr/                                     (done: 0001, 0002)
│   ├── design/                                  (done: moved + mock rules)
│   └── server/TESTING.md                        (done)
├── server/
│   ├── Furria.slnx
│   ├── Directory.Build.props                    # TFM net10.0, nullable, warnings=errors, versioning
│   ├── Directory.Packages.props                 # Central Package Management
│   ├── .editorconfig                            # base style + MET006=error
│   ├── .csharpierrc.yaml                        # printWidth 100, LF
│   ├── .config/dotnet-tools.json                # csharpier, dotnet-ef
│   ├── docker-compose.yml                       # postgres only
│   ├── src/
│   │   ├── Directory.Build.targets              # analyzers → every prod project (excl. Analyzers, Tests.Common)
│   │   ├── Furria.Core/                         # domain; zero external deps (empty for now)
│   │   ├── Furria.Application/                  # AddApplication(); refs Core
│   │   ├── Furria.Infrastructure/               # AppDbContext, Npgsql, AddInfrastructure(IConfiguration), Migrations/
│   │   ├── Furria.Api/                          # FastEndpoints host; GetHealth endpoint
│   │   ├── Furria.Tests.Analyzers/              # MET001–007 (copied from kit, renamed)
│   │   └── Furria.Tests.Common/                 # 4 kit drop-ins + ApiTestFixture
│   └── tests/
│       ├── Directory.Build.targets              # analyzers → every test project
│       ├── .editorconfig                        # MET001–007 = error
│       ├── Furria.Tests.Analyzers.Tests/        # 18 kit tests (renamed)
│       └── Furria.Api.Tests/                    # ApiCollection + GetHealthTests
└── web/
    ├── package.json                             # workspace root: dev/build/test/lint/typecheck scripts
    ├── pnpm-workspace.yaml                      # apps/*, packages/* (+ catalog, see Q9)
    ├── biome.json                               # shared lint/format config
    ├── tsconfig.base.json                       # strict shared TS config
    ├── packages/ui/                             # @furria/ui — tokens, createKkTheme, fonts, primitives
    └── apps/
        ├── website/                             # Vite + React 19 + TanStack Router/Query + MUI
        ├── club-app/README.md                   # stub
        └── event-app/README.md                  # stub
```

## 4. Phase 1 — Backend

### 4.1 Projects & references

- `Furria.Core` → (nothing)
- `Furria.Application` → Core; `Microsoft.Extensions.DependencyInjection.Abstractions`
- `Furria.Infrastructure` → Core, Application; EF Core + `Npgsql.EntityFrameworkCore.PostgreSQL` + `Microsoft.Extensions.Configuration.Abstractions`
- `Furria.Api` (Sdk.Web) → Application, Infrastructure; `FastEndpoints`, `Microsoft.EntityFrameworkCore.Design` (PrivateAssets, for `dotnet ef`)
- `Furria.Tests.Common` (in `src/`) → Api; `Microsoft.AspNetCore.Mvc.Testing`, `Testcontainers.PostgreSql`, `Npgsql`, `Microsoft.Extensions.TimeProvider.Testing`, xunit fixture abstractions
- `Furria.Tests.Analyzers` (netstandard2.0) → `Microsoft.CodeAnalysis.CSharp`
- `Furria.Api.Tests` → Tests.Common, Api; `xunit.v3`, `Microsoft.NET.Test.Sdk`, `FastEndpoints.Testing`
- `Furria.Tests.Analyzers.Tests` → Analyzers (as plain library); kit csproj as-is

### 4.2 Central package versions (researched on NuGet, 2026-07-16)

| Package | Version |
|---------|---------|
| FastEndpoints / FastEndpoints.Testing | 8.2.0 |
| Microsoft.EntityFrameworkCore (+ .Design) | 10.0.10 |
| Npgsql.EntityFrameworkCore.PostgreSQL / Npgsql | 10.0.3 |
| Microsoft.AspNetCore.Mvc.Testing | 10.0.10 |
| Testcontainers.PostgreSql | 4.13.0 |
| Microsoft.Extensions.TimeProvider.Testing | 10.8.0 |
| Microsoft.Extensions.{DependencyInjection,Configuration}.Abstractions | 10.0.10 |
| Microsoft.CodeAnalysis.CSharp | 4.14.0 (kit pin) |
| xunit.v3 | 3.2.2 (kit pin) |
| Microsoft.NET.Test.Sdk | 18.0.1 (kit pin) |
| coverlet.collector / Microsoft.Testing.Extensions.CodeCoverage | 6.0.4 / 17.14.2 (kit pins) |
| CSharpier (dotnet tool) | 1.3.0 |

### 4.3 Kit absorption (rename `MyProduct` → `Furria`)

- `test-setup/analyzers/` → `server/src/Furria.Tests.Analyzers/`
- `test-setup/analyzer-tests/` → `server/tests/Furria.Tests.Analyzers.Tests/`
- `test-setup/common/*` (4 files) → `server/src/Furria.Tests.Common/`
- `test-setup/wiring/root.Directory.Build.props` → merged into `server/Directory.Build.props` (+ versioning block)
- `test-setup/wiring/src.Directory.Build.targets` → `server/src/`, `tests.Directory.Build.targets` → `server/tests/`, `tests.editorconfig` → `server/tests/.editorconfig`
- Strip `Version=` attributes from copied csprojs (CPM), keep `PrivateAssets`
- Afterwards: **delete `test-setup/`**

### 4.4 Production skeleton

- `Program.cs`: `AddApplication()` + `AddInfrastructure(builder.Configuration)` + `AddFastEndpoints()`; `app.UseFastEndpoints(c => c.Endpoints.RoutePrefix = "api")`; trailing `public partial class Program;` for `WebApplicationFactory`.
- `AddInfrastructure`: `AddDbContext<AppDbContext>(UseNpgsql(ConnectionStrings:AppDb))` + `AddSingleton(TimeProvider.System)` (MET006 discipline from day one).
- `AppDbContext`: empty model for now; initial (empty) EF migration so the migration pipeline is real.
- `Endpoints/GetHealth.cs`: `EndpointWithoutRequest<GetHealthResponse>`, route `health`, `AllowAnonymous`, returns `{ "status": "ok", "version": "<InformationalVersion>" }`. No validator needed (no request, no route params).
- `appsettings.json`: `ConnectionStrings:AppDb` → compose Postgres (furria/furria/furria).

### 4.5 Test system — step 1 scope

- `Furria.Tests.Common`: kit drop-ins (`DatabaseResetService`, `AliasRegistry`, `Polling`, `SeedsAliasesAttribute`) + `ApiTestFixture`:
  - one `PostgreSqlContainer` per assembly; `ConfigureWebHost` repoints `ConnectionStrings:AppDb` at the container and replaces `TimeProvider` with `FakeTimeProvider(DateTimeOffset.UtcNow)` (parameterless ctor would start at 2000-01-01!)
  - `InitializeAsync`: start container → `MigrateAsync` → `DatabaseResetService.CreateAsync([db], [])` (no snapshot singletons yet)
  - exposes `ResetDatabaseAsync` (later called by `BuildAsync` when the builder lands in step 3)
- `Furria.Api.Tests`: `[CollectionDefinition("Api")] ApiCollection : ICollectionFixture<ApiTestFixture>` (must live in the **test** assembly) + `GetHealthTests` using FastEndpoints' typed `GETAsync<GetHealth, GetHealthResponse>`.

### 4.6 Implementation notes / risks (learned during dry-run)

- **CPM**: `PackageReference` with inline `Version=` errors (NU1008) — all versions live in `Directory.Packages.props`.
- **xunit.v3 in a classlib**: full `xunit.v3` metapackage turns the project into an executable test host. `Furria.Tests.Common` must reference `xunit.v3.extensibility.core` (3.2.2) for `IAsyncLifetime`/`ICollectionFixture` instead.
- **FastEndpoints 8.x**: `SendOkAsync(...)` may be deprecated in favor of `Send.OkAsync(...)` — with warnings-as-errors this breaks the build; verify against FE 8.2 docs during implementation and update the backend-work skill if the new API is required.
- **`DatabaseResetService` with an empty EF model** builds `TRUNCATE TABLE ;` (invalid SQL) — add a tiny guard (skip truncate when the table list is empty) with a comment; harmless once real entities exist.
- **slnx**: create via `dotnet new sln -n Furria --format slnx`, add projects with `dotnet sln add`.
- **`FakeTimeProvider` assignment** happens in `ConfigureWebHost` before the container is started only if `Services` is touched too early — start the container first in `InitializeAsync`, then build the host.

### 4.7 Acceptance criteria

1. `dotnet build` — zero warnings (warnings are errors).
2. `dotnet test` — 18 analyzer tests + ≥1 integration test green, real Postgres via Testcontainers.
3. `dotnet csharpier format .` — no diff.
4. `docker compose up -d` + `dotnet run --project src/Furria.Api` → `GET /api/health` returns 200.
5. A deliberately mock-using / misnamed / DbContext-touching test fails to **compile** (spot-check the analyzers bite).

## 5. Phase 2 — Web

### 5.1 Workspace

- `pnpm-workspace.yaml`: `apps/*`, `packages/*` + `catalog:` defining every shared dependency version once (react, MUI, zod, vitest, …) — apps reference `"catalog:"`.
- Root `package.json` (private): `dev` → website (port 3000), `build`, `test`, `lint` (Biome), `typecheck` — fanned out via `pnpm -r --filter`.
- Shared `biome.json` + `tsconfig.base.json` (strict: `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, bundler resolution).

### 5.2 `packages/ui` (`@furria/ui`)

Source-consumed (`"exports"` → `.ts` files, no build step). Contents:

- `tokens.ts` — the KK tokens verbatim from the handoff §5 (light + dark), typed `as const`.
- `theme.ts` — **one theme for all apps** (Corporate Identity — no per-app variants). Exported as `kkTheme`, light + dark via MUI CSS-vars `colorSchemes`. Token → MUI mapping:

| KK token | MUI slot |
|----------|----------|
| `bg` / `panel` / `panel2` | `background.default` / `background.paper` / custom via augmentation |
| `ink`, `sub`, `faint` | `text.primary/secondary/disabled` |
| `red` `#E11D2A` (+`redDk`) | `palette.primary` (accent/action only) + `error` |
| `gold` | `warning` (+ decorative use via tokens) |
| `green` / `blue` | `success` / `info` |
| `line` | `divider` |
| Anton | `typography.h1–h6` + display styles |
| Archivo (500–900) | `typography` body/UI, `fontWeightBold: 800` |
| radius **14** (club-app value, everywhere) | `shape.borderRadius` |
| pill buttons (radius 50, weight 800), soft shadows, hairline cards | component overrides: `MuiButton`, `MuiCard`, `MuiChip` |

- `fonts.ts` — side-effect imports of `@fontsource/anton` + `@fontsource/archivo` weights (self-hosted, GDPR).
- Primitives: start with **theme only**; shared components (Chip tones, section header, …) are added when the first consumer needs them — not speculatively.

### 5.3 `apps/website`

- Vite + `@vitejs/plugin-react` with `babel-plugin-react-compiler` (React Compiler ON), `@tanstack/router-plugin` (file-based routes).
- `src/routes/` → `__root.tsx` (ThemeProvider + CssBaseline + QueryClientProvider) + `index.tsx` German teaser landing (masthead wordmark, two-tone Anton headline, pill button).
- `src/features/` structure per frontend-work skill; `@/` alias.
- Vitest (+ Testing Library, `happy-dom`) with one smoke test; `zod` at boundaries.
- Dev server port 3000; `/api` proxy → `http://localhost:5100`.

### 5.4 Placeholders

`apps/club-app/README.md` and `apps/event-app/README.md` — one paragraph each: purpose, planned stack (club-app: Capacitor-wrapped later), pointer to `docs/design/`.

### 5.5 Dependencies (majors — pin exact latest stable at install time)

- Runtime: react 19, react-dom 19, @mui/material 7+, @emotion/react + styled, @tanstack/react-router, @tanstack/react-query, zod, @fontsource/anton, @fontsource/archivo
- Dev: typescript 5, vite 7, @vitejs/plugin-react, babel-plugin-react-compiler, @tanstack/router-plugin, vitest, @testing-library/react + jest-dom + user-event, happy-dom, @biomejs/biome, @types/react(-dom)

### 5.6 Acceptance criteria

1. `pnpm install && pnpm dev` → themed German landing on :3000, Anton/Archivo rendering, zero console errors.
2. `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` — all green, zero warnings.
3. Theme demonstrably shared: website consumes `@furria/ui` only (no local tokens).

## 6. Phase 3 — CI & finalization

- `.github/workflows/ci.yml`, two jobs on `ubuntu-latest` (push to main + PRs):
  - **backend**: setup-dotnet 10 → `dotnet tool restore` → `dotnet build` → `dotnet test` (Docker preinstalled on the runner, Testcontainers works out of the box) → csharpier check.
  - **web**: pnpm via corepack → `pnpm install --frozen-lockfile` → lint → typecheck → test → build.
- Root `README.md`: project intro, prerequisites, quickstart for both stacks.
- Delete `test-setup/` (absorbed) and finally this `SETUP-PLAN.md`.

## 7. Execution order (on go)

1. Backend scaffold (4.1–4.4) → `dotnet build` green
2. Analyzer projects absorbed → analyzer tests green
3. Tests.Common + ApiTestFixture + GetHealthTests → `dotnet test` fully green
4. csharpier format, acceptance 4.7
5. Web workspace + `@furria/ui` + website → acceptance 5.6
6. CI + README + delete `test-setup/` → push, CI green
7. `/self-improve` session review; delete this plan file

## 8. Explicitly out of scope (this setup)

Auth/JWT + identity tables (test-system steps 2–4), any domain entities, club-app & event-app implementations, Capacitor wrapping, Storybook (never), i18n (never), payment/ledger, deployment/hosting.
