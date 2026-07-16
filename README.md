# Furria

Digital platform of the **Furrscher Carnevals Club e.V. ("FURRIA")** — public website, internal
Club-App for members, and a guest event app, all served by one .NET backend.

## Structure

- `server/` — .NET 10 API (FastEndpoints, EF Core, PostgreSQL) — one API for all apps
- `web/` — pnpm workspace: `apps/website`, `apps/club-app`*, `apps/event-app`*, `packages/ui` (shared theme)
- `docs/` — ADRs, design handoff (`docs/design`), backend test conventions (`docs/server/TESTING.md`)
- `CONTEXT.md` — domain glossary

\* placeholders

## Prerequisites

.NET SDK 10, Node 24 + pnpm 11, Docker.

## Quickstart

```bash
# Backend
cd server
docker compose up -d          # PostgreSQL on :5432
dotnet tool restore
dotnet test                   # analyzer + integration tests (needs Docker)
dotnet run --project src/Furria.Api   # API on http://localhost:5100/api

# Web
cd web
pnpm install
pnpm dev                      # website on http://localhost:3000 (proxies /api → :5100)
```

See `CLAUDE.md` for the full command reference and conventions.
