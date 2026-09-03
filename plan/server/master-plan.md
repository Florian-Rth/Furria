# Backend — Master Plan

The single .NET API (`server/`) serving all three apps: public website, internal Club-App,
guest event app. This plan covers **only** the backend; the website has
[its own master plan](../website/master-plan.md) and the Club-App will get one when its
build starts.

---

## How this plan works

- **The backend is demand-driven — this plan is an inventory, not a build queue** (pinned
  2026-09-03 grilling). Backend logic is built **only when a frontend needs it**: a Club-App
  or website feature pulls its backend slice with it. The one exception is the
  [Foundations](#foundations--built-now-backend-first) section — built backend-first, now,
  because every later endpoint stands on it.
- **The domain inventory below carries the expected pull order**, resolved in the 2026-09-03
  grilling. It is guidance for sequencing dependencies, not a promise: areas are pulled when
  the Club-App build reaches them, and the order may shift with the club's needs.
- **No launch is scheduled.** The platform ships as a whole (see CLAUDE.md); the website is
  not going live on its own, so no backend area has deadline pressure — not even the ones the
  website already waits on.
- **Area plan files** (`plan/server/*.md`) are created when an area is pulled, in the website
  plan's format. Contracts the website has already pinned are **linked, never restated** —
  the Zod seed schemas in `web/apps/website/src/lib/seed/` are the executable versions.
- **Cross-cutting, hard-to-reverse decisions** become ADRs (`docs/adr/`); domain terms live
  in [`CONTEXT.md`](../../CONTEXT.md) only.
- **Conventions:** `/backend-work` skill + [`docs/server/TESTING.md`](../../docs/server/TESTING.md)
  (integration tests, Testcontainers, no mocks —
  [ADR-0001](../../docs/adr/0001-no-mocks-integration-testing.md)).

---

## Foundations — built now, backend-first

The only work that precedes frontend demand. When it closes, work moves to the Club-App and
everything further is pulled from there.

### B1 — Identity foundation
**Status:** built — [identity-foundation.md](identity-foundation.md) ·
[ADR-0005](../../docs/adr/0005-auth-aspnet-identity-bearer-tokens.md)
Person + Mitgliedschaft model, ASP.NET Identity as the Account store, login/refresh/logout/me,
bootstrap admin seed — **plus the endpoint authorization pattern** (added in the 2026-09-03
grilling): the mechanism by which an endpoint declares its required Berechtigung, shipped with
"authenticated" as the only rule that exists yet. The rights-matrix *data and management* stay
in the inventory (B4) — but no endpoint ever ships with a check shape we would have to rebuild.

---

## Domain inventory — pulled on demand, in expected order

| # | Area | Pulled by | Needs first |
|---|---|---|---|
| B2 | **Personen & Mitgliedschaften** — the master-data registry (CRUD, Mitgliedschaft Art/status/period) | Club-App Personenverwaltung | B1 |
| B3 | **Gruppen** — Gruppen + Person↔Gruppe, archivable, per-Gruppe recruiting openness, Trainer assignment | Club-App Gruppenverwaltung | B2 |
| B4 | **Ämter & Berechtigungen** — the rights matrix (fixed Ämter, targeted Berechtigungen, Gruppe-scoped Trainer); retro-applies real checks to the still-small B2/B3 surface | Club-App rights management | B2, B3 |
| B5 | **Einladung & Onboarding** — one-time tokens (link/printed QR), Account creation for Mitglieder *and* non-member Gruppen people | Club-App member onboarding | B2 (B4 for who may invite) |
| B6 | **Antrag- & Gruppen-Backend** — `POST /api/membership-applications`, `GET /api/groups`, `GET /api/group-matcher` + the **outbound-mail foundation** (SMTP, SPF/DKIM, rate limiting, retention rules). Contracts fully pinned in the [website master plan → Deferred](../website/master-plan.md#antrag--und-gruppen-backend-not-scheduled) / [ADR-0004](../../docs/adr/0004-website-writes-membership-applications.md) | Website `/join` + Club-App Antrag review | B3, B4 |
| B7 | **Veranstaltungen & Ablauf** — events admin, sales lifecycle (`salesStatus` backend-owned), public read endpoints per the [events area contracts](../website/events/master-plan.md), per-event Ablauf | Club-App events admin + website events pages | B4 |
| B8 | **Meldungen** — publishing (board UI in Club-App), public read, body sanitisation once content stops being compile-time | Club-App publishing + website `/news` | B4 |
| B9 | **Ledger & Beitrag** — the single money truth (CONTEXT.md): ledger entries, Beitrag tiers by Mitgliedschaftsart, settlement paths pluggable | Club-App finance | B2 |
| B10 | **Bestellungen & Karten** — order flow, Stripe (embedded, pinned in E5), guest checkout via `orderCode`, Kartenbörse mechanics. Writes the Ledger from day one | Website order flow + Club-App sales admin | B7, B9, mail (B6) — **and the open club decisions below** |
| B11 | **Media & Alben** — the first infrastructure beyond Postgres: object storage, thumbnail pipeline; Club-App Bildergalerie (upload) + website Galerie (curated read) | Club-App Bildergalerie + website Galerie | B4 — **and the photo-consent decision below** |
| B12 | **Event-App backend** — guest photo upload/download per Veranstaltung, moderation before visibility, retention/deletion; possibly the Einlass scanner | Event app | B7, B11 — **and both decisions below** |

Further Club-App domains (ideas exist — e.g. the Ledger's Shop/Getränkekasse mentions, a
Trainingsplaner) are **deliberately not specified yet** (2026-09-03 ruling): they join the
inventory when they become real club intentions, not before.

---

## Open club decisions the inventory waits on

Tracked in [`CONTEXT.md` → Flagged ambiguities](../../CONTEXT.md#flagged-ambiguities); listed
here because they block inventory areas, and none of them blocks the Foundations:

- **Sitzplatzvergabe** (seat per Karte vs. general admission) — blocks B10.
- **Einlasskontrolle** (QR / name list / none) — shapes B10's Karten display and B12's scanner.
- **Who decides a photo is public** (per-photo release vs. Person-level consent — never one
  flag) — blocks B11's upload rules and B12 entirely.
- **Gast-Registrierung & Dubletten** (merge/claim mechanism) — due before public
  self-registration ships (B10's optional account path), not before B1.
