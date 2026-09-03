---
title: Identity-Fundament (Backend)
slug: server-identity-foundation
route: —
type: foundation
status: built
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
5. **Endpoint authorization pattern** (added 2026-09-03, master-plan grilling) — the
   mechanism by which an endpoint declares its required Berechtigung (permission-key
   constants + the FastEndpoints enforcement shape), shipped with "authenticated" as the
   only rule that exists yet. The rights-matrix data and management stay in the inventory
   (B4) — this slice exists so no endpoint ever ships with a check shape we would have to
   rebuild.

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

## Resolved at implementation (2026-09-03)

- **Token lifetimes** — confirmed as proposed: **15 min access / 30 days refresh**, sliding via
  rotation, both config-driven (`Auth:AccessToken:Lifetime`, `Auth:RefreshToken:Lifetime`). The
  15 minutes bound the irrevocable window: an access token carries no per-request security-stamp
  check, so a disabled Account stays usable for at most one access-token lifetime.
- **Refresh token mechanics** — **own table + own rotation**, `FastEndpoints.Security`'s
  `RefreshTokenService` rejected. Its `PersistTokenAsync(TResponse)` never sees the *consumed*
  token, it has no family concept and no unit of work, and it hardcodes
  `Guid.NewGuid().ToString("N")` as the token — so hashed-at-rest storage, an atomic
  consume-or-fail and family revocation would all have been written by hand anyway, against
  sealed methods. `AddAuthenticationJwtBearer` and the `Permissions()` surface are still used.
  A `ReuseGraceWindow` (30 s, configurable) keeps a client's own in-flight retry from tripping
  reuse detection and logging the honest user out.
- **`GetMe` payload shape** — Account id + email, Person basics, and the Membership state or
  `null`. Gruppen/Ämter are decided when the rights-matrix plan (B4) lands.
- **Where the entities live** — `Person` and `Membership` in `Furria.Core` as the plan says;
  `Account` and `RefreshToken` in `Furria.Infrastructure/Identity` instead, because the
  `/backend-work` rule "Core has zero external dependencies" and `IdentityUser<int>` is one.
  For the same reason the **service classes** (`AccountService`, `RefreshTokenService`,
  `AccessTokenService`) live in Infrastructure, with their boundary types (`…Command`,
  `…Details`, `Result<T>`, the options classes) in `Furria.Application` — Application references
  Core only and so cannot see `AppDbContext`. Adding an `IAppDbContext` port to satisfy the
  diagram was rejected: it is an interface with exactly one implementation forever, and
  ADR-0001 bans the mocking it would enable.
- **Snake-case schema** — `EFCore.NamingConventions` plus an explicit
  `MigrationsHistoryTable("__ef_migrations_history")`, so the whole schema matches
  `docs/design/FCC-Schema.txt`. Identity's tables are renamed to the domain: `account`,
  `account_claim`, `account_login`, `account_token`. **Any pre-existing local database must be
  recreated** (`docker compose down -v`) — the convention also renames the history table's
  columns.
- **Permission-key constants** — the *shape* ships (metadata + `Definition.RequirePermission`
  + the enforcer); the `Permissions` constants file itself is created by its first caller in B2.
  B1 has no endpoint that needs a Berechtigung, so shipping the class empty or with invented
  keys would have been dead code. The frozen key format is `"{area}:{action}"`.

## Traps the code cannot state itself

Code carries no comments (`/backend-work`), so the non-obvious reasons behind five decisions live
here. Each is a place where the "obvious simplification" is wrong.

- **`RefreshTokenSecret.HashOf` guards with `Base64Url.IsValid` before decoding.** It looks
  redundant next to `TryDecodeFromChars` and is not: that method **throws** on malformed input
  instead of returning `false`, and `POST /auth/refresh` is anonymous — so removing the guard
  turns any garbled token into an unauthenticated 500. Applies to every future token decode
  (Einladung, `orderCode`).
- **JWT lifetime validation is wired to the injected `TimeProvider`** (`AccessTokenLifetime`,
  wired in `Program.cs`). The framework default reads the machine clock, which would make token
  validation the one part of the API ignoring the clock MET006 exists to enforce — and would
  make every token-expiry test impossible.
  `GetMeTests.Should_ReturnUnauthorized_When_TheAccessTokenHasExpired` is the guard.
- **`Login` spends exactly one password-hash verification on every path** — unknown email,
  disabled Account and locked-out Account included. Identity short-circuits before hashing on
  each of those, and an unequalized path is a ~600x user-enumeration timing oracle. Rate
  limiting is *not* in this foundation and is still owed before the API is exposed.
- **`Result<T>` overrides `ToString`.** The generated record `ToString` evaluates both `Value`
  and `Error`, exactly one of which always throws; and printing the value verbatim would put a
  live access and refresh token in the first log line about a successful login. It names the
  type, never the value.
- **`PermissionAuthorizer` returning `false` is the correct answer, not a stub.** No Amt can be
  held until the rights matrix exists (B4), so no Berechtigung is granted — and it is
  fail-closed, so an endpoint that declares a key is refused rather than waved through.

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

- **B1 — Identity foundation** (this file, slices 1–5 in order). Per-slice review, full
  gates after each slice, as established in the website phases.
- B1 is the **only** backend-first work: the backend is demand-driven — everything after
  B1 is pulled by a Club-App or website feature when it needs it. The inventory and its
  expected pull order live in the [backend master plan](master-plan.md); work moves to the
  Club-App when B1 closes.
