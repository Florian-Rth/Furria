# CLAUDE.md

## Repo Layout

```
furria/
├── CONTEXT.md         # Domain glossary — canonical terms; read before modeling anything
├── docs/
│   ├── adr/           # Architecture decision records
│   ├── design/        # Design handoff + mocks — its "READ FIRST" section rules how to use them
│   ├── ops/           # Production: edge contract, release path, rollback runbook
│   ├── server/        # Backend docs (TESTING.md = test conventions, analyzer-enforced)
│   └── web/           # Web frontend docs (TESTING.md = test rules; reference, examples)
├── server/            # .NET 10 backend — ONE API for all apps (Furria.slnx)
│   ├── src/           # Furria.Core → Application → Infrastructure ← Api (+ Tests.Analyzers, Tests.Common)
│   └── tests/         # Furria.Api.Tests (integration), Furria.Tests.Analyzers.Tests
└── web/               # pnpm workspace (versions via catalog in pnpm-workspace.yaml)
    ├── apps/
    │   ├── website/   # Public website (React 19 + Vite + TS + MUI)
    │   ├── club-app/  # Internal member app (React 19 + Vite + TS, visuals via @furria/ui only)
    │   └── event-app/ # Guest event app (placeholder)
    └── packages/
        └── ui/        # @furria/ui — shared KK theme + primitives (source-consumed)
```

## Build the End State — No Temp Versions

Nothing ships publicly until the whole platform (website, backend, internal apps) is done.
Therefore: **always build features directly in their final intended form — never temporary,
reduced or interim versions.** Incomplete is fine; interim is not. A button may call an
endpoint that doesn't exist yet; components may rely on data that can't be fetched yet.
Never scale a feature down so it "works today".

## Skills — Mandatory

- Before writing, planning or modifying code in `server/`, invoke `/backend-work`
- Before writing, planning or modifying code in `web/`, invoke `/frontend-work`
- When the user corrects your approach or at the end of a coding session, invoke `/self-improve`

## Design Mocks

`docs/design/` holds the design handoff. The mocks are **design direction, not spec** —
tokens/typography/primitives are binding, layouts and functionality are inspiration that may
and should be improved. See the "READ FIRST" section in `docs/design/README.md`.

## Common Commands

### Infrastructure
```bash
cd server
docker compose up -d                  # Start PostgreSQL
docker compose down -v                # Teardown + delete all data
```

### Backend (.NET)
```bash
cd server
dotnet build
dotnet test                           # Integration tests need Docker (Testcontainers)
dotnet csharpier format .
```

### Frontend (React)
```bash
cd web
pnpm install
pnpm dev                              # Website dev server on port 3000
pnpm dev:club-app                     # Club-App dev server on port 3001 (/api proxied to :5100)
pnpm build
pnpm test
pnpm lint                             # Biome check (no writes)
pnpm typecheck
pnpm shot /members                    # Screenshots phone/desktop × light/dark → web/tools/screenshot/out (needs dev server + API)
```

## Validation — When to Run What

Single source of truth; skills and plans point here. CI (`.github/workflows/ci.yml`) runs every
full suite on every PR and is the authority.

1. **Inner loop (TDD red/green/refactor):** only the targeted test class/file(s). Never a full suite.
2. **End of a slice/task:** only the stack(s) touched.
   - Backend: `dotnet csharpier format .` + `dotnet build` (zero warnings) + the test classes of the touched features.
   - Web: `pnpm lint` + `typecheck` of the touched packages + the affected test files.
3. **Full suite locally** only before opening/updating a PR with a cross-cutting change (shared
   infra, test fixtures, analyzers, `@furria/ui`, configs/catalog), or to reproduce a CI failure.
4. **Never rerun** a suite that just passed with no code change in between.
5. **`pnpm build` / `pnpm shot`** only when the change affects bundling (routes, configs, deps)
   or chrome/layout — see `docs/web/TESTING.md`.

Targeted commands:
```bash
cd server && dotnet run --project tests/Furria.Api.Tests --no-build -- -class <FQN> [-class <FQN>]  # after dotnet build
cd web && pnpm --filter @furria/<pkg> test <path/to/file.test.ts>
cd web && pnpm --filter @furria/<pkg> typecheck
```
`dotnet test -- --filter-class` from `server/` also runs `Furria.Tests.Analyzers.Tests` with zero matches and fails; VSTest `--filter` is ignored and runs everything.

## Versioning

### Server (`server/Directory.Build.props`)
- `<Version>` — major only: `{major}.0.0.0` (e.g. `0.0.0.0` for v0.x.x)
- `<FileVersion>` — full: `{major}.{minor}.{patch}.0`
- `<InformationalVersion>` — SemVer: `{major}.{minor}.{patch}`

### Web (`web/package.json`)
- `"version"` — SemVer: `{major}.{minor}.{patch}`

## Communication
- Be extremely concise
- If in doubt, ask clarifying questions
- Never mention / Co-Author Claude Code in commits.
- Conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`
