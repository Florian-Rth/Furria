---
title: Identity-Fundament (Backend)
slug: server-identity-foundation
route: —
type: foundation
status: planned
mock: docs/design/FCC-Schema.txt (person, membership, account, invitation — account superseded by ADR-0005)
depends-on: []
adrs: [0005]
---

## What & Why

The first real backend slice: the identity core everything else has a foreign key into —
Person and Mitgliedschaft as EF Core entities, ASP.NET Identity as the Account store, and
login/refresh/me endpoints so the Club-App shell (next plan) can authenticate against
something real. Chosen first because the locked three-layer identity model
(`CONTEXT.md`) is the root of the whole domain, and because auth is a prerequisite of
every Club-App feature.

Deliberately **not** in this foundation: Einladung flow, public self-registration, the
rights matrix (Ämter/Berechtigungen), Gruppen, and any Person-management endpoints. Each
is its own plan on top of this one. This foundation ships exactly enough to log in as a
seeded admin and know who you are.

## Scope / Slices

1. **Domain model + persistence** — `Person` and `Membership` entities in Core
   (per DBML, corrected model: `MembershipType` = Active | Youth | Honorary,
   `MembershipStatus` = Active | Paused | Left; membership optional, unique per Person),
   AppDbContext configuration + migration. Integration-tested via Testcontainers
   round-trips (no repositories to unit-test into existence).
2. **ASP.NET Identity integration** — custom `Account : IdentityUser<int>` with required
   unique `PersonId`, email as the only identifier (ADR-0005), a domain `IsDisabled`
   flag distinct from lockout. Identity schema in the same AppDbContext/migration.
   No `AddRoles<>()`, no `MapIdentityApi`.
3. **Auth endpoints** (FastEndpoints REPR, one file each): `Login`
   (email + password → access JWT + refresh token), `RefreshToken` (rotation, reuse
   detection revokes the family), `Logout` (revokes server-side), `GetMe` (Person basics +
   membership state for the authenticated Account). Refresh tokens persisted in their own
   table.
4. **Bootstrap admin seeding** — a configured admin Account (+ Person) created on startup
   only when no Account exists; without it, invite-only onboarding can never start.

## Decisions

Pinned in the 2026-09-03 backend kickoff session:

- **Three frontends stay** — website, Club-App (browser + Capacitor native shell),
  event app — over one API; frontends stay thin over shared workspace packages.
- **ASP.NET Identity, bearer + refresh tokens, no OIDC server, Identity user = Account,
  email as login identifier** — all recorded in
  [ADR-0005](../../docs/adr/0005-auth-aspnet-identity-bearer-tokens.md).
- **Authorization is domain, not Identity** — the rights matrix comes in a later plan;
  this foundation knows only "authenticated" vs "not".
- **Non-member Gruppen people are first-class** (`CONTEXT.md`, Gruppe): nothing in this
  foundation — or ever — gates Club-App access on an existing Mitgliedschaft. `GetMe`
  must therefore return cleanly for an Account whose Person has no membership row.
- **Gast-Registrierung & Dubletten stays open** and does not block this foundation:
  onboarding here is seed-only, and the flag's resolution is owed before
  self-registration ships, not before login exists.

## Open Questions

- **Token lifetimes** — proposed: 15 min access / 30 days refresh (sliding via rotation);
  to be confirmed at implementation, config-driven either way.
- **Refresh token mechanics** — own table + own rotation logic vs
  FastEndpoints.Security's `RefreshTokenService`; decide at implementation after checking
  what the library's model allows for reuse detection and revoke-all.
- **`GetMe` payload shape** — Person basics + membership state now; whether Gruppen/Ämter
  ride along is decided when the rights-matrix plan lands.

## Done When

- `docker compose up -d && dotnet run` migrates from scratch and seeds the bootstrap
  admin; a second start seeds nothing.
- Login → authenticated `GetMe` → refresh → logout → refresh fails: all integration-
  tested, including the no-membership Account case and refresh-token reuse detection.
- Every slice built via the tdd skill; suite green, zero warnings,
  `dotnet csharpier format .` clean.
- `docs/design/FCC-Schema.txt` carries a superseded-note on `account` pointing at
  ADR-0005.

## Implementation plan

- **B1 — Identity foundation** (this file, slices 1–4 in order). Per-slice review, full
  gates after each slice, as established in the website phases.
- Next plans, in order, each its own file: Club-App shell (login screen + authenticated
  skeleton), Personenverwaltung vertical, Einladung + onboarding, Gruppen, rights matrix.
