<div align="center">

<img src=".github/assets/logo.svg" width="170" alt="FURRIA — the crossed brooms of Großbesenstadt">

# FURRIA

**Die fünfte Jahreszeit, jetzt mit Continuous Integration.**

[![CI](https://github.com/Florian-Rth/Furria/actions/workflows/ci.yml/badge.svg)](https://github.com/Florian-Rth/Furria/actions/workflows/ci.yml)
![Narrenruf](https://img.shields.io/badge/Narrenruf-Gross_--_Furria!-E11D2A)
![Gegründet](https://img.shields.io/badge/gegr.-1971-F4B400)
![Mocks](https://img.shields.io/badge/Mocks-verboten-1A1411)
![Eröffnung](https://img.shields.io/badge/Session-11.11%2C%2011%3A11%20Uhr-2E9E5B)

</div>

The digital home of the **Furrscher Carnevals Club e.V.** — Großbesenstadt's finest (and, to be
fair, only) carnival club. Organizing controlled chaos since 1971, writing integration tests
since 2026.

## The plan

One repo, one backend, three apps. If eleven people on the Elferrat can run an entire carnival,
one API can serve three frontends.

| App | What it's for | Status |
|-----|---------------|--------|
| 🌐 **Website** (`web/apps/website`) | The public face: events, tickets with a cinema-style seat picker, news, and the "Mitglied werden" funnel | v0 teaser is live — the fifth season starts here |
| 🎭 **Club-App** (`web/apps/club-app`) | The engine room for members: Mitglieder, Ämter, Beiträge, event planning, Live-Regie, the legendary Bierliste | Waiting in der Bütt |
| 📸 **Event-App** (`web/apps/event-app`) | For guests at the party: per-table photo upload, live photo wall, digital programme — no install, no excuses | Kommt nach dem Umzug |

## The serious part

- **`server/`** — .NET 10, FastEndpoints, EF Core, PostgreSQL. Clean architecture
  (`Core → Application → Infrastructure ← Api`), central package management, warnings are errors.
- **`web/`** — pnpm workspace: React 19 (Compiler on), Vite, TypeScript, MUI, TanStack
  Router/Query, Biome, Vitest. One shared theme in `@furria/ui` — corporate identity is
  non-negotiable, even for a carnival club. *Especially* for a carnival club.
- **UI language**: the code speaks English, the buttons speak German (ADR-0002).

## Quickstart

Works on your machine *and* on `ubuntu-latest` — both confirmed.

```bash
# Backend
cd server
docker compose up -d                  # PostgreSQL on :5432
dotnet tool restore
dotnet test                           # analyzer + integration tests (needs Docker)
dotnet run --project src/Furria.Api   # API on http://localhost:5100/api

# Web
cd web
pnpm install
pnpm dev                              # website on http://localhost:3000 (proxies /api → :5100)
```

## Testing: no mocks, no mercy

Every backend test runs against a **real Postgres** in a Testcontainer, through the **real HTTP
pipeline**, with **real auth**. Moq and friends are banned — not by convention, but by our own
Roslyn analyzers (MET001–007) that turn a mock into a **compile error**. The only thing allowed
to be fake around here is the `FakeTimeProvider`, and even that starts at real "now".

`Task.Delay` in tests is also banned. We poll. Patience is for Lent.

Details in [`docs/server/TESTING.md`](docs/server/TESTING.md), rationale in
[ADR-0001](docs/adr/0001-no-mocks-integration-testing.md).

## Design: „Konfetti Kinetik"

Bold editorial-newspaper DNA — Anton headlines, Archivo everything else, cream & ink, confetti
strictly rationed. **Red is for action buttons, never body text** — save the drama for the
Männerballett. One theme for all apps, radius 14, no exceptions.

The full design handoff lives in [`docs/design/`](docs/design/README.md) — read its
**READ FIRST** section before pixel-copying anything.

## Docs map

| Where | What |
|-------|------|
| [`CONTEXT.md`](CONTEXT.md) | Domain glossary — what a Mitglied is, why there is no Vorstand super-role, and other club law |
| [`docs/adr/`](docs/adr/) | Architecture decisions — the "why did they do it this way?" file |
| [`docs/design/`](docs/design/README.md) | Design system + feature mocks (direction, not spec) |
| [`docs/server/TESTING.md`](docs/server/TESTING.md) | The testing conventions the compiler enforces |
| [`CLAUDE.md`](CLAUDE.md) | Full command reference and repo conventions |

## License

Source-available, **all rights reserved** — reading and learning is welcome and encouraged;
any actual use (commercial or by other clubs) needs written permission. See
[`LICENSE.md`](LICENSE.md).

---

<div align="center">

🧹 **FURRIA — Großbesenstadt** 🧹

*Gross - Furria!*

</div>
