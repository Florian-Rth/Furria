# CLAUDE.md

## Repo Layout

```
furria/
├── CONTEXT.md         # Domain glossary — canonical terms; read before modeling anything
├── docs/
│   ├── adr/           # Architecture decision records
│   ├── design/        # Design handoff + mocks — its "READ FIRST" section rules how to use them
│   ├── server/        # Backend docs (TESTING.md = test conventions, analyzer-enforced)
│   └── web/           # Web frontend docs (reference, examples)
├── server/            # .NET 10 backend — ONE API for all apps (Furria.slnx)
│   ├── src/           # Furria.Core → Application → Infrastructure ← Api (+ Tests.Analyzers, Tests.Common)
│   └── tests/         # Furria.Api.Tests (integration), Furria.Tests.Analyzers.Tests
└── web/               # pnpm workspace (versions via catalog in pnpm-workspace.yaml)
    ├── apps/
    │   ├── website/   # Public website (React 19 + Vite + TS + MUI)
    │   ├── club-app/  # Internal member app (placeholder)
    │   └── event-app/ # Guest event app (placeholder)
    └── packages/
        └── ui/        # @furria/ui — shared KK theme + primitives (source-consumed)
```

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
pnpm build
pnpm test
pnpm lint                             # Biome check + fix
pnpm typecheck
```

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
