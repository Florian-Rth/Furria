<div align="center">

<img src=".github/assets/logo.svg" width="170" alt="FURRIA — the crossed brooms of Großbesenstadt">

# FURRIA

**The fifth season, now in production.**

[![CI](https://github.com/Florian-Rth/Furria/actions/workflows/ci.yml/badge.svg)](https://github.com/Florian-Rth/Furria/actions/workflows/ci.yml)
![Carnival call](https://img.shields.io/badge/Carnival_call-Gross_--_Furria!-E11D2A)
![Founded](https://img.shields.io/badge/founded-1971-F4B400)
![Mocks](https://img.shields.io/badge/Mocks-banned-1A1411)
![Go-live](https://img.shields.io/badge/live_since-11.11.2026%2C%2011%3A11-2E9E5B)

</div>

The digital home of the **Furrscher Carnevals Club e.V.** (FCC) — Großbesenstadt's finest (and,
to be fair, only) carnival club. Organizing controlled chaos since 1971, running in production since
the eleventh of the eleventh.

## Where we stand

| App | What it's for | Status |
|-----|---------------|--------|
| 🌐 **Website** (`web/apps/website`) | The public face: events, news, gallery, club history since 1971, and the "Mitglied werden" funnel | **Live.** Prerendered heads, sitemaps, imprint and privacy — Google knows we exist |
| 🎭 **Club-App** (`web/apps/club-app`) | The engine room for members — installed on phones as a PWA, whether they like it or not | **Live.** See below — it got out of hand |
| 📸 **Event-App** (`web/apps/event-app`) | For guests at the party: per-table photo upload, live photo wall, digital programme | Still a README. It's been told it's next. It's been told that before |

### What the Club-App does by now

The original brief said "members, roles, fees, event planning, the legendary beer list".
We may have overdelivered slightly.

- **People & groups** — persons, memberships, pauses, fee reductions, board offices, roles
  (admin-only — members see an avatar coin, not an org chart), group hubs that keep their own
  record, and **QR-Anmeldung** for newcomers who'd rather scan than fill in paper.
- **Kalender** — agenda + week strip, usual training times shown (never generated), and
  *Funktionen*: polls, sign-up lists and attendance bolted onto any entry. Nothing asks by default.
- **Aushänge** — the digital notice board, with mentions, push and their own add-ons.
- **Events** — planning, *Ablauf* (the running order, auto-planned to the exact cheapest order),
  and **Saal & Tische**, a touch-first hall planner that seats the whole club without a single
  argument. Allegedly.
- **Auftritte & Tanzstudio** (`@furria/studio`) — every group's act for the year: music mix with
  slices, trainer video, steps synced to the beat, a stage editor for formations, and a practice
  view calm enough to use at 11 p.m. in a gym.
- **Galerie** — albums, tus uploads (videos up to 20 GB, because someone *will* film the entire
  parade), a media worker for renditions, signed URLs, upload links for non-members, and website
  picture slots.
- **News** — a strict Markdown subset, so nobody can embed their cousin's Comic Sans.
- **Bierliste** — a private pot outside the club's books (legally the most important
  sentence in this repo): several drinks, crates, forecasts, payments, reminders.
- **Jeck-Check** — a shared pool of statements that matches people to groups. Like a dating app,
  but for the men's ballet.
- **WhatsApp bridge** — a self-hosted bot posts to the club group, and votes flow back into the
  app. The group chat finally has a database.
- **Plumbing** — passkeys, web push, a live change feed, the club record, keys & venues,
  presale places, archiving that actually closes things out, and a *System* hub with logs, mail,
  storage, tasks and the WhatsApp outbox.
- **Showpieces** — confetti, a shake-to-celebrate globe on Start, and a projector promo reel.
  Confetti is rationed. Mostly.

## The serious part

- **`server/`** — .NET 10, FastEndpoints, EF Core, PostgreSQL. Clean architecture
  (`Core → Application → Infrastructure ← Api`) plus `Furria.MediaWorker` for renditions off the
  API. Central package management, warnings are errors, logs are JSON on stdout.
- **`web/`** — pnpm workspace: React 19 (Compiler on), Vite, TypeScript, MUI, TanStack
  Router/Query, Biome, Vitest. Shared packages:
  - `@furria/ui` — the `Kk*` components. It owns *every* visible pixel; the club-app lint rule
    bites if you try otherwise.
  - `@furria/api-client` — one fetch, one way to fail.
  - `@furria/studio` — the dance studio, its own domain and engine.
  - `@furria/website-pictures` — picture slot catalogue.
- **Production** — a Hetzner box in the EU, an edge nginx, docker compose, watchtower, and a
  rollback workflow we hope to never need. See [`docs/ops/PRODUCTION.md`](docs/ops/PRODUCTION.md).
- **Language** — the code speaks English, the buttons speak German. No `Mitgliedsbeitragsermäßigung`
  in an identifier. Ever.

## Quickstart

Works on your machine *and* on `ubuntu-latest` — both confirmed.

```bash
# Backend
cd server
docker compose up -d                  # PostgreSQL on :5432
dotnet tool restore
dotnet build
dotnet run --project src/Furria.Api   # API on http://localhost:5100/api

# Web
cd web
pnpm install
pnpm dev                              # website on http://localhost:3000 (proxies /api → :5100)
pnpm dev:club-app                     # club-app on http://localhost:3001 (proxies /api → :5100)
pnpm shot /members                    # screenshots phone/desktop × light/dark
```

The Club-App insists on being installed on phones. Desktop browsers are spared.
Developers can bypass the gate with `?pwa=false` — or by tapping eleven times. Of course eleven.

## Testing: no mocks, no mercy, no filler

Every backend test runs against a **real Postgres** in a Testcontainer, through the **real HTTP
pipeline**, with **real auth**. Moq and friends are banned — not by convention, but by our own
Roslyn analyzers that turn a mock, an in-memory database, an ambient clock or a
stray `Console.WriteLine` into a **compile error**. The only thing allowed to be fake around here
is the `FakeTimeProvider`, and even that starts at real "now".

`Task.Delay` in tests is also banned. We poll. Patience is for Lent.

We also test **business logic only**. A test that checks whether a button says "Speichern" is
not a test, it's a proofreading job. CI runs the backend in four shards and stays under two
minutes per job — faster than the Elferrat finds its seats.

Details in [`docs/server/TESTING.md`](docs/server/TESTING.md) and
[`docs/web/TESTING.md`](docs/web/TESTING.md).

## Design: „Konfetti Kinetik"

Bold editorial-newspaper DNA — Anton headlines, Archivo everything else, cream & ink, confetti
strictly rationed. **Red means action or trouble — never body text**; "current" is blue,
"overdue" is gold. Save the drama for the men's ballet. One theme for all apps, radius 14,
no exceptions.

Club-App screens are dense: maximum information per pixel, no airy hero blocks, no pitch copy
explaining why a button exists. Members came to work, not to be inspired.

The full design handoff lives in [`docs/design/`](docs/design/README.md) — read its
**READ FIRST** section before pixel-copying anything.

## How work gets done

Big features start as a grilling session, become an **RFC** in [`docs/rfcs/`](docs/rfcs/)
(mirrored as a GitHub issue), and ship phase by phase. No temporary versions: everything is built in its
final form or not at all ([`CLAUDE.md`](CLAUDE.md)).

## Docs map

| Where | What |
|-------|------|
| [`CONTEXT.md`](CONTEXT.md) | Domain glossary — club law, from *Aushang* to *Zugang* |
| [`docs/adr/`](docs/adr/) | Architecture decisions — the "why did they do it this way?" file |
| [`docs/rfcs/`](docs/rfcs/) | Feature proposals, phased and ticked off |
| [`docs/design/`](docs/design/README.md) | Design system + feature mocks (direction, not spec) |
| [`docs/ops/PRODUCTION.md`](docs/ops/PRODUCTION.md) | Edge contract, release path, rollback runbook |
| [`docs/server/`](docs/server/) | Testing conventions the compiler enforces, logging |
| [`docs/web/TESTING.md`](docs/web/TESTING.md) | What the frontend tests (and, more importantly, doesn't) |
| [`plan/`](plan/) | Launch plan and feature plans |
| [`CLAUDE.md`](CLAUDE.md) | Full command reference and repo conventions |

## License

Source-available, **all rights reserved** — reading and learning is welcome and encouraged;
any actual use (commercial or by other clubs) needs written permission. See
[`LICENSE.md`](LICENSE.md).

---

<div align="center">

🧹 **FURRIA — Großbesenstadt** 🧹

*Groß – Furria!*

</div>
