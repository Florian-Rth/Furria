---
status: pinned — binding contract for CA-P1 implementation
phase: CA-P1
derived from: CONTEXT.md · plan/club-app/p1-registry-and-groups.md · .claude/skills/{backend-work,frontend-work} · docs/design/persons-groups
pinned: 2026-09-11
---

# CA-P1 — Implementation contract

The single pinned contract for *Registry & Gruppen*. Everything an implementation agent needs
that is **not** already in the plan lives here: entity shapes, derived-fact helpers, the
authorization wiring, all 40 endpoints, every frontend surface, every new `@furria/ui`
primitive, the test-harness extensions, the development seed, the German copy rules and the
slice ledger.

> **Revision 2 (2026-09-11, after three adversarial audits).** Every finding accepted by that
> pass is folded in; the ones rejected are answered in §12 (decisions AA–AT). If a section here
> disagrees with a memory of the first revision, this file wins.

---

## 0. How to use this file

### Who reads what

| You are implementing | Read |
|---|---|
| anything | this file's §0, §10, §11 (your slice's row), §12 |
| a backend slice | §1, §2, §3, §4 (your slice's endpoints), §8, and `/backend-work` |
| a frontend slice | §4 (the endpoints you consume), §5, §6, §7, §10, and `/frontend-work` |
| a `@furria/ui` addition | §7 in full, plus `map-design.md` §1 for the anatomy |
| development data / the UX-pass script | §9 |

Context you are expected to have loaded before writing a line: `CONTEXT.md`,
`plan/club-app/p1-registry-and-groups.md`, and the four maps in the session scratchpad
(`map-backend.md`, `map-frontend.md`, `map-design.md`, `map-domain.md`). Nothing else needs to be
re-derived — if you find yourself deriving a domain rule, it is either in §2 or it is a contract
bug.

### The binding rule

**This contract is binding.** Two agents implementing opposite ends of the same slice must
produce code that fits on the first try, which only works if nobody improvises.

- If a name, type, route, status code or prop signature here disagrees with what you would have
  chosen, **implement what is written here**.
- If something here is wrong, impossible or self-contradicting, **report it in your PR
  description and stop at that point** — never silently deviate, never "fix it locally", never
  ship a second spelling of the same thing.
- If something you need is genuinely absent (a primitive, a field, an endpoint), that is a
  **contract bug**. Report it. Do not inline a styled thing in the app (the Biome guardrails
  will stop you anyway) and do not invent an endpoint shape.

### Three rules that outrank convenience

1. **Nothing from plan §4's "Ignored" table may appear anywhere** — no Mitgliedschaftsart, no
   Ehrenmitgliedschaft (seal, gold avatar, filter, "verliehen in Session"), no Ruhezeit-Grund, no
   derived `minor`, no base Rolle "Mitglied", no Rolle `kind`, no 26-right catalogue or
   `sensibel`/`unwiderruflich` flags, no Gruppe founding year, no Fotofreigabe/Push/E-Mail
   switches, no "Verlauf" or "angelegt von", no Gruppe-"Mitmachen" card with training times, no
   mock rail groups. Also banned by the design map's extension of that table: the word **Amt /
   Ämter** anywhere in code or copy, and any **Schlüssel** marker or explanatory card.
2. **One page = one concern = one Berechtigung**, with the Gruppen-Hub as the one ruled
   exception (it carries its admin tools inline, ruling 12).
3. **Build the end state.** A button may call an endpoint that does not exist yet; a component
   may render data that cannot be fetched yet. Never ship a reduced variant so it "works today".

---

## 1. Entities and schema

Layer rules (from `/backend-work`): entities live in `Furria.Core`, are used only in
`Furria.Infrastructure`, and never cross the service boundary. All classes `sealed`, no primary
constructors, navigation properties nullable and not virtual, `Nullable` enabled.
`UseSnakeCaseNamingConvention()` derives every table, column, index and FK name — **never write a
column name by hand**.

### 1.0 Namespaces and new folders

```
Furria.Core/Identity/      Person, Membership, MembershipPause, FeeReduction, FeeReductionBasis
Furria.Core/Groups/        Group, GroupMembership, GroupAdmin
Furria.Core/Roles/         Role, RolePermission, RoleHolding
Furria.Core/Club/          ClubSession, ClubClock, DatePeriod, SessionSpan, MembershipState,
                           MembershipStateCalculator, ITimestamped
Furria.Core/Text/          GermanFold
Furria.Application/Registry/  ContactVisibility, MemberSummary, MemberDetails, PersonSummary, …
```

**Enums the wire needs live in `Furria.Application`, never in `Furria.Api`.** `ContactVisibility`
(§4.3) is produced by `PersonService` and carried by `MemberDetails`; neither Infrastructure nor
Application references the Api project, so an Api-owned enum cannot cross that boundary. Any enum
an endpoint block below appears to "declare" is declared **once** in `Furria.Application` and only
*used* by the endpoint.

`Person` and `Membership` **stay** in `Furria.Core.Identity` — `Account` hangs off `Person`, and
moving them multiplies slice-1 churn (`AccountService`, `PersonConfiguration`,
`IdentitySeedBuilder`, `PersonExpectations`, `GetMe`) for no behavioural gain.

### 1.1 `ITimestamped` and the audit interceptor

```csharp
namespace Furria.Core.Club;

public interface ITimestamped
{
    DateTimeOffset CreatedAt { get; set; }

    DateTimeOffset UpdatedAt { get; set; }
}
```

Every entity in §1.2–§1.10 implements it. `created_at` / `updated_at` are
`DateTimeOffset` with `HasDefaultValueSql("now()")` (the existing `PersonConfiguration` idiom).

New in slice 1: `Furria.Infrastructure/Persistence/AuditTimestampInterceptor.cs`, a
`SaveChangesInterceptor` registered on the `AppDbContext` options, which reads
`_timeProvider.GetUtcNow()` **once per `SaveChanges`** and then:

- `EntityState.Added` → sets **both** `CreatedAt` and `UpdatedAt` to that instant;
- `EntityState.Modified` → sets `UpdatedAt` only.

(MET006 forbids `DateTimeOffset.UtcNow`.) The `HasDefaultValueSql("now()")` on both columns stays
as a **backstop for rows inserted outside EF** (a migration, raw SQL); it must never be the source
for an application write, because a row whose `created_at` comes from Postgres and whose
`updated_at` comes from the injected `FakeTimeProvider` cannot be asserted in one test — which is
exactly what MET006 exists to prevent. This closes backend-map gap G6; without the interceptor
`updated_at` is a lie on every table.

**It must be assertable** (§8.5): `PersonExpectations` gains
`ToHaveBeenTouchedAt(DateTimeOffset)` and slice 1 ships
`Should_StampUpdatedAt_When_APersonIsEdited` — a deliverable whose whole purpose is a column value
with no legal way to read that column is not a deliverable.

> `Person` is a `DatabaseResetService` snapshot table: it must never gain a computed or
> `GENERATED ALWAYS` column. The interceptor is application-side, so this stays true.

### 1.2 `Person` — changed

```csharp
namespace Furria.Core.Identity;

public sealed class Person : ITimestamped
{
    public int Id { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Street { get; set; }
    public string? Zip { get; set; }
    public string? City { get; set; }
    public DateOnly? BirthDate { get; set; }
    public bool ContactVisibleToMembers { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public ICollection<Membership> Memberships { get; set; } = [];
    public ICollection<FeeReduction> FeeReductions { get; set; } = [];
    public ICollection<GroupMembership> GroupMemberships { get; set; } = [];
    public ICollection<GroupAdmin> GroupAdminships { get; set; } = [];
    public ICollection<RoleHolding> RoleHoldings { get; set; } = [];
}
```

**Per-slice arrival — §1.2 is the *end state*, not slice 1's file.** EF discovers entities by
convention through navigation properties, so pulling all five collections forward would make
migration 1 create all nine tables and leave migrations 2 and 3 empty. Each navigation lands with
its own slice:

| Member | Slice |
|---|---|
| `BirthDate`, `ContactVisibleToMembers`, `Memberships`, `FeeReductions` | 1 |
| `RoleHoldings` | 2 |
| `GroupMemberships`, `GroupAdminships` | 3 |

Slice 1's `Person` therefore compiles against types that exist. Verify with
`dotnet ef migrations script`: migration 1 must touch **only** `person`, `membership`,
`membership_pause`, `fee_reduction`.

**`Membership? Membership` is deleted and replaced by `ICollection<Membership> Memberships`.**
That single change is what makes a Mitgliedschaft a repeatable period and what breaks
`AccountService.GetDetailsAsync`, `MembershipDetails`, `GetMe`, `IdentitySeedBuilder.AddMembership`,
`MembershipExpectations` and `ApiTestFixture.InsertMembershipDirectlyAsync` — all rewritten in
slice 1 (§11).

`PersonConfiguration` additions:
- `builder.Property(person => person.ContactVisibleToMembers).HasDefaultValue(false);`
- `BirthDate` needs no configuration (`date`, nullable).
- The existing `ix_person_last_name_first_name` stays and is the list's sort index.

### 1.3 `Membership` — recreated

```csharp
namespace Furria.Core.Identity;

public sealed class Membership : ITimestamped
{
    public int Id { get; set; }
    public int PersonId { get; set; }
    public DateOnly StartedOn { get; set; }
    public DateOnly? EndedOn { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public Person? Person { get; set; }
    public ICollection<MembershipPause> Pauses { get; set; } = [];
}
```

**Deleted outright:** `MembershipType.cs`, `MembershipStatus.cs`, the `Type` and `Status`
properties, and the index `ix_membership_status`. Columns rename `started_at`/`ended_at` →
`started_on`/`ended_on` so every period column in the phase reads alike.

`MembershipConfiguration` (rewritten):
```csharp
builder.ToTable(
    "membership",
    table => table.HasCheckConstraint("ck_membership_period", "ended_on IS NULL OR ended_on >= started_on")
);
builder.HasKey(membership => membership.Id);
builder
    .HasOne(membership => membership.Person)
    .WithMany(person => person.Memberships)
    .HasForeignKey(membership => membership.PersonId)
    .HasConstraintName("fk_membership_person_person_id")
    .OnDelete(DeleteBehavior.Cascade);
builder.HasIndex(membership => membership.PersonId);
builder
    .HasIndex(membership => membership.PersonId, "ix_membership_person_id_open")
    .IsUnique()
    .HasFilter("ended_on IS NULL");
builder.Property(membership => membership.CreatedAt).HasDefaultValueSql("now()");
builder.Property(membership => membership.UpdatedAt).HasDefaultValueSql("now()");
```

**Two indexes, and the named overload is the only way to get them.** `HasIndex(expression)`
returns the *existing* index for that property list, so calling it twice configures **one** index —
the second call would silently turn the plain index into the filtered unique one and the plain
`ix_membership_person_id` would not exist. The plain index carries every lookup of a Person's
**closed** periods (`GetPersonById`, `MemberSince` over the whole chain, the overlap check). The
same applies to `group_membership` (§1.7), `group_admin` (§1.8) and `role_holding` (§1.9).

The **partial unique index** is the database backstop for "at most one open period at a time".
Full non-overlap between *closed* periods (decision J) is enforced in `MembershipService` and
answered `409 Conflict` — a PostgreSQL exclusion constraint would require the `btree_gist`
extension and is deliberately not introduced.

### 1.4 `MembershipPause` — new

```csharp
namespace Furria.Core.Identity;

public sealed class MembershipPause : ITimestamped
{
    public int Id { get; set; }
    public int MembershipId { get; set; }
    public int FirstSessionYear { get; set; }
    public int? LastSessionYear { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public Membership? Membership { get; set; }
}
```

`MembershipPauseConfiguration`:
- table `membership_pause`; check `ck_membership_pause_span`:
  `last_session_year IS NULL OR last_session_year >= first_session_year`;
  check `ck_membership_pause_founding`: `first_session_year >= 1971`.
- FK → `membership` Cascade, `fk_membership_pause_membership_membership_id`.
- `HasIndex(pause => pause.MembershipId)`.
- No reason/`Grund` column ever (plan §4 Ignored).

Overlap between two pauses of the same Mitgliedschaft is rejected by `MembershipService`
(`409 Conflict`), and a pause's Session span must lie inside its Mitgliedschaft's Session span
(`422`, decision I) — see §4 slice 12.

### 1.5 `FeeReduction` — new

```csharp
namespace Furria.Core.Identity;

public enum FeeReductionBasis
{
    Minor = 1,
    School = 2,
    Apprenticeship = 3,
    Studies = 4,
}

public sealed class FeeReduction : ITimestamped
{
    public int Id { get; set; }
    public int PersonId { get; set; }
    public FeeReductionBasis Basis { get; set; }
    public int FirstSessionYear { get; set; }
    public int LastSessionYear { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public Person? Person { get; set; }
}
```

`LastSessionYear` is **not nullable** — a Beitragsermäßigung always expires (CONTEXT: "it expires
on its own, so the Nachweis is renewed"). The plan's entity line lists it without a `?`; that is
deliberate.

`FeeReductionConfiguration`: table `fee_reduction`; `Basis` stored as a **string**
(`.HasConversion<string>().HasMaxLength(32)`, the house rule); check `ck_fee_reduction_span`
(`last_session_year >= first_session_year`) and `ck_fee_reduction_founding`
(`first_session_year >= 1971`); FK → `person` Cascade; `HasIndex(r => r.PersonId)`.
Overlapping reductions per Person are rejected in the service (`409`).

`Basis` is **never derived** from `BirthDate` (ruling 14).

### 1.6 `Group` — new

```csharp
namespace Furria.Core.Groups;

public sealed class Group : ITimestamped
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public bool IsRecruiting { get; set; }
    public DateOnly? ArchivedOn { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public ICollection<GroupMembership> Memberships { get; set; } = [];
    public ICollection<GroupAdmin> Admins { get; set; } = [];
}
```

`GroupConfiguration`:
- `builder.ToTable("group")` — **`group` is a reserved SQL word.** EF/Npgsql always quotes
  identifiers, so the generated SQL is safe; **any hand-written SQL must write `"group"`**
  (this bites `ApiTestFixture`-style raw statements and the migration review).
- `Name` `HasMaxLength(80).IsRequired()`, `Description` `HasMaxLength(400).IsRequired()`
  (empty string, never NULL).
- `IsRecruiting` `HasDefaultValue(false)`.
- **Unique among non-archived, case-insensitively**. The model-derived index would be
  case-**sensitive**, so "Tanzgarde" and "tanzgarde" would both pass it while the service rejects
  the second with `409` — a backstop that does not back the rule up. The index is therefore
  **hand-written in the migration** over a lowered expression:
  ```sql
  CREATE UNIQUE INDEX ix_group_name_active ON "group" (lower(name)) WHERE archived_on IS NULL;
  ```
  and declared in the model only as
  `builder.HasIndex(group => group.Name).HasDatabaseName("ix_group_name_lookup");` (plain, for the
  service's duplicate probe). This is the **one declared exception** to §1.11's "never write a
  column name by hand": an expression index is not model-derivable. The same applies verbatim to
  `ix_role_name_active` (§1.9). The service still answers the `409` — the index is the backstop,
  not the error message.
- **`ArchivedOn` is a fact of the past, never a plan.** `ArchiveGroup` (§4.28) takes **no** date;
  the service stamps `ClubClock.Today(_timeProvider)`. Nothing may write a future `archived_on`,
  which is why every consumer (`AffiliationQuery`, `GrantedKeysAsync`, the partial indexes, every
  "non-archived only" filter, the `archiviert` chip) tests `ArchivedOn == null` and never
  `ArchivedOn <= today`. Decision AE.
- No founding year. Ever.

### 1.7 `GroupMembership` — new (Zugehörigkeit)

```csharp
namespace Furria.Core.Groups;

public sealed class GroupMembership : ITimestamped
{
    public int Id { get; set; }
    public int GroupId { get; set; }
    public int PersonId { get; set; }
    public DateOnly JoinedOn { get; set; }
    public DateOnly? LeftOn { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public Group? Group { get; set; }
    public Person? Person { get; set; }
}
```

`GroupMembershipConfiguration`:
- table `group_membership`; check `ck_group_membership_period`
  (`left_on IS NULL OR left_on >= joined_on`).
- FK → `group` **Cascade**, FK → `person` **Restrict** (a Person is never deleted; her Gruppen
  history must not vanish by accident).
- `HasIndex(z => new { z.GroupId, z.PersonId })`, `HasIndex(z => z.PersonId)`.
- **At most one open row per pair** — the **named** overload, so this is a *second* index over the
  same property pair and not a mutation of the first (§1.3):
  `.HasIndex(z => new { z.GroupId, z.PersonId }, "ix_group_membership_group_id_person_id_open").IsUnique().HasFilter("left_on IS NULL")`.

Nothing ever deletes a row here (ruling 3).

**`DeleteBehavior` on `person` is uniformly `Restrict` across the whole phase** — `membership` and
`fee_reduction` included (§1.3, §1.5 are amended here). A mixed set is incoherent: three `Restrict`
edges already make a Person undeletable, so the two `Cascade` edges could never fire, and
`DatabaseResetService` truncates with `CASCADE`, which ignores FK actions entirely. Nothing in P1
deletes a Person, a Gruppe or a Rolle, so **no test asserts this behaviour** — do not write one
that cannot exist.

### 1.8 `GroupAdmin` — new

```csharp
namespace Furria.Core.Groups;

public sealed class GroupAdmin : ITimestamped
{
    public int Id { get; set; }
    public int GroupId { get; set; }
    public int PersonId { get; set; }
    public string? Function { get; set; }
    public DateOnly SinceOn { get; set; }
    public DateOnly? UntilOn { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public Group? Group { get; set; }
    public Person? Person { get; set; }
}
```

`GroupAdminConfiguration`: table `group_admin`; `Function` `HasMaxLength(64)`; check
`ck_group_admin_period` (`until_on IS NULL OR until_on >= since_on`); FK → `group` Cascade,
FK → `person` Restrict; partial unique `ix_group_admin_group_id_person_id_open` filtered
`until_on IS NULL`.

`Function` is a **label only** — no code branches on its value, ever.

### 1.9 `Role`, `RolePermission`, `RoleHolding` — new

```csharp
namespace Furria.Core.Roles;

public sealed class Role : ITimestamped
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public DateOnly? ArchivedOn { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public ICollection<RolePermission> Permissions { get; set; } = [];
    public ICollection<RoleHolding> Holdings { get; set; } = [];
}

public sealed class RolePermission : ITimestamped
{
    public int Id { get; set; }
    public int RoleId { get; set; }
    public string PermissionKey { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public Role? Role { get; set; }
}

public sealed class RoleHolding : ITimestamped
{
    public int Id { get; set; }
    public int RoleId { get; set; }
    public int PersonId { get; set; }
    public DateOnly SinceOn { get; set; }
    public DateOnly? UntilOn { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public Role? Role { get; set; }
    public Person? Person { get; set; }
}
```

Configurations:
- `role`: `Name` `HasMaxLength(80).IsRequired()`, `Description` `HasMaxLength(400).IsRequired()`;
  unique among non-archived, **case-insensitively** — `ix_role_name_active` is hand-written in
  migration 2 as `CREATE UNIQUE INDEX ix_role_name_active ON role (lower(name)) WHERE archived_on IS NULL;`
  exactly as §1.6 spells out for `group`. `ArchivedOn` is stamped by the service, never supplied
  (decision AE).
  **No `kind`/`type` column, no `locked`/`unique`/`multi` flag** (plan §4 Ignored).
- `role_permission`: **surrogate `int Id` primary key, not a composite key** — the table is in the
  `DatabaseResetService` snapshot list (§8) and the reset re-inserts every column verbatim, which
  needs Npgsql's default identity key. `PermissionKey` `HasMaxLength(64).IsRequired()`; unique
  index on `(RoleId, PermissionKey)`; FK → `role` Cascade.
- `role_holding`: check `ck_role_holding_period` (`until_on IS NULL OR until_on >= since_on`);
  FK → `role` Cascade, FK → `person` Restrict; partial unique
  `ix_role_holding_role_id_person_id_open` filtered `until_on IS NULL`, declared through the
  **named** `HasIndex(h => new { h.RoleId, h.PersonId }, "ix_role_holding_role_id_person_id_open")`
  overload (§1.3); `HasIndex(h => h.PersonId)` — this index carries every permission check.
- `group_admin` gets the same named-overload treatment for its partial unique index (§1.8).

### 1.10 `AppDbContext` additions

```csharp
public DbSet<Person> People => Set<Person>();
public DbSet<Membership> Memberships => Set<Membership>();
public DbSet<MembershipPause> MembershipPauses => Set<MembershipPause>();
public DbSet<FeeReduction> FeeReductions => Set<FeeReduction>();
public DbSet<Group> Groups => Set<Group>();
public DbSet<GroupMembership> GroupMemberships => Set<GroupMembership>();
public DbSet<GroupAdmin> GroupAdmins => Set<GroupAdmin>();
public DbSet<Role> Roles => Set<Role>();
public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
public DbSet<RoleHolding> RoleHoldings => Set<RoleHolding>();
public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
```

`ApplyConfigurationsFromAssembly` picks the configurations up; nothing else is registered.
`DatabaseResetService` derives its truncate set from the model, so **every new table is truncated
automatically** — no registration needed there either.

### 1.11 Migrations — three, in slice order

Generated with (Docker must be up; there is no design-time factory):
```bash
cd /home/florian/sources/furria/server && docker compose up -d
dotnet ef migrations add <Name> --project src/Furria.Infrastructure --startup-project src/Furria.Api
dotnet ef migrations script --project src/Furria.Infrastructure --startup-project src/Furria.Api   # review
dotnet csharpier format .
```
Never `dotnet ef database update` — `DatabaseMigrator` (`IHostedService`) applies them at startup.

| # | Slice | Name | Contains |
|---|---|---|---|
| 1 | 1 | `RegistryFacts` | drop `membership` and recreate it as a period table (ruling 10 — rows are recreated, not migrated); drop `ix_membership_status`; add `membership_pause`, `fee_reduction`; add `person.birth_date`, `person.contact_visible_to_members` |
| 2 | 2 | `Roles` | `role`, `role_permission`, `role_holding`, hand-written `ix_role_name_active` |
| 3 | 3 | `Groups` | `group`, `group_membership`, `group_admin`, hand-written `ix_group_name_active` |

**Three hand-edits of the generated migrations are required and authorised.** Nothing else in a
generated migration may be touched.

1. **Migration 1, `membership`.** `dotnet ef migrations add RegistryFacts` will emit
   `RenameColumn(started_at → started_on)`, `DropColumn(type)`, `DropColumn(status)`,
   `DropIndex(ix_membership_status)` — it *preserves* rows, because the entity type is not removed.
   Ruling 10 says rows are **recreated, not migrated**. Replace the whole `membership` operation
   block with `migrationBuilder.DropTable("membership");` followed by the full `CreateTable`. The
   review step (`dotnet ef migrations script`) must confirm the drop/create.
2. **Migration 2**, `ix_role_name_active`: replace the generated `CreateIndex` with the
   `lower(name)` SQL of §1.9.
3. **Migration 3**, `ix_group_name_active`: the same, per §1.6. Remember the quoting —
   `ON "group" (lower(name))`.

### 1.12 Exactly what happens to the existing membership path

| Artefact | Fate |
|---|---|
| `Furria.Core/Identity/MembershipType.cs` | **deleted** |
| `Furria.Core/Identity/MembershipStatus.cs` | **deleted** |
| `Membership.Type`, `Membership.Status` | **deleted**; `StartedAt`/`EndedAt` → `StartedOn`/`EndedOn` |
| `Person.Membership` | **deleted**, replaced by `Person.Memberships` (one-to-many) |
| `MembershipConfiguration` | rewritten (§1.3); `ix_membership_status` gone; **two** indexes now exist on `person_id` — the plain `ix_membership_person_id` (closed-period lookups) and the partial unique `ix_membership_person_id_open` |
| `Furria.Application/Identity/MembershipDetails.cs` | rewritten as `MembershipDetails { int MembershipId; DateOnly StartedOn; DateOnly? EndedOn; bool IsRunning; bool IsFuture; IReadOnlyList<MembershipPauseDetails> Pauses }` |
| new `Furria.Application/Identity/MembershipPauseDetails.cs` | `{ int PauseId; int FirstSessionYear; int? LastSessionYear }` — `Core.SessionSpan` carries **no id**, and `PutMembershipPause` (§4.22) is addressed by `pauseId`, so the person read needs a type that has one |
| new `Furria.Application/Identity/MembershipChainDetails.cs` | `{ MembershipState State; DateOnly? MemberSince; MembershipDetails? Current; IReadOnlyList<MembershipDetails> All }` — what `GetMe` and every person read return. `GetMe` maps `Current` down to the four flat fields of `MeMembershipDto`; `GetPersonById` maps `All` to `PersonMembershipDto[]`, ids included |
| `AccountService.GetDetailsAsync` | loads `Memberships` + their pauses, returns `AccountDetails.MembershipChain` (never a single `Membership`) |
| `Api/Endpoints/Auth/GetMe.cs` | `AccountMembershipDetailsDto` replaced by `MeMembershipDto` (§4.1) |
| `MembershipExpectations` | **rescoped and renamed.** The shipped accessor is `Expected.MembershipOf(int personId)` (documented in `docs/server/TESTING.md`) and it is **person**-scoped; with several periods per Person it becomes ambiguous. It is replaced by two accessors: `Expected.Membership(int membershipId)` (`ToHavePeriod`, `ToBeOpen`, `ToNotExist`) and `Expected.MembershipsOfPerson(int personId)` (`ToHaveCount`, `ToHaveOpenCount`). `ToHave(type, status)` is deleted with the enums. **`docs/server/TESTING.md` is a slice-1 deliverable** — its `MembershipOf(…).ToNotExist()` example is rewritten, or the doc teaches a method that no longer exists |
| `ApiTestFixture.InsertMembershipDirectlyAsync` | **deleted** — the one-to-one fixup trap it existed for disappears with the collection navigation; tests seed two periods through `AddMembership` twice |
| `MembershipPersistenceTests.Should_RejectASecondMembership_When_ThePersonAlreadyHasOne` | **replaced** by `Should_RejectASecondOpenMembership_When_OneIsAlreadyOpen` (the partial unique index) and `Should_AcceptASecondMembership_When_TheFirstOneEnded` |
| `lib/api/schemas.ts` (`MembershipTypeSchema`, `MembershipStatusSchema`, `MembershipSchema`) | rewritten (§5.1) |
| `lib/membership-labels.ts` | `toMembershipTypeLabel` **deleted**; `toMembershipStatusLabel` replaced by `toMembershipStateLabel`; `formatIsoDay` **kept**; the shipped `formatMembershipPeriod` is **renamed `formatPeriod`** (§5.1) — it formats any period, not only a Mitgliedschaft's, and §10.3 gives it five consumers |
| `features/profile/components/ProfileMembershipPanel.tsx` | "Art" row deleted; "Status" reads the derived state; "Zeitraum" reads the chain |
| `features/session/components/AppUserLink.tsx` | `meta` line stops naming a Mitgliedschaftsart |

---

## 2. Derived-fact helpers

Every derived fact of the domain map lives in **exactly one pure place** and is called from there
by every service, endpoint and seeder. Re-deriving a rule inside an endpoint is a contract
violation. All of these are `[Pure]`, allocation-free where possible, and take a `DateOnly today`
that the caller obtains from the **injected `TimeProvider`** (MET006 — `DateTime.Now` is a build
error in production code).

### 2.0 `Furria.Core/Club/ClubClock.cs` — the only way to get "today"

```csharp
namespace Furria.Core.Club;

public static class ClubClock
{
    private static readonly TimeZoneInfo ClubTimeZone =
        TimeZoneInfo.FindSystemTimeZoneById("Europe/Berlin");

    [Pure]
    public static DateOnly Today(TimeProvider timeProvider) =>
        DateOnly.FromDateTime(
            TimeZoneInfo.ConvertTime(timeProvider.GetUtcNow(), ClubTimeZone).DateTime
        );
}
```

**`DateOnly.FromDateTime(timeProvider.GetUtcNow().UtcDateTime)` is banned everywhere** — the
authorizer and every service. Every fact in this domain is a **German calendar day**,
and every boundary in the model is inclusive on that day: between 23:00 and midnight CET (22:00
CEST) a UTC "today" is the *previous* day, so for two hours every night a Berechtigung held
`until_on = today` would stop granting, a Zugehörigkeit ended today would still run, and
`ClubSession.YearOf` would flip a Session a day late on 11.11. — while the client, which reads its
own local clock, says otherwise. `Europe/Berlin` is the IANA id; .NET resolves it on every
platform. `ClubClock` is the twin of `lib/club.ts`'s local-time reading on the client.

### 2.1 `Furria.Core/Club/ClubSession.cs`

```csharp
using System.Diagnostics.Contracts;

namespace Furria.Core.Club;

public static class ClubSession
{
    public const int FoundingYear = 1971;
    public const int OpeningMonth = 11;
    public const int OpeningDay = 11;

    [Pure]
    public static int YearOf(DateOnly date) =>
        date.Month > OpeningMonth || (date.Month == OpeningMonth && date.Day >= OpeningDay)
            ? date.Year
            : date.Year - 1;

    [Pure]
    public static int NumberOf(int sessionYear) => sessionYear - FoundingYear + 1;

    [Pure]
    public static string LabelOf(int sessionYear) =>
        $"{sessionYear}/{(sessionYear + 1) % 100:D2}";
}
```

The exact twin of the shipped `web/apps/club-app/src/lib/club.ts` `sessionAt` (decision H): a
Session **year** runs 11.11. → 10.11. with no gaps, so every date belongs to exactly one Session
and the months between Aschermittwoch and the next Eröffnung belong to the Session that last
opened. `LabelOf(2025)` → `"2025/26"`; `NumberOf(2026)` → `56`.

### 2.2 `Furria.Core/Club/DatePeriod.cs`

```csharp
public readonly record struct DatePeriod
{
    public required DateOnly Start { get; init; }
    public required DateOnly? End { get; init; }

    [Pure]
    public bool IsOpen => End is null;

    [Pure]
    public bool IsRunningOn(DateOnly today) => Start <= today && (End is null || End >= today);

    [Pure]
    public bool Overlaps(DatePeriod other) =>
        Start <= (other.End ?? DateOnly.MaxValue) && other.Start <= (End ?? DateOnly.MaxValue);

    [Pure]
    public bool IsWellFormed => End is null || End >= Start;
}
```

**Both ends inclusive** (decision B): a period ended today still runs today, and
`Start == End` is one valid day. `IsOpen` is **not** `IsRunningOn` — a row with a future `Start`
is open but not running. Every derived fact uses `IsRunningOn`, never `IsOpen` (decision C:
future starts and future ends are legal; only `End >= Start` is validated).

### 2.3 `Furria.Core/Club/SessionSpan.cs`

```csharp
public readonly record struct SessionSpan
{
    public required int FirstYear { get; init; }
    public required int? LastYear { get; init; }

    [Pure]
    public bool Contains(int sessionYear) =>
        FirstYear <= sessionYear && (LastYear is null || LastYear >= sessionYear);

    [Pure]
    public bool Overlaps(SessionSpan other) =>
        FirstYear <= (other.LastYear ?? int.MaxValue) && other.FirstYear <= (LastYear ?? int.MaxValue);

    [Pure]
    public bool IsWellFormed => LastYear is null || LastYear >= FirstYear;
}
```

Both bounds inclusive. A `FeeReduction` always has a `LastYear`; a `MembershipPause` may be
open-ended, and an open-ended pause does **not** end by itself (boundary case 4).

### 2.4 `Furria.Core/Club/MembershipState.cs` and `MembershipStateCalculator.cs`

```csharp
public enum MembershipState
{
    None = 1,
    Ended = 2,
    Paused = 3,
    Active = 4,
}

public static class MembershipStateCalculator
{
    [Pure]
    public static MembershipState Resolve(
        IReadOnlyCollection<DatePeriod> periods,
        IReadOnlyCollection<SessionSpan> pausesOfRunningPeriod,
        DateOnly today
    );

    [Pure]
    public static DateOnly? MemberSince(IReadOnlyCollection<DatePeriod> periods);
}
```

Semantics, exactly (decision G — four display values):

```
Resolve(periods, pauses, today) =
    None    when periods is empty
            OR every period.Start > today                       -- never (yet) a Mitglied
    Ended   when no period IsRunningOn(today)
            AND some period.Start <= today                      -- a chain has begun, none runs
    Paused  when a period runs AND some pause Contains(ClubSession.YearOf(today))
    Active  otherwise

MemberSince(periods) = MIN(p.Start) over every period with Start <= today; null when none has
```

`pausesOfRunningPeriod` are the pauses of the **running** period only — a pause on an ended period
never produces `Paused` (boundary case 6). `MemberSince` reads the whole **begun** chain and is
never reset by a Kündigung, a rejoin or a Ruhezeit.

**Why the `Start <= today` clauses** (decision AF). Decision C makes a future start legal — an
accepted Beitrittsantrag whose Aufnahme is dated next month is the ordinary reason. Without the
clauses that Person has a non-empty chain with nothing running, so `Resolve` returns `Ended` and
the app tells a brand-new member that she has quit, while `MemberSince` returns a date in the
future („Mitglied seit 01.12.2026"). With them she reads `kein Mitglied` — **true today** — and
flips to `aktiv` with a correct „Mitglied seit" on the day itself. A future row is stored and
invisible until its day, exactly as decision C promises. **No fifth state is introduced**: decision
G pins four display values, and a fifth would add a chip, an enum member, a label and a filter to
eleven surfaces to describe a row that Person bearbeiten already shows in full (§4.15's `IsFuture`).

### 2.5 `Furria.Infrastructure/Registry/AffiliationQuery.cs`

Affiliation is a database predicate, not an in-memory one — it filters ~150 rows and must compose
into EF queries. It lives as a single reusable expression:

```csharp
namespace Furria.Infrastructure.Registry;

public static class AffiliationQuery
{
    [Pure]
    public static Expression<Func<Person, bool>> IsAffiliatedOn(DateOnly today) =>
        person =>
            person.Memberships.Any(m => m.StartedOn <= today && (m.EndedOn == null || m.EndedOn >= today))
            || person.GroupMemberships.Any(z =>
                z.JoinedOn <= today
                && (z.LeftOn == null || z.LeftOn >= today)
                && z.Group!.ArchivedOn == null)
            || person.RoleHoldings.Any(h =>
                h.SinceOn <= today
                && (h.UntilOn == null || h.UntilOn >= today)
                && h.Role!.ArchivedOn == null);
}
```

**Archiving excludes** (decision D): a Zugehörigkeit in an archived Gruppe and an Inhaberschaft of
an archived Rolle stop conferring affiliation, without the periods being rewritten. History
survives; the Person simply falls out of `/members` until the Gruppe is reactivated. Every
Gruppenverwaltung archive confirmation must say so (§10).

Having an Account is irrelevant to affiliation. Every key holder is affiliated by construction
(a running `role_holding` satisfies the predicate), so a key-gated endpoint never also checks
affiliation.

**`group_admin` rows are deliberately absent from the predicate** — CONTEXT.md and ruling 1 both
define affiliation as *running Mitgliedschaft ∨ open Zugehörigkeit ∨ running Inhaberschaft*, and a
Gruppen-Admin is none of those. Consequence, stated here so nobody "fixes" it: a Person who is
**only** a Gruppen-Admin (the Kindergarde's 43-year-old Trainerin, if the club records nothing else
for her) is **not affiliated** — her Gruppen-Hub works (it has its own gate,
`IsGroupMemberOrAdminAsync`), and `/members` and `/groups` answer 403. The remedy is a club act —
give her a Zugehörigkeit or a Rolle — not a widened predicate. §9.3 requires the UX-pass script to
produce one such Person so the pass sees this case. Decision AG.

### 2.6 Where the rest live

| Fact | Home | Signature |
|---|---|---|
| current members of a Gruppe | `GroupService` | `.Where(z => z.JoinedOn <= today && (z.LeftOn == null \|\| z.LeftOn >= today))` — the `DatePeriod.IsRunningOn` rule expressed in SQL |
| current admins of a Gruppe | `GroupService` | same shape over `group_admin` |
| "in der Gruppe seit" | `GroupService` | `MIN(z.JoinedOn)` over **all** of that Person's rows for that Gruppe |
| Inhaber of a Rolle | `RoleService` | running `role_holding` rows |
| "Rolle seit" | `RoleService` | `MIN(h.SinceOn)` over that Person's holdings of that Rolle |
| `isGranted(account, key)` | `PermissionAuthorizer` | §3.2 |
| `isGroupAdmin(account, group)` | `PermissionAuthorizer` | §3.3 |
| the Session of today | `ClubSession.YearOf(today)` | §2.1 |

The **same chain rule** applies to every "seit": always the minimum over the whole chain, never the
latest row. **`Since` is the only field any `KkSinceRow` may render** (§4.0); `SinceOn`, `UntilOn`,
`JoinedOn` and `LeftOn` are row identity and belong to `KkFactRow` and the history panels alone.
A *closed* row never renders a "seit" at all — it renders its span.

Frontend twins (§5.1): `web/apps/club-app/src/lib/club.ts` already owns `sessionAt`; the state
label mapper and the period formatter are pure modules with unit tests. The client **never
re-derives** `state` or `memberSince` — the API sends them.

---

## 3. Authorization

### 3.1 The key constants

`server/src/Furria.Application/Authorization/FurriaPermissions.cs`:

```csharp
namespace Furria.Application.Authorization;

public static class FurriaPermissions
{
    public const string PersonsReadDetails = "persons.read_details";
    public const string PersonsManage = "persons.manage";
    public const string GroupsManage = "groups.manage";
    public const string RolesManage = "roles.manage";

    public static readonly IReadOnlyList<string> All =
    [
        PersonsReadDetails,
        PersonsManage,
        GroupsManage,
        RolesManage,
    ];
}
```

The **dot form is the pinned spelling** (decision A) — `plan/server/identity-foundation.md`'s
frozen `{area}:{action}` line is superseded and must be corrected when that file is next touched.
Exactly these four keys ship; the catalogue grows per phase, the keys stay code constants
(ruling 4).

### 3.2 `PermissionAuthorizer` — moved and implemented

The class **moves from `Furria.Application.Authorization` to
`Furria.Infrastructure.Authorization`** (new file
`server/src/Furria.Infrastructure/Authorization/PermissionAuthorizer.cs`; the Application copy is
deleted). Reason: it needs `AppDbContext`, and `Furria.Application` references `Furria.Core` only.
The precedent is `AccountService` / `RefreshTokenService`, which live in Infrastructure and are
injected straight into endpoints. **No interface is introduced** — ADR-0001 bans mocks and
`/backend-work` bans an interface without a genuine second implementation.
Registration moves from `AddApplication()` to `AddInfrastructure()`, still `AddScoped`.
`Furria.Api.Authorization.PermissionEnforcer` keeps resolving it by concrete type from
`http.RequestServices` — only its `using` changes.

```csharp
namespace Furria.Infrastructure.Authorization;

public sealed class PermissionAuthorizer
{
    private readonly AppDbContext _dbContext;
    private readonly TimeProvider _timeProvider;
    private readonly Dictionary<int, GroupTies> _groupTiesCache = new();

    private int? _personId;
    private bool _personResolved;
    private HashSet<string>? _grantedKeys;
    private bool? _isAffiliated;

    public PermissionAuthorizer(AppDbContext dbContext, TimeProvider timeProvider) { … }

    public async Task<bool> IsGrantedAsync(int accountId, string permissionKey, CancellationToken ct);
    public async Task<IReadOnlyCollection<string>> GrantedKeysAsync(int accountId, CancellationToken ct);
    public async Task<bool> IsAffiliatedAsync(int accountId, CancellationToken ct);
    public async Task<bool> IsGroupAdminAsync(int accountId, int groupId, CancellationToken ct);
    public async Task<bool> IsGroupMemberOrAdminAsync(int accountId, int groupId, CancellationToken ct);
    public async Task<bool> CanAdministerGroupAsync(int accountId, int groupId, CancellationToken ct);
    public async Task<bool> CanSearchPersonsAsync(int accountId, CancellationToken ct);
}

private readonly record struct GroupTies(bool IsAdmin, bool IsMember);
```

**One cache entry per `groupId`, carrying both answers.** A single `bool` keyed by `groupId`
cannot serve three questions whose answers differ: for one request and one Gruppe
`IsGroupAdminAsync` may be `false` while `IsGroupMemberOrAdminAsync` is `true`, and the hub read
calls both (`IsGroupMemberOrAdminAsync` to gate, then `ViewerIsAdmin` to shape the payload). The
cache is filled by **one** query per `groupId`:

```csharp
var ties = await _dbContext
    .Groups.Where(group => group.Id == groupId)
    .Select(group => new GroupTies(
        group.Admins.Any(a => a.PersonId == personId && a.SinceOn <= today && (a.UntilOn == null || a.UntilOn >= today)),
        group.Memberships.Any(z => z.PersonId == personId && z.JoinedOn <= today && (z.LeftOn == null || z.LeftOn >= today))
    ))
    .SingleOrDefaultAsync(ct);
```

Semantics:

```
today            := ClubClock.Today(_timeProvider)              (§2.0 — never the UTC date)
personOf(account):= account.person_id            (resolved once, cached in _personId)

GrantedKeysAsync := { rp.permission_key
                      | h IN role_holding, rp IN role_permission,
                        rp.role_id = h.role_id AND h.person_id = personOf(account)
                        AND h.since_on <= today AND (h.until_on IS NULL OR h.until_on >= today)
                        AND h.role.archived_on IS NULL }
IsGrantedAsync   := GrantedKeysAsync contains permissionKey
IsAffiliatedAsync:= AffiliationQuery.IsAffiliatedOn(today) applied to personOf(account)
IsGroupAdminAsync:= EXISTS a IN group_admin WHERE a.person_id = personOf(account)
                      AND a.group_id = groupId
                      AND a.since_on <= today AND (a.until_on IS NULL OR a.until_on >= today)
IsGroupMemberOrAdminAsync := ties.IsAdmin OR ties.IsMember
CanAdministerGroupAsync   := ties.IsAdmin OR IsGrantedAsync(groups.manage)
CanSearchPersonsAsync     := IsGrantedAsync(persons.manage) OR IsGrantedAsync(groups.manage)
                             OR IsGrantedAsync(roles.manage)
                             OR EXISTS a IN group_admin WHERE a.person_id = personOf(account)
                                AND a.since_on <= today AND (a.until_on IS NULL OR a.until_on >= today)
```
(`IsGroupAdminAsync` is `ties.IsAdmin`.) `CanSearchPersonsAsync` is the gate of §4.41 — "may this
caller put a Person into something?". It is the one question whose answer is not
Gruppe-scoped, so it caches in its own `bool?` field.

Notes that matter:
- A **disabled or missing Account**, or an Account whose Person cannot be resolved, yields
  `false` everywhere. **Fail closed**, always.
- `a.until_on = today` still grants — the Berechtigung is held on the `until_on` day itself
  (boundary case 5).
- The **archived Rolle exclusion** in `GrantedKeysAsync` is decision D. The group-scoped checks do
  **not** filter on `ArchivedOn`, and the reason is not "so a manager can restore one" —
  `RestoreGroup` (§4.29) is gated on `groups.manage` and never calls them. The real reason:
  **every write endpoint answers 409 for an archived Gruppe and the hub read 404s**, so the filter
  would be redundant, and `IsGroupAdminAsync` stays a pure "does this row run today" question.

**Per-request caching** (gap G3): the authorizer is `AddScoped`, so one instance serves one
request. `_grantedKeys`, `_isAffiliated`, `_personId`, `_canSearchPersons` and `_groupTiesCache`
are filled on first use and reused — a request that checks a key and then a group-admin flag
issues at most three queries.

### 3.3 Declaring a gate on an endpoint

Three gate kinds, three mechanisms.

**(a) Key gate — declarative, unchanged.** In `Configure()`, after the verb and route:
```csharp
Definition.RequirePermission(FurriaPermissions.PersonsManage);
```
The global `PermissionEnforcer` (`IGlobalPreProcessor`, wired once in `Program.cs`) picks the
metadata up. Unauthenticated → **401** (the auth middleware rejects first); authenticated without
the key → **403**. No `Policies(...)`, no `[Authorize]`, one key per endpoint.

**(b) Affiliation gate — declarative, new.** Two new files in `Furria.Api/Authorization/`:

```csharp
public sealed record AffiliationRequirement;

public static class EndpointPermissionExtensions      // extended
{
    public static void RequireAffiliation(this EndpointDefinition definition) =>
        definition.Options(route => route.WithMetadata(new AffiliationRequirement()));
}
```
`PermissionEnforcer.PreProcessAsync` gains a second branch, checked **before** the key branch:
if the endpoint carries an `AffiliationRequirement`, resolve the authorizer and
`await authorizer.IsAffiliatedAsync(accountId, ct)`; on false →
`await http.Response.SendForbiddenAsync(ct)`. An endpoint never carries both.

Usage: `Definition.RequireAffiliation();` — one line, on `GetMembers`, `GetMemberById`,
`GetGroups`, `GetGroupById`.

**(c) Group-scoped gate — in-handler.** The hub's write gate is a **disjunction** ("Gruppen-Admin
of this Gruppe **or** holds `groups.manage`", rulings 9/12), which the single-string
`PermissionRequirement` cannot express, and it needs the route value. So it is checked in
`HandleAsync`, first thing after reading the caller:

```csharp
var accountId = User.AccountId();
if (accountId is null)
{
    await Send.UnauthorizedAsync(ct);
    return;
}

if (!await _authorizer.CanAdministerGroupAsync(accountId.Value, req.GroupId, ct))
{
    await Send.ForbiddenAsync(ct);
    return;
}
```

`Send.ForbiddenAsync` is the FastEndpoints 8 counterpart of the `Send.*Async` family already in
use; this contract introduces it. The hub **read** endpoints use
`IsGroupMemberOrAdminAsync` instead (decision E: `groups.manage` does **not** open
`/my-groups/$groupId`; the higher instance works through `/manage/groups`, so "Meine Gruppen"
keeps meaning *mine*).

**(d) Nothing may be ungated by accident.** Kind (c) is five hand-written `if` blocks; nothing
fails the build or the suite when one is forgotten, and a forgotten one is a silent privilege
escalation with a green suite. §8.8 therefore ships **one guard test** that enumerates the
registered endpoints and asserts every one carries a `PermissionRequirement`, an
`AffiliationRequirement`, `AllowAnonymous`, or appears in a named allowlist. Adding an ungated
endpoint goes red.

### 3.4 `Result<T>` → HTTP, and the non-generic `Result`

New: `server/src/Furria.Application/Results/Result.cs` — the void counterpart, same factory
methods (`Success()`, `NotFound`, `Conflict`, `Validation`, `Unauthorized`, **`Forbidden`**), same
`IsSuccess`/`Error` surface. Every mutation that returns nothing returns `Result`; never a bare
`Task`.

Changed: `ResultErrorKind` gains **`Forbidden = 5`**, and `Result<T>` gains
`Result<T>.Forbidden(string message)`. Without it one enum member would carry two incompatible HTTP
meanings — `AccountService.LoginAsync` and `RefreshSessionAsync` already return
`Result<SessionTokensDetails>.Unauthorized(RejectedCredentialsMessage)`, which **must** stay 401,
while a permission failure **must** be 403. Resolving that by "which endpoint file handles it" is
exactly the kind of second spelling §0 forbids, and the first agent who writes
`SendFailureAsync(result.Error, ct)` inside `Login` — because §3.4 calls it *"the shape every
mutation copies"* — would make a wrong password answer 403 and silently stop logging people out.
**A credential failure is `Unauthorized`; a permission or visibility failure is `Forbidden`.**
Decision Q is restated accordingly.

New: `server/src/Furria.Api/Results/ResultResponseExtensions.cs`:

```csharp
namespace Furria.Api.Results;

public static class ResultResponseExtensions
{
    private const string ConflictField = "conflict";
    private const string ValidationField = "request";

    public static Task SendFailureAsync(this HttpResponse response, ResultError error, CancellationToken ct);
}
```

The **only** translation table in the codebase:

| `ResultErrorKind` | HTTP | Shape |
|---|---|---|
| `NotFound` | **404** | empty |
| `Conflict` | **409** | FastEndpoints error payload, one failure on field `conflict` carrying `error.Message` |
| `Validation` | **422** | FastEndpoints error payload, one failure on field `request` carrying `error.Message` |
| `Forbidden` | **403** | empty |
| `Unauthorized` | **401** | empty |

A permission or visibility failure is **`Forbidden` → 403, never 401**. ADR-0006 makes a 401
terminal in the Club-App — the client clears both tokens and logs the member out — so a permission
failure answered 401 would log people out of the app. `Unauthorized` is reserved for a **credential**
failure and keeps its 401; `Login`, `Refresh` and the "no token at all" branch are its only
producers, and `SendFailureAsync` is now safe to use in all three.

**The German `error.Message` is user-facing copy, and the client renders it verbatim** for 409 and
422 (§5.0). That is what makes the three different 422 causes of `PutMembership` distinguishable to
the person fixing the data, what gives `ClubSession.LabelOf` its backend consumer (the pause
message), and what puts every message below into §10's remit. No machine-readable `ResultError.Code`
is introduced — one string with one meaning beats a code plus a lookup table (decision AH).

Endpoint usage, the shape every mutation copies:
```csharp
var result = await _groupService.EndMembershipAsync(command, ct);
if (!result.IsSuccess)
{
    await HttpContext.Response.SendFailureAsync(result.Error, ct);
    return;
}

await Send.NoContentAsync(ct);
```

`400` remains the validator's territory (FluentValidation, automatic). `422` is for a rule the
validator cannot see (cross-row: "the pause lies outside its Mitgliedschaft"), `409` for a state
conflict (an open row already exists, a duplicate name, overlapping periods).

### 3.5 `ClaimsPrincipal.PersonId()`

`Furria.Api/Authorization/ClaimsPrincipalExtensions.cs` gains a twin of `AccountId()` reading
`FurriaClaimTypes.PersonId` — the claim is already issued and read by nothing (gap G8). It is used
**only** by `PutMyContactVisibility` and the own-profile path, where "the caller's own Person" is
the whole authorization story. Every other check starts from `AccountId()` and hops through the
authorizer, which owns the Account → Person resolution and caches it.

### 3.6 What the bootstrap seeder adds (ruling 11)

`BootstrapAdminSeeder.StartAsync` is split into three guarded steps that run in order in one scope:

```
0. if _options.Email or _options.Password is empty            -> return  (all three steps skipped)
1. EnsureBootstrapAccountAsync   guard: NO Account with _options.Email exists   (CHANGED)
2. EnsureAdminRoleAsync          guard: NO Role named "Admin" exists
3. (inside step 2) create one RolePermission row per FurriaPermissions.All
   and one open RoleHolding (SinceOn = ClubClock.Today(...), UntilOn = null)
   for the Person behind the bootstrap Account — UNCONDITIONALLY.
```

**Invariant: the seeder never leaves an `Admin` Rolle without an open Inhaberschaft.** If it cannot
resolve the bootstrap Person in step 3 it throws `InvalidOperationException`, exactly like the
existing Identity-failure branch.

Constants: `private const string AdminRoleName = "Admin";` and the description
`"Vollzugriff. Vom System angelegt, danach ganz normale Vereinsdaten."`

Why step 1's guard **narrows** (gap G4, and the lockout it would otherwise create): the shipped
guard is `if (await dbContext.Users.AnyAsync(ct)) return;` — "no Account exists **at all**". On any
database that already has an Account (one self-registered ticket buyer is enough) step 1 returns
without creating the bootstrap Account. If steps 2 and 3 then ran outside that branch with step 3
conditional on the Account existing, the result is an `Admin` Rolle holding all four keys with
**zero Inhaber** — and because step 2 never reconciles (decision W), it would never be fixed.
Granting a holding needs `roles.manage`, which nobody would hold: the club would be permanently
un-administrable, with no CLI and no `--repair`. Narrowing the guard to *"no Account with the
configured bootstrap email exists"* makes the bootstrap Person exist before step 2 runs, so step 3
is unconditional and ruling 11 is honoured literally ("…**and** an open Inhaberschaft for the
bootstrap Person").

Behaviour change to note in slice 2's PR: a database that has other Accounts but no bootstrap
Account now gains one on the next start. That is the recovery path, and it is the documented
purpose of a bootstrap account. Step 0 keeps an unconfigured environment inert — an unheld
all-keys Rolle is worse than no Rolle.

Why "create once, never reconcile": ruling 11 says the Rolle is **ordinary data afterwards** —
editable, archivable, its keys the club's business. The seeder must never re-add a key the club
removed. If a Rolle named `Admin` exists, step 2 does nothing at all.

The whole seeder keeps running inside a transaction and keeps throwing
`InvalidOperationException` when Identity refuses to create the account.

Test-harness consequence (§8): the three seeded row kinds must be appended to the
`DatabaseResetService` snapshot array, parents before children, or they vanish on every per-test
truncate. Second consequence, easy to miss: from slice 2 on the bootstrap admin holds a running
`RoleHolding`, so **she is affiliated** and appears in `GetMembers` and `GetPersons` in **every**
test. Assert by alias membership, never by a raw `Count` (§4.2, §4.14, §8.6).

---

## 4. Endpoint catalogue

**40 new endpoints plus a rewritten `GetMe`.** This section is the contract the frontend codes
against.

### 4.0 Conventions that hold for every entry

- **Route prefix** `api` is global (`c.Endpoints.RoutePrefix = "api"`), so `Get("members")` serves
  `GET /api/members`. Routes below are written **with** the prefix for clarity; the `Configure()`
  call omits it.
- **Route families and their gate** — one prefix, one gate:
  | prefix | gate |
  |---|---|
  | `api/auth/me*` | authenticated (own Account) |
  | `api/members*`, `api/groups` (GET), `api/groups/{id}` (GET) | `Definition.RequireAffiliation()` |
  | `api/my-groups` (collection) | authenticated — the honest answer for an Account with no ties is an empty list, not a 403 |
  | `api/my-groups/{groupId}` | in-handler `IsGroupMemberOrAdminAsync` |
  | `api/groups/{id}/**` (writes) | in-handler `CanAdministerGroupAsync` (Gruppen-Admin ∨ `groups.manage`) |
  | `api/person-search` | in-handler `CanSearchPersonsAsync` (§4.41) |
  | `api/manage/persons**` | `RequirePermission(PersonsManage)` |
  | `api/manage/groups**` | `RequirePermission(GroupsManage)` |
  | `api/manage/roles**` | `RequirePermission(RolesManage)` |
  | `api/public/**` | `AllowAnonymous()` |
- **One file per endpoint** containing Endpoint + Request + Validator + Response, `sealed`,
  ctor-injected `private readonly` fields, manual `static` mapping methods
  (`ToQuery`/`ToCommand`/`ToResponse`/`ToDto`). No endpoint shares a Request or Response with
  another. No endpoint touches `AppDbContext`.
- **Route parameters bind by property name *and carry `[RouteParam]`*** (this phase sets the
  precedent, gap G7):
  ```csharp
  Get("members/{personId}");
  // ...
  [RouteParam]
  public required int PersonId { get; init; }
  ```
  The attribute is **not optional**. FastEndpoints deserializes the JSON body with
  System.Text.Json **first** (body → form → route → query); `personId` is not in the body, so STJ's
  `required`-member enforcement throws `JsonException: … was missing required properties` before
  route binding ever runs. The FastEndpoints documentation states it directly: *"When using the
  `required` keyword with properties bound from sources other than the JSON body (e.g. route
  parameters), decorate these properties with their respective binding attributes to avoid
  serializer errors."* The same annotation is what lets the typed test client
  (`client.POSTAsync<TEndpoint, TRequest>`) lift the id out of the body and into the URL, so
  **every test file in §8 depends on it too**. `FastEndpoints.Attributes` 8.2.0 is already on the
  machine transitively; add `using FastEndpoints;`.
  This is stated once and copied into ~20 endpoint files and ~20 test files — get it right once.
- **Dates on the wire** are `DateOnly` in C# and **ISO date strings** `"2025-11-11"` in JSON
  (`z.iso.date()` on the client). Never `DateTime`, never a timestamp, never a locale format.
- **Enums on the wire are camelCase strings.** `Program.cs` registers
  `new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)` on the FastEndpoints serializer, so
  `MembershipState.Paused` → `"paused"`, `FeeReductionBasis.Apprenticeship` → `"apprenticeship"`.
  The retired int-enum decoding idiom in `lib/api/schemas.ts` goes away with the enums it decoded.
- **Sorting** is server-side and stable: people by `LastName, FirstName, Id`; Gruppen and Rollen by
  `Name, Id`; periods by `StartedOn DESC, Id DESC` (newest fact first).
  **Every name sort collates German.** `postgres:18-alpine` (the compose file *and* Testcontainers)
  is a musl build whose default collation sorts every umlaut after `Z`, while the client's letter
  dividers and A–Z index bucket `Kühnel` under `K` — the list would show a `K` section and then a
  stray block of `Kühnel`, `Löffler`, `Möller`, `Tröger` at the end. So:
  `.OrderBy(p => EF.Functions.Collate(p.LastName, "de-DE-x-icu")).ThenBy(p => EF.Functions.Collate(p.FirstName, "de-DE-x-icu")).ThenBy(p => p.Id)`,
  and the same for `Name` on Gruppen and Rollen. Slice 4 ships
  `Should_SortUmlautsAsGerman_When_ListingMembers` (seed `Kühnel`, `Kuhn`, `Zimmermann`; assert
  `Kuhn < Kühnel < Zimmermann`) — the suite runs the same image, so the test is the verification
  that the ICU collation exists.
- **No paging anywhere in P1.** The registry is ~150 Personen; a list endpoint returns the whole
  set in one payload. The mock's "… 140 weitere" footer and "Weitere laden" button are dropped —
  a list that cannot show its own data is worse than a long list with a letter index.
- **Status codes**: 200 read, **200 create** (with the new id in its Response — no
  `Send.CreatedAtAsync`, no `Location` header; the codebase has no location-header convention and
  P1 does not invent one), 204 for a write with no body, 400 validator, 403 gate, 404 missing or
  invisible, 409 conflict, 422 cross-row rule. **No endpoint in P1 answers 201.**
- **Shared DTO shapes** (each endpoint declares its own copy — endpoints never share types; these
  are the canonical field sets to copy):
  ```
  PersonRefDto      { int PersonId; string FirstName; string LastName }
  SincePersonDto    { int PersonId; string FirstName; string LastName; DateOnly Since }
  GroupRefDto       { int GroupId; string Name }
  RoleRefDto        { int RoleId; string Name }
  MembershipDto     { int MembershipId; DateOnly StartedOn; DateOnly? EndedOn }
  PauseDto          { int PauseId; int FirstSessionYear; int? LastSessionYear }
  ```
- **Id fields are entity-prefixed everywhere** — `MembershipId`, `PauseId`, `GroupMembershipId`,
  `GroupAdminId`, `FeeReductionId`, `RoleHoldingId`, `PersonId`, `GroupId`, `RoleId`. A bare `Id`
  appears in exactly one place, `MePersonDto.Id` (shipped, unchanged). One spelling, so a client
  and a server written from two different paragraphs still line up.
- **`Since` vs the row dates.** Wherever a DTO carries **`Since`**, that field is the **chain
  minimum** of §2.6 and it is the **only** field a `KkSinceRow` may render. `SinceOn`, `UntilOn`,
  `JoinedOn` and `LeftOn` are that *row's* identity; they belong to `KkFactRow`, the history panels
  and the end-actions. Every DTO that names a running relationship carries `Since`; a *past* row
  carries the row dates and renders its span, never a "seit".
- **Every Request type gets a Validator.** Blanket rules, so only deviations need mentioning
  below: every route id gets `GreaterThan(0)`; every non-nullable `DateOnly` gets `NotEmpty()`;
  every Session year gets `GreaterThanOrEqualTo(1971)`; every string with a column length gets
  `MaximumLength(n)` matching §1. An endpoint whose Request carries **only** route ids still gets
  its validator (`/backend-work`). The one endpoint with no meaningful rule is §4.6 — see there.
- **Service return types.** A **collection read** returns the collection
  (`Task<IReadOnlyList<T>>`); a **single-entity read** returns `Task<Result<T>>`; a **mutation**
  returns `Task<Result>` or `Task<Result<int>>` when it creates. Never a bare `Task`.

---

### Slice 1 — Mitgliedschaft rework

#### 4.1 `GetMe` — `GET /api/auth/me` *(rewritten)*

**Gate** authenticated. **Request** none (`EndpointWithoutRequest<GetMeResponse>`).

It grows across three slices: slice 1 rewrites `person` + `membership`, slice 2 adds
`permissionKeys`, slice 3 adds `isAffiliated`. The end state:

```csharp
public sealed record GetMeResponse
{
    public required int AccountId { get; init; }
    public required string Email { get; init; }
    public required MePersonDto Person { get; init; }
    public required MeMembershipDto Membership { get; init; }
    public required bool IsAffiliated { get; init; }
    public required IReadOnlyList<string> PermissionKeys { get; init; }
}

public sealed record MePersonDto
{
    public required int Id { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public required string? Email { get; init; }
    public required string? Phone { get; init; }
    public required string? Street { get; init; }
    public required string? Zip { get; init; }
    public required string? City { get; init; }
    public required DateOnly? BirthDate { get; init; }
    public required bool ContactVisibleToMembers { get; init; }
}

public sealed record MeMembershipDto
{
    public required MembershipState State { get; init; }
    public required DateOnly? MemberSince { get; init; }
    public required DateOnly? CurrentStartedOn { get; init; }
    public required DateOnly? CurrentEndedOn { get; init; }
}
```

`Membership` is **never null** — `State` is `"none"` when the Person never held one. The own
`BirthDate` is returned here (ruling 14: own profile and Verwaltung only).

**Application** `AccountService.GetDetailsAsync(accountId, ct) → Result<AccountDetails>` where
`AccountDetails { int Id; string Email; PersonDetails Person; MembershipChainDetails Membership;
bool IsAffiliated; IReadOnlyList<string> PermissionKeys }`. The service composes
`MembershipStateCalculator`, `PermissionAuthorizer.IsAffiliatedAsync` and
`PermissionAuthorizer.GrantedKeysAsync`. **Not `AffiliationQuery` directly**:
`IsAffiliatedOn` is an `Expression<Func<Person, bool>>`, which EF can apply as a top-level
`.Where(...)` predicate (that is how `GetMembers` uses it) but **cannot invoke inside a per-row
`Select` projection** without LinqKit. `IsAffiliatedAsync` wraps the same expression in a `Where`
and adds the per-request cache — one source of truth, one call site shape.

**Failures** no token → 401 · account missing → 404.

**Why `GetMe` carries the authorization context** (and not a dedicated endpoint): ADR-0006 makes
route guards run in `beforeLoad`, the shell already gates the whole tree on one `useMeQuery`, and
`isAffiliated` + four key strings are a bounded, rarely-changing payload. A second endpoint would
add a round trip on every boot and create a second source of truth for "am I affiliated". The
**Gruppen list is deliberately not here** — it changes independently and has its own endpoint
(`GetMyGroups`, slice 8).

---

### Slice 2 — Rights core · Slice 3 — Gruppen core

No endpoints of their own. Slice 2 adds `PermissionKeys` to `GetMe` and the seeded Admin Rolle
(§3.6); slice 3 adds `IsAffiliated` to `GetMe` and `AffiliationQuery`.

---

### Slice 4 — Mitglieder list

#### 4.2 `GetMembers` — `GET /api/members`

**Gate** `Definition.RequireAffiliation()`. **Request** none.

```csharp
public sealed record GetMembersResponse
{
    public required IReadOnlyList<MemberSummaryDto> Members { get; init; }
}

public sealed record MemberSummaryDto
{
    public required int PersonId { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public required MembershipState MembershipState { get; init; }
    public required IReadOnlyList<GroupRefDto> Groups { get; init; }
    public required IReadOnlyList<RoleRefDto> Roles { get; init; }
}
```

Contains **every currently affiliated Person** (ruling 2) — including Personen with no
Mitgliedschaft who belong to a Gruppe or hold a Rolle (`membershipState: "none"`). `Groups` and
`Roles` are the **running** ones in non-archived Gruppen/Rollen. **No contact data** in this
payload for anyone, ever, regardless of key (decision K). No `hasKey`/Schlüssel field (ruling 6).

**Application** `PersonService.GetMembersAsync(ct) → IReadOnlyList<MemberSummary>`.
**Failures** not affiliated → 403.

Two things every test of this endpoint must know: the payload **always contains the caller** (she
reached it through the affiliation gate, so she is affiliated and is in her own list), and from
slice 2 on it **always contains the bootstrap admin** (ruling 11 gives her a running
`RoleHolding`, and §8.6 keeps her through every truncate). Assert by alias membership, never by a
raw `Count`.

---

### Slice 5 — Person card

#### 4.3 `GetMemberById` — `GET /api/members/{personId}`

**Gate** `Definition.RequireAffiliation()`.
**Request** `GetMemberByIdRequest { required int PersonId }` · **Validator**
`RuleFor(r => r.PersonId).GreaterThan(0)`.

```csharp
public sealed record GetMemberByIdResponse
{
    public required int PersonId { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public required MembershipState MembershipState { get; init; }
    public required DateOnly? MemberSince { get; init; }
    public required IReadOnlyList<MemberGroupDto> Groups { get; init; }
    public required IReadOnlyList<MemberRoleDto> Roles { get; init; }
    public required MemberContactDto Contact { get; init; }
}

public sealed record MemberGroupDto { required int GroupId; required string Name; required DateOnly Since; }
public sealed record MemberRoleDto  { required int RoleId;  required string Name; required DateOnly Since; }
// Both lists: RUNNING rows only, in NON-ARCHIVED Gruppen / Rollen — the same rule as GetMembers
// and as AffiliationQuery. A card never shows an ended Zugehörigkeit or an archived Gruppe;
// the full history is a `persons.manage` surface (§4.15).

public sealed record MemberContactDto
{
    public required ContactVisibility Visibility { get; init; }
    public required string? Phone { get; init; }
    public required string? Email { get; init; }
    public required string? Street { get; init; }
    public required string? Zip { get; init; }
    public required string? City { get; init; }
}

// Declared in Furria.Application/Registry/ContactVisibility.cs (§1.0), carried by MemberDetails,
// only USED here — Application cannot see Furria.Api.
public enum ContactVisibility { Shared = 1, Hidden = 2, RevealedByPermission = 3 }
```

The contact rule, exactly (ruling 7):

| target `ContactVisibleToMembers` | viewer holds `persons.read_details` | `Visibility` | fields |
|---|---|---|---|
| true | any | `shared` | populated |
| false | yes | `revealedByPermission` | populated |
| false | no | `hidden` | **all null** |

`BirthDate` is **never** in this response (decision F — `persons.read_details` is *contact* data;
a birth date is not). `Since` is the chain minimum (§2.6).

**Application** `PersonService.GetMemberAsync(personId, viewerAccountId, ct) → Result<MemberDetails>`.
**Failures** not affiliated → 403 · Person unknown **or not currently affiliated** → **404**
(decision L: a former member's card is reachable only under `persons.manage`; otherwise ruling 2
would be a UI-only filter).

---

### Slice 6 — Gruppen

#### 4.4 `GetGroups` — `GET /api/groups`

**Gate** `RequireAffiliation()`. **Request** none.

```csharp
GetGroupsResponse { IReadOnlyList<GroupSummaryDto> Groups }
GroupSummaryDto {
    int GroupId; string Name; string Description; bool IsRecruiting;
    int MemberCount; IReadOnlyList<PersonRefDto> MemberPreview;   // first 5 by LastName
    IReadOnlyList<PersonRefDto> Admins;                           // running, by LastName
}
```
**Non-archived only.** `MemberCount` = running Zugehörigkeiten. `MemberPreview` feeds the avatar
stack (initials are built client-side from `lib/initials.ts`).

**`Admins` is on this payload for one reason**: `sucht Verstärkung` is the page's emotional hook,
and it provokes a question the page could not answer — *who do I ask?* The mock's answer („Bei Anna
melden" under a training time) was correctly banned as Gruppentermin fiction, but the **name of a
Gruppen-Admin is not fiction**, it is the one fact the club has for exactly this. One field turns
`/groups` from a directory into an invitation: „Melde dich bei Anna oder Katrin." (§5.4). Names
only — a `PersonRefDto` carries no contact data, so decision K holds.
**Application** `GroupService.GetGroupsAsync(ct) → IReadOnlyList<GroupSummary>`.
**Failures** not affiliated → 403.

#### 4.5 `GetGroupById` — `GET /api/groups/{groupId}`

**Gate** `RequireAffiliation()`. **Request** `{ required int GroupId }` · validator `GreaterThan(0)`.

```csharp
GetGroupByIdResponse {
    int GroupId; string Name; string Description; bool IsRecruiting;
    IReadOnlyList<SincePersonDto> Members;              // running, by LastName
    IReadOnlyList<GroupAdminDto> Admins;                // running, by LastName
}
GroupAdminDto { int PersonId; string FirstName; string LastName; string? Function; DateOnly Since }
```
**Failures** not affiliated → 403 · unknown **or archived** Gruppe → 404 (the read surface shows
non-archived Gruppen only).

---

### Slice 7 — Profile visibility

#### 4.6 `PutMyContactVisibility` — `PUT /api/auth/me/contact-visibility`

**Gate** authenticated; writes the caller's own Person row and no other.
**Request** `PutMyContactVisibilityRequest { required bool ContactVisibleToMembers }` ·
**Validator** `PutMyContactVisibilityValidator` — **empty on purpose**, and the one declared
deviation from §4.0's blanket rule. There is no route id and no rule: `NotNull()` on a
non-nullable `bool` always passes, and a rule that looks like a check but cannot fail is worse than
no rule. The class exists (one per Request, `/backend-work`) with a comment saying exactly this.
**Response** none → **204**.
**Application** `PersonService.SetContactVisibilityAsync(personId, visible, ct) → Result`.
**Failures** no token → 401 · Person missing → 404.

File: `Api/Endpoints/Auth/PutMyContactVisibility.cs`, beside `GetMe` — the account-scoped surface
stays together.

---

### Slice 8 — Hub read

#### 4.7 `GetMyGroups` — `GET /api/my-groups`

**Gate** authenticated. This is the collection row of §4.0's table, not the `{groupId}` row: an
Account with no ties gets an **empty list**, which is the honest answer, and
`IsGroupMemberOrAdminAsync` cannot even be called here — there is no `groupId`. **Request** none.

```csharp
GetMyGroupsResponse { IReadOnlyList<MyGroupSummaryDto> Groups }
MyGroupSummaryDto { int GroupId; string Name; bool IsMember; bool IsAdmin }
```
One row per **non-archived** Gruppe the caller's Person currently belongs to **or** administers.
This is the source for the "Meine Gruppen" navigation group (§6).
**Application** `GroupService.GetMyGroupsAsync(personId, ct)`.

#### 4.8 `GetMyGroupById` — `GET /api/my-groups/{groupId}`

**Gate** in-handler `IsGroupMemberOrAdminAsync(accountId, groupId)` → 403.
**Request** `{ required int GroupId }` · validator `GreaterThan(0)`.

```csharp
GetMyGroupByIdResponse {
    int GroupId; string Name; string Description; bool IsRecruiting;
    bool ViewerIsAdmin;
    IReadOnlyList<HubMemberDto> Members;                 // running
    IReadOnlyList<HubAdminDto>  Admins;                  // running
    IReadOnlyList<HubMemberDto> PastMembers;             // ended — ADMIN ONLY, else empty
    IReadOnlyList<HubAdminDto>  PastAdmins;              // ended — ADMIN ONLY, else empty
}
HubMemberDto { int GroupMembershipId; int PersonId; string FirstName; string LastName;
               DateOnly JoinedOn; DateOnly? LeftOn; DateOnly Since }
HubAdminDto  { int GroupAdminId; int PersonId; string FirstName; string LastName;
               string? Function; DateOnly SinceOn; DateOnly? UntilOn; DateOnly Since }
```
`HubAdminDto.Since` is **not** optional and **not** `SinceOn`: without it the hub would render an
admin's *row* start while `/groups/$groupId` two clicks away renders her *chain* minimum for the
same person — „seit 2019" on one page and „seit 2024" on the other for an admin who stepped down
and came back. §4.0's `Since` rule applies to both DTOs: the running panels render `Since`, the
history panels render `formatPeriod(joinedOn, leftOn)` / `formatPeriod(sinceOn, untilOn)`.
`PastMembers`/`PastAdmins` are the "Zugehörigkeit und admin history" a Gruppen-Admin sees
(plan §2); for a plain member they are **empty arrays**, not omitted — the shape never varies.
The row ids are what the end-actions of slices 9/10 address.
**Failures** neither member nor admin → **403** · unknown **or archived** Gruppe → **404**. The
two must stay distinguishable on the wire because the client says two different things: 403 =
„Diese Gruppe ist nicht deine.", 404 = „Diese Gruppe gibt es nicht mehr." — telling a member of an
archived Gruppe that it „is not yours" is false on both counts (§5.6). Check membership **after**
existence: an archived Gruppe answers 404 even to its own members.

---

### Slice 9 — Hub admin I

All three carry the disjunction gate `CanAdministerGroupAsync(accountId, groupId)` → 403, which is
also what makes slice 15 (`groups.manage` as the higher instance) need no new endpoints. Slice 9
also delivers the person picker every add-dialog in the phase needs (§4.41).

#### 4.41 `GetPersonSearch` — `GET /api/person-search?q=…`

*Numbered last because it was added in revision 2; **delivered in slice 9**, where it is first
needed, and consumed again by slices 10, 15 and 17.* **This endpoint exists because
`GET /api/members` provably cannot serve a person picker**: it contains only *currently affiliated*
Personen (§4.2), and a Person freshly created in the Personenverwaltung has no Mitgliedschaft, no
Zugehörigkeit and no Inhaberschaft — she is by definition **not** affiliated and therefore not in
it. Wiring the dialogs to `useMembersQuery()` would make the dialog's own instruction („leg sie
zuerst in der Personenverwaltung an") dead-end on the next screen, close off CONTEXT.md's
first-class case (a Gruppe member or Gruppen-Admin who is not a Mitglied — the Kindergarde's
six-year-olds, the 43-year-old Trainerin), and make „already be in something" the only way into
anything. `AddHolderDialog` is worse off still: it sits behind `roles.manage`, and the only
all-Personen endpoint is `GET /api/manage/persons` behind `persons.manage`, which a roles manager
need not hold.

**Gate** in-handler `CanSearchPersonsAsync(accountId)` → 403 (§3.2): holds `persons.manage`,
`groups.manage` or `roles.manage`, **or** currently administers at least one Gruppe. That is
precisely "may this caller put a Person into something".
**Request** `GetPersonSearchRequest` with a single property
`[QueryParam, BindFrom("q")] public required string Query { get; init; }` — the same
bind-attribute rule as §4.0's `[RouteParam]`, for the same serializer reason ·
**Validator** `Query.NotEmpty().MinimumLength(2).MaximumLength(64)`.

```csharp
GetPersonSearchResponse { IReadOnlyList<PersonRefDto> Persons }
```

Over **all** Personen in the registry, matched case- and diacritic-insensitively on
`lower(unaccent)`-equivalent of first name, last name and `"first last"`, ordered
`LastName, FirstName, Id` (German collation, §4.0), **capped at 25 rows**. Nothing else:
**no contact data, no birth date, no membership state, no Gruppen, no Rollen** — a name and an id
are exactly what the four write endpoints (4.10, 4.12, 4.38, and slice 15's reuse) need, and
decision K's "a right never changes a payload shape" stays true because this payload has no shape
to change. **Failures** 403 · nothing else (an empty result is a result).

Diacritic folding without an extension: the service compares
`EF.Functions.ILike(EF.Functions.Collate(p.LastName, "de-DE-x-icu"), $"%{q}%")` — ICU's
locale-aware `ILike` already folds case; for umlaut folding („muller" finding „Müller") the client
normalises its own query with `normalizeForSearch` (§5.1) **and** the service additionally matches
the umlaut-expanded form (`ue`/`oe`/`ae`/`ss`) built by a small pure helper
`Furria.Core/Text/GermanFold.cs` — one place, unit-tested against `Müller/Mueller/muller`.

#### 4.9 `PutGroupInfo` — `PUT /api/groups/{groupId}/info`

**Request** `{ required int GroupId; required string Description; required bool IsRecruiting }`
**Validator** `GroupId.GreaterThan(0)`; `Description.NotNull().MaximumLength(400)`.
**Response** none → 204.
**Application** `GroupService.UpdateInfoAsync(UpdateGroupInfoCommand, ct) → Result`.
**Failures** 403 · unknown Gruppe → 404 · archived Gruppe → 409 (`"Eine archivierte Gruppe kann
nicht bearbeitet werden."`).

The Gruppe's **name is not writable here** — renaming is a club-level act and lives in `PutGroup`
(slice 14, `groups.manage`). That is the concern split, not an omission.

#### 4.10 `PostGroupMembership` — `POST /api/groups/{groupId}/memberships`

**Request** `{ required int GroupId; required int PersonId; required DateOnly JoinedOn }`
**Validator** both ids `GreaterThan(0)`; `JoinedOn.NotEmpty()`.
**Response** `PostGroupMembershipResponse { int GroupMembershipId }` → 200.
**Application** `GroupService.AddMembershipAsync(AddGroupMembershipCommand, ct) → Result<int>`.
**Failures** 403 · unknown Gruppe or Person → 404 · archived Gruppe → 409 · an **open**
Zugehörigkeit for this pair already exists → 409 · the new period overlaps an existing one for
this pair → 409.

#### 4.11 `EndGroupMembership` — `POST /api/groups/{groupId}/memberships/{groupMembershipId}/end`

Action endpoint, prefix dropped. **Request**
`{ required int GroupId; required int GroupMembershipId; required DateOnly EndedOn }`
**Validator** ids `GreaterThan(0)`; `EndedOn.NotEmpty()`. **Response** none → 204.
**Application** `GroupService.EndMembershipAsync(EndGroupMembershipCommand, ct) → Result`.
**Failures** 403 · row unknown or not in this Gruppe → 404 · already ended → 409 ·
`EndedOn < JoinedOn` → 422.

Nothing is deleted — the row keeps its history (ruling 3).

---

### Slice 10 — Hub admin II

#### 4.12 `PostGroupAdmin` — `POST /api/groups/{groupId}/admins`

**Gate** `CanAdministerGroupAsync`.
**Request** `{ required int GroupId; required int PersonId; required string? Function;
required DateOnly SinceOn }`
**Validator** ids `GreaterThan(0)`; `Function.MaximumLength(64)`; `SinceOn.NotEmpty()`.
**Response** `{ int GroupAdminId }` → 200.
**Application** `GroupService.AddAdminAsync(AddGroupAdminCommand, ct) → Result<int>`.
**Failures** 403 · unknown Gruppe/Person → 404 · archived Gruppe → 409 · open admin row for this
pair exists → 409 · overlapping period → 409.

The appointed Person need **not** be a Mitglied and need **not** belong to the Gruppe — no check
of either, ever.

#### 4.13 `EndGroupAdmin` — `POST /api/groups/{groupId}/admins/{groupAdminId}/end`

**Request** `{ required int GroupId; required int GroupAdminId; required DateOnly EndedOn }`
**Response** none → 204. **Failures** 403 · row unknown or not in this Gruppe → 404 · already
ended → 409 · `EndedOn < SinceOn` → 422.

A Gruppe may end up with **no** admin — that is legal and shown as a warning chip in
Gruppenverwaltung, never blocked (the lockout recovery path is `groups.manage`, ruling 9).

---

### Slice 11 — Personenverwaltung

All four: `Definition.RequirePermission(FurriaPermissions.PersonsManage)`.

#### 4.14 `GetPersons` — `GET /api/manage/persons`

**Request** none.
```csharp
GetPersonsResponse { IReadOnlyList<PersonSummaryDto> Persons }
PersonSummaryDto {
    int PersonId; string FirstName; string LastName;
    string? Email; string? Phone; string? Street; string? Zip; string? City;
    DateOnly? BirthDate; bool ContactVisibleToMembers;
    MembershipState MembershipState; DateOnly? MemberSince;
    IReadOnlyList<GroupRefDto> Groups; IReadOnlyList<RoleRefDto> Roles;
}
```
**Every** Person in the registry — affiliated, former, ticket buyers, unaffiliated (ruling 2). The
bootstrap admin is always among them (§3.6) — assert by alias, never by `Count`.
`Street` and `Zip` are here (and **only** here and in §4.15 — never in an affiliated-gated payload,
decision K) because `PersonsToolbar` searches „Name, Adresse, E-Mail" and because
`PersonFormDialog` opens for **edit** straight off a list row: without them the search cannot match
an address and the edit form would need a second round trip before it can prefill. This is a
`persons.manage` payload; the manager may see everything already.
**Application** `PersonService.GetAllAsync(ct) → IReadOnlyList<PersonSummary>`.

#### 4.15 `GetPersonById` — `GET /api/manage/persons/{personId}`

**Request** `{ required int PersonId }`. The full Person-bearbeiten payload:
```csharp
GetPersonByIdResponse {
    int PersonId; string FirstName; string LastName;
    string? Email; string? Phone; string? Street; string? Zip; string? City;
    DateOnly? BirthDate; bool ContactVisibleToMembers;
    MembershipState MembershipState; DateOnly? MemberSince;
    IReadOnlyList<PersonMembershipDto> Memberships;      // newest first, incl. ended
    IReadOnlyList<PersonFeeReductionDto> FeeReductions;  // newest first
    IReadOnlyList<PersonGroupDto> Groups;                // READ-ONLY here, incl. ended
    IReadOnlyList<PersonRoleDto> Roles;                  // READ-ONLY here, incl. ended
}
PersonMembershipDto { int MembershipId; DateOnly StartedOn; DateOnly? EndedOn; bool IsRunning;
                      bool IsFuture; IReadOnlyList<PersonPauseDto> Pauses }
PersonPauseDto      { int PauseId; int FirstSessionYear; int? LastSessionYear }
PersonFeeReductionDto { int FeeReductionId; FeeReductionBasis Basis;
                        int FirstSessionYear; int LastSessionYear }
PersonGroupDto { int GroupId; string Name; DateOnly JoinedOn; DateOnly? LeftOn }
PersonRoleDto  { int RoleId;  string Name; DateOnly SinceOn; DateOnly? UntilOn }
```
`IsRunning` is computed server-side with `DatePeriod.IsRunningOn(today)` and `IsFuture` with
`StartedOn > today` — the client never recomputes either. `IsFuture` is what lets Person bearbeiten
render a not-yet-begun period honestly (chip `geplant`, §10.4) instead of letting it look ended;
it is the visible counterpart of §2.4's `None`-until-it-starts rule.
**The `Pauses` list is nested inside its period on purpose** — a Ruhezeit hangs off exactly one
`membership_id` (decision I), and the UI mirrors the payload (§5.8).
**Failures** unknown Person → 404.

#### 4.16 `PostPerson` — `POST /api/manage/persons`

**Request** `PostPersonRequest { required string FirstName; required string LastName;
required string? Email; required string? Phone; required string? Street; required string? Zip;
required string? City; required DateOnly? BirthDate; required bool ContactVisibleToMembers }`
**Validator** `FirstName`/`LastName` `NotEmpty().MaximumLength(128)`; `Email`
`MaximumLength(256).EmailAddress().When(r => !string.IsNullOrEmpty(r.Email))`; `Phone`
`MaximumLength(64)`; `Street` `MaximumLength(256)`; `Zip` `MaximumLength(16)`; `City`
`MaximumLength(128)`.
**Response** `{ int PersonId }` → 200.
**Application** `PersonService.CreateAsync(CreatePersonCommand, ct) → Result<int>`.
**Failures** 403.

Creating a Person creates **no** Mitgliedschaft and **no** Account — both are separate, dated
decisions.

#### 4.17 `PutPerson` — `PUT /api/manage/persons/{personId}`

**Request** `PutPersonRequest { [RouteParam] required int PersonId; required string FirstName;
required string LastName; required string? Email; required string? Phone; required string? Street;
required string? Zip; required string? City; required DateOnly? BirthDate;
required bool ContactVisibleToMembers }` — its **own** type, not an inheritance of or an alias for
`PostPersonRequest` (§4.0: no endpoint shares a Request with another; `/backend-work`'s type-layer
rule says the same). **Validator** `PutPersonValidator` — its own class, with `PostPersonValidator`'s
rules plus `PersonId.GreaterThan(0)`.
**Response** none → 204. **Failures** 403 · unknown Person → 404.

`ContactVisibleToMembers` is writable here because a manager sets it **on the Person's word** for
Personen without an Account (ruling 7). The Club-App surface must label it as exactly that (§10).

---

### Slice 12 — Person bearbeiten I (Mitgliedschaft, Ruhezeit)

All five: `RequirePermission(PersonsManage)`.

#### 4.18 `PostMembership` — `POST /api/manage/persons/{personId}/memberships`
**Request** `{ required int PersonId; required DateOnly StartedOn; required DateOnly? EndedOn }`
**Validator** `PersonId.GreaterThan(0)`; `StartedOn.NotEmpty()`.
**Response** `{ int MembershipId }` → 200.
**Failures** unknown Person → 404 · overlaps an existing period of this Person → 409
(`"Dieser Zeitraum überschneidet sich mit einer bestehenden Mitgliedschaft. Ein Wiedereintritt
beginnt frühestens am Tag nach dem Ende der vorigen Mitgliedschaft."`) · a second **open** period
→ 409 (`"Es läuft bereits eine Mitgliedschaft."`) · `EndedOn < StartedOn` → 422.

**Same-day rejoin is a 409, and that is intended.** Decision B makes both ends inclusive and
decision J forbids any overlap, so `[… – 2026-03-01]` and `[2026-03-01 – offen]` overlap on that
one day. A Kündigung and a re-entry therefore cannot share a date: **a rejoin starts at the
earliest the day after the previous period ended.** The message above says so, because nothing else
on the surface would.

#### 4.19 `PutMembership` — `PUT /api/manage/persons/{personId}/memberships/{membershipId}`
**Request** `PutMembershipRequest { [RouteParam] required int PersonId;
[RouteParam] required int MembershipId; required DateOnly StartedOn; required DateOnly? EndedOn }`
**Response** 204.
**Failures** 404 (unknown, or not this Person's) · 409 overlap/second open (same messages as 4.18) ·
422 `EndedOn < StartedOn` · **422** when the new span no longer contains a **closed** pause of this
Mitgliedschaft (`$"Die Ruhezeit {ClubSession.LabelOf(first)} … liegt dann außerhalb der Mitgliedschaft."`).

**An open-ended pause is clamped, not rejected** — see §4.20 for the rule and its reason. It
applies identically here.

#### 4.20 `EndMembership` — `POST /api/manage/persons/{personId}/memberships/{membershipId}/end`
**Request** `EndMembershipRequest { [RouteParam] required int PersonId;
[RouteParam] required int MembershipId; required DateOnly EndedOn }`
**Response** 204. **Failures** 404 · already ended → 409 (`"Diese Mitgliedschaft ist bereits
beendet."`) · `EndedOn < StartedOn` → 422 · a **closed** pause would fall outside the new span →
422 (the §4.19 message).

**An open-ended Ruhezeit is clamped, in the same transaction** (decision AI). Every pause of this
Mitgliedschaft with `LastSessionYear == null` gets
`LastSessionYear = ClubSession.YearOf(EndedOn)`. Without this rule, ending a Mitgliedschaft that
currently *ruht* open-endedly is **impossible**: an open-ended pause spans `[first … ∞)`, the
membership span becomes finite the moment `EndedOn` is set, containment can never hold, and every
`EndMembership` on a ruhende Mitgliedschaft would answer 422 forever — while decision U forbids
deleting the pause and nothing would tell the user to edit it first. *Kündigen while ruhend* is an
ordinary club event; it must be one click. The confirmation says so out loud: „Eine offene Ruhezeit
endet mit der Mitgliedschaft." (§10.5).

**Nothing else cascades** (decision I): closed pauses and every Beitragsermäßigung stay on record,
Gruppen and Rollen are untouched. `MembershipStateCalculator` already ignores a pause on a
non-running period.

#### 4.21 `PostMembershipPause` — `POST /api/manage/persons/{personId}/memberships/{membershipId}/pauses`
**Request** `PostMembershipPauseRequest { [RouteParam] required int PersonId;
[RouteParam] required int MembershipId; required int FirstSessionYear;
required int? LastSessionYear }`
**Validator** ids `GreaterThan(0)`; `FirstSessionYear.GreaterThanOrEqualTo(1971)`;
`LastSessionYear.GreaterThanOrEqualTo(1971).When(r => r.LastSessionYear.HasValue)`.
**Response** `{ int PauseId }` → 200.
**Failures** 404 · overlaps another pause of this Mitgliedschaft → 409 · `LastSessionYear <
FirstSessionYear` → 422 · the span lies outside the Mitgliedschaft's Session span → 422.

The Mitgliedschaft's Session span is
`[ClubSession.YearOf(StartedOn) … (EndedOn is null ? ∞ : ClubSession.YearOf(EndedOn))]`. An
**open-ended** pause (`LastSessionYear == null`) on an **ended** Mitgliedschaft is rejected here
(422) — the manager should state the end; only §4.20's clamp writes one implicitly.
A pause may be added to a **closed** period: correcting history is exactly what `persons.manage`
is for, and decision U leaves correction as the only remedy.
**No `Grund`/reason field exists** (plan §4 Ignored).

#### 4.22 `PutMembershipPause` — `PUT /api/manage/persons/{personId}/memberships/{membershipId}/pauses/{pauseId}`
**Request** `PutMembershipPauseRequest { [RouteParam] required int PersonId;
[RouteParam] required int MembershipId; [RouteParam] required int PauseId;
required int FirstSessionYear; required int? LastSessionYear }` — its own type and its own
validator (`PostMembershipPauseValidator`'s rules plus `PauseId.GreaterThan(0)`).
**Response** 204. **Failures** as §4.21, plus 404 when the pause is not this Mitgliedschaft's.

> There is **no delete** for a pause or a reduction. The plan's surface table pins "add/edit"
> only; a mis-entered fact is corrected with `PUT`. Do not add one.

---

### Slice 13 — Person bearbeiten II (Beitragsermäßigung)

#### 4.23 `PostFeeReduction` — `POST /api/manage/persons/{personId}/fee-reductions`
**Gate** `RequirePermission(PersonsManage)`.
**Request** `{ required int PersonId; required FeeReductionBasis Basis;
required int FirstSessionYear; required int LastSessionYear }`
**Validator** `PersonId.GreaterThan(0)`; `Basis.IsInEnum()`; both years
`GreaterThanOrEqualTo(1971)`.
**Response** `{ int FeeReductionId }` → 200.
**Failures** unknown Person → 404 · overlaps another reduction of this Person → 409 ·
`LastSessionYear < FirstSessionYear` → 422.

`Basis` is always **stated** by the manager; it is never derived from `BirthDate` (ruling 14).
`LastSessionYear` is required — a reduction always expires.

#### 4.24 `PutFeeReduction` — `PUT /api/manage/persons/{personId}/fee-reductions/{feeReductionId}`
**Request** `PutFeeReductionRequest { [RouteParam] required int PersonId;
[RouteParam] required int FeeReductionId; required FeeReductionBasis Basis;
required int FirstSessionYear; required int LastSessionYear }` — own type, own validator
(`PostFeeReductionValidator`'s rules plus `FeeReductionId.GreaterThan(0)`).
**Response** 204. **Failures** as §4.23, plus 404 when the row is not this Person's.

---

### Slice 14 — Gruppenverwaltung I

All: `RequirePermission(GroupsManage)`.

#### 4.25 `GetManagedGroups` — `GET /api/manage/groups`
**Request** none.
```csharp
GetManagedGroupsResponse { IReadOnlyList<ManagedGroupSummaryDto> Groups }
ManagedGroupSummaryDto {
    int GroupId; string Name; string Description; bool IsRecruiting; DateOnly? ArchivedOn;
    int MemberCount; IReadOnlyList<PersonRefDto> Admins;
}
```
**Includes archived Gruppen.** `Admins` are the running ones; an empty list is what drives the
„kein Admin" warning chip.

#### 4.26 `PostGroup` — `POST /api/manage/groups`
**Request** `{ required string Name; required string Description; required bool IsRecruiting }`
**Validator** `Name.NotEmpty().MaximumLength(80)`; `Description.NotNull().MaximumLength(400)`.
**Response** `{ int GroupId }` → 200.
**Failures** a non-archived Gruppe with this name (case-insensitive) exists → 409.

#### 4.27 `PutGroup` — `PUT /api/manage/groups/{groupId}`
**Request** `PutGroupRequest { [RouteParam] required int GroupId; required string Name;
required string Description; required bool IsRecruiting }` — own type, own validator
(`PostGroupValidator`'s rules plus `GroupId.GreaterThan(0)`).
**204**. **Failures** 404 · duplicate name (case-insensitive, among non-archived) → 409
(`"Eine Gruppe mit diesem Namen gibt es schon."`) · archived → 409.
This is the only endpoint that renames a Gruppe.

#### 4.28 `ArchiveGroup` — `POST /api/manage/groups/{groupId}/archive`
**Request** `ArchiveGroupRequest { [RouteParam] required int GroupId }` · **Validator**
`GroupId.GreaterThan(0)` · **Response** 204.
**Failures** 404 · already archived → 409 (`"Diese Gruppe ist bereits archiviert."`).

**No date is accepted.** The service stamps `ArchivedOn = ClubClock.Today(_timeProvider)`.
Archiving is an **act, not a plan** (decision AE): every consumer in the codebase tests
`ArchivedOn == null`, never `ArchivedOn <= today`, so a future date would archive the Gruppe
*instantly* — nine Zugehörigkeiten stop conferring affiliation today, nine Personen fall out of
`/members` today, the Gruppe vanishes from the public website today, for a date two years out that
the UI happily let someone type. Present tense is also what §10.7 promises: „Archivieren löscht
nichts: Die Gruppe **verschwindet** aus dem Verzeichnis." `archivedOn` is therefore **not** a
`KkDateField` consumer (§7.3) and the archive confirmation has no date field.

**Archiving does not rewrite any period.** Zugehörigkeiten and Gruppen-Admin rows stay exactly as
they are; they simply stop conferring affiliation and stop being shown (decision D). The
confirmation copy says so honestly (§10) — the mock's "Die 9 Zugehörigkeiten werden zum gewählten
Datum beendet" is **wrong for this model and must not ship**.

#### 4.29 `RestoreGroup` — `POST /api/manage/groups/{groupId}/restore`
**Request** `{ required int GroupId }` · **Response** 204. Sets `ArchivedOn = null`.
**Failures** 404 · not archived → 409 · another non-archived Gruppe now carries this name → 409.

---

### Slice 15 — Gruppenverwaltung II (overrides)

#### 4.30 `GetManagedGroupById` — `GET /api/manage/groups/{groupId}`
**Gate** `RequirePermission(GroupsManage)`. **Request**
`GetManagedGroupByIdRequest { [RouteParam] required int GroupId }`.

```csharp
GetManagedGroupByIdResponse {
    int GroupId; string Name; string Description; bool IsRecruiting; DateOnly? ArchivedOn;
    IReadOnlyList<ManagedMemberDto> Members;          // running
    IReadOnlyList<ManagedAdminDto>  Admins;           // running
    IReadOnlyList<ManagedMemberDto> PastMembers;      // ended — always populated here
    IReadOnlyList<ManagedAdminDto>  PastAdmins;       // ended — always populated here
}
ManagedMemberDto { int GroupMembershipId; int PersonId; string FirstName; string LastName;
                   DateOnly JoinedOn; DateOnly? LeftOn; DateOnly Since }
ManagedAdminDto  { int GroupAdminId; int PersonId; string FirstName; string LastName;
                   string? Function; DateOnly SinceOn; DateOnly? UntilOn; DateOnly Since }
```
Its **own** response and DTO types — field-for-field identical to §4.8's apart from `ArchivedOn`
and the absent `ViewerIsAdmin` (a key holder is always the higher instance here), because §4.0
forbids sharing a Response between endpoints. Written out once here so nobody writes
`: GetMyGroupByIdResponse`.
**Failures** unknown Gruppe → 404 (an **archived** Gruppe is returned, not 404 — this is the one
surface that must reach it).

Slice 15 adds **no write endpoints**: the override actions reuse 4.9–4.13, whose gate is the
disjunction `Gruppen-Admin ∨ groups.manage`. That is the whole point of the disjunction.

---

### Slice 16 — Rollen & Rechte I

All: `RequirePermission(RolesManage)`.

#### 4.31 `GetRoles` — `GET /api/manage/roles`
**Request** none.
```csharp
GetRolesResponse {
    IReadOnlyList<RoleSummaryDto> Roles;
    IReadOnlyList<string> PermissionKeys;      // FurriaPermissions.All, the enforceable catalogue
}
RoleSummaryDto { int RoleId; string Name; string Description; DateOnly? ArchivedOn;
                 IReadOnlyList<string> PermissionKeys; IReadOnlyList<PersonRefDto> Holders }
```
Includes archived Rollen. `Holders` are the running Inhaber. The catalogue is sent so the client
never hard-codes the key list; the **German description of each key is client copy** (§10), not
API data — it is UI text, and ADR-0002 keeps German copy in the components.

#### 4.32 `GetRoleById` — `GET /api/manage/roles/{roleId}`
**Request** `{ required int RoleId }`.
```csharp
GetRoleByIdResponse {
    int RoleId; string Name; string Description; DateOnly? ArchivedOn;
    IReadOnlyList<string> PermissionKeys;
    IReadOnlyList<RoleHolderDto> Holders;          // running
    IReadOnlyList<RoleHolderDto> PastHolders;      // ended
}
RoleHolderDto { int RoleHoldingId; int PersonId; string FirstName; string LastName;
                DateOnly SinceOn; DateOnly? UntilOn; DateOnly Since }
```
`Since` is the chain minimum of that Person's holdings of this Rolle. **Failures** 404.

#### 4.33 `PostRole` — `POST /api/manage/roles`
**Request** `{ required string Name; required string Description }` · **Validator**
`Name.NotEmpty().MaximumLength(80)`, `Description.NotNull().MaximumLength(400)`.
**Response** `{ int RoleId }` → 200. A new Rolle starts with **no** keys.
**Failures** duplicate non-archived name → 409.
No `kind`, no `unique`/`multi` flag, no "locked" Rolle (plan §4 Ignored).

#### 4.34 `PutRole` — `PUT /api/manage/roles/{roleId}`
**Request** `PutRoleRequest { [RouteParam] required int RoleId; required string Name;
required string Description }` — own type, own validator (`PostRoleValidator`'s rules plus
`RoleId.GreaterThan(0)`). **204**. **Failures** 404 · duplicate non-archived name
(case-insensitive) → 409 (`"Eine Rolle mit diesem Namen gibt es schon."`) · archived → 409.

#### 4.35 `ArchiveRole` — `POST /api/manage/roles/{roleId}/archive`
**Request** `ArchiveRoleRequest { [RouteParam] required int RoleId }` · validator
`RoleId.GreaterThan(0)` · 204 · 404 · 409 already archived.
**No date is accepted** — the service stamps `ClubClock.Today(_timeProvider)`, for the reasons in
§4.28. Archiving stops the Rolle granting its keys immediately (decision D) and does not rewrite
any Inhaberschaft.

#### 4.36 `RestoreRole` — `POST /api/manage/roles/{roleId}/restore`
**Request** `{ required int RoleId }` · 204 · 404 · 409 not archived · 409 duplicate name.

#### 4.37 `PutRolePermissions` — `PUT /api/manage/roles/{roleId}/permissions`
**Request** `{ required int RoleId; required IReadOnlyList<string> PermissionKeys }` —
**a full replacement**, not a patch.
**Validator** `RoleId.GreaterThan(0)`;
`RuleForEach(r => r.PermissionKeys).Must(key => FurriaPermissions.All.Contains(key))` with the
message `"Unbekannter Berechtigungs-Key."`; `PermissionKeys.Must(keys => keys.Distinct().Count() == keys.Count)`.
**Response** none → 204.
**Failures** 404 · archived Rolle → 409 · unknown key → 400 (validator).

There is **no** self-lockout protection and no "the Admin Rolle cannot lose rights" special case —
ruling 11 makes the seeded Rolle ordinary data, and inventing an axis the club did not ask for is
in the Ignored table. The club owns its matrix.

---

### Slice 17 — Rollen & Rechte II

#### 4.38 `PostRoleHolding` — `POST /api/manage/roles/{roleId}/holdings`
**Gate** `RequirePermission(RolesManage)`.
**Request** `{ required int RoleId; required int PersonId; required DateOnly SinceOn }` ·
**Response** `{ int RoleHoldingId }` → 200.
**Failures** unknown Rolle/Person → 404 · archived Rolle → 409 · open holding for this pair → 409 ·
overlapping period → 409.

#### 4.39 `EndRoleHolding` — `POST /api/manage/roles/{roleId}/holdings/{roleHoldingId}/end`
**Request** `{ required int RoleId; required int RoleHoldingId; required DateOnly EndedOn }` ·
**Response** 204. **Failures** 404 · already ended → 409 · `EndedOn < SinceOn` → 422.

---

### Slice 18 — Website re-pointing

#### 4.40 `GetPublicGroups` — `GET /api/public/groups`

**Gate** `AllowAnonymous()`. **Request** none.
```csharp
GetPublicGroupsResponse { IReadOnlyList<PublicGroupDto> Groups }
PublicGroupDto { int GroupId; string Name; string Description; bool IsRecruiting }
```
Non-archived only. **No member count, no people, no ids of Personen** — the public website shows
the units and their openness, nothing about humans. `api/groups` stays affiliated-gated; a public
endpoint is a separate concern with a separate gate, not a widened one.
**Consumer** the website's Gruppen list and its openness flag (ADR-0003: the page must stay
prerenderable or move this to a client fetch; no SSR runtime is introduced).

---

## 5. Frontend surfaces

### 5.0 Conventions that hold for every surface

**Boundary changes landed in slice 1** (before any page):
- `lib/api/api-fetch.ts`: `method?: 'GET' | 'POST' | 'PUT' | 'DELETE'`.
- `lib/api/api-error.ts`: a **fourth error class**, `RequestFailedError` (§5.0a).
- `lib/api/schemas.ts`: `MembershipTypeSchema`, `MembershipStatusSchema`, `MembershipSchema`
  deleted; `PersonSchema` and `MeSchema` rewritten (§5.1).
- `lib/membership-labels.ts`: `toMembershipTypeLabel` deleted; `toMembershipStateLabel` added;
  `formatIsoDay` kept; `formatMembershipPeriod` renamed `formatPeriod`.

### 5.0a The write boundary — how a backend refusal reaches the member

Without this, the whole write half of the phase is mute. `api-fetch` today does
`!response.ok → throw new ServerFailureError(status)` **without reading the body**, and
`<name>-messages.ts` is keyed on `QueryErrorKind`, whose only values are `unreachable | unexpected`.
Endpoints 4.9–4.13 and 4.16–4.39 define roughly thirty distinct 409/422 conditions — overlapping
periods, a second open period, already ended, a duplicate name, a pause outside its Mitgliedschaft,
an archived Gruppe — and every one of them would reach the member as „Da ist etwas schiefgelaufen.
Bitte versuch es gleich noch einmal." A Gruppen-Admin who re-adds a Person who is already in the
Gruppe would be told nothing and would retry forever. Field-level `400`s from every validator in §4
would be dropped entirely, so no form field could ever show a server error.

**Slice 1 ships:**

```ts
// lib/api/api-error.ts
export interface ApiFieldFailure { field: string; message: string }

export class RequestFailedError extends Error {
  readonly status: 400 | 409 | 422;
  readonly failures: readonly ApiFieldFailure[];
  get firstMessage(): string;          // failures[0]?.message ?? a neutral fallback
}
```
`apiFetch` parses the FastEndpoints error payload (`{ errors: { <field>: string[] } }`) for status
400, 409 and 422 and throws `RequestFailedError`; every other non-OK status keeps throwing
`ServerFailureError`. A body that does not parse degrades to `ServerFailureError` — never a crash.

**`toQueryErrorKind` gains a third value:** `'rejected'`, carrying the error. Every
`<name>-messages.ts` therefore answers three kinds, and `rejected` renders `error.firstMessage`
**verbatim** — those German strings are written in §4 and reviewed as copy in §10.

**The mutation-error contract, one rule for the phase:**
- a **409 / 422** message renders verbatim in the open dialog's footer (`KkAlert tone="error"`
  inside `KkModalFrame.Footer`); if no dialog is open, as a toast (§7.3 `KkToast`);
- a **400** maps each `failures[].field` (camelCased) onto the react-hook-form field of the same
  name via `setError`; anything unmatched falls back to the footer;
- a **403** is never shown as an error at all — a guard is about to render `AccessDenied`, so
  `toXErrorMessage` returns `null` for status 403 exactly as it does for `UnauthorizedError`;
- a **404** on a detail route renders that route's own not-found copy (§5.3, §5.8, §5.10), not an
  error panel.

**This is pinned before slice 9, not during it.**

**Per-feature layout** (the `features/profile/` template, extended):
```
features/<name>/
├── index.ts                 the page components only — one symbol per route
├── schemas.ts               zod schemas + their z.infer<> types
├── requests.ts              one thin apiFetch wrapper per endpoint
├── api.ts                   query keys + React Query hooks (useXQuery / useXMutation)
├── <name>-messages.ts       error copy keyed by QueryErrorKind
├── <name>-labels.ts         pure label/format helpers            ← unit-tested
├── hooks/use-*.ts           state-shaping hooks (never fetch here)
└── components/*.tsx         one component per file, FC<Props>, named export
```

**Data hooks.** `requests.ts` calls `apiFetch(path, { schema, method, body })`; `api.ts` wraps it
in `useQuery({ queryKey, queryFn: () => withFreshAccessToken(requestX) })`. Every authenticated
call goes through `withFreshAccessToken` — it injects a fresh token and ends the session on a 401
from the call itself.

**The plain mutation idiom** (slice 9 sets it, slices 10–17 copy it):
```ts
useMutation({
  mutationFn,
  onSuccess: () => {
    showToast({ tone: 'success', message: '…' });     // the verb in the past tense
    void queryClient.invalidateQueries({ queryKey: … });
  },
  onError: (error) => { /* §5.0a: footer message, field errors, or toast */ },
});
```
Every mutation's `onSuccess` shows a toast. Seventeen write flows (aufnehmen, ernennen, beenden ×4,
anlegen ×3, speichern, archivieren ×2, aktivieren ×2, toggle ×2) otherwise confirm success only by
a dialog closing and a list quietly re-rendering.

**The optimistic idiom** — defined once here, used by exactly two flows (the Mein-Profil visibility
switch, §5.5, and the Rollen key switches, §5.10):
```ts
useMutation({
  mutationFn,
  onMutate: async (next) => {
    await queryClient.cancelQueries({ queryKey });
    const previous = queryClient.getQueryData(queryKey);
    queryClient.setQueryData(queryKey, (current) => applyOptimistic(current, next));
    return { previous };
  },
  onError: (error, _next, context) => {
    queryClient.setQueryData(queryKey, context?.previous);
    showToast({ tone: 'error', message: toRejectedMessage(error) });
  },
  onSettled: () => { void queryClient.invalidateQueries({ queryKey }); },
});
```
**The optimistic value lives in the query cache, nowhere else** — never in component state. Two
consequences that are not optional: the row is `busy`, **never `disabled`**, while in flight; and a
request whose payload is derived from the current value (`PutRolePermissions` is a **full
replacement**, §4.37) derives it from the **optimistically updated cache value**, or two toggles a
second apart silently undo each other — the second would read a cache the first has not yet
refreshed, send the old array plus its own key, and un-set the first. On the surface that decides
who may do what in the club, that is not an acceptable failure mode.

**Query keys** — exported `as const`, one module-level tuple per list, one factory per detail:
```ts
ME_QUERY_KEY        = ['auth', 'me'] as const
MEMBERS_QUERY_KEY   = ['members'] as const            memberQueryKey(id)        = ['members', id]
GROUPS_QUERY_KEY    = ['groups'] as const             groupQueryKey(id)         = ['groups', id]
MY_GROUPS_QUERY_KEY = ['my-groups'] as const          myGroupQueryKey(id)       = ['my-groups', id]
PERSONS_QUERY_KEY   = ['manage', 'persons'] as const  personQueryKey(id)        = ['manage','persons', id]
MANAGED_GROUPS_QUERY_KEY = ['manage','groups'] as const  managedGroupQueryKey(id)
ROLES_QUERY_KEY     = ['manage', 'roles'] as const    roleQueryKey(id)          = ['manage','roles', id]
```

**The four states, always in this order** (the `ProfileBody` contract):
```tsx
const query = useXQuery();
const errorMessage = toXErrorMessage(query.error);
if (query.data !== undefined) { return <XLoaded data={query.data} />; }
if (errorMessage !== null)    { return <XError message={errorMessage} onRetry={reload} />; }
return <XSkeleton />;
```
`toXErrorMessage` returns `null` for an `UnauthorizedError` — the session has already ended and
`_app` is about to redirect; the page must not flash an error. **Skeletons show on first load
only**; while a search box is being typed the previous results stay on screen.

**Guards are components, not `beforeLoad`.** `_app.tsx`'s session guard stays exactly as it is
(that one *can* read a synchronous store). Everything P1 gates on lives behind `useMeQuery` /
`useMyGroupsQuery`, which are asynchronous, so the guard renders its own pending state:

```
features/session/components/RequireAffiliation.tsx   props: none (children)
features/session/components/RequirePermission.tsx    props: { permissionKey: PermissionKey }
features/session/components/AccessDenied.tsx         props: { message: string; action?: ReactNode }
features/session/components/PageSkeleton.tsx         props: none — KkPanelHeader skeleton +
                                                     KkSkeletonBlock lines={3} + KkSkeletonRow count={4}
```
`features/session/index.ts` exports all four.

**A guard renders its children while it is undecided.** Concretely: `me` pending **or** granted →
`children`; `me` resolved and denied → `<AccessDenied/>`. Not `<PageSkeleton/>` while pending — a
guard that withholds its children until `me` resolves turns every cold open and every deep link
into a **serial waterfall**: `GetMe` → the list query on `/members`, `/groups` and every
`/manage/*`, on the club's most-linked surfaces. Rendering children immediately lets the page's own
query start in parallel; the page shows its own skeleton, and the guard's decision replaces the
subtree if it turns out to be `denied`. The endpoint is the real gate (403, §3.3) and §5.0a maps a
403 to `null`, so nothing flashes.

**`RequireGroupAccess` does not exist.** It would have read `useMyGroupsQuery()` to decide
something `GET /api/my-groups/{groupId}` already decides in-handler (403), buying a third serial
round trip on a cold `/my-groups/$groupId` (`GetMe` → `GetMyGroups` → `GetMyGroupById`) and nothing
else. The hub branches on its own query's status instead: **403 → `AccessDenied` („Diese Gruppe ist
nicht deine.") with an action link to `/groups/$groupId`; 404 → „Diese Gruppe gibt es nicht mehr."**
(§5.6). That is also the only way the archived-Gruppe case can be told the truth.

**Master→detail never shows a spinner over data it already has.** `useRoleQuery(roleId)` is seeded
with `placeholderData` built from the matching `GetRoles` row (§5.10); the same applies to any
later master→detail pair. `GetRoleById` adds only `PastHolders`.

`features/session/hooks/use-permissions.ts` exports
`usePermissions(): { keys: readonly PermissionKey[]; has: (key: PermissionKey) => boolean; isAffiliated: boolean; isPending: boolean }`
built on `useMeQuery` — **this is the only place a page asks about a key.**

**The four `AccessDenied` messages are copy, pinned here** so three implementers do not write three
tones:

| Guard | Message |
|---|---|
| affiliation | „Das Verzeichnis ist für Mitglieder, Gruppen und Rollen des FCC. Dein Konto hat noch keine Verbindung zum Verein — melde dich bei der Personenverwaltung." |
| `persons.manage` | „Die Personenverwaltung ist an eine Rolle gebunden. Du hast sie gerade nicht." |
| `groups.manage` | „Die Gruppenverwaltung ist an eine Rolle gebunden. Du hast sie gerade nicht." |
| `roles.manage` | „Rollen & Rechte ist an eine Rolle gebunden. Du hast sie gerade nicht." |

**Lacking a right HIDES the affordance.** Never `disabled`, never a greyed button with a tooltip,
never a 403 toast after the click. A member who is not a Gruppen-Admin sees a Hub with no
`+ Mitglied` button at all.

**Route files are two lines.** All logic lives in the feature.

**`/backend-work`'s and `/frontend-work`'s rules bind the examples in this document too.** Three
that the surfaces below would otherwise violate on sight: *no logic in JSX* means no calls, no
string building and no inline handlers inside a JSX attribute — `` id={`letter-${letter}`} `` and
`params={{ personId: String(id) }}` are both hoisted to a named const in the component body (or
computed in the hook that produced the row); and a filter-chip `onChange` never becomes
`onChange={(id) => setState(toState(id))}` — `use-member-search.ts` exports a ready
`selectState: (id: string) => void`. And **"guards are components, not `beforeLoad`" is scoped to
P1's *data-dependent* guards** — `_app.tsx`'s session guard reads a synchronous store and stays
exactly as it is.

**No UI tests** (`docs/web/TESTING.md`). The testable surface of each slice is its pure modules:
label mappers, date/period formatters, search and filter scoring, the nav builder, zod coercion.
Verification that a page *looks* right is `pnpm shot <route>` — four PNGs, phone/desktop ×
light/dark — read by the implementing agent before the PR (§11).

---

### 5.1 Shared schemas — `lib/api/schemas.ts` (rewritten, slice 1)

```ts
export const MembershipStateSchema = z.enum(['none', 'ended', 'paused', 'active']);
export type MembershipState = z.infer<typeof MembershipStateSchema>;

export const PersonRefSchema = z.object({
  personId: z.number().int(), firstName: z.string(), lastName: z.string(),
});
export const GroupRefSchema = z.object({ groupId: z.number().int(), name: z.string() });
export const RoleRefSchema  = z.object({ roleId: z.number().int(),  name: z.string() });

export const MePersonSchema = z.object({
  id: z.number().int(), firstName: z.string(), lastName: z.string(),
  email: z.string().nullable(), phone: z.string().nullable(),
  street: z.string().nullable(), zip: z.string().nullable(), city: z.string().nullable(),
  birthDate: z.iso.date().nullable(), contactVisibleToMembers: z.boolean(),
});

export const MeMembershipSchema = z.object({
  state: MembershipStateSchema,
  memberSince: z.iso.date().nullable(),
  currentStartedOn: z.iso.date().nullable(),
  currentEndedOn: z.iso.date().nullable(),
});

export const MeSchema = z.object({
  accountId: z.number().int(), email: z.string(),
  person: MePersonSchema, membership: MeMembershipSchema,
  isAffiliated: z.boolean(), permissionKeys: z.array(z.string()),
});
export type Me = z.infer<typeof MeSchema>;

export const PERMISSION_KEYS = {
  personsReadDetails: 'persons.read_details',
  personsManage: 'persons.manage',
  groupsManage: 'groups.manage',
  rolesManage: 'roles.manage',
} as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[keyof typeof PERMISSION_KEYS];
```
**`PERMISSION_KEYS` is the only spelling of a key in client code.** `MANAGE_SECTIONS` (§6.1),
every `RequirePermission`, every `usePermissions().has(...)` reads it; a raw `'persons.manage'`
literal anywhere is where decision A's retired `persons:manage` form comes back.

`lib/membership-labels.ts` (rewritten):
```ts
export const toMembershipStateLabel = (state: MembershipState): string
// none → 'kein Mitglied' · ended → 'beendet' · paused → 'ruht' · active → 'aktiv'
export const formatIsoDay = (isoDay: string): string            // kept — '11.11.2025'
export const formatPeriod = (startedOn: string, endedOn: string | null): string
// endedOn === null → `${formatIsoDay(startedOn)} – offen`, else `${a} – ${b}`
export const formatSessionLabel = (sessionYear: number): string // '2025/26', from lib/club.ts
export const formatSessionSpan = (first: number, last: number | null): string
// last === null → '2025/26 – offen', first === last → '2025/26', else '2025/26 – 2027/28'
export const formatSinceSession = (isoDay: string): string
// '2018/19' — the SESSION the day falls in, via lib/club.ts sessionAt. The value of every
// KkSinceRow (§10.3). Reading a Session off a date is a pure calendar mapping the client has
// owned since P0; it is NOT a re-derivation of state or memberSince.
export const formatAddress = (
  street: string | null, zip: string | null, city: string | null,
): string | null
// 'Hauptstraße 12, 99713 Großfurra' · zip+city only → '99713 Großfurra' · street only →
// 'Hauptstraße 12' · all null → null (the caller renders the row's empty treatment, never ', ,')
```
`lib/text.ts` (new, pure, unit-tested) — the German-name helpers both the list and the search need:
```ts
export const toIndexLetter = (lastName: string): string
// NFD, strip combining marks, ß→S, uppercase; anything that is not A–Z → '#'.
// 'Österreicher' → 'O', 'Übelacker' → 'U', 'Ärtzel' → 'A', 'Ćosić' → 'C', '' → '#'
export const normalizeForSearch = (value: string): string
// NFD-folded, combining marks stripped, ß→ss, lowercased — used by EVERY filter in the phase,
// so 'müller' finds 'Müller' and 'muller' finds both
```
Without these two, a German club's A–Z register grows three orphan dividers that the 25-cell index
cannot jump to, and the search misses every umlaut.
`lib/state-chips.ts` (new, pure, unit-tested) — the state → chip decision, so `@furria/ui` never
owns German domain vocabulary:
```ts
export interface StateChip { label: string; tone: KkChipTone; dot: boolean }
export const toMembershipStateChip = (state: MembershipState): StateChip
export const toPeriodChip = (isRunning: boolean, isFuture: boolean): StateChip | null
// running → 'läuft' (green, dot) · future → 'geplant' (neutral) · closed → null
export const toRecruitingChip = (isRecruiting: boolean): StateChip
// true → 'sucht Verstärkung' (gold, dot) · false → 'sucht gerade niemanden' (neutral)
export const toArchivedChip = (archivedOn: string | null): StateChip | null
export const toStateFilterOptions = (
  counts: Record<MembershipState, number>,
): KkFilterOption[]
// 'Alle' first with the total, then one option per state with count > 0, in the order
// aktiv · ruht · beendet · kein Mitglied. ONE function for /members and /manage/persons —
// the chip row follows the data instead of each surface hard-coding its vocabulary.
```

---

### 5.2 Mitglieder — `/members` (slice 4)

| | |
|---|---|
| Route file | `routes/_app/_affiliated.members.tsx` |
| Guard | `_app` session guard → `_affiliated` layout route mounting `<RequireAffiliation>` |
| Feature | `features/members/` |

`routes/_app/_affiliated.tsx` is a **pathless layout route** whose component is
`<RequireAffiliation><Outlet /></RequireAffiliation>` — one guard for all four read surfaces.

**Hooks / keys** `useMembersQuery()` → `MEMBERS_QUERY_KEY`.
**Schemas** `MemberSummarySchema`, `MembersResponseSchema` in `features/members/schemas.ts`.
**Pure modules** `member-filters.ts` (`filterMembers(members, { query, state })`,
`countByState(members)`, `groupByLetter(members)`, `availableLetters(members)`),
`members-labels.ts`, `members-messages.ts`.
`filterMembers` matches name · Gruppe · Rolle through `normalizeForSearch` on **both** sides;
`groupByLetter` and `availableLetters` key on `toIndexLetter(lastName)` (§5.1) — both are pure,
branch-carrying and unit-tested, which is the only kind of test this repo allows.
`members-labels.ts` owns `toPersonRowAffiliation(groups, roles): { accent?: string; meta?: string }`
— `KkPersonRow` takes two **singular** strings while the DTO carries two lists, so the rule is
pinned rather than improvised: **accent = the first Rolle alphabetically, plus „ +N" when there are
more; meta = the Gruppen joined by „ · "**, truncated by CSS ellipsis, never by slicing the string.

**Components**
```
components/MembersPage.tsx        AppPageHeader + KkAppShell.PageTitle + <MembersBody/>
components/MembersBody.tsx        the one query-aware component; the four states
components/MembersView.tsx        loaded layout: toolbar · list · desktop aside (Grid 12: 8 / 4)
components/MembersToolbar.tsx     KkSearchField + KkFilterChips (real counts)
components/MembersList.tsx        letter sections
components/MembersLetterSection.tsx  KkLetterDivider + rows; the anchor id is a named const in
                                  the component body (`const anchorId = toLetterAnchorId(letter)`),
                                  never built inside JSX
components/MemberRow.tsx          kit-consumer: KkPersonRow (component={Link} to="/members/$personId");
                                  `params` is a const in the body, never an object literal in JSX
components/MembersAside.tsx       desktop-only: KkLetterIndex + MembersStats
components/MembersStats.tsx       KkPanelHeader + KkStatRow + KkRule + KkNote
components/MembersIntro.tsx       the count sentence + the „ohne Mitglied" sentence — rendered
                                  ABOVE the list on mobile, inside MembersAside on desktop
components/MembersEmpty.tsx       KkEmptyState naming the query
components/MembersError.tsx       KkAlert + retry
components/MembersSkeleton.tsx    KkSkeletonRow count={8}
hooks/use-member-search.ts        { query, setQuery, state, setState, letter, jumpTo, visible, counts, letters }
```

**States**
- *first load* — `MembersSkeleton`: eight `KkSkeletonRow`s matching `KkPersonRow` metrics.
- *empty (no affiliated Personen at all)* — **does not exist and must not be built.** The viewer
  reached this page through the affiliation gate, so she is affiliated and is in her own list; the
  list can never be empty. (A payload that comes back empty anyway is a bug, and the error state
  covers it.)
- *empty (search/filter)* — `KkEmptyState` title „NIEMAND GEFUNDEN", body naming the actual query:
  „Kein Name, keine Gruppe und keine Rolle passt zu „<query>". Vielleicht anders geschrieben?"
- *error* — `KkAlert` + „Erneut laden".
- *loaded* — rows grouped by surname initial; per row: initials avatar, name, the running Rolle in
  accent, then the Gruppen faint, italic „keine Gruppe" when there are none, and the state chip.
  Every row navigates (chevron on mobile, hover affordance on desktop).
- *permission variants* — none. The list is identical for everyone; `persons.read_details`
  changes nothing here (decision K) and there is no Schlüssel marker (ruling 6).

Filter chips are **single-select**, built by `toStateFilterOptions(countByState(members))`
(§5.1): `Alle` plus every state that actually occurs, in the order aktiv · ruht · beendet · kein
Mitglied, each with its real count.

**`beendet` does occur here, and it must be offered** (decision AA). A Person whose Mitgliedschaft
ended but who still dances in a Gruppe or holds a Rolle is **affiliated** (§2.5), is in this
payload, and `MembershipStateCalculator` returns `Ended` for her. Suppressing the chip would drop
her out of every filter and out of `countByState`; labelling her „kein Mitglied" would be false —
she *was* one. `beendet` is exactly the honest word, and hers is the case ruling 1 and CONTEXT's
„a Person can belong to a Gruppe without being a Mitglied" exist to make visible. §9.3 requires the
UX-pass script to produce her. §10.4's „Personenverwaltung only" line is corrected accordingly:
what is Personenverwaltung-only is the *unaffiliated* former member, which is ruling 2 and stays
true.

**The stats sentence is not desktop-only.** „X Personen tanzen oder helfen mit, ohne Mitglied zu
sein. Sie stehen mit in der Liste." is the one sentence that teaches the whole model, and a
carnival club reads its app on a phone. `MembersIntro` renders it (with the live total) above the
list below `desktop`; the aside keeps the A–Z register and the „Der Verein in Zahlen" card, which
genuinely are desktop-only.

---

### 5.3 Person — `/members/$personId` (slice 5)

Route file `routes/_app/_affiliated.members.$personId.tsx`; same guard; feature `features/members/`.
**Hooks** `useMemberQuery(personId)` → `memberQueryKey(personId)`.

```
components/MemberPage.tsx         header portal + <MemberBody/>. The portalled title is the
                                  Person's name **once it is known** and the literal „Person"
                                  while the query is pending — the stage must never render an
                                  empty `<h1>` that pops a name in a moment later
components/MemberBody.tsx         query states
components/MemberView.tsx         the loaded layout
components/MemberHeader.tsx       KkAvatar + name + state chip + „Mitglied seit …"
components/MemberClubPanel.tsx    „Im Verein": KkFieldRow Mitgliedschaft / Status / Mitglied seit
components/MemberGroupsPanel.tsx  KkSinceRow per Gruppe, local empty „IN KEINER GRUPPE"
components/MemberRolesPanel.tsx   KkSinceRow tone="accent" per Rolle, local empty „KEINE ROLLE"
components/MemberContactPanel.tsx the three contact states
components/MemberContactHidden.tsx  KkPanel tone="reserved" + KkRedactedValue ×3
components/MemberError.tsx  components/MemberSkeleton.tsx
```

**States**
- *first load* — `MemberSkeleton` (header block + three panel skeletons).
- *not found / not affiliated* — the query fails 404 → „Diese Person steht nicht im Verzeichnis."
  with a link back to `/members`. No hint that she might exist elsewhere.
- *error / loaded* — as usual.
- *contact, three variants driven by `contact.visibility`* — and **only** by it:
  - `shared` → `KkPanel` with three `KkFieldRow`s (Telefon · E-Mail · Adresse). The address value
    is `formatAddress(street, zip, city)` (§5.1); when it is `null` the row renders the same faint
    „nicht hinterlegt" treatment as an absent phone number — a missing field and a withheld field
    are different things and must look different.
  - `hidden` → `KkPanel tone="reserved"` (white, dashed), title „Kontaktdaten sind hinterlegt,
    aber nicht freigegeben", one explanatory sentence, then three `KkRedactedValue`s
    (`label="Telefon|E-Mail|Adresse"`, `placeholder="privat"`). **Hidden never looks like missing.**
  - `revealedByPermission` → the normal data panel **plus** a `KkNote tone="info" icon="permissions"`
    strip above the divider: „Du siehst das über deine Rolle — für andere Mitglieder ist es
    verborgen."
- No `birthDate` on this surface, ever.

---

### 5.4 Gruppen — `/groups` and Gruppe — `/groups/$groupId` (slice 6)

Route files `routes/_app/_affiliated.groups.tsx`, `routes/_app/_affiliated.groups.$groupId.tsx`;
same `_affiliated` guard; feature `features/groups/`.
**Hooks** `useGroupsQuery()`, `useGroupQuery(groupId)`.

```
components/GroupsPage.tsx  GroupsBody.tsx  GroupsGrid.tsx  GroupCard.tsx
components/GroupsEmpty.tsx  GroupsError.tsx  GroupsSkeleton.tsx
components/GroupPage.tsx   GroupBody.tsx   GroupView.tsx
components/GroupHeader.tsx        name, openness chip, member count
components/GroupDescription.tsx
components/GroupMembersPanel.tsx  KkSinceRow per member
components/GroupAdminsPanel.tsx   KkSinceRow + Funktion as the second line + the admin note
components/GroupPhotosSlot.tsx    reserved: KkPhotoPlaceholder grid + one faint line
components/GroupError.tsx  GroupSkeleton.tsx
```

`GroupCard` is an **app-level** composition (`KkPanel` + `KkAvatarStack` + `KkChip` +
`KkHeading tone="accent"`) — every pixel it draws comes from a `Kk*`, which is the §7.4 criterion.
Anatomy to keep: Anton name, the **member count in accent Anton** as the strongest signal
(`KkHeading level={2} tone="accent"` — that is why the `tone` prop exists; `sx={{ color: … }}` is a
`noDesignSx` error with no suppression), description, then avatar stack · „N Personen" · openness
chip. An **archived** card's root is `KkPanel dimmed` — the archived opacity is a panel prop, never
page-level `sx`.

**Under a `sucht Verstärkung` chip the card names who to ask.** `GroupSummaryDto.Admins` (§4.4)
feeds a pure `toRecruitingContactLine(admins): string | null` in `groups-labels.ts` — one admin →
„Melde dich bei Anna.", two → „Melde dich bei Anna oder Katrin.", three or more → „Melde dich bei
Anna, Katrin oder einer der anderen Gruppen-Admins.", none → „Diese Gruppe sucht noch eine
Ansprechperson." The line renders only when `isRecruiting`. This is the difference between a
directory and an invitation, and it is one field plus one pure function.

**States**: skeleton grid of three cards · empty „NOCH KEINE GRUPPE" · error · loaded.
`/groups/$groupId` 404s for an unknown **or archived** Gruppe → „Diese Gruppe gibt es nicht
mehr im Verzeichnis."
The **Bilder** slot is inert: `KkPhotoPlaceholder` tiles plus „Platz für ein paar Bilder aus
vergangenen Sessions. Die Galerie liefert sie später automatisch — hier wird nichts hochgeladen."
No upload control, no „Mitmachen" card, no training time, no founding year.

---

### 5.5 Mein Profil — `/profile` (slice 7, existing surface)

Route file `routes/_app/profile.tsx` (unchanged, two lines). Feature `features/profile/`.
**Hooks** `useMeQuery()` (existing) + `useContactVisibilityMutation()` invalidating
`ME_QUERY_KEY`.

Changes:
```
components/ProfileMembershipPanel.tsx   rewritten: „Status" = toMembershipStateLabel(state),
                                        „Mitglied seit" = formatIsoDay(memberSince),
                                        „Zeitraum" = formatPeriod(currentStartedOn, currentEndedOn)
components/ProfileVisibilityPanel.tsx   NEW — KkPanelHeader „Sichtbarkeit" + KkSwitchRow
components/ProfileVisibilityPreview.tsx NEW — „Was andere von dir sehen": the REAL
                                        MemberContactPanel, on every viewport
hooks/use-contact-visibility.ts         NEW — { isVisible, toggle, isSaving, error }
profile-labels.ts                       + toPreviewContact(person, visible): MemberContact
```
The switch is **optimistic** — the §5.0 optimistic idiom verbatim, over `ME_QUERY_KEY`: the row is
`busy` while in flight, a failure restores the previous cache value **and** raises an error toast
(§7.3 `KkToast`) *and* fills `KkSwitchRow`'s `error` line. A toggle that silently snaps back two
seconds later reads as a broken switch, and this particular switch is about who can see a member's
phone number.

**The preview previews the contact block, not the list row** (decision AJ). The card asks whether
other members may see your phone, e-mail and address; a `KkPersonRow` renders name · Rolle ·
Gruppen · state chip and **no contact data at all**, so it would answer a question nobody asked and
leave the switch's actual effect invisible. Worse, it could not even render truthfully: `MeSchema`
carries `person`, `membership`, `isAffiliated`, `permissionKeys` and **no groups and no roles**, so
the „real" row would show „keine Gruppe" for every member of the Tanzgarde — the component built so
it *cannot lie* would lie on its first render. Instead `ProfileVisibilityPreview` renders the same
`MemberContactPanel` the Person card uses (imported from `features/members/`; features may import
features, §5.9), fed by `toPreviewContact(me.person, isVisible)` — `shared` with the three real
values when on, `hidden` with the dashed card and the `KkRedactedValue` bars when off. That is
truthful, uses data `GetMe` already carries, flips live with the switch, and belongs on **mobile
too**, where most members will meet it.

Only the visibility card is added — no Fotofreigabe, no Push, no E-Mail switch.

---

### 5.6 Gruppen-Hub — `/my-groups/$groupId` (slices 8–10)

Route file `routes/_app/my-groups.$groupId.tsx` — two lines, **no guard component**: the hub
branches on its own query (§5.0). `routes/_app/my-groups.index.tsx` is a bare
`beforeLoad: () => { throw redirect({ to: '/groups' }) }` so a deep link to `/my-groups` lands
somewhere honest instead of the router's not-found; there is no „Meine Gruppen" index **page** —
the Gruppen live in the navigation, and a Person in no Gruppe correctly never sees the group.
Feature `features/group-hub/`.
**Hooks** `useMyGroupsQuery()`, `useMyGroupQuery(groupId)`, and (slices 9/10)
`useUpdateGroupInfoMutation`, `useAddGroupMembershipMutation`, `useEndGroupMembershipMutation`,
`useAddGroupAdminMutation`, `useEndGroupAdminMutation` — each invalidating
`myGroupQueryKey(groupId)` **and** `MY_GROUPS_QUERY_KEY`.

```
components/HubPage.tsx  HubBody.tsx  HubView.tsx
components/HubHeader.tsx            name · „du bist hier dabei" / „du bist Gruppen-Admin" eyebrow
components/HubInfoPanel.tsx         description + openness chip
components/HubMembersPanel.tsx      KkSinceRow rows; admin: + KkPanelHeader action „+ Mitglied"
components/HubAdminsPanel.tsx       same with Funktion; admin: action „+ Admin"
components/HubHistoryPanel.tsx      admin only — ended Zugehörigkeiten and admin rows, as
                                   `KkFactRow tone="neutral"` with `actions` omitted (a closed
                                   row has no end action) and the span from `formatPeriod`;
                                   NEVER a KkSinceRow — „seit 2017" about someone who left
                                   in 2026 is a factual falsehood
components/HubCelebration.tsx      KkConfettiBurst over the members panel, fired on a
                                   successful „Aufnehmen" (see below)
components/HubCarePanel.tsx         admin only — „Gruppe pflegen": description field + KkSwitchRow
components/HubEventsSlot.tsx        KkReservedSlot icon="calendar"
components/HubPhotosSlot.tsx        KkPhotoPlaceholder grid
components/AddMemberDialog.tsx      KkModalFrame: PersonPicker + KkDateField
components/AddAdminDialog.tsx       KkModalFrame: PersonPicker + KkChipField (Funktion)
components/PersonPicker.tsx        KkSearchField + KkPersonRow results, fed by
                                   `usePersonSearchQuery(query)` (§4.41) — the ONE picker, reused
                                   by AddMemberDialog, AddAdminDialog and AddHolderDialog
components/EndMembershipDialog.tsx  KkConfirmDialog tone="neutral"
components/EndAdminDialog.tsx       KkConfirmDialog tone="neutral"
components/HubError.tsx  HubSkeleton.tsx
hooks/use-hub-dialogs.ts            which dialog is open and for which row
```

**States**
- *first load* — `HubSkeleton`.
- *403 — not yours* — `AccessDenied` with `message` = „Diese Gruppe ist nicht deine. Im
  Verzeichnis kannst du sie ansehen." and `action` = a `KkButton component={Link}
  to="/groups/$groupId"` („Im Verzeichnis ansehen"). This is why `AccessDenied` takes an
  `action` slot.
- *404 — gone or archived* — „Diese Gruppe gibt es nicht mehr." with no link, because
  `/groups/$groupId` 404s for an archived Gruppe too. The two cases must not share copy: a member
  of a freshly archived Gruppe told „nicht deine" is lied to twice over.
- *empty* — a Gruppe with no members shows `KkEmptyState` „NOCH NIEMAND DABEI" inside the panel;
  with no admins, „KEIN GRUPPEN-ADMIN"; an admin whose history panel is empty sees
  „NOCH KEINE GESCHICHTE" / „Beendete Zugehörigkeiten und frühere Gruppen-Admins
  stehen hier.".
- *permission variants* — **member**: read-only panels, no `+`, no `Beenden`, no care panel, no
  history. **Gruppen-Admin**: the same page plus the care panel, the two `+` actions in the panel
  headers, a `Beenden` ghost per running row, and the history panel. The tools appear **in place**
  (ruling 12) — there is no second "manage" page for a Gruppen-Admin.
- The **hub must read as mine**: the eyebrow says so, and it is the only place with these tools.
  `/groups/$groupId` never grows them (design-map weakness #4).
- Termine and Bilder are inert reserved slots — no entity, no endpoint, no promised date beyond
  „Kommt in einer späteren Phase."

Person search inside the dialogs is `PersonPicker`, over **`GET /api/person-search`** (§4.41) —
**never** `useMembersQuery()`, which by construction cannot contain the Person being added.
Results render as `KkPersonRow`s with no trailing chip (the payload carries no state). Copy:
„Such die Person im Verzeichnis. Wer noch nicht drin ist, muss zuerst in der Personenverwaltung
angelegt werden." — and now that sentence is true, because a Person created there is findable
here the moment she exists. Under the picker, when the dialog is „Gruppen-Admin ernennen":
„Kein Mitglied — geht trotzdem."

**One celebration, in the one place the club actually grows.** A successful `PostGroupMembership`
increments `HubCelebration`'s `fireKey`, and `KkConfettiBurst` (already in `@furria/ui`) fires once
over the members panel. Aufnehmen is the most club-shaped event in the phase and currently ends in
a dialog quietly closing. Nothing else in P1 celebrates: not ending anything, not archiving, not a
key toggle. §10.2 stands — a burst is not a Narrenruf, and no second Narrenruf placement is added.

---

### 5.7 Personenverwaltung — `/manage/persons` (slice 11)

Route file `routes/_app/manage.persons.tsx`; guard
`<RequirePermission permissionKey={PERMISSION_KEYS.personsManage}>`. Feature `features/manage-persons/`.
**Hooks** `usePersonsQuery()`, `useCreatePersonMutation()`, `useUpdatePersonMutation()`.

```
components/PersonsPage.tsx  PersonsBody.tsx  PersonsView.tsx
components/PersonsToolbar.tsx     KkSearchField („Name, Adresse, E-Mail") + KkFilterChips
components/PersonsList.tsx        KkLetterDivider sections
components/PersonRow.tsx          KkPersonRow → /manage/persons/$personId, chip + „nicht freigegeben"
components/PersonsAside.tsx       desktop KkLetterIndex
components/PersonFormDialog.tsx   KkModalFrame — create and edit share one form. Nine fields plus
                                  a date field plus a switch: below `desktop` the frame is the
                                  **full-height** variant (`size="full"`), not a half-height sheet
                                  with a date popover opening on top of it. It stays a dialog — a
                                  second route would be a page the plan's route table has not got.
components/PersonsCreateFab.tsx   KkFab „Person anlegen" (mobile); desktop uses a header KkButton
components/PersonsEmpty.tsx  PersonsError.tsx  PersonsSkeleton.tsx
hooks/use-person-form.ts          react-hook-form + zodResolver(PersonFormSchema)
```
Filter chips here are the **same** `toStateFilterOptions` row as `/members` (§5.1); on this surface
the payload contains unaffiliated and former Personen, so `beendet` and `kein Mitglied` always
appear. One function, one vocabulary, two data sets — instead of each surface hard-coding which
chips it is allowed to show.

**Cold-empty state** (a registry with nothing in it — reachable on a fresh database):
„NOCH KEINE PERSON" / „Leg die erste Person an — Name genügt, alles andere kommt später." with the
create action. The same treatment for `/manage/groups` („NOCH KEINE GRUPPE") and `/manage/roles`
(„NOCH KEINE ROLLE"); until now only the *search*-empty was specified.
`PersonFormSchema` / `PersonForm` in `schemas.ts`; fields Vorname, Nachname, E-Mail, Telefon,
Straße, PLZ, Ort, Geburtsdatum (`KkDateField`), and the visibility switch labelled as set **on her
word** (§10). The **edit** dialog prefills from the list row — `PersonSummaryDto` carries `Street`
and `Zip` (§4.14) precisely so it can, with no second round trip. Search-empty copy names the query.

**`PersonRow` on a phone**: avatar 38 + two lines + trailing chip + chevron leaves ~190px for the
name at a 400px viewport, so below `desktop` the state chip moves to **line two** (after the
Gruppen) and the trailing slot carries the chevron alone. The same rule applies to `MemberRow` on
`/members`.

---

### 5.8 Person bearbeiten — `/manage/persons/$personId` (slices 12–13)

Route file `routes/_app/manage.persons.$personId.tsx`; same key guard; same feature.
**Hooks** `usePersonQuery(personId)` plus one mutation hook per endpoint 4.18–4.24, all
invalidating `personQueryKey(personId)` and `PERSONS_QUERY_KEY`.

```
components/PersonEditPage.tsx  PersonEditBody.tsx  PersonEditView.tsx
components/PersonMasterDataPanel.tsx      Stammdaten + „Bearbeiten"
components/PersonMembershipsPanel.tsx     KkFactRow per period + „+ Zeitraum hinzufügen"
components/PersonMembershipRow.tsx        one period: its KkFactRow, then its pauses NESTED
                                          beneath it as KkFactRow tone="gold", then a per-period
                                          „+ Ruhezeit" action carrying THAT row's membershipId
components/PersonFeeReductionsPanel.tsx   KkFactRow per Ermäßigung + „+ Ermäßigung hinzufügen"
components/PersonGroupsPanel.tsx          READ-ONLY: KkSinceRow + „nur Ansicht" chip + the note
components/PersonRolesPanel.tsx           READ-ONLY: same
components/MembershipEditor.tsx           inline editor, one open at a time
components/PauseEditor.tsx                Von/Bis Session + KkConsequenceNote
components/FeeReductionEditor.tsx         Grund + Von/Bis Session + KkConsequenceNote
components/EndMembershipDialog.tsx        KkConfirmDialog tone="neutral"
hooks/use-fact-editor.ts                  which editor is open, for which row
```

**Rules**
- The editor **replaces the card in place**, one at a time, and the `KkConsequenceNote` sits
  **directly under the fields it describes**, updating as they change (design-map weakness #6).
- **There is no flat `PersonPausesPanel`.** A Ruhezeit hangs off exactly **one** `membership_id`
  (§1.4, decision I), its route is
  `/manage/persons/{personId}/memberships/{membershipId}/pauses` (§4.21) and §4.15 already nests
  `Pauses` inside `PersonMembershipDto`. A sibling panel with one „+ Ruhezeit hinzufügen" button
  has **no `membershipId` to post to** — the implementer would silently pick the running period
  (wrong for a historic correction, impossible when none runs) or invent a period selector — and a
  flat list cannot say which period each pause belongs to. For the Person the model exists for
  (§9.4's two-chain case: kündigt, rejoins) that is unreadable. The UI mirrors the payload.
- **Row actions, pinned once.** `Beenden` appears **only** on a row that is currently running.
  `Ändern` appears on **every** row, running, future or closed — decision U says a mistake is
  *corrected, not erased*, so `PutMembership` / `PutMembershipPause` / `PutFeeReduction` must be
  reachable for a closed row, or the only remedy for a typo in a 2019 date is no remedy at all.
  `+ Ruhezeit` is offered on every membership row, for the same reason. (This supersedes the
  earlier blanket „a closed row carries no actions"; decision AK.)
- A **future** period (`isFuture`) renders the `geplant` chip and offers `Ändern` but not
  `Beenden` — there is nothing to end yet.
- The consequence sentence may state what the fact does to the derived state and to Gruppen. It
  **may never promise anything about money** — „Beitrag während einer Ruhezeit" is an open club
  question.
- Ruhezeit has **no Grund field**; Beitragsermäßigung's `basis` is a stated choice, never derived
  from the birth date; neither block mentions a Mitgliedschaftsart or an Ehrenmitgliedschaft.
- Gruppen and Rollen are read-only here with an honest pointer: „Gruppen pflegen die
  Gruppen-Admins. Überschreiben geht in der Gruppenverwaltung." / „Rollen werden unter „Rollen &
  Rechte" vergeben."
- No „Verlauf" button, no „angelegt von" line.

---

### 5.9 Gruppenverwaltung — `/manage/groups` (slices 14–15)

Route file `routes/_app/manage.groups.tsx` with
`validateSearch: ManagedGroupsSearchSchema` where
`ManagedGroupsSearchSchema = z.object({ group: z.coerce.number().int().positive().optional().catch(undefined) })`
— **the selected Gruppe is a search param (`?group=7`)**, exactly as `/manage/roles` selects a
Rolle, and for the same reasons: the override panel is the surface an admin is *sent to* by someone
else after a lockout, so it must be linkable and reloadable, and local component state would make
it neither. A row click sets `?group=<id>`; `GroupOverridePanel` renders beside the list on desktop
(Grid 12: 5 / 7) and below it on mobile, scrolled into view on select. §6.3's `resolveSectionTitle`
is unaffected — the prefix does not change.
Guard `permissionKey={PERMISSION_KEYS.groupsManage}`.
Feature `features/manage-groups/`.
**Hooks** `useManagedGroupsQuery()`, `useManagedGroupQuery(groupId)`, `useCreateGroupMutation`,
`useUpdateGroupMutation`, `useArchiveGroupMutation`, `useRestoreGroupMutation`, plus the **reused**
hub mutations from `features/group-hub/api.ts` for the overrides (slice 15).

```
components/ManagedGroupsPage.tsx  ManagedGroupsBody.tsx  ManagedGroupsView.tsx
components/ManagedGroupsToolbar.tsx   search + KkFilterChips (Alle / Aktiv / Archiviert)
components/ManagedGroupRow.tsx        ≥ `desktop`: name · Personen · Admins · Offenheit · Status.
                                     Below it: two lines — name / „N Personen · N Admins" — plus
                                     one trailing chip (the most urgent of `kein Admin` →
                                     `archiviert` → openness). Five columns do not fit 360px, and
                                     the five-column table is the mock the design map calls out
                                     as weak (#3); the phone form is the primary one.
components/GroupFormDialog.tsx        create + rename + description + openness
components/ArchiveGroupDialog.tsx     KkConfirmDialog tone="neutral"
components/RestoreGroupDialog.tsx     KkConfirmDialog tone="neutral"
components/GroupOverridePanel.tsx     slice 15 — members and admins of the selected Gruppe
components/ManagedGroupsCreateFab.tsx KkFab „Gruppe anlegen" (mobile)
```
Archived rows render `dimmed` with an `archiviert` chip and offer „Aktivieren".
Slice 15's override panel reuses `AddMemberDialog`, `EndMembershipDialog`, `AddAdminDialog`,
`EndAdminDialog` from `features/group-hub/` — the components are exported from that feature's
`index.ts` and imported here. Features may import features; only `lib` and `routes` are
constrained.

---

### 5.10 Rollen & Rechte — `/manage/roles` (slices 16–17)

Route file `routes/_app/manage.roles.tsx` with
`validateSearch: RolesSearchSchema` where `RolesSearchSchema = z.object({ role: z.coerce.number().int().positive().optional().catch(undefined) })`
— the selected Rolle is a search param (`?role=3`), validated by a schema that never throws.
Guard `permissionKey={PERMISSION_KEYS.rolesManage}`. Feature `features/manage-roles/`.
**Hooks** `useRolesQuery()`, `useRoleQuery(roleId)`, `useCreateRoleMutation`,
`useUpdateRoleMutation`, `useArchiveRoleMutation`, `useRestoreRoleMutation`,
`useSetRolePermissionsMutation`, `useAddRoleHoldingMutation`, `useEndRoleHoldingMutation`.

```
components/RolesPage.tsx  RolesBody.tsx  RolesView.tsx      // Grid 12: 4 / 8 on desktop
components/RolesMasterList.tsx     KkSearchField + KkSelectRow per Rolle + „+ Rolle anlegen"
components/RoleDetail.tsx          header card, holders, the key list
components/RoleHeaderCard.tsx      name, description, „Umbenennen", „+ Inhaber", chips
components/RoleHoldersPanel.tsx    KkSinceRow per Inhaber + „Beenden"
components/RolePermissionList.tsx  one KkSwitchRow per key, in FurriaPermissions order
components/RoleFormDialog.tsx  AddHolderDialog.tsx  EndHoldingDialog.tsx  ArchiveRoleDialog.tsx
                               // AddHolderDialog uses the SAME PersonPicker as the hub
                               // (features/group-hub/), over GET /api/person-search (§4.41) —
                               // a roles manager need not hold persons.manage, so
                               // GET /api/manage/persons is not available to her
components/RolesEmpty.tsx  RolesError.tsx  RolesSkeleton.tsx
role-permission-copy.ts            the four German key descriptions (module constant)
```

**Rules taken from the UX pass, not from the mock**
- The master list is **flat** (alphabetical, archived last) — no `kind` groups, no origin hints.
- **No rights counter** („16 von 26", „3 von 5", a red count per Rolle). With four keys a ratio
  reads as a score to fill. One row per key, plain German, a switch.
- **Mobile shows the four switches directly** in the detail view — no „Rechte ändern" second
  screen. Master → detail is a single navigation (`?role=`), and the master list collapses above
  the detail below `desktop`. Selecting a row **scrolls the detail into view** (`ref.scrollIntoView`
  in an effect keyed on `role`), because a tap that only changes a search param and moves nothing
  on screen reads as a dead row.
- `useRoleQuery(roleId)` is seeded with `placeholderData` derived from the matching `GetRoles` row
  — `GetRoles` already returns each Rolle's `PermissionKeys` and `Holders` (§4.31), so master →
  detail is instant and only `PastHolders` arrives late.
- A Rolle with no Inhaber shows „Die Rolle ist unbesetzt. Die Rechte sind gesetzt und greifen,
  sobald jemand eingetragen wird." — not an error.
- Toggling a key uses the **optimistic idiom of §5.0** verbatim (`onMutate` snapshot →
  `setQueryData` → `onError` restore + toast → `onSettled` invalidate). `PutRolePermissions` is a
  **full replacement** (§4.37), so the next key set is computed from the **optimistically updated
  cache value**, never from a stale read; the row is `busy`, never `disabled`, while in flight.
  The guidance line says „Umschalten wirkt sofort für alle Inhaber dieser Rolle."
- **404 states**: `?role=999` (or an archived Rolle deleted from under the user) renders
  „DIESE ROLLE GIBT ES NICHT" / „Vielleicht wurde sie umbenannt. Wähl links eine aus." in the
  detail column; `/manage/persons/$personId` with an unknown id renders „DIESE PERSON GIBT ES
  NICHT" with a link back to the list.
- No `sensibel` / `unwiderruflich` flags, no Grundrecht, no Admin special case.

---

## 6. Navigation and routing

### 6.1 The new `app-sections.ts` shape

`features/session/app-sections.ts` (rewritten; it keeps its unit test):

```ts
export interface AppSection {
  id: string;
  label: string;
  icon: KkIconName;
  to: string | null;                       // the ROUTE PATTERN, e.g. '/my-groups/$groupId'
  params?: Record<string, string>;         // e.g. { groupId: '12' }
  permissionKey?: PermissionKey;           // entry appears only when the key is held
}

export interface AppSectionGroup {
  id: 'main' | 'my-groups' | 'manage';
  label: string | null;                    // null = no heading (the main group)
  sections: AppSection[];
}
```

```ts
export const OVERVIEW_PATH = '/';
export const PROFILE_PATH = '/profile';
export const MEMBERS_PATH = '/members';
export const GROUPS_PATH = '/groups';

export const APP_SECTIONS: AppSection[] = [
  { id: 'overview',  label: 'Übersicht',       icon: 'overview', to: OVERVIEW_PATH },
  { id: 'events',    label: 'Veranstaltungen', icon: 'events',   to: null },
  { id: 'live',      label: 'Live-Regie',      icon: 'live',     to: null },
  { id: 'members',   label: 'Mitglieder',      icon: 'members',  to: MEMBERS_PATH },
  { id: 'groups',    label: 'Gruppen',         icon: 'group',    to: GROUPS_PATH },
  { id: 'fees',      label: 'Beitrag',         icon: 'fees',     to: null },
  { id: 'gallery',   label: 'Galerie',         icon: 'gallery',  to: null },
  { id: 'wardrobe',  label: 'Klamotten',       icon: 'wardrobe', to: null },
];

export const MANAGE_SECTIONS: AppSection[] = [
  { id: 'manage-persons', label: 'Personen',        icon: 'person',      to: '/manage/persons', permissionKey: PERMISSION_KEYS.personsManage },
  { id: 'manage-groups',  label: 'Gruppen',         icon: 'group',       to: '/manage/groups',  permissionKey: PERMISSION_KEYS.groupsManage },
  { id: 'manage-roles',   label: 'Rollen & Rechte', icon: 'permissions', to: '/manage/roles',   permissionKey: PERMISSION_KEYS.rolesManage },
];
```
**Raw key literals are banned here too.** `PERMISSION_KEYS` (§5.1) is the one spelling; a literal
`'persons.manage'` in this file is exactly where decision A's retired `persons:manage` form comes
back, and §0 forbids a second spelling of the same thing.

`to: null` keeps rendering a disabled nav item — the shipped "placeholder that is not an interim
version" idiom. **Only `members` and `groups` gain live targets**; Veranstaltungen, Live-Regie,
Beitrag, Galerie and Klamotten stay `null`. The mock's rail groups (MEIN BEREICH / VEREIN /
Spielplan / Bierliste / Beiträge & Kasse) never reach the code.

### 6.2 The pure group builder

```ts
export interface NavGroupInput {
  permissionKeys: readonly string[];
  myGroups: readonly { groupId: number; name: string }[];
}

export const buildNavGroups = (input: NavGroupInput): AppSectionGroup[];
```
Rules (pure, unit-tested with `it.each`):
1. The **main** group is always present, label `null`, `APP_SECTIONS` verbatim.
2. **„Meine Gruppen"** appears only when `myGroups` is non-empty; one entry per Gruppe, sorted by
   name, id `my-group-<groupId>`, `icon: 'group'`, `to: '/my-groups/$groupId'`,
   `params: { groupId: String(groupId) }`.
3. **„Verwaltung"** appears only when at least one `MANAGE_SECTIONS` entry's `permissionKey` is in
   `permissionKeys`; it contains exactly the held ones, in `MANAGE_SECTIONS` order.
   `persons.read_details` grants **no page** and therefore never opens this group — it changes what
   a Person card shows, not the navigation. (The plan's "one entry per held key" means one entry
   per held key *that has a surface*; the fourth key has none by design. This is a **declared
   reinterpretation** of plan §4's navigation paragraph, decision T — write it back into the plan
   when that file is next touched, exactly as decision A does for
   `plan/server/identity-foundation.md`.)

### 6.3 `resolveSectionTitle`

Becomes a prefix matcher (it must handle `$param` routes), still a pure function with its test:

```ts
const SECTION_TITLES: readonly { prefix: string; title: string }[] = [
  { prefix: '/manage/persons', title: 'Personenverwaltung' },
  { prefix: '/manage/groups',  title: 'Gruppenverwaltung' },
  { prefix: '/manage/roles',   title: 'Rollen & Rechte' },
  { prefix: '/my-groups',      title: 'Meine Gruppe' },
  { prefix: '/members',        title: 'Mitglieder' },
  { prefix: '/groups',         title: 'Gruppen' },
  { prefix: '/profile',        title: 'Profil' },
];
export const resolveSectionTitle = (pathname: string): string;
// first prefix that pathname === prefix || pathname.startsWith(`${prefix}/`); else 'Übersicht'
```
Order matters: `/manage/groups` must be tested before `/groups`. The title feeds
`KkAppShell.MenuButton` (the mobile dock label), while the **page's own** `<h1>` still comes from
`AppPageHeader` + `KkAppShell.PageTitle`.

### 6.4 How the client learns its keys and its Gruppen

| Question | Source | Where |
|---|---|---|
| Which Berechtigungen does this Account hold? | `GET /api/auth/me` → `permissionKeys` | `useMeQuery()` → `usePermissions()` |
| Is this Account affiliated? | `GET /api/auth/me` → `isAffiliated` | `RequireAffiliation` |
| Which Gruppen are mine, and where am I admin? | `GET /api/my-groups` | `useMyGroupsQuery()` |

**Decision and justification.** The **authorization context rides on `GetMe`**; the **Gruppen list
is its own endpoint**.

`GetMe` already gates the whole tree (the shell will not render without it), so putting
`isAffiliated` and four key strings there costs no extra round trip, keeps one source of truth for
"who am I", and survives ADR-0006's constraint that a guard must decide from something the client
already holds. A dedicated `/auth/permissions` endpoint would double the boot requests and let the
two answers drift.

The Gruppen list is **not** on `GetMe` because it is unbounded, changes independently of the
Account (any Gruppen-Admin can add or end a Zugehörigkeit), and is the hub index in its own right —
folding it into `GetMe` would make every hub write invalidate the session query.

`AppShell` therefore calls `useMeQuery()` and `useMyGroupsQuery()` and passes both into
`buildNavGroups`. `AppNav` renders `AppSectionGroup[]`, adding a `KkEyebrow` heading per group with
a non-null label.

**Both queries are part of the boot gate.** The shell already will not render without `me`;
`myGroups` joins it, fired **in parallel** (not chained — that would be the waterfall §5.0
removes). Letting the „Meine Gruppen" group appear a beat later is a guaranteed layout shift in the
rail *and* in the curtain on every cold boot, on the one surface that is on screen the whole time.
One extra parallel request at boot is the cheaper trade. A failed `myGroups` query does **not**
block the shell: the group is omitted and the rest of the navigation renders.

---

## 7. `@furria/ui` additions

**This section is the anti-drift contract.** ADR-0007 and the `noDesignSx` Grit plugin make it
physically impossible for a Club-App page to style anything: in `apps/club-app/**` the only legal
MUI imports are `@mui/material/Stack`, `@mui/material/Grid`, `@mui/material/Box`;
`@mui/icons-material/**` and `@emotion/**` are banned; and every design-bearing `sx` key
(`color`, `bgcolor`, `font*`, `border*`, `outline*`, `background*`, `boxShadow`, `opacity`,
`letterSpacing`, `lineHeight`, `textTransform`, `fill`, `stroke`, `textDecoration*`) plus any hex,
`px`/`rem`/`em` literal, colour function or CSS colour name is a lint error — including inside
`style=` and nested `slotProps`. **Suppression is never allowed.**

Therefore: **if a surface needs a styled thing that is not in this section, that is a contract
bug** — report it and add the primitive to `@furria/ui`, never a page-level `sx`.

### 7.0 Rules for every new primitive

1. Folder + file layout: a single-part component is `packages/ui/src/KkThing.tsx`; a multi-part
   one is `packages/ui/src/KkThing/KkThing.tsx` containing **only imports plus one
   `Object.assign`**, with parts under `internal/{layout,ui,logic}`, one component per file,
   `FC<Props>` arrow, named export. `logic/` only at 3+ shared consumers.
   A part shared by **several separate primitives** lives in `packages/ui/src/internal/` and is
   **not** exported from `index.ts` — `KkFieldChoices` (the suggestion-chip row under a field) is
   the one such part in P1, used by `KkDateField`, `KkChipField` and `KkSessionField`. Without it
   the package whose whole purpose is to stop duplication would ship the same chip row three times.
2. Export from `packages/ui/src/index.ts` (value and, where public, its prop/enum types).
3. Root element carries a `data-kk-*` attribute; `sx` is merged with the house idiom
   `sx={[{ …defaults }, ...(Array.isArray(sx) ? sx : [sx])]}` so a caller always wins.
4. Colours are **palette token strings** (`'text.primary'`, `'background.paper'`, `'divider'`,
   `'primary.main'`, `'warning.main'`, `'success.main'`, `'info.main'`) or
   `(theme.vars ?? theme).palette.X` inside a template string. A bare `theme.palette.X` bakes one
   mode and is a bug.
5. **Light is the base declaration; dark is a `theme.applyStyles('dark', { … })` delta.** Never a
   `prefers-color-scheme` media query, never a scheme literal outside `kkTokens`.
   Every new primitive must be checked in **both** schemes — the mock bundle has no dark mode at
   all, so every white/cream/dashed/dotted surface needs a deliberate dark counterpart.
6. Radius `kkTokens.radius.base` (14) everywhere; pills and chips stay fully round
   (`kkTokens.radius.pill`). Hairlines are `1.5` in `divider`. Elevation is
   `kkTokens.shadow.rest`; the poster offset shadow stays absent from the app.
7. Nothing interactive below 11px. Tap targets ≥ `kkTokens.tapTarget`.
8. **No German domain vocabulary inside `@furria/ui`** — the package is shared with the public
   website. Labels are props. The `aktiv/ruht/beendet` mapping lives in the app
   (`lib/state-chips.ts`).
9. `useIsMobile()` (breakpoint `desktop` = 900) is the only responsive switch; never
   `useMediaQuery` in an app.

### 7.1 Extended existing components

| Component | File | Change |
|---|---|---|
| `KkPanelHeader` | `KkPanelHeader.tsx` | props become `{ title: string; action?: ReactNode; meta?: string }` — the right slot of the editorial header. `action` renders flush right after the rule; `meta` renders as a faint `KkEyebrow`. Existing call sites are unaffected. |
| `KkPanel` | `KkPanel.tsx` | props become `{ variant?: 'list' \| 'block'; tone?: 'cream' \| 'raised' \| 'reserved'; dimmed?: boolean; sx?: KkSx }`. `cream` (default) = `background.paper`; `raised` = `kkTokens.color.light.panel2` + dark delta (input surfaces, modals, previews); `reserved` = `raised` + `1.5px dashed divider` (withheld or not-yet-built content); `dimmed` adds the archived opacity. |
| `KkFieldRow` | `KkFieldRow.tsx` | props become `{ label: string; value: ReactNode; hint?: string }` — `value` accepts a `KkChip`, `hint` renders as a faint line under the value. |
| `KkNote` | `KkNote.tsx` | props become `{ tone?: 'muted' \| 'info' \| 'warning'; icon?: KkIconName; sx?: KkSx }`. `info` = `info.main` text with a leading icon (the "über deine Rolle" strip); `warning` = `warning.main`. |
| `KkButton` | `KkButton.tsx` | adds `tone?: 'default' \| 'danger'`. `danger` + `variant="outlined"` = accent text on an accent hairline (the `Beenden` ghost); `danger` + `variant="contained"` = the destructive primary. |
| `KkIcon` | `KkIcon.tsx` | `KkIconName` gains 17 names (§7.2). |
| `KkAvatar` | `KkAvatar.tsx` | adds `size?: 'small' \| 'medium' \| 'large'` (26 / 40 / 56) for the avatar stack and the person row. **No `tone` prop** — the gold Ehrenmitglied avatar is out of P1. |
| `KkHeading` | `KkHeading.tsx` | adds `tone?: 'default' \| 'accent'`. `accent` = `primary.main`. Without it the single strongest element on `/groups` — the member count in accent Anton — is **physically unbuildable**: `sx={{ color: 'primary.main' }}` is a `noDesignSx` error and suppression is never allowed, so the implementer would ship a black number (drift) or reach for a documented bypass (ADR-0007 forbids it). Same prop unblocks every other big accent number (the Rollen master count, the stat values). |

#### 7.1a Amendment — the action hierarchy (UX pass, round 1, finding U2)

§9 item 1 of the implementation-state file asked for this decision. It is taken here and is binding
on every surface. The primitive definitions above are **unchanged**; what this pins is *where each
one is used*, plus one contrast fix.

1. **A repeated row action is quiet.** A row-level `Beenden` — the Gruppen-Hub member and admin
   rows, the Gruppenverwaltung override rows, a Rollen holder row, a running period on Person
   bearbeiten — is `tone="danger" variant="text" size="small"`. A red verb, never a pill, never a
   column of pills.
2. **The loud destructive treatment is reserved for the single confirming button inside
   `KkConfirmDialog`**, which carries the consequence sentence (§10.5). That is
   `tone="danger" variant="contained"`.
3. **Each surface gets exactly one `variant="contained"` primary**, in the `action` slot of its
   section `KkPanelHeader`. `/manage/roles` already does this correctly — „+ Inhaber eintragen"
   filled, „Umbenennen"/„Archivieren" outlined.
4. **Contrast.** Both red *label* branches of `KkButton` (`default/text` and
   `danger/outlined` · `danger/text`) paint through `kkTokens.color.*.redInk`, not `error.main`:
   `.main` is the fill, the `*Ink` token is the readable foreground. `error.main` at
   `size="small"` measured 4.35:1 on cream, under the AA floor, on a control that repeats ~20×
   per surface. `variant="contained"` is untouched — there red is the fill and `onRed` the
   foreground.
5. **Rejected: a „Bearbeiten"/„Mitglieder pflegen" mode toggle** that hides the row actions until
   switched on. It adds a mode to four surfaces, hides an affordance behind state, and contradicts
   „build the end state". Do not build it.
6. **Rejected: escalating the archive confirmations to `tone="danger"`** — decisions V and AE keep
   archiving deliberately undramatic.

Palette consequence (finding U7): `error.main` is now `color.redDk`, so a rejected field reads a
step darker and heavier than a merely focused one. Before, `primary.main` and `error.main` were the
same hex and focus and error were indistinguishable (WCAG 1.4.1). `KkTextField` additionally renders
an `alert` icon in its `endAdornment` on `error`, so the state never rests on hue alone.

#### 7.1b Amendment — uppercase is chrome, a club name is data (UX pass, round 1, finding U5)

**Uppercase belongs to chrome**: the page-title band, the nav rail, `KkPanelHeader`, `KkEyebrow`,
`internal/display-title`. **A Gruppe's or a Rolle's own name is data and reaches the screen exactly
as the club typed it.** `KkSelectRow` was CSS-uppercasing the club's own names, which destroyed the
ß („Große Garde" → „GROSSE GARDE") on the one surface whose entire content is those names, and its
`lineHeight: 1.1` plus `overflow: hidden` sliced the diacritics off Ä/Ö/Ü in Anton.

`KkSelectRow` therefore: no `textTransform`; `lineHeight: 1.3`; the ellipsis clip moved to an inner
span so a diacritic can never fall outside the box that clips; and `title` is `text.primary` in
**both** states — selection is carried by the accent bar, the `text.primary` border and
`raisedSurface`, and the muted treatment is reserved for `dimmed`, so „archiviert" reads as a state
and not as „not currently selected".

**Rejected: uppercasing `KkHeading`** so the detail card titles match the master rows. That would
spread the ß destruction and the clipped diacritics to `/groups` as well. `KkHeading` stays mixed
case.

#### 7.1c Further primitive changes from the same pass

| Primitive | Change | Finding |
|---|---|---|
| `KkSinceRow` | optional `component`/`to`/`params` (the `KkPersonRow` interactive contract), focus ring, hover paint and a trailing chevron when interactive; optional `avatar` rendered **in place of** the icon tile (a row renders exactly one of the two); `title` raised to `type.rowValue` and `sinceValue` dropped to Archivo `type.rowTitle` at `text.secondary`, so the name outranks the Session; the `xs` full-width `trailing` band is gone and the slot sits inline at every width. A row whose `trailing` holds a `KkButton` stays non-interactive (§8.12: no `<button>` inside an `<a>`). | U1 |
| `KkAppShell.Main` | `pb` of `curtainClearance + 24` below `desktop`, so the fixed mobile dock stops covering the last screenful of every phone route. | U3 |
| `KkAppShell.NavItem` | new optional `hint?: string` (a small neutral chip, flush right). The disabled row no longer uses `opacity: 0.6` — its label **and** icon are `text.disabled`, a genuinely different token from the enabled `text.secondary`, which was the same value spelled twice. | U4 |
| `KkAppShell.Stage` | renders `KkBandWatermark side="right" tone="ink"` behind the page title, at `kkTokens.opacity.watermark`, `zIndex: -1`. `KkBandWatermark` gains `tone` (`onAccent` default, `ink`), `size` and `sx`. | U8 |
| `KkEmptyState` | the 52px ink-wash disc and its `KkIcon` are gone; `KkBroomMark` at 116 in `text.disabled` is the single figure. **The `icon` prop is removed** — it survives only on `KkReservedSlot`. | U8 |
| `KkPageWatermark` | **new primitive.** The coat of arms as page content, for a surface whose own content has not been built yet. Consumer: `/` (the overview). | U8 |
| `KkAvatarStack` | `buildAvatarStack` emits a **one-letter** monogram for stacked circles. At 26px with a −10px overlap the second letter was painted over on every circle but the last; the stack is a density texture, the names are spelled out on the detail surface. Standalone `KkAvatar` at `medium`/`large` keeps both letters. | U6 |
| `KkIconButton` | `focusRing(theme)` — every modal close ✕, the password eye, the search clear ✕, the toast close and the rail logout had no visible keyboard focus (WCAG 2.4.7). | U7 |
| `KkIcon` | `KkIconName` gains **`alert`** (`ErrorOutlineOutlined`) for the non-colour error signal. | U7 |
| `KkSummaryRow`, `KkSelectRow` | a trailing chevron when the row is interactive, matching `KkPersonRow` — on a touch device nothing else said a row was tappable. | U10 |
| `KkPanel` | an interactive panel carries a resting lift (`shadow.rest` light / `chrome.dark.lift` dark) outside the hover query; the `primary.main` border stays the hover state. | U10 |
| `KkPersonRow`, `KkSummaryRow`, `KkSelectRow`, `KkFactRow`, `KkSinceRow`, `KkPanel` | `dimmed` no longer puts `opacity` on the whole node — it set `text.secondary` to 2.75:1 and made the `archiviert` chip the least readable thing in the row it explains. It now recolours the **title** to `text.secondary` and dims only the avatar/icon tile or the rail bar; chips render at full opacity. | U11 |
| `kkTokens` | new `color.*.neutralInk`; the `neutral` chip ground rises 6→10 % (light) and 12→16 % (dark). `color.light.goldInk` → `#7E5C00` and `color.dark.blueInk` → `#7FB2E0`, the two remaining chip tones that were still under 4.5:1 at `chipSmall`. A `contrastRatio` unit test now guards every tone pair in both schemes, plus the red button label and the destructive fill. | U11 |
| `KkFilterChips` | wraps at `xs` when there are ≤ 5 options instead of scrolling with no affordance — the fifth chip on `/members` was entirely off-screen at 390px with no fade, no shadow and no scrollbar. | U12 |
| `KkPhotoPlaceholder` | set in `kkTokens.font.body` at `type.chip`; `ui-monospace` is a face the KK system does not own. | U9 |
| `KkStickyRail` | **new primitive.** `position: sticky` with a px `top` is a `noDesignSx` error in a page and suppression is never allowed, so a page column could not be made sticky at all. `display: { xs: 'contents', desktop: 'block' }`, new token `kkTokens.layout.stickyTop`. | U13 |

**One deliberate deviation from §10.3.** In a `KkSinceRow` the Session is still the unit
(`seit 2018/19`, never `seit 2019`) — what changed is only its *typographic rank*: it is Archivo at
`type.rowTitle` in `text.secondary` rather than Anton at `type.rowValue` in `text.primary`. §10.3
governs which unit is rendered, not which face outranks the person's name.

`app-sections.ts` (app side, same finding U4): the five routeless entries — Veranstaltungen,
Live-Regie, Beitrag, Galerie, Klamotten — leave `APP_SECTIONS` for their own trailing group
`{ id: 'later', label: 'Kommt später' }`, each with `hint: 'bald'`, hung after „Meine Gruppen" and
„Verwaltung". Five of the eight front-row entries were dead ends rendered pixel-identical to the
live ones.

#### 7.1d Further primitive changes (UX pass, round 4)

| Primitive | Change | Finding |
|---|---|---|
| `kkTokens.color.dark.panel2` | `#0E0B0A` → **`#272120`**. The dark raised surface was *darker* than the dark page ground (`bg #161110`) and byte-identical to `chrome.dark.base` — a chrome ground reused as a content surface — so every dialog, `/profile`'s Sichtbarkeit card and the Hub's reserved slots read as holes punched in the page and the 7.6a `editing` tone was distinguishable only by being one. `bg < panel < panel2` now holds in dark as it always did in light. `chrome.dark.base`/`sideBg` stay `#0E0B0A`: chrome darker than the page is deliberate. `internal/contrast.test.ts` gained the invariant (raised is lighter than both the page and a cream panel, in both schemes) and the „never reuse a chrome ground as a content surface" check. | R1 |
| `KkLetterIndex` | the selected cell spread `redInk(theme)` and `accentWash(theme)` into one object literal, so the second `applyStyles('dark', …)` key silently discarded the first and the cell shipped light `#B3101C` on the dark wash at **2.04:1**. `internal/accent-wash.ts` now exports `accentWashScheme(theme)` beside `redInkScheme`, and the pair is merged through the one `applyScheme` 7.6c created for exactly this bug class. The composed paint moved to `letter-index-cell-paint.ts` so a unit test can assert it carries **one** dark block containing **both** the ink and the wash. Every other call site in the package was audited: no second occurrence. | R2 |
| `KkFilterChips` | U12 is now actually implemented. The shipped component did the **inverse** — `nowrap`/`overflow-x: auto` at `xs`, `wrap` at desktop, plus an unconditional 36px fade — so the fifth chip on `/members` (`kein Mitglied 11`, the cohort the page's own lead explains) was off-screen at 390px. `filterChipsWrap(optionCount)` pins the rule: **≤ 5 options wrap at every width**, `overflowX: visible`, no mask; the scroll-with-fade branch survives only for a longer set, and the `scrollIntoView` effect runs only in that branch. | R3 |
| `KkLetterIndex` | new **`variant="rail"`**: a fixed, vertically centred, right-gutter column of 26×26 cells (clears SC 2.5.8), `aria-orientation="vertical"`, `zIndex: kkTokens.layout.letterRailZ` — above the list, below the sticky bar. Roving tabindex, `aria-current="location"` and the required `label` are unchanged. At 390px the phone toolbars pinned search + filter chips + a three-row alphabet (~250 CSS px) for the whole scroll of a deliberately unpaged 151-row list; the rail costs zero vertical space. Mounting it at `xs` is the app's call. | R4 |
| `KkButton` | `variant="text"`'s rest signifier (7.1a's round-3 amendment) and `KkSinceRow`'s title-link underline (U1) had become typographic twins: 19–21× per surface a row carried two underlined targets of identical weight, „Beenden" and the person's name, separated only by hue (WCAG 1.4.1). The **marks** split, not the hues: the button label rests on `textDecorationStyle: 'dotted'` at `line.hair` and goes **solid** at `line.section` on `:hover, :focus-visible`. `titleLinkPaint` keeps its solid underline. Neither underline is removed. | R5 |
| `KkPageWatermark`, `KkBandWatermark` | both now read one exported `watermarkOpacityScheme` (`internal/watermark-paint.ts`) through `applyScheme`. The page mark had no dark delta at all and painted at 2.5× the band mark directly above it. | R6 |
| `KkPanelHeader` | the editorial rule gets `minWidth: RULE_BLEED * 2` and `flexShrink: 0`, so it can never render as pure accent bleed. With a selection the Verwaltung master column narrows to ~5/12 and the rule was squeezed to ~30px — entirely inside the 26px bleed — so §5's signature gesture became a red dash hanging off the word, in the selected state only. The create action stays in the `action` slot (round-1 amendment 3 to 7.1a.3). | R7 |
| `KkSinceRow` | the desktop `KkEyebrow`(„SEIT") + value pair is gone; both breakpoints now render the single phrase `compactSince` („seit 2016/17"), right-aligned, `nowrap`, `text.secondary`. §10.3 pins one spelling for a running relationship and 7.1c's deviation note governs only its typographic **rank** (Archivo `type.rowTitle` at `text.secondary`) — which is kept. | R8 |
| `KkPersonRow` | at `xs` the second line wraps: the affiliation takes `flexGrow: 1` / `flexBasis: 100%` and the trailing chips fall to a third line instead of truncating the identity. The Personenverwaltung hangs two pinned chips (§5.7) there, ~200 of 390px, so the management view showed **less** about a Person than `/members` did. The chip order fixed in round 1 is unchanged. | R9 |
| `KkInlineLink`, `KkCard` | both hover rules paint `redInk(theme)` instead of `primary.main`. 7.1a.4 pins `.main` as the fill and `*Ink` as the readable foreground; these two were the last sites still dropping to 4.35:1 in exactly the state the reader puts them in. | R10 |
| `KkAppShell.MenuButton` | `aria-label` is `` `${label} – Menü öffnen` `` instead of the bare constant, which replaced the visible section title outright (WCAG 2.5.3 Label in Name, Level A) on the only navigation control a phone has. | R11 |
| `KkConfirmDialog` | `disabled={busy}` is off the cancel button. Escape, the backdrop and the frame's close ✕ all dismissed during the same request anyway, so the dialog disabled its one *labelled* exit and left three unlabelled ones open — and with the confirm button loading, a keyboard user in a slow write had no focusable control left inside the dialog. `loading={busy}` on the confirming button is unchanged; `onClose` is **not** gated. | R12 |
| `KkErrorState` | `role="alert"` on the root, so the German failure sentence and its retry button are announced when they replace the skeleton (SC 4.1.3). | R13 |
| `KkSelectRow` | optional `component`/`to`/`params`/`search`, rendering a real anchor when they are passed and keeping the `<button>` branch for callers with no URL. The card grid reached `?group=5` through an anchor while the master list — the only way to reach another detail once a selection exists — reached the identical destination through `navigate()`. 7.1b's rules for this primitive are untouched. | R14 |
| `KkPanelHeader`, `KkPanelSection` | new `titleRef?: Ref<HTMLHeadingElement>`; the title carries `tabIndex={-1}` and `outline: 'none'`. Every „… beenden" flow unmounts the row MUI would restore focus to, dropping focus to `<body>` (SC 2.4.3); a caller can now move it to MITGLIEDER / INHABER with the list underneath. | R15 |

**Token hygiene from the same finding (R16), read as an amendment to 7.6d.**
`radius.card` (16, zero consumers) is **deleted**; `radius.action` (40) folds into `radius.pill` —
a 46px-tall dock button is a pill; `radius.sheet` (22) folds into `radius.base`, so the corner on
the `/login` sheet and every `xs` `KkModalFrame` matches the cards behind it. Design handoff §12
(„no new radii") therefore holds again: 14 · 20 · 50 plus `radius.bar`.
`kkTokens.shadow.sheet` and `kkTokens.shadow.floating` are **kept and hereby written into 7.6d**:
`sheet` is the dark-scheme half of the `sheetSoft` sheet elevation (an upward shadow the
`shadow.*` scale had no entry for), and `floating` is the tighter, darker lift the mobile dock
button and the skip link need over live content, where `shadow.raised`'s 0.12 alpha disappears.
New `kkTokens.type.tracking` — `tight 0.01em · display 0.03em · label 0.09em · section 0.12em ·
eyebrow 0.2em` — replaces **twelve** distinct `letterSpacing` literals across 28 files (0.02/0.025
collapse into one decision, 0.06–0.09 into one, 0.12/0.16 into one);
`kkTokens.eyebrow.letterSpacing` now reads `tracking.eyebrow` and keeps its name, because the
website spreads `kkTokens.eyebrow` wholesale. The orphan `kkTokens.layout.stickyLetterZ` is gone —
`KkLetterDivider` stopped being sticky in round 3 — replaced by `kkTokens.layout.letterRailZ`,
which the new rail variant actually reads.

### 7.2 `KkIconName` additions

```
group · person · role · permissions · search · add · edit · check · manage ·
calendar · phone · mail · place · back · bolt · info · archive
```
Mapping (all `*Outlined` where a variant exists): group→Diversity3Outlined,
person→PersonOutlined, role→WorkspacePremiumOutlined, permissions→KeyOutlined,
search→SearchOutlined, add→AddOutlined, edit→EditOutlined, check→CheckOutlined,
manage→TuneOutlined, calendar→CalendarMonthOutlined, phone→PhoneOutlined, mail→MailOutlined,
place→PlaceOutlined, back→ChevronLeft, bolt→BoltOutlined, info→InfoOutlined,
archive→Inventory2Outlined.
The existing 15 names are untouched. **No key/Schlüssel icon for the deferred Schlüssel marker** —
`permissions` is the Berechtigungen key, not a Vereinsraum key.

### 7.3 New primitives

Each entry: file · props · tokens · light/dark · consumers.

**§7.6 amends this section.** Four signatures below changed in the review pass (required German
labels, a modal close affordance) and two primitives were added. Read §7.6 before writing a call
site.

---

**`KkChip`** — `packages/ui/src/KkChip.tsx`
```ts
export type KkChipTone = 'neutral' | 'ink' | 'accent' | 'gold' | 'green' | 'blue';

interface KkChipProps extends PropsWithChildren {
  tone?: KkChipTone;            // default 'neutral'
  dot?: boolean;                // default false
  size?: 'small' | 'medium';    // default 'medium'
  sx?: KkSx;
}
```
Tokens: `neutral`→`text.secondary`, `ink`→`text.primary`, `accent`→`primary.main`,
`gold`→`warning.main`, `green`→`success.main`, `blue`→`info.main`. Ground is the same token at low
alpha via `color-mix(in srgb, ${(theme.vars ?? theme).palette.X} 12%, transparent)`; dark raises it
to 20%. Fully round, Archivo 800, `medium` 11px / `small` 11px with tighter padding (nothing below
11). `dot` renders a 6px disc in the foreground colour.
Consumers: Mitglieder, Person, Gruppen, Gruppe, Hub, Personenverwaltung, Gruppenverwaltung,
Rollen & Rechte, `KkFactRow`.

**Placement and size — one rule, binding on every surface** (UX pass, round 1, finding G3). One
fact about one object had four positions and two type sizes across the four Gruppen surfaces, so
the reader re-learned where to look on every one of them.

- **Position.** A chip that states the object's own condition — openness, `archiviert`,
  `kein Admin`, a Person's Mitgliedschaft state — belongs to the **header** of the thing it
  describes: the page-title band on a detail route, the detail header card on a master/detail
  surface, the card's own title block on a card, the trailing slot on a list row. It never sits in
  the body, and it is never repeated in two places on one surface.
- **Size.** **Default (`medium`) in a header** — page title band, detail header card, card title
  block. **`size="small"` in a list row** — the `trailing` slot of `KkPersonRow`, `KkSelectRow`,
  `KkSummaryRow`, `KkSinceRow`, `KkFactRow`, and `KkReservedSlot`'s badge. There is no third case:
  if a chip is neither in a header nor in a row, it is in the wrong place.

**`KkSearchField`** — `packages/ui/src/KkSearchField.tsx`
```ts
interface KkSearchFieldProps {
  name: string; label: string; value: string;
  onChange: (value: string) => void;
  placeholder?: string; autoFocus?: boolean; sx?: KkSx;
}
```
`KkTextField` internals with a leading `search` icon and a trailing clear `KkIconButton`
(`label` → `aria-label`) shown only when `value` is non-empty. `label` is the accessible name —
the screenshot tool drives inputs by accessible name, so it is required, not optional.
Consumers: Mitglieder, Personenverwaltung, Gruppenverwaltung, Rollen master list, `PersonPicker`.

**`KkSelectField`** — `packages/ui/src/KkSelectField.tsx`
```ts
export interface KkSelectOption { value: string; label: string }

interface KkSelectFieldProps {
  name: string; label: string; value: string;
  options: readonly KkSelectOption[];
  onChange: (value: string) => void;
  placeholder?: string; hint?: string; disabled?: boolean;
  error?: boolean; helperText?: string; sx?: KkSx;
}
```
Renders its choice list through the shared `KkFieldChoices` part (§7.0 rule 1) when
`options.length <= 4`, otherwise as a native `Select` popover.
Consumer: the Beitragsermäßigung `basis` field (four options), and nothing else in P1. The two
Session-year fields are `KkSessionField`, and Gruppe openness is a `KkSwitchRow` on **every**
surface that has it — a third "select where a switch is not appropriate" consumer does not exist
and must not be invented to justify the primitive. One real consumer is enough (§7.4).

**`KkSessionField`** — `packages/ui/src/KkSessionField.tsx`
```ts
interface KkSessionFieldProps {
  name: string; label: string;
  value: number | null;                       // the Session YEAR, 2025 = Session 2025/26
  onChange: (value: number | null) => void;
  currentSessionYear: number;                 // the app passes it; the package owns no clock
  allowOpen?: boolean; openLabel?: string;    // 'offen lassen' — the app supplies the German
  hint?: string; error?: boolean; helperText?: string; sx?: KkSx;
}
```
A Session year is neither a date nor an arbitrary option: it renders as `2025/26`, it is chosen
from „offen lassen · this Session · next Session" quick choices (`KkFieldChoices`) with a numeric
fallback, and forcing it through a generic select or a date picker is what produces §4.21's 422s.
The label formatting is a `format` callback the app passes (`formatSessionSpan`), so no German
enters the package.
Consumers: the Ruhezeit editor (Von/Bis Session), the Beitragsermäßigung editor (Von/Bis Session).

**`KkDateField`** — `packages/ui/src/KkDateField.tsx`
```ts
export interface KkDateQuickChoice { label: string; value: string | null }   // ISO date or null

interface KkDateFieldProps {
  name: string; label: string;
  value: string | null;                       // ISO 'yyyy-MM-dd'
  onChange: (value: string | null) => void;
  quickChoices?: readonly KkDateQuickChoice[];
  allowEmpty?: boolean; emptyLabel?: string;
  hint?: string; error?: boolean; helperText?: string; sx?: KkSx;
}
```
Wraps `@mui/x-date-pickers` `DatePicker` — already a dependency of `@furria/ui`, with
`LocalizationProvider` (`AdapterDateFns`, `de`, `deDE` localeText) already wired in
`KkThemeProvider`. **The value crosses the boundary as an ISO string**, so no app ever holds a
`Date`. `quickChoices` render as a chip row under the field — the shared `KkFieldChoices` part (§7.0
rule 1), first chip = the common answer.
Consumers: every dated write flow — `joinedOn`, `endedOn`, `sinceOn`, `startedOn`, `birthDate`.
**Not `archivedOn`**: archiving takes no date (decision AE, §4.28).

**`KkChipField`** — `packages/ui/src/KkChipField.tsx`
```ts
interface KkChipFieldProps {
  name: string; label: string; value: string;
  onChange: (value: string) => void;
  suggestions?: readonly string[];
  placeholder?: string; hint?: string; maxLength?: number;
  error?: boolean; helperText?: string; sx?: KkSx;
}
```
Free text plus a suggestion-chip row (the shared `KkFieldChoices` part, §7.0 rule 1); picking a
chip fills the field and leaves it editable.
Consumer: the Gruppen-Admin **Funktion** field (Trainerin · Sprecher · Kommandantin · Betreuerin).

**`KkTextArea`** — `packages/ui/src/KkTextArea.tsx`
```ts
interface KkTextAreaProps {
  name: string; label: string; value: string;
  onChange: (value: string) => void;
  rows?: number;                 // default 4
  maxLength?: number; showCount?: boolean;
  countLabel?: (used: number, max: number) => string;   // the app supplies the German
  placeholder?: string; hint?: string;
  error?: boolean; helperText?: string; sx?: KkSx;
}
```
A multi-line field with the „N von M Zeichen" counter rendered **inside** the primitive (the
counter is design-bearing type and cannot live in the app). Without it four write surfaces cannot
be built at all: `Description` is 400 characters on `PutGroupInfo` (§4.9), `PostGroup`/`PutGroup`
(§4.26/4.27) and `PostRole`/`PutRole` (§4.33/4.34), `KkTextField` has no `multiline`, and
`@mui/material/TextField` is banned in the app. Shipping a single-line input for a paragraph that
is published on the public website is not an option.
Consumers: `HubCarePanel`, `GroupFormDialog`, `RoleFormDialog`.

**`KkSwitchRow`** — `packages/ui/src/KkSwitchRow.tsx`
```ts
interface KkSwitchRowProps {
  label: string; checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  stateLabel?: { on: string; off: string };   // renders a KkChip beside the label
  error?: string;                             // a failed optimistic write, under the description
  disabled?: boolean; busy?: boolean; sx?: KkSx;
}
```
Green when on, `divider` when off; 46×27 pill, 21px knob, `transition: background .2s` respecting
the reduced-motion block already in `MuiCssBaseline`.
Consumers: Mein Profil visibility, Hub openness, `RolePermissionList` (one row per key).

**`KkPersonRow`** — `packages/ui/src/KkPersonRow.tsx`
```ts
interface KkPersonRowProps {
  initials: string; name: string;
  accent?: string;        // the running Rolle, rendered in primary.main
  meta?: string;          // the Gruppen, faint
  emptyMeta?: string;     // italic faint when both accent and meta are absent
  trailing?: ReactNode;   // usually a KkChip
  component?: ElementType; to?: string; params?: Record<string, string>;
  onClick?: () => void;
  sx?: KkSx;
}
```
Two lines: identity / affiliation. When `component`/`to`/`onClick` is given the whole row is
interactive and shows a `chevron` — the read-only list must not look inert (design-map weakness
#2). Hairline top border from the second row.
Consumers: Mitglieder, Personenverwaltung, group member lists, `PersonPicker` (all three
add-dialogs). Below `desktop` the trailing slot carries the chevron **instead of** the state chip,
which moves to line two — at 400px the shell gives the row 360px and avatar + two lines + chip +
chevron leaves ~190px for a name.

**`KkSinceRow`** — `packages/ui/src/KkSinceRow.tsx`
```ts
interface KkSinceRowProps {
  icon: KkIconName; title: string; meta?: string;
  sinceLabel?: string;      // default 'seit'
  sinceValue: string;       // ONE running relationship's start, e.g. '2018/19'. Never a span.
  tone?: 'neutral' | 'accent';   // accent = primary-tinted icon tile, for a Rolle
  trailing?: ReactNode;
  sx?: KkSx;
}
```
30px round icon tile · title + optional second line · right-aligned eyebrow + **Anton value**.
**`sinceValue` is never a span** — the earlier "or a span for a closed relationship" licensed
exactly what §10.3 forbids. A closed relationship is a `KkFactRow`, full stop.
Consumers: Person (Gruppen, Rollen), Gruppe, Hub members and admins, Rolle Inhaber, Person
bearbeiten's read-only blocks.

**`KkFactRow`** — `packages/ui/src/KkFactRow.tsx`
```ts
interface KkFactRowProps {
  title: string;
  span: string;                                   // '01.09.2017 – offen', '2025/26 – 2027/28'
  meta?: string;
  tone?: 'neutral' | 'gold' | 'accent';           // the 3px left accent bar
  chip?: ReactNode;
  actions?: ReactNode;                            // omit entirely for a closed row
  sx?: KkSx;
}
```
`children` renders **nested** rows indented under this one with a shared accent rail — that is how
a Mitgliedschaft carries its Ruhezeiten (§5.8) without a second panel.
**Below `desktop` the `actions` wrap to their own full-width row under the span.** In one row an
accent bar + title + chip + a nowrap Anton span („01.09.2017 – 28.02.2026", ≈150px) + two
44px-tall ghost buttons (≈160px) exceed the 360px the shell gives a 400px viewport before the title
has any room — Person bearbeiten would be unusable on a phone.
Consumers: Person bearbeiten (Mitgliedschaft, its nested Ruhezeiten, Beitragsermäßigungen), the
Hub's history panel; reusable for any dated fact in later phases.

**`KkSelectRow`** — `packages/ui/src/KkSelectRow.tsx`
```ts
interface KkSelectRowProps {
  title: string; meta?: string; trailing?: ReactNode;
  selected?: boolean; onClick: () => void; sx?: KkSx;
}
```
Selected = raised fill, `1.5px text.primary` border and a 3px accent bar down the left edge.
Consumer: the Rollen master list.

**`KkLetterDivider`** — `packages/ui/src/KkLetterDivider.tsx`
```ts
interface KkLetterDividerProps { letter: string; id?: string }
```
Accent Anton letter + hairline to the edge. `id` is the scroll target of `KkLetterIndex`.

**`KkLetterIndex`** — `packages/ui/src/KkLetterIndex.tsx`
```ts
export interface KkLetterIndexEntry { letter: string; enabled: boolean }

interface KkLetterIndexProps {
  letters: readonly KkLetterIndexEntry[];
  current?: string;
  onSelect: (letter: string) => void;
  sx?: KkSx;
}
```
25px round cells; disabled letters are faint and not clickable; `current` sits on a tinted disc.
Consumers: Mitglieder (desktop aside), Personenverwaltung (desktop aside).

**`KkFilterChips`** — `packages/ui/src/KkFilterChips.tsx`
```ts
export interface KkFilterOption { id: string; label: string; count: number }

interface KkFilterChipsProps {
  label: string;                       // the group's accessible name
  options: readonly KkFilterOption[];
  value: string;
  onChange: (id: string) => void;
  sx?: KkSx;
}
```
**Single-select**, counts are rendered inline and must be real. Scrolls on mobile, wraps on
desktop. `role="group"` with `aria-label={label}`; each chip is a `button` with `aria-pressed`.
`onChange` takes the option `id`; the **hook** exports a ready `selectState: (id: string) => void`
so the call site never becomes an inline arrow in JSX (`/frontend-work`).
Consumers: Mitglieder, Personenverwaltung, Gruppenverwaltung.

**`KkAvatarStack`** — `packages/ui/src/KkAvatarStack.tsx`
```ts
interface KkAvatarStackProps { initials: readonly string[]; max?: number; sx?: KkSx }
```
26px avatars overlapping by 10px, each ringed in the host surface's own background.
Consumer: the Gruppen showcase cards.

**`KkEmptyState`** — `packages/ui/src/KkEmptyState.tsx`
```ts
interface KkEmptyStateProps {
  icon: KkIconName; title: string; description: string;
  action?: ReactNode; sx?: KkSx;
}
```
52px faint round tile · Anton caps title · `sub` copy at a narrow measure · optional action.
Consumers: every list, plus the local "IN KEINER GRUPPE" / "KEINE ROLLE" empties.

**`KkSkeletonRow`** / **`KkSkeletonBlock`** — `packages/ui/src/KkSkeletonRow.tsx`, `KkSkeletonBlock.tsx`
```ts
interface KkSkeletonRowProps { count?: number }          // default 6; matches KkPersonRow metrics
interface KkSkeletonBlockProps { lines?: number; sx?: KkSx }
```
Shimmer gradient, 1.4s linear; both honour the global reduced-motion block. Shown on **first load
only**.

**`KkConsequenceNote`** — `packages/ui/src/KkConsequenceNote.tsx`
```ts
interface KkConsequenceNoteProps extends PropsWithChildren { sx?: KkSx }
```
Cream inset with a hairline, a gold `bolt` icon and one plain sentence. Consumers: every dated-fact
editor. Placed **directly under the fields it describes**, never below the footer.

**`KkRedactedValue`** — `packages/ui/src/KkRedactedValue.tsx`
```ts
interface KkRedactedValueProps { label: string; placeholder: string }
```
A 9px eyebrow label over a dotted bar plus the placeholder word (the app passes `"privat"`).
This is what makes *hidden* look deliberate instead of missing.
Consumer: the Person card's hidden-contact block.

**`KkReservedSlot`** — `packages/ui/src/KkReservedSlot.tsx`
```ts
interface KkReservedSlotProps {
  icon: KkIconName; title: string; description: string; badge?: string; sx?: KkSx;
}
```
`KkPanel tone="reserved"` with an icon tile, Anton title, explanation and an optional neutral chip.
Consumers: the Hub's **Termine** slot. (The Gruppe/Hub **Bilder** slot uses the existing
`KkPhotoPlaceholder` in a grid plus one faint line — no new primitive.)

**`KkFab`** — `packages/ui/src/KkFab.tsx`
```ts
interface KkFabProps {
  label: string; icon?: KkIconName;          // default 'add'
  onClick?: () => void; component?: ElementType; to?: string; sx?: KkSx;
}
```
Accent disc with `kkTokens.shadow.floating`, fixed clear of the curtain's menu pill, `label` →
`aria-label`. **Exactly one per surface**, mobile only.
Consumers: Personenverwaltung, Gruppenverwaltung.

**`KkModalFrame`** — compound kit, `packages/ui/src/KkModalFrame/`
```
KkModalFrame/
├── KkModalFrame.tsx        Object.assign(KkModalFrameRoot, { Kicker, Title, Body, Fields, Footer })
└── internal/
    ├── layout/  KkModalFrameRoot.tsx  KkModalFrameBody.tsx  KkModalFrameFields.tsx
    │            KkModalFrameFooter.tsx
    └── ui/      KkModalFrameKicker.tsx  KkModalFrameTitle.tsx
```
```ts
interface KkModalFrameRootProps extends PropsWithChildren {
  open: boolean; onClose: () => void; labelledBy: string;
  size?: 'default' | 'full';     // 'full' = full-height on mobile, for a form of 8+ fields
}
KkModalFrameKicker : PropsWithChildren            // accent eyebrow
KkModalFrameTitle  : { id: string } & PropsWithChildren   // Anton caps, the labelledBy target
KkModalFrameBody   : PropsWithChildren            // one explanatory paragraph
KkModalFrameFields : PropsWithChildren            // column of fields, gap
KkModalFrameFooter : PropsWithChildren            // right-aligned ≥ desktop, 50/50 stretched below
```
The root renders **one MUI `Dialog`, always**, and switches only its *paper presentation* through
`slotProps` on `useIsMobile()`: centred with scrim + blur ≥ `desktop`; bottom-anchored, full-width,
top corners rounded below it (and full-height when `size="full"`). The app never sees either shape.

**It must not swap `Dialog` ↔ `Drawer`.** Those are different element types at the same position,
so crossing the 900px breakpoint — a tablet rotating, a desktop window resized, browser chrome
collapsing — unmounts the whole subtree: react-hook-form state, a half-typed Funktion, a chosen
date, gone without warning, `autoFocus` re-run and the dialog re-announced to screen readers.
No `logic/` folder (no shared runtime state between parts).
Consumers: Mitglied aufnehmen, Gruppen-Admin ernennen, Person anlegen/bearbeiten, Gruppe
anlegen/bearbeiten, Rolle anlegen/umbenennen, Inhaber hinzufügen.

**`KkConfirmDialog`** — `packages/ui/src/KkConfirmDialog.tsx`
```ts
export interface KkConfirmFact { label: string; value: string }

interface KkConfirmDialogProps {
  open: boolean; onClose: () => void; onConfirm: () => void;
  tone?: 'neutral' | 'danger';          // default 'neutral'
  eyebrow: string;                      // the action
  question: string;                     // caps question
  explanation: string;                  // exactly ONE paragraph: what is lost AND what survives
  facts: readonly KkConfirmFact[];
  consequence?: ReactNode;              // a LIVE sentence, rendered as a KkConsequenceNote
  error?: string;                       // a rejected write (§5.0a), above the footer
  confirmLabel: string;                 // the verb
  cancelLabel?: string;                 // default 'Abbrechen'
  busy?: boolean;
}
```
Composes `KkModalFrame`. `tone="danger"` draws the accent bolt head and the destructive primary;
`tone="neutral"` draws a neutral mark. **Tone rule for P1**: `danger` only where something is lost
the moment you confirm — that is **Inhaberschaft beenden** alone. `Zugehörigkeit beenden`,
`Gruppe archivieren` and `Rolle archivieren` are reversible bookkeeping and use `neutral`
(design-map weakness #7 — a red danger bolt on an explicitly reversible act is dishonest).
The facts table always answers: *who/what · since when · end date · what survives*.

**`consequence` puts the best idea in the bundle where it matters most.** `KkConsequenceNote` was
mounted only in the Person-bearbeiten editors; the acts that actually frighten people — Gruppe
archivieren, Inhaberschaft beenden, Mitgliedschaft beenden — got a static facts table. The slot
renders one plain sentence that **updates with the chosen date**: „Ab 28.02.2026 steht die
Tanzgarde nicht mehr im Verzeichnis. Die 9 Zugehörigkeiten bleiben bestehen." It is the same idea,
nearly free, applied where a person is about to commit.

**`KkToast`** — compound kit, `packages/ui/src/KkToast/`
```
KkToast/
├── KkToast.tsx             Object.assign(KkToastProvider, { … }) + the useKkToast hook
└── internal/
    ├── layout/  KkToastViewport.tsx
    ├── ui/      KkToastItem.tsx
    └── logic/   toast-store.ts          (3 consumers: provider, viewport, hook)
```
```ts
export interface KkToastRequest { tone: 'success' | 'error' | 'info'; message: string; icon?: KkIconName }
export const KkToastProvider: FC<PropsWithChildren>;
export const useKkToast: () => (request: KkToastRequest) => void;
```
Bottom-centred above the curtain pill on mobile, bottom-right on desktop; auto-dismiss after 5s
(error: 8s), one at a time with a queue, dismissible, `role="status"` / `aria-live="polite"`,
honouring the global reduced-motion block. No German inside — the message is a prop.
Mounted once in `AppShell`.
**Why it is not optional:** §5.0's mutation idiom shows a toast on every success, and the two
optimistic writes (Mein Profil visibility, Rollen key switches) have **nowhere else** to surface a
revert — a switch that flips on, then silently flips back two seconds later, reads as broken. The
design map's own §1.19 says "Optimistic toggle, **revert with a toast**"; the toast was the one
piece missing.
Consumers: every mutation in slices 7 and 9–17.

---

### 7.4 Deliberately **not** primitives (build in the app)

**The criterion is not "how many consumers".** Under ADR-0007 and `noDesignSx` an app component
cannot draw a single pixel of its own, so consumer-counting produces unbuildable specifications —
it is what nearly shipped `/groups` with a black member count and an archived card that cannot be
dimmed. The rule that the lint actually permits:

> **A thing is built in the app if and only if every pixel it draws already comes from a `Kk*`.
> Otherwise it is a primitive, however few consumers it has.**

(That is also why `KkSelectRow`, `KkReservedSlot` and `KkSessionField` are primitives with one
consumer each — and why §7.3's list is the right length.)

| Thing | Why | Built from |
|---|---|---|
| Gruppen showcase card | draws nothing of its own once `KkHeading tone="accent"` and `KkPanel dimmed` exist | `KkPanel` (+`dimmed`) + `KkAvatarStack` + `KkChip` + `KkHeading tone="accent"` |
| hidden-contact block | its three states are domain logic about one field; every surface it draws is a primitive's | `KkPanel tone="reserved"` + `KkRedactedValue` + `KkNote tone="info"` |
| „Der Verein in Zahlen" card | composition only | `KkPanelHeader` + `KkStatRow` + `KkRule` + `KkNote` |
| Rollen master–detail frame | a page layout, not a component | MUI `Grid` (12-column) + `KkSelectRow` |
| Mein-Profil preview | must reuse the real contact block to stay truthful (§5.5) | `MemberContactPanel` from `features/members/` |
| photo-placeholder grid | the tile already exists | `KkPhotoPlaceholder` in a `Grid` |
| person picker | search + rows, no new pixels | `KkSearchField` + `KkPersonRow` |
| stage glow | already owned by `KkAppShell`'s stage | — **never add a second layer** |
| gold avatar tone, `KkSeal` usage | Ehrenmitgliedschaft is out of P1 | **not used** in the Club-App — `KkSeal` already exists and stays a website primitive; nothing is deleted |

`KkConfettiBurst` is the one exception to "never add a second layer": it is an existing primitive,
fired once, over one panel, on one event (§5.6), and it is not the stage's own flecks.

### 7.5 Count

**26 new components** (`KkChip`, `KkSearchField`, `KkSelectField`, `KkSessionField`, `KkDateField`,
`KkChipField`, `KkTextArea`, `KkSwitchRow`, `KkPersonRow`, `KkSinceRow`, `KkFactRow`,
`KkSelectRow`, `KkLetterDivider`, `KkLetterIndex`, `KkFilterChips`, `KkAvatarStack`,
`KkEmptyState`, `KkSkeletonRow`, `KkSkeletonBlock`, `KkConsequenceNote`, `KkRedactedValue`,
`KkReservedSlot`, `KkFab`, `KkModalFrame`, `KkConfirmDialog`, `KkToast`), **one internal shared
part** (`internal/KkFieldChoices`, not exported), and **8 extended** (`KkPanelHeader`, `KkPanel`,
`KkFieldRow`, `KkNote`, `KkButton`, `KkIcon`, `KkAvatar`, `KkHeading`).

Three of the new ones (`KkSessionField`, `KkTextArea`, `KkToast`) and one of the extensions
(`KkHeading tone`) exist because without them a specified surface is physically unbuildable under
`noDesignSx` — not because they are nice to have.

---

### 7.6 Review amendments (design-system + a11y pass, 2026-09-11)

Two reviews audited the committed primitive layer. What they changed is binding; §7.3 above is read
**through** this section.

#### 7.6a Signature changes to primitives already specified

| Primitive | Change | Why |
|---|---|---|
| `KkSearchField` | **new required** `clearLabel: string` | the clear button's accessible name was a German literal (`'Suche leeren'`) baked into a package the public website also ships — rule 8, with no override path. The screenshot tool drives it by name. |
| `KkSinceRow` | `sinceLabel` is now **required**, no default | §7.3's `// default 'seit'` contradicted rule 8. Resolved in rule 8's favour: the app supplies the word. |
| `KkConfirmDialog` | `cancelLabel` is now **required**; **new required** `closeLabel: string` | same contradiction (`// default 'Abbrechen'`), same resolution. |
| `KkModalFrame` root | **new required** `closeLabel: string` | the frame had no dismissal of its own: on a phone the only exit was the scrim. It now renders a top-right close button, and the footer is **sticky** so the submit button of an eight-field `size="full"` form never scrolls out of reach. |
| `KkToastProvider` | **new required** `dismissLabel: string` | the toast's close button carried a German literal (`'Schließen'`). |
| `KkChip` | `size="small"` is now **10px** (was 11); new `live?: boolean` | §1.4 pins the person-row state chip at 10/800 and the primitive could not draw it. `live` opts a **single, focal** chip into a 2.4 s dot breath — never a list row (see 7.6d). |
| `KkLetterIndex` | **new required** `label: string` | it rendered `role="group"` with no accessible name. |
| `KkEyebrow` | new `size?: 'small' \| 'medium'` (`small` = 9px) | `KkSinceRow` and `KkRedactedValue` were reaching 9px through `sx={{ fontSize }}`, which a page cannot do. |
| `KkPanel` | new tone **`editing`** = `raised` + `1.5px solid primary.main` + lift | §1.12's in-place editor. Person bearbeiten (§5.8) is built entirely on "the editor replaces the card in place"; without it the editor is indistinguishable from a reading panel. |
| `KkPanelHeader` | new `size?: 'small' \| 'medium'`, new `sx` | `medium` is §1.12's Anton-19 editor head; `small` (default) stays the Anton-13 section label. |
| `KkPersonRow`, `KkSinceRow`, `KkFactRow`, `KkSelectRow` | new `dimmed?: boolean` | §1.2(e) / §5.9: an archived row must be dimmable, and `opacity` is a `noDesignSx` error in a page. |
| `KkSelectField` | new `presentation?: 'auto' \| 'choices' \| 'select'` (default `auto`) | `auto` keeps the `options.length <= 4` rule; the explicit values stop a five-option field silently becoming a different widget. The chip branch now carries a real `aria-labelledby`, a hidden input bearing `name`/`value`, and an error treatment on the chips. |
| `KkRedactedValue` | new `width?: 'short' \| 'medium' \| 'long'`, new `sx` | three identical bars read as one asset pasted three times; a phone, an e-mail and an address are three different withheld facts. |
| `KkAvatarStack` | new `ringOn?: 'paper' \| 'raised'` | the ring was hard-wired to `background.paper` and would have been a cream halo on a raised host. |
| `KkStatRow.Value` | new `tone?: 'default' \| 'accent' \| 'muted'` | §7.1 claimed `KkHeading tone` "unblocks the stat values"; it does not — `KkStatRow.Value` takes only a `variant`. Now it does. |
| `KkPanelHeader`, `KkFieldRow`, `KkRedactedValue`, `KkLetterDivider`, `KkSkeletonRow` | all now take `sx` | rule 3 said every primitive merges a caller `sx`; these five did not, so a parent could not position them. |

#### 7.6b Two new primitives

**`KkMeta`** — `packages/ui/src/KkMeta.tsx`
```ts
export type KkMetaTone = 'muted' | 'faint' | 'accent';

interface KkMetaProps extends PropsWithChildren {
  tone?: KkMetaTone;        // default 'muted'
  italic?: boolean;         // the honest empty — a real Archivo 600-italic face is now loaded
  component?: ElementType;  // default 'p'; pass 'span' inside an interactive row
  sx?: KkSx;
}
```
Archivo 11.5px / 600, line-height 1.35, `textWrap: pretty`. `muted` = `text.secondary` (4.62:1 on
cream), `faint` = `text.disabled` for genuinely inert text only, `accent` = `primary.main`.
**This was the single most-repeated un-primitived thing in the bundle.** `KkNote` is `body2`/14px
at a 34rem measure and `KkEyebrow` is a 900-weight overline at 0.2em tracking; neither is a small
faint meta line, and a page cannot make one.
Consumers: the Gruppen card's „18 Personen" and its italic „keine Mitglieder" (§1.11), the Rollen
master row's „unbesetzt" (§1.14), the photo-grid explanation line (§1.19), the stat caption
(§1.10), the Gruppenverwaltung compact line, `KkFieldRow`'s „nicht hinterlegt" value (§5.3), every
right-aligned hint.

**`KkSummaryRow`** — `packages/ui/src/KkSummaryRow.tsx`
```ts
export interface KkSummaryFact { label: string; value: string }

interface KkSummaryRowProps {
  title: string;
  meta?: string;                            // the compact second line, below `desktop` only
  facts?: readonly KkSummaryFact[];         // labelled cells, ≥ `desktop` only
  trailing?: ReactNode;                     // the chips, ≥ `desktop` only
  compactTrailing?: ReactNode;              // the ONE chip below `desktop`
  selected?: boolean; dimmed?: boolean;
  component?: ElementType; to?: string; params?: Record<string, string>;
  onClick?: () => void;
  sx?: KkSx;
}
```
The multi-column registry row that collapses to two lines plus one chip — §5.9's `ManagedGroupRow`
is „name · Personen · Admins · Offenheit · Status" on desktop and „name / N Personen · N Admins"
plus the most urgent chip below it. `@mui/material/Table` is banned in the app and no `Kk*` drew
this; the row is the mobile-first form and the desktop cells are the wide form (§1.19's
"table → row-list collapse"). `selected` draws the raised fill (the Gruppe is a `?group=` search
param, §5.9).
Consumer: Gruppenverwaltung.

#### 7.6c New internal shared parts (not exported)

§7.0 rule 1 allowed exactly one shared part in P1 (`KkFieldChoices`). The pass added five more,
each because the same declaration had been copy-pasted across four or more primitives:
`internal/scheme-paint.ts` (the light/dark pair and `applyScheme`, which **merges** several pairs —
two raw `theme.applyStyles('dark', …)` spreads in one object silently overwrite each other, which
is a bug class this closes and the only new unit test guards), `internal/tone.ts` (the six chip
tones), `internal/focus-ring.ts`, `internal/row-divider.ts`, `internal/person-row-metrics.ts`
(shared by `KkPersonRow` and `KkSkeletonRow`, whose only job is to match it), and
`internal/display-title.ts`.

#### 7.6d Token additions that pages inherit

`kkTokens.line.hair` is now **1.5**, matching §7.0 rule 6 and the theme's own `MuiCard` /
`MuiOutlinedInput` borders; six local `const HAIRLINE = 1.5` declarations are gone and the three
primitives that were drawing a 1px divider next to a 1.5px one now agree.
New: `kkTokens.type` (`rowTitle` 14 · `rowMeta` 11.5 · `rowValue` 17 · `span` 15 · `chip` 11 ·
`chipSmall` 10 · `eyebrowSmall` 9 · `sectionTitle` 13 · `blockTitle` 19) replaces ten one-off
`fontSize` constants at half-pixel sizes; `kkTokens.color.*.{redInk, goldInk, greenInk, blueInk}`
(the **readable** foreground of each accent — `warning.main` as chip text was 1.70:1 on cream);
`kkTokens.color.*.avatar` (§1.4's cream disc — every member was getting a saturated gold one);
`kkTokens.layout.curtainClearance` (84, read by `KkFab` **and** the toast viewport, which had
reached the same number independently); `kkTokens.overlay.scrimInk` (deliberately
scheme-invariant, replacing a `kkTokens.color.light.ink` read inside a dark branch);
`kkTokens.radius.bar`, `kkTokens.measure.empty`, `kkTokens.opacity.dimmed`,
`kkTokens.shadow.sheetSoft`, `kkTokens.motion.*`, `kkTokens.font.displayWeight` (Anton ships one
face at 400; six files were asking for 500 and getting a faux bold).

#### 7.6e Rejected, with reasons

| Asked for | Rejected because |
|---|---|
| `KkListFooter` („11 von 168 Personen" + „Weitere laden") | decision Z and §10.6 **drop** paging and that footer: the list shows all of its data. |
| A permission-group header (radius-9 icon tile + „3 von 5") | §5.10 cuts `kind` groups **and** the rights counter outright: "one row per key, plain German, a switch". |
| An accent/faint count in `KkSelectRow.trailing` | same ruling — no red count per Rolle. The archived Gruppe's faint count is `KkPanel dimmed` on the whole card (§5.4). |
| A `tiny` (9.5px) chip size | its only consumer is §1.5's desktop **table** contact cell, and §5.7 builds a `KkPersonRow`, not a table. `small` (10px) is the size §1.4 actually pins. |
| Merging `KkSkeletonRow` into `KkSkeletonBlock` | two different contracts (`count` of person-shaped rows vs `lines` of bars), both named in §5.0's `PageSkeleton`; a `variant` prop is the same anti-pattern the review criticises in `KkSelectField`. |
| `disabled={disabled \|\| busy}` on `KkSwitchRow` | §5.0 pins the optimistic idiom: the row is **`busy`, never `disabled`**, while in flight. The a11y half of the finding (error `id`, `role="alert"`, `aria-describedby`) was taken. |
| An index-driven cascade on first list paint | the row keys change on every search keystroke, so a mount-driven cascade replays per character — against §5.0's "while a search box is being typed the previous results stay". |
| `KkChip` green dot pulsing by default | `/members` renders that chip ~150 times; a permanent synchronised breath across a viewport is motion WCAG 2.2.2 wants pausable. Shipped as an **opt-in `live`** for a single focal chip instead. |
| The `KkConfirmDialog` facts table in Anton | §1.16 pins it at Archivo 12.5/800, and §10.3 gives Anton to Sessions and spans only — half the confirmation's values are sentences („die Zugehörigkeiten bleiben bestehen"), which Anton caps would wreck. |
| `KkToast.tsx` rebuilt as an `Object.assign` | the kit has no public dot-members: `KkToastViewport` / `KkToastItem` are internal and must stay so. `Object.assign(KkToastProvider, {})` is theatre. **The file stays a re-export; this is the documented exception to §7.0 rule 1's assembly rule.** |

#### 7.6f Follow-up that belongs to slice 1, not to the package

`KkToastProvider` is still **unmounted**. §7.3 names the site — `features/session/components/AppShell.tsx` — and the app layer was out of this pass's scope, so the first `useKkToast()` call will throw until slice 1 wraps the shell:
`<KkToastProvider dismissLabel="Schließen">`. Nothing else in §5's mutation idiom works before that.

#### 7.6g Count, corrected

**28 new components** (§7.5's 26 plus `KkMeta` and `KkSummaryRow`), **seven internal shared parts**
(`KkFieldChoices` + §7.6c's six modules), and **9 extended** (§7.1's eight plus `KkStatRow.Value`).

---

## 8. Test-harness extensions

Everything here lives in `server/src/Furria.Tests.Common/`. Rules that bind every addition:
ADR-0001 (no mocks — real Postgres, real HTTP, real auth), the MET analyzers (a violation is a
**build failure**), and `docs/server/TESTING.md`.

**MET007 naming law:** a seeding method **must start with `Add`**, and a resolution helper **must
be named** `IdOf`, `ClientFor`, `ClientForAsync`, `EmailOf` or `NameOf` — otherwise the dangling-alias
analyzer silently stops protecting those aliases. Every addition below obeys it.

### 8.1 `SeedContextBuilder` — three sub-builders

```csharp
public sealed class SeedContextBuilder
{
    private readonly IdentitySeedBuilder _identity = new();
    private readonly GroupSeedBuilder _groups = new();
    private readonly RoleSeedBuilder _roles = new();

    internal IdentitySeedBuilder RecordedIdentity => _identity;
    internal GroupSeedBuilder RecordedGroups => _groups;
    internal RoleSeedBuilder RecordedRoles => _roles;

    public SeedContextBuilder Identity(Action<IdentitySeedBuilder> configure) { … }
    public SeedContextBuilder Groups(Action<GroupSeedBuilder> configure) { … }
    public SeedContextBuilder Roles(Action<RoleSeedBuilder> configure) { … }
}
```
One sub-builder per bounded context, never per entity — the existing convention.

### 8.2 `IdentitySeedBuilder` — rewritten registry facts

```csharp
public IdentitySeedBuilder AddPerson(string alias, string firstName = "Test", string lastName = "Person");
public IdentitySeedBuilder AddPersonContact(string alias, string? email = null, string? phone = null,
    string? street = null, string? zip = null, string? city = null, bool contactVisibleToMembers = false,
    DateOnly? birthDate = null);
public IdentitySeedBuilder AddAccount(string alias, bool disabled = false);

public IdentitySeedBuilder AddMembership(string alias, string personAlias,
    DateOnly? startedOn = null, DateOnly? endedOn = null);
public IdentitySeedBuilder AddMembershipPause(string alias, string membershipAlias,
    int firstSessionYear, int? lastSessionYear = null);
public IdentitySeedBuilder AddFeeReduction(string alias, string personAlias,
    FeeReductionBasis basis, int firstSessionYear, int lastSessionYear);
```
Every fact carries **its own alias** (first argument) and names its parent by alias — so every id a
test needs comes back through an MET007-protected `IdOf`, and a Person can hold several
Mitgliedschaften without ambiguity. `startedOn` defaults to `DefaultStartedAt` (2020-11-11).
`AddMembership(type, status)` is **gone** with the enums.
`AddPersonContact` is separate from `AddPerson` so the common case stays a one-liner.

### 8.3 `GroupSeedBuilder` and `RoleSeedBuilder` — new

```csharp
public sealed class GroupSeedBuilder
{
    public GroupSeedBuilder AddGroup(string alias, string name, string description = "",
        bool isRecruiting = false, DateOnly? archivedOn = null);
    public GroupSeedBuilder AddGroupMembership(string alias, string groupAlias, string personAlias,
        DateOnly? joinedOn = null, DateOnly? leftOn = null);
    public GroupSeedBuilder AddGroupAdmin(string alias, string groupAlias, string personAlias,
        string? function = null, DateOnly? sinceOn = null, DateOnly? untilOn = null);
}

public sealed class RoleSeedBuilder
{
    public RoleSeedBuilder AddRole(string alias, string name, params string[] permissionKeys);
    public RoleSeedBuilder AddRoleWithDetails(string alias, string name, string description,
        DateOnly? archivedOn, params string[] permissionKeys);
    public RoleSeedBuilder AddRoleHolding(string alias, string roleAlias, string personAlias,
        DateOnly? sinceOn = null, DateOnly? untilOn = null);
    public RoleSeedBuilder AddRoleWithHolder(string alias, string holdingAlias, string name,
        string personAlias, params string[] permissionKeys);
}
```
**`params` may not follow optional parameters here.** `AddRole(alias, name, description = "",
archivedOn = null, params string[] keys)` compiles, but the obvious call
`AddRole("presi", "Präsident", FurriaPermissions.PersonsManage)` silently binds the key to
`description` and grants **nothing** — a test that goes green for the wrong reason, in the harness
that seeds authorization. The common shape therefore takes only alias, name and keys;
`AddRoleWithDetails` is the explicit overload for a description or an `archivedOn`.

**`AddRoleWithHolder` takes its holding alias as a literal.** The `DanglingAliasAnalyzer` (MET007)
collects declarations **syntactically, from string literals** passed to `Add*` calls in the class,
so a derived alias (`$"{alias}-holding"`) would make
`ctx.Roles.RoleHoldings.IdOf("gruppenpflege-holding")` a **build error** on an alias the builder
really did register. Passing it in keeps the analyzer honest: `AddRoleWithHolder("gruppenpflege",
"gruppenpflege-holding", "Gruppenpflege", "ilka", FurriaPermissions.GroupsManage)`.

### 8.4 Materializers and the seeded context

**One entry point, one scope, one alias→id map.** The three sub-builders record into three
contexts, but `GroupMembership` and `RoleHolding` need Person ids the identity layer produced, so
the materializers cannot each own a scope or a map. Pinned shape — do not invent a second one:

```csharp
internal static class SeedMaterializer
{
    public static Task<SeededRegistry> MaterializeAsync(
        IServiceScopeFactory scopeFactory, SeedContextBuilder recorded, string password,
        CancellationToken ct);
}

internal sealed record SeededRegistry(
    SeededIdentity Identity, SeededGroups Groups, SeededRoles Roles);
```
`SeedMaterializer` opens the **one** scope, holds the **one** `Dictionary<string, int>` per entity
kind, and calls three internal inserters — `IdentitySeedMaterializer`, `GroupSeedMaterializer`,
`RoleSeedMaterializer` — in this order, one `SaveChanges` per layer:

```
Person → Membership → MembershipPause → FeeReduction → Account
      → Group → GroupMembership → GroupAdmin
      → Role  → RolePermission   → RoleHolding
```
Unknown aliases throw a **listing** `KeyNotFoundException` (the `RequirePerson` pattern). Emails
stay uniquified behind the alias; the password hash stays cached once per run.

`SeededContext`'s constructor becomes
`internal SeededContext(SeededIdentity identity, SeededGroups groups, SeededRoles roles, Expected expected)`,
and the context exposes, each with `AliasRegistry<int>` properties:
```csharp
ctx.Identity   // People, Accounts, Memberships, Pauses, FeeReductions  + ClientForAsync/EmailOf/LogInAsync
ctx.Groups     // Groups, GroupMemberships, GroupAdmins
ctx.Roles      // Roles, RolePermissions, RoleHoldings
ctx.Expected   // the assertion queue
```
Registries are built as `new AliasRegistry<int>("Gruppe", seeded.GroupIds)` — the kind string is
the **German** word, because it lands in the analyzer's error text.

### 8.5 `Expected` — new expectations

Add one accessor per entity on `Expected` and one `sealed class …Expectations` per entity
(internal ctor, `To*` methods enqueuing an `AsNoTracking` read and returning `Expected`, xUnit v3
`Assert.*` only):

```csharp
public PersonExpectations Person(int personId);                 // + ToHaveContactVisible(bool)
                                                                //   ToHaveBirthDate(DateOnly?)
                                                                //   ToHaveBeenTouchedAt(DateTimeOffset)
public MembershipExpectations Membership(int membershipId);     // ToHavePeriod(started, ended)
                                                                // ToBeOpen() · ToNotExist()
public MembershipSetExpectations MembershipsOfPerson(int personId);   // ToHaveCount(int)
                                                                      // ToHaveOpenCount(int)
public MembershipPauseExpectations MembershipPause(int pauseId);      // ToHaveSpan(first, last)
public FeeReductionExpectations FeeReduction(int id);                 // ToHaveBasis · ToHaveSpan
public GroupExpectations Group(int groupId);                          // ToHaveName · ToHaveDescription
                                                                      // ToBeRecruiting(bool)
                                                                      // ToBeArchivedOn(DateOnly?)
public GroupMembershipExpectations GroupMembership(int id);           // ToHavePeriod · ToBeOpen
public GroupMembershipSetExpectations GroupMembershipsOf(int groupId);// ToHaveOpenCount(int)
public GroupAdminExpectations GroupAdmin(int id);                     // ToHaveFunction(string?)
                                                                      // ToHavePeriod
public RoleExpectations Role(int roleId);                             // ToHaveName
                                                                      // ToGrantExactly(params string[])
                                                                      // ToBeArchivedOn(DateOnly?)
public RoleHoldingExpectations RoleHolding(int id);                   // ToHavePeriod · ToBeOpen
```
`MembershipExpectations.ToHave(type, status)` is deleted with the enums, and the shipped
person-scoped `Expected.MembershipOf(int personId)` is **replaced** by the two accessors above —
`docs/server/TESTING.md` documents the old one and is updated in the same slice (§1.12).

`ToHaveBeenTouchedAt` is what makes `AuditTimestampInterceptor` (§1.1) a testable deliverable:
MET005 makes a `DbContext` in a test body a build error, so without an expectation there is **no
legal way** to assert the one column the interceptor exists for. Slice 1 ships
`Should_StampUpdatedAt_When_APersonIsEdited`, asserting against the fixture's `FakeTimeProvider`
instant — which only works because the interceptor sets **both** timestamps from that clock.

### 8.6 `ApiTestFixture` changes

0. **`ConfigureWebHost` calls `builder.UseEnvironment("Testing")`** — one line. The fixture
   currently sets no environment at all, so the host's environment is whatever the test runner
   happens to supply and two agents will assume opposite answers. Pin it: any code that ever
   branches on `IHostEnvironment` (a future Development-only hosted service, a Swagger branch,
   a relaxed CORS rule) must see `Testing`, not `Development`. Note that §9's ruling removes the
   seeder this guard was originally written against — the environment is pinned on its own merit,
   not as seeder suppression.
1. **`InsertMembershipDirectlyAsync` is deleted.** It existed only because EF's one-to-one fixup
   silently dropped a second Mitgliedschaft; with `Person.Memberships` a collection, two
   `AddMembership` calls just work. Its literal SQL named the retired `type`/`status` columns.
2. **The snapshot list grows**, parents before children — the seeded Admin Rolle must survive every
   per-test truncate:
   ```csharp
   _resetService = await DatabaseResetService.CreateAsync(
       [db],
       [typeof(Person), typeof(Account), typeof(Role), typeof(RolePermission), typeof(RoleHolding)],
       CancellationToken.None
   );
   ```
   Both snapshot constraints still hold: these tables keep Npgsql's default
   `GENERATED BY DEFAULT AS IDENTITY` key (hence the surrogate `int Id` on `role_permission`,
   §1.9) and carry no computed column.
3. `BootstrapAdminClientAsync(ct)` becomes **the way a test gets a caller holding every
   Berechtigung** — ruling 11 makes the bootstrap admin a full key holder.
4. **`ApiTestFixture.Today` and `ApiTestFixture.CurrentSessionYear`.** `docs/server/TESTING.md`
   warns that the `FakeTimeProvider` is shared by the whole collection and **only moves forward**,
   so a test that jumps the clock to a chosen 11.11. poisons every later test in the collection —
   and a test that computes its Session with `ClubSession.YearOf` asserts the implementation with
   the implementation. The fixture therefore derives both **once**, from its anchored clock, and
   exposes them: `public DateOnly Today { get; }` and `public int CurrentSessionYear { get; }`.
   Rule: **every Ruhezeit and Beitragsermäßigung span in a test is seeded relative to
   `_fixture.CurrentSessionYear`**; `ClubSession.YearOf` itself is verified independently by the
   pure `ClubSessionTests` against literal dates (10.11., 11.11., 12.11., a leap year).
5. **Every list assertion counts the bootstrap admin** (§3.6): from slice 2 she is affiliated and
   survives every truncate. Assert by alias membership, never by a raw `Count`.
6. Nothing else changes. `DatabaseResetService` derives its truncate set from the EF model, so the
   nine new tables are truncated automatically with no registration.

### 8.7 A complete worked example

`server/tests/Furria.Api.Tests/Groups/EndGroupMembershipTests.cs` — one test file per endpoint,
file name mirrors the endpoint. Passes MET001 (no mocking framework), MET002 (no in-memory
provider), MET003 (`Should_X_When_Y`, both segments capitalised), MET004 (`[Collection("Api")]`
with the fixture ctor parameter), MET005 (no `DbContext` in a test body — state through
`ctx.Expected`), MET006 (no ambient clock — dates are literals, the clock is the fixture's
`FakeTimeProvider`), MET007 (every alias is declared by an `Add*` call in this class).

> **This file only compiles because `EndGroupMembershipRequest.GroupId` and
> `.GroupMembershipId` carry `[RouteParam]`** (§4.0). The typed client
> (`client.POSTAsync<TEndpoint, TRequest>`) uses the same annotations as the server to decide what
> goes into the URL and what goes into the body; without them the ids would be serialised into the
> JSON body, the route would not match, and `required` would make System.Text.Json throw before
> route binding ran. Every test file in the phase depends on this.

```csharp
using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Groups;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Xunit;

namespace Furria.Api.Tests.Groups;

[Collection("Api")]
public sealed class EndGroupMembershipTests
{
    private static readonly DateOnly JoinedOn = new(2017, 9, 1);
    private static readonly DateOnly EndedOn = new(2026, 3, 1);

    private readonly ApiTestFixture _fixture;

    public EndGroupMembershipTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_CloseTheZugehoerigkeit_When_TheCallerIsTheGruppenAdmin()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("paula-tanzgarde", "tanzgarde", "paula", JoinedOn)
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna", "Trainerin")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var request = new EndGroupMembershipRequest
        {
            GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
            GroupMembershipId = ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"),
            EndedOn = EndedOn,
        };

        var response = await client.POSTAsync<EndGroupMembership, EndGroupMembershipRequest>(request);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GroupMembership(ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"))
            .ToHavePeriod(JoinedOn, EndedOn)
            .GroupMembershipsOf(ctx.Groups.Groups.IdOf("tanzgarde"))
            .ToHaveOpenCount(0)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerOnlyBelongsToTheGruppe()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("mara", "Mara", "Lenz")
                            .AddAccount("mara")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("paula-tanzgarde", "tanzgarde", "paula", JoinedOn)
                            .AddGroupMembership("mara-tanzgarde", "tanzgarde", "mara", JoinedOn)
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("mara", ct);
        var request = new EndGroupMembershipRequest
        {
            GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
            GroupMembershipId = ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"),
            EndedOn = EndedOn,
        };

        var response = await client.POSTAsync<EndGroupMembership, EndGroupMembershipRequest>(request);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await ctx
            .Expected.GroupMembership(ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"))
            .ToBeOpen()
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AllowTheHigherInstance_When_TheCallerHoldsGroupsManage()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("ilka", "Ilka", "Reineke")
                            .AddAccount("ilka")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("paula-tanzgarde", "tanzgarde", "paula", JoinedOn)
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "gruppenpflege",
                            "gruppenpflege-holding",
                            "Gruppenpflege",
                            "ilka",
                            FurriaPermissions.GroupsManage
                        )
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("ilka", ct);
        var request = new EndGroupMembershipRequest
        {
            GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
            GroupMembershipId = ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"),
            EndedOn = EndedOn,
        };

        var response = await client.POSTAsync<EndGroupMembership, EndGroupMembershipRequest>(request);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        await ctx
            .Expected.GroupMembership(ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"))
            .ToHavePeriod(JoinedOn, EndedOn)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnConflict_When_TheZugehoerigkeitIsAlreadyEnded()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddPerson("paula", "Paula", "Brendel")
                            .AddPerson("anna", "Anna", "Kaiser")
                            .AddAccount("anna")
                    )
                    .Groups(groups =>
                        groups
                            .AddGroup("tanzgarde", "Tanzgarde")
                            .AddGroupMembership("paula-tanzgarde", "tanzgarde", "paula", JoinedOn, EndedOn)
                            .AddGroupAdmin("anna-tanzgarde", "tanzgarde", "anna")
                    ),
            ct
        );

        var client = await ctx.Identity.ClientForAsync("anna", ct);
        var request = new EndGroupMembershipRequest
        {
            GroupId = ctx.Groups.Groups.IdOf("tanzgarde"),
            GroupMembershipId = ctx.Groups.GroupMemberships.IdOf("paula-tanzgarde"),
            EndedOn = EndedOn,
        };

        var response = await client.POSTAsync<EndGroupMembership, EndGroupMembershipRequest>(request);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
```

Run one class with `dotnet test -- --filter-class Furria.Api.Tests.Groups.EndGroupMembershipTests`
— the VSTest `--filter` flag is silently ignored under Microsoft.Testing.Platform and runs the
whole suite. Docker must be up.

### 8.8 The gate guard test

`server/tests/Furria.Api.Tests/Authorization/EndpointGateTests.cs`, landing in **slice 3** with the
`AffiliationRequirement` branch. Gate kind (c) is five hand-written `if` blocks in five handlers;
nothing fails the build or the suite when one is forgotten, and a forgotten one is a silent
privilege escalation that the rest of the suite happily reports green.

```csharp
[Fact]
public void Should_CarryAGate_When_AnEndpointIsRegistered()
{
    var source = _fixture.Services.GetRequiredService<EndpointDataSource>();
    var ungated = source
        .Endpoints.OfType<RouteEndpoint>()
        .Where(endpoint =>
            endpoint.Metadata.GetMetadata<PermissionRequirement>() is null
            && endpoint.Metadata.GetMetadata<AffiliationRequirement>() is null
            && endpoint.Metadata.GetMetadata<IAllowAnonymous>() is null
            && !InHandlerGated.Contains(endpoint.RoutePattern.RawText)
        )
        .Select(endpoint => endpoint.RoutePattern.RawText)
        .ToArray();

    Assert.Empty(ungated);
}
```
`InHandlerGated` is a `static readonly string[]` **allowlist** naming exactly the routes whose gate
lives in `HandleAsync` or in the caller's own identity: `auth/me`, `auth/me/contact-visibility`,
`my-groups`, `my-groups/{groupId}`, `person-search`, the five `groups/{groupId}/**` writes, plus
`auth/login`, `auth/refresh`, `auth/logout`. Adding an endpoint without a gate and without an
allowlist entry goes red, and the allowlist is a diff a reviewer notices.

---

## 9. Development data — nothing is seeded

> **Ruling (Florian, 2026-09-11): the application seeds no data that is not technically required
> to make it work.** No Personen, no Gruppen, no Rollen beyond the one below, no Zugehörigkeiten,
> no Mitgliedschaften. This overrides the earlier draft of this section, which specified a
> `DevelopmentDataSeeder` shipping ~150 invented Personen and ten invented Gruppen.

### 9.1 What is still seeded, and why it is technically required

| Seeded | By | Why it survives the ruling |
|---|---|---|
| The bootstrap `Person` + `Account` | `BootstrapAdminSeeder` (exists) | It is the only way into the app. Without it there is no login and no path to create anything else. |
| The `Admin` Rolle with **all four keys**, and one open `role_holding` for the bootstrap Person | `BootstrapAdminSeeder`, extended in **slice 2** (§3.6) | Plan **ruling 11**. Rights are data; an Account holding no key reaches no `/manage/*` surface, so without this the app ships with every write surface unreachable and no bootstrap path to reach them. This is the definition of technically required. Afterwards the Rolle is ordinary data the club may rename, re-key or re-hold. |

Nothing else. In particular there is **no** `DevelopmentDataSeeder`, no `DevelopmentSeedOptions`,
no `DevelopmentSeed` configuration key, no `Infrastructure/Development/` folder, and **no slice
3a** — the build ledger runs the plan's pinned eighteen slices and no more.

### 9.2 How the UX pass gets density instead

The UX pass (`pnpm shot` on every touched route) still must see a 150-row register, a full Gruppen
showcase and a populated rights matrix — an eight-empty-state pass verifies nothing. It gets them
from a **throwaway script that lives in the session scratchpad and is never committed**:

- it logs in as the bootstrap admin against the running dev API,
- it creates everything through the **real write endpoints** (`POST /api/manage/persons`,
  `POST /api/manage/groups`, `POST /api/manage/roles`, the Zugehörigkeit and Inhaberschaft
  endpoints, …),
- the data it makes is dev-database content that `docker compose down -v` erases.

Three properties make this the right shape: it ships nothing, it exercises the real write path
end-to-end as a free integration check, and it cannot drift into production because it does not
exist in the repository.

**Sequencing consequence.** The create endpoints arrive in slices 11, 14 and 16. Until then a
frontend slice's own `pnpm shot` sees thin or empty data. That is accepted: the slice agent
screenshots and judges the **loading and empty states honestly** rather than faking rows, and the
density judgement happens in the UX pass, which runs after those slices.

### 9.3 The cases the throwaway script must produce

Not shipped code — a checklist, because these are the cases the UX pass exists to look at. Each
one is a state some surface must render and no other data will reveal:

- ~150 Personen, German names, distinct `(first, last)` pairs, so the A–Z register, the letter
  dividers and the scan density are judged at real size.
- Contact data present on roughly two thirds; `contact_visible_to_members` on roughly a fifth —
  both contact states, plus the third state for a viewer holding `persons.read_details`.
- The four membership states all present: `aktiv`, `ruht`, `beendet`, `kein Mitglied`.
- A Person with **an ended period and a new open one** — the two-chain case „Mitglied seit" exists for.
- A Person **`beendet` but affiliated through a running Zugehörigkeit** — she appears on `/members`
  with the `beendet` chip (decision AA); without her that chip is unreachable.
- A Person with a **future** Mitgliedschaft — reads `kein Mitglied` today, `geplant` in
  Person bearbeiten (decision AF).
- Ruhezeiten: some current, at least two **open-ended** (so §4.20's clamp has data), some historic.
- Beitragsermäßigungen across all four bases, half still running.
- Gruppen: enough to fill the showcase grid, every one of them with members, descriptions of
  realistic length, both openness values, and **one archived** Gruppe that still holds open
  Zugehörigkeiten — the case that proves archiving excludes without rewriting.
- **One Gruppe with no Gruppen-Admin** — the „kein Admin" warning must have data.
- **Two Gruppen-Admins who do not belong to the Gruppe they run** (the Kindergarde case in
  `CONTEXT.md`); one of them affiliated by nothing else at all — her Hub works, `/members` answers
  403 for her (§2.5, decision AG).
- Closed rows everywhere: ended Zugehörigkeiten, an ended admin row, closed Inhaberschaften — the
  history panels and the „seit"-chains need them.
- Rollen with a spread of key sets, one **unbesetzt** — the empty-holder state must have data.

Group and Rolle names in that script are **development fiction**. They are never exported, never
demoed as real, and **slice 18's website re-pointing is never verified against them** — the public
Gruppen list is checked against the club's own Gruppen.

### 9.4 What must not happen

No fixture or demo data in the repository. No seed flag in any `appsettings`. No test that depends
on data the script made. No Accounts beyond the bootstrap one — login stays a single known
credential for `pnpm shot`. And nothing from plan §4's Ignored table, in the script or anywhere:
no Ehrenmitgliedschaft, no Mitgliedschaftsart, no Ruhezeit-Grund, no Schlüssel, no founding year,
no audit author, no `Beitrag` amounts.

---

## 10. Copy

German UI, English identifiers (ADR-0002: copy is written inline in components, no i18n, no
locale files). Routes, ids, props, table and field names stay English.

### 10.1 Address form — **du**

The app addresses the member as **du**, lowercase mid-sentence (`du`, `dein`, `dich`), capitalised
only at the start of a sentence. It is a carnival club, everyone is on first-name terms, and the
shipped shell already greets with `du`. **Never `Sie`.** Copy about a third person uses her first
name where the mocks did („Paula hat die Anzeige für Mitglieder ausgeschaltet").

### 10.2 Narrenruf

**„Gross - Furria!"** — exactly that spelling, that hyphen, those spaces. *Helau* and *Alaaf* are
forbidden everywhere. P1 adds **no new Narrenruf placement**: `KkAppShell` / `KkBrandStage`
already carry it, and sprinkling it into a registry list cheapens it.

### 10.3 Dates, Sessions and spans

| Thing | Rendered as | Helper |
|---|---|---|
| a day | `11.11.2025` | `formatIsoDay` |
| a Session | `2025/26` | `formatSessionLabel` |
| a Session number | `Session Nº 56` (only where the club counts) | `lib/club.ts` |
| a **period** (has both ends) | `01.09.2017 – 28.02.2026`, open: `01.09.2017 – offen` | `formatPeriod` |
| a **Session span** | `2025/26 – 2027/28`, single: `2025/26`, open: `2025/26 – offen` | `formatSessionSpan` |
| a **running relationship** in a list row | `seit 2018/19` — the **Session**, not the year | `formatSinceSession` |
| a **closed relationship** | its span in a `KkFactRow` | `formatPeriod` |

**One rule, decided here** (the mocks had three competing treatments): *a period always renders as
a span; a running start-only relationship always renders as `seit <Session>`.* `KkSinceRow` shows
the Session; `KkFactRow` shows the span. **Never mix them within one block** — a running-members
block and a history block are two blocks and may sit on the same surface (the Hub does exactly
that); what is forbidden is one list whose rows are treated two ways.

**Why the Session and not the calendar year** (decision AL): this is a club whose identity is the
Session, whose founding year defines Session Nº 1, and whose `lib/club.ts` has computed the label
since P0. „in der Tanzgarde seit 2018/19" is something a member recognises; „seit 2019" throws the
club's own unit of time away for three saved characters. Two things stay **exact dates**, because
the club records them as dates: **„Mitglied seit 01.09.2017"** (the Beitrittserklärung has a day on
it) and every **period span** in a `KkFactRow`.

An absent end date is **`offen`** — never „unbefristet", never „–", never an empty cell.

### 10.4 State vocabulary

| State | Chip label | Tone | Dot | Where |
|---|---|---|---|---|
| running Mitgliedschaft | `aktiv` | green | yes | Mitglieder, Person, Personenverwaltung |
| running, inside a Ruhezeit | `ruht` | gold | yes | same |
| a begun chain, none running | `beendet` | neutral | no | **wherever it occurs** — Mitglieder included, whenever the Person is still affiliated through a Gruppe or a Rolle (decision AA); Personenverwaltung shows it for the unaffiliated too |
| no Mitgliedschaft, or only a future one | `kein Mitglied` | neutral | no | Mitglieder, Person, Personenverwaltung |
| the running period, in a FactRow | `läuft` | green | yes | Person bearbeiten |
| a period that has not begun, in a FactRow | `geplant` | neutral | no | Person bearbeiten |
| `isRecruiting = true` | `sucht Verstärkung` | gold | yes | Gruppen, Gruppe, Hub, Gruppenverwaltung |
| `isRecruiting = false` | `sucht gerade niemanden` | neutral | no | same |
| `archivedOn != null` | `archiviert` | neutral | no | Gruppenverwaltung, Rollen master |
| the viewer administers this Gruppe | `Gruppen-Admin` | accent | no | Hub header |
| a Gruppe with no running admin | `kein Admin` | gold | no | Gruppenverwaltung |
| a read-only block | `nur Ansicht` | neutral | no | Person bearbeiten |
| contact not opted in | `nicht freigegeben` | neutral | no | Personenverwaltung |
| the visibility switch | `an` / `aus` | green / neutral | no | Mein Profil |
| a Gruppe name as a marker | the name | ink | no | desktop tables |
| a Rolle name as a marker | the name | accent | no | desktop tables |

Green/gold/neutral is the whole state axis. **Accent (red) is never a state** — only an action or
an identity accent (Rolle, Gruppen-Admin). These strings live in `lib/state-chips.ts`, not in
`@furria/ui`.

**`läuft` vs `aktiv`, spelled out** so they do not read as two words for one thing: a **period**
*läuft* (a row on a timeline, in a `KkFactRow`, beside its span); a **Mitgliedschaft** is *aktiv*
(a Person's derived state, in a chip beside her name). Person bearbeiten is the only surface that
shows both, and there the distinction is exactly what it is describing.

**„Team komplett" is retired before it ships.** CONTEXT.md's **Gruppe** entry bans the word *team*
outright, and this was user-visible German on four surfaces — inventing a state the club never
named, where the club's vocabulary has only the positive marker. „sucht gerade niemanden" says the
same thing in the club's own words (decision AM).

### 10.5 Confirmation verbs

The primary button of a confirmation **carries the verb**, never „OK" or „Bestätigen":

| Action | Eyebrow | Question | Primary |
|---|---|---|---|
| end a Zugehörigkeit | „Zugehörigkeit beenden" | „PAULA AUS DER TANZGARDE?" | **Zugehörigkeit beenden** |
| end a Gruppen-Admin row | „Gruppen-Admin beenden" | „ANNA ALS GRUPPEN-ADMIN BEENDEN?" | **Gruppen-Admin beenden** |
| archive a Gruppe | „Gruppe archivieren" | „MUSIK & KAPELLE ARCHIVIEREN?" | **Archivieren** |
| restore a Gruppe | „Gruppe aktivieren" | „MUSIK & KAPELLE WIEDER AKTIVIEREN?" | **Aktivieren** |
| end a Mitgliedschaft | „Mitgliedschaft beenden" | „MITGLIEDSCHAFT VON PAULA BEENDEN?" | **Mitgliedschaft beenden** |
| end an Inhaberschaft | „Inhaberschaft beenden" | „KATRIN ALS PRÄSIDENTIN BEENDEN?" | **Inhaberschaft beenden** |
| archive a Rolle | „Rolle archivieren" | „CHRONIK ARCHIVIEREN?" | **Archivieren** |
Secondary is always **Abbrechen**. The explanation is exactly **one** paragraph saying what is
lost *and* what survives, and every confirmation fills `KkConfirmDialog`'s `consequence` slot with
a **live** sentence that changes with the chosen date (§7.3).

Two confirmations carry a sentence the model makes mandatory:
- **Mitgliedschaft beenden** — „Eine offene Ruhezeit endet mit der Mitgliedschaft." (§4.20's clamp;
  the facts table adds a row *Offene Ruhezeit · endet mit 2025/26* when there is one).
- **Gruppe archivieren** — „Ab <Datum> steht <Gruppe> nicht mehr im Verzeichnis. Die
  <N> Zugehörigkeiten bleiben bestehen." — and the date is **today**, stated, not chosen: archiving
  takes no date field (§4.28).

Create/edit verbs: „Aufnehmen" (Zugehörigkeit) · „Ernennen" (Gruppen-Admin) · „Anlegen" (Person,
Gruppe, Rolle) · „Speichern" (edit) · „Hinzufügen" (a dated fact) · „Ändern" / „Beenden" (row
actions) · „Umbenennen" (Rolle).

### 10.6 Copy that must be corrected relative to the mocks

| Mock said | Ship |
|---|---|
| „über dein **Amt**" | „über deine **Rolle**" |
| „Im **Amt** seit" | „**Inhaberin seit**" / „Inhaber seit" |
| „Name, Gruppe oder **Amt**" | „Name, Gruppe oder **Rolle**" |
| „KEIN **AMT**" | „**KEINE ROLLE**" |
| „**Ämter** & Rechte" | „**Rollen & Rechte**" |
| „Die 9 Zugehörigkeiten werden zum gewählten Datum **beendet**" | „Die Zugehörigkeiten **bleiben bestehen** — die Gruppe zählt nur nicht mehr mit." (archiving rewrites no period, §4.28) |
| „**zahlt Paula keinen Beitrag**" | drop — Beitrag während einer Ruhezeit is an open club question. Say „Ab Session 2025/26 zählt Paula nicht als aktiv. Ihre Gruppen bleiben bestehen." |
| „Vorstandsämter, Finanzen, Admin" (key note) | no enumeration — Rollen are club data |
| „Änderungen an Stammdaten gehen an die **Schriftführerin**" | „Änderungen an Stammdaten übernimmt die **Personenverwaltung**." |
| „… müssen dich dann **übers Amt** … erreichen" | „… müssen dich dann **über deine Gruppe** oder persönlich erreichen." |
| „**Team komplett**" (the openness counterpart) | „**sucht gerade niemanden**" — CONTEXT bans *team* for a Gruppe (§10.4) |
| Hub eyebrow „du **tanzt** hier mit" | „du **bist hier dabei**" — half the Gruppen (Elferrat, Technik & Bühne, Musik & Kapelle, Festkomitee, Archiv & Chronik) do not dance |
| „Die **9** Zugehörigkeiten werden … beendet" (hard count in the mock) | the count is the **live** number from the payload, never a literal |
| „**152 Personen** sind aktuell mit dem FCC verbunden" | the count is the **live** `members.length`, never a literal |
| „zieht der eine Vereins-**Spielplan**" | drop — Gruppentermin is an open term |
| „**Schlüssel**" marker + its explanatory card | drop entirely (ruling 6) |
| „… 140 weitere", „Weitere laden" | drop — the list shows all of its data |
| „16 von 26", „3 von 5" rights counters | drop — no ratio, no score |

### 10.7 Copy worth keeping verbatim

- Mitglieder sub: „**{count} Personen sind aktuell mit dem FCC verbunden. Alles hier ist Ansicht —
  geändert wird in der Personenverwaltung.**" — `{count}` is the **live** `members.length`. The
  mock's „152" is not copy; shipping the literal is the first mistake this line invites.
- Stats note: „**{n} Personen tanzen oder helfen mit, ohne Mitglied zu sein. Sie stehen mit in der
  Liste.**" — one sentence that teaches the whole model; `{n}` is the live
  `countByState(members).none`. Rendered **above the list on mobile** and in the aside on desktop
  (§5.2). „tanzen oder helfen mit" covers both halves of the club and stays exactly as it is.
- Hidden contact: „**Kontaktdaten sind hinterlegt, aber nicht freigegeben**" /
  „**<Vorname> hat die Anzeige für Mitglieder ausgeschaltet. Das ist eine Einstellung, keine Lücke
  — frag im Zweifel eine Gruppen-Admin.**" / bar label „**privat**"
- Key-holder strip: „**Du siehst das über deine Rolle — für andere Mitglieder ist es verborgen**"
- Gruppen-Admin note: „**Gruppen-Admins pflegen die Gruppe. Sie müssen nicht selbst in der Gruppe
  tanzen.**"
- Funktion hint: „**Nur ein Etikett für die Anzeige. Die Rechte hängen an der Gruppen-Admin-Rolle,
  nicht am Wort.**"
- Mein Profil: „**Meine Kontaktdaten für Mitglieder sichtbar**" + the two-sentence explanation and
  „**Unabhängig davon: Wer das Recht „Personendetails sehen" hat, sieht deine Daten immer.**"
- Personenverwaltung sub: „**Alle Personen im Register — auch ausgetretene und Leute ohne
  Vereinsbindung.**"
- Gruppenverwaltung footnote: „**Archivieren löscht nichts: Die Gruppe verschwindet aus dem
  Verzeichnis, ihre Geschichte bleibt in den Profilen stehen.**"
- Rollen guidance: „**Jede Zeile ist eine Sache, die man tun darf. Umschalten wirkt sofort für
  alle Inhaber dieser Rolle.**"

### 10.8 The four key descriptions (module constant, `role-permission-copy.ts`)

| Key | Title | One line |
|---|---|---|
| `persons.read_details` | Kontaktdaten aller Personen sehen | Telefon, E-Mail und Adresse — auch wenn die Person sie für Mitglieder nicht freigegeben hat. |
| `persons.manage` | Personen und Mitgliedschaften pflegen | Personen anlegen, Stammdaten ändern, Zeiträume, Ruhezeiten und Beitragsermäßigungen anlegen und beenden. |
| `groups.manage` | Gruppen verwalten | Gruppen anlegen, bearbeiten, archivieren und jede Zugehörigkeit oder Gruppen-Admin-Rolle überschreiben. |
| `roles.manage` | Rollen und Rechte verwalten | Rollen anlegen, ihre Rechte ändern und Inhaberschaften eintragen. Wer das hat, kann sich alles andere selbst geben. |

### 10.9 Beitragsermäßigung — the four bases

`FeeReductionBasis` reaches the client as `minor | school | apprenticeship | studies` and had no
German anywhere: slice 13 could not have rendered a single row.
`features/manage-persons/manage-persons-labels.ts`:

| Wire value | Label |
|---|---|
| `minor` | **Minderjährig** |
| `school` | **Schule** |
| `apprenticeship` | **Ausbildung** |
| `studies` | **Studium** |

The editor's field is labelled „**Grundlage**", **never „Grund"** — „Grund" is the Ruhezeit reason
that plan §4 retires, and reusing it three panels down will be read as the banned field. Hint under
the field: „Wird angegeben, nicht aus dem Geburtsdatum abgeleitet." (ruling 14, said out loud).

---

## 11. Slice-by-slice build ledger

**One concern per PR.** Backend by TDD (one failing test first, then the minimal implementation).
Frontend gates green per slice. **Every frontend slice ends with `pnpm shot <route>` for each new
or changed route**; the agent reads the four PNGs (phone/desktop × light/dark) and fixes what it
sees *before* opening the PR.

### The gate commands

```bash
# B — backend (Docker must be running)
cd /home/florian/sources/furria/server && docker compose up -d
dotnet build && dotnet test && dotnet csharpier format .

# F — frontend
cd /home/florian/sources/furria/web
pnpm lint && pnpm typecheck && pnpm test && pnpm build

# S — screenshots (needs pnpm dev:club-app on :3001 and dotnet run --project src/Furria.Api on :5100)
cd /home/florian/sources/furria/web && pnpm shot <route>
```
`pnpm lint` is `biome check .` with a zero-warning policy; **no `biome-ignore`, ever**.
`dotnet build` fails on any warning (`TreatWarningsAsErrors`) and on any MET violation.

### The ledger

| # | Slice | Backend deliverables | Frontend deliverables | Gates | Shots |
|---|---|---|---|---|---|
| 1 | Mitgliedschaft rework | **add** `Core/Club/{ClubSession,ClubClock,DatePeriod,SessionSpan,MembershipState,MembershipStateCalculator,ITimestamped}`, `Core/Identity/{MembershipPause,FeeReduction,FeeReductionBasis}`, `Infrastructure/Persistence/AuditTimestampInterceptor`, configurations for the two new tables, migration `RegistryFacts`, `Application/Identity/MembershipChainDetails`. **change** `Person` (Memberships, BirthDate, ContactVisibleToMembers), `Membership` (periods), `PersonConfiguration`, `MembershipConfiguration`, `AppDbContext`, `AccountService.GetDetailsAsync`, `MembershipDetails`, `GetMe`. **delete** `MembershipType`, `MembershipStatus`, `InsertMembershipDirectlyAsync`. **harness** `IdentitySeedBuilder` (§8.2), `IdentitySeedMaterializer`, `MembershipExpectations`, `PersonExpectations`, `MembershipPauseExpectations`, `FeeReductionExpectations` (+`ToHaveBeenTouchedAt`), `ApiTestFixture` (`UseEnvironment("Testing")`, `Today`, `CurrentSessionYear`); **docs** rewrite `docs/server/TESTING.md`'s `MembershipOf` example; rewrite `GetMeTests`, `MembershipPersistenceTests`, add `ClubSessionTests`, `ClubClockTests`, `Should_StampUpdatedAt_When_APersonIsEdited` | `lib/api/api-fetch.ts` (PUT/DELETE), **`lib/api/api-error.ts` (`RequestFailedError`, §5.0a)**, `lib/api/schemas.ts` (§5.1, +`PermissionKey`), `lib/membership-labels.ts`, `lib/state-chips.ts` (+tests), **`lib/text.ts` (+tests)**, `features/profile/components/ProfileMembershipPanel.tsx`, `features/session/components/AppUserLink.tsx` | B, F | `/profile` |
| 2 | Rights core | `Core/Roles/{Role,RolePermission,RoleHolding}` + configurations, migration `Roles`, `Application/Authorization/FurriaPermissions`, **move** `PermissionAuthorizer` → `Infrastructure/Authorization` and implement `IsGrantedAsync` + `GrantedKeysAsync` with per-request caching, `BootstrapAdminSeeder` split into three guarded steps (§3.6), `ApiTestFixture` snapshot array, `RoleSeedBuilder` + materializer + `TestRoles` + `RoleExpectations` + `RoleHoldingExpectations`, `GetMe.permissionKeys`, tests for the enforcer against a real matrix | `MeSchema.permissionKeys`, `features/session/hooks/use-permissions.ts`, `RequirePermission`, `AccessDenied` | B, F | — |
| 3 | Gruppen core | `Core/Groups/{Group,GroupMembership,GroupAdmin}` + configurations, migration `Groups` (incl. the hand-written `ix_group_name_active`), `Infrastructure/Registry/AffiliationQuery`, `PermissionAuthorizer.{IsAffiliatedAsync,IsGroupAdminAsync,IsGroupMemberOrAdminAsync,CanAdministerGroupAsync,CanSearchPersonsAsync}` + the `GroupTies` cache, `Api/Authorization/{AffiliationRequirement, RequireAffiliation}` + the `PermissionEnforcer` branch, `Api/Results/ResultResponseExtensions` + non-generic `Result` + `ResultErrorKind.Forbidden`, `GroupSeedBuilder` + materializer + `TestGroups` + the three group expectations, **`EndpointGateTests` (§8.8)**, `GetMe.isAffiliated` | `MeSchema.isAffiliated`, `RequireAffiliation`, `PageSkeleton`, `AccessDenied` (`action` slot + the four messages), `routes/_app/_affiliated.tsx` | B, F | — |
| 4 | Mitglieder list | `GetMembers` (4.2) with the German collation + `Should_SortUmlautsAsGerman_When_ListingMembers`, `Infrastructure/Registry/PersonService.GetMembersAsync`, `Application/Registry/MemberSummary` | `features/members/*` (list half), `routes/_app/_affiliated.members.tsx`, `APP_SECTIONS` members target + Gruppen entry, `buildNavGroups`, `resolveSectionTitle` (+tests), `KkChip`, `KkPersonRow`, `KkSearchField`, `KkFilterChips`, `KkLetterDivider`, `KkLetterIndex`, `KkEmptyState`, `KkSkeletonRow`, `KkIcon` names | B, F, S | `/members` |
| 5 | Person card | `GetMemberById` (4.3) with the contact rule, `PersonService.GetMemberAsync`, `Application/Registry/MemberDetails` | `features/members/*` (card half), `routes/_app/_affiliated.members.$personId.tsx`, `KkSinceRow`, `KkRedactedValue`, `KkNote` tone, `KkPanel` tones, `KkFieldRow` hint | B, F, S | `/members/$personId` |
| 6 | Gruppen | `GetGroups` (4.4), `GetGroupById` (4.5), `Infrastructure/Groups/GroupService`, `Application/Groups/{GroupSummary,GroupDetails}` | `features/groups/*`, `routes/_app/_affiliated.groups.tsx` + `.$groupId.tsx`, `KkAvatarStack`, `KkPanelHeader` action slot | B, F, S | `/groups`, `/groups/$groupId` |
| 7 | Profile visibility | `PutMyContactVisibility` (4.6), `PersonService.SetContactVisibilityAsync`, `ClaimsPrincipal.PersonId()` | `features/profile` visibility panel + contact-block preview + `use-contact-visibility` (the §5.0 optimistic idiom), `KkSwitchRow`, **`KkToast` + provider in `AppShell`** | B, F, S | `/profile` |
| 8 | Hub read | `GetMyGroups` (4.7), `GetMyGroupById` (4.8) — 403 vs 404 kept distinct | `features/group-hub/*` (read half), `routes/_app/my-groups.$groupId.tsx` + `my-groups.index.tsx` (redirect), the 403/404 branches (no guard component), „Meine Gruppen" nav group folded into the boot gate, `KkReservedSlot` | B, F, S | `/my-groups/$groupId` |
| 9 | Hub admin I | `GetPersonSearch` (4.41) + `Core/Club/GermanFold`, `PutGroupInfo` (4.9), `PostGroupMembership` (4.10), `EndGroupMembership` (4.11) | hub admin panels, `PersonPicker`, `AddMemberDialog`, `EndMembershipDialog`, `HubCelebration`, the mutation-invalidation idiom, `KkModalFrame`, `KkConfirmDialog`, `KkDateField`, `KkTextArea`, `KkButton` tone | B, F, S | `/my-groups/$groupId` |
| 10 | Hub admin II | `PostGroupAdmin` (4.12), `EndGroupAdmin` (4.13) | `AddAdminDialog`, `EndAdminDialog`, `KkChipField` | B, F, S | `/my-groups/$groupId` |
| 11 | Personenverwaltung | `GetPersons` (4.14), `GetPersonById` (4.15), `PostPerson` (4.16), `PutPerson` (4.17) | `features/manage-persons/*` (list half), `routes/_app/manage.persons.tsx`, „Verwaltung" nav group, `KkFab` | B, F, S | `/manage/persons` |
| 12 | Person bearbeiten I | `PostMembership`, `PutMembership`, `EndMembership` (incl. the open-pause clamp), `PostMembershipPause`, `PutMembershipPause` (4.18–4.22), `Infrastructure/Registry/MembershipService` | `features/manage-persons/*` (edit half, pauses nested per period), `routes/_app/manage.persons.$personId.tsx`, `KkFactRow`, `KkConsequenceNote`, `KkSessionField` | B, F, S | `/manage/persons/$personId` |
| 13 | Person bearbeiten II | `PostFeeReduction`, `PutFeeReduction` (4.23–4.24) | `PersonFeeReductionsPanel`, `FeeReductionEditor`, the four basis labels (§10.9), `KkSelectField` | B, F, S | `/manage/persons/$personId` |
| 14 | Gruppenverwaltung I | `GetManagedGroups` (4.25), `PostGroup`, `PutGroup`, `ArchiveGroup`, `RestoreGroup` (4.26–4.29) | `features/manage-groups/*`, `routes/_app/manage.groups.tsx` | B, F, S | `/manage/groups` |
| 15 | Gruppenverwaltung II | `GetManagedGroupById` (4.30) — **no write endpoints**, the overrides ride the disjunction gate of 4.9–4.13 | `GroupOverridePanel` selected by `?group=` (`ManagedGroupsSearchSchema`), reusing the four hub dialogs and `PersonPicker` | B, F, S | `/manage/groups`, `/manage/groups?group=1` |
| 16 | Rollen & Rechte I | `GetRoles` (4.31), `GetRoleById` (4.32), `PostRole`, `PutRole`, `ArchiveRole`, `RestoreRole`, `PutRolePermissions` (4.33–4.37), `Infrastructure/Roles/RoleService` | `features/manage-roles/*`, `routes/_app/manage.roles.tsx` (`?role=`), `KkSelectRow`, `role-permission-copy.ts` | B, F, S | `/manage/roles`, `/manage/roles?role=1` |
| 17 | Rollen & Rechte II | `PostRoleHolding` (4.38), `EndRoleHolding` (4.39) | `RoleHoldersPanel`, `AddHolderDialog` (`PersonPicker`, §4.41), `EndHoldingDialog` (`tone="danger"`) | B, F, S | `/manage/roles?role=1` |
| 18 | Website re-pointing | `GetPublicGroups` (4.40) | `apps/website` Gruppen list + openness read from the API; keep `/club` prerenderable or move the read client-side (ADR-0003); no SSR runtime | B, F | website `/club` |

Every slice's PR description states which contract sections it implemented and reports any
contract bug it hit. Commits use conventional prefixes (`feat:`, `fix:`, `refactor:`, `test:`,
`docs:`, `chore:`) and never mention Claude.

---

## 12. Open questions — all decided

None of these blocks an implementer. Each is decided here; the rationale is one line.

| # | Question | **Decision** | Why |
|---|---|---|---|
| A | Key format `{area}:{action}` (B1) vs `persons.manage` (P1) | **the P1 dot form, verbatim** — `persons.read_details`, `persons.manage`, `groups.manage`, `roles.manage`; correct the frozen line in `plan/server/identity-foundation.md` when it is next touched | the later, "final" document wins, and `read_details` is not an `{area}:{action}` pair |
| B | Are period end dates inclusive? What is a same-day period? | **inclusive on both ends** — `start <= today <= end`; `start == end` is one valid day | matches the confirmation copy „Ende am <Datum>" and makes a same-day row meaningful rather than a no-op |
| C | May a period start or end in the future? | **yes**, both; validators enforce only `end >= start`; every derived fact uses `IsRunningOn`, never `IsOpen` | the club plans ahead and a Ruhezeit is explicitly enterable in advance; a future row is stored and invisible until its day |
| D | Do archived Gruppen / Rollen still confer affiliation and rights? | **no** — `AffiliationQuery` and `GrantedKeysAsync` ignore rows whose Gruppe/Rolle is archived; archiving **rewrites no period** | history survives, the register stays honest, and the archive confirmation can promise „löscht nichts" truthfully |
| E | Does `groups.manage` open the Gruppen-Hub? | **no** — `/my-groups/$groupId` is gated strictly on a running Zugehörigkeit or a running `group_admin` row; the higher instance works through `/manage/groups` | otherwise "Meine Gruppen" stops meaning *mine* and the nav fills with every Gruppe of the club |
| F | Which key guards `birth_date`? | **`persons.manage` only**; it is returned by `GetMe` (own profile) and the `manage/persons` endpoints, and by nothing else | `persons.read_details` is defined as *contact* data; a birth date is not contact data |
| G | `beendet` vs `kein Mitglied` | **four values**: `active`, `paused`, `ended`, `none`; `beendet` when a chain has **begun** and none runs, `kein Mitglied` when none ever did **or every period is still in the future**; `ended` appears wherever it occurs, Mitglieder included (decision AA) | the surface table and the derived-facts list each named half of the same axis |
| H | Which Session is "today" between Aschermittwoch and 11.11.? | **the Session that last opened** — a Session year runs 11.11. → 10.11. with no gaps; `ClubSession.YearOf` is the exact twin of the shipped `sessionAt` | the rule was shipped on the client and never written down; pinning it makes `ruht` computable every day of the year |
| I | Ruhezeit anchors on `membership_id`, Beitragsermäßigung on `person_id` | **keep both anchors**; a pause's Session span must lie inside its Mitgliedschaft's (422); **no cascade** when a period ends, with one exception — an **open-ended** pause is clamped to the Mitgliedschaft's last Session (decision AI). The UI mirrors the anchor: pauses render nested inside their period, never as a sibling panel (§5.8) | a pause is only meaningful inside one period; a reduction outlives periods |
| J | May two **closed** periods overlap? | **no overlap at all**, per Person, per (person, group), per (person, role) — validated in the service → 409; the partial unique index is the database backstop for the open case. With decision B's inclusive ends this makes a **same-day rejoin a 409**: a rejoin starts at the earliest the **day after** the previous period ended, and §4.18's message says so | makes "at most one running" true by construction and `Mitglied seit` unambiguous; a PG exclusion constraint would need `btree_gist` |
| K | Does `persons.read_details` reveal contact data in the **list** too? | **card only** — `GetMembers` and `GetPersons` carry no contact data shaped by a key | one fewer place where a right changes a payload shape |
| L | Can `/members/$personId` be opened for a non-affiliated Person? | **404** from `GET /api/members/{id}`; her data is reachable only under `persons.manage` | otherwise ruling 2 would be a UI-only filter |
| M | Enum wire format — int (shipped) or string? | **camelCase strings** via `JsonStringEnumConverter(JsonNamingPolicy.CamelCase)` on the FastEndpoints serializer; the client uses `z.enum([...])` | the only two int enums on the wire are deleted in slice 1, so there is nothing to keep compatible; strings are legible in Swagger, in a payload and in this contract |
| N | Where does `PermissionAuthorizer` live? | **`Furria.Infrastructure.Authorization`**, concrete and sealed, no interface | it needs `AppDbContext`; `Furria.Application` sees `Furria.Core` only; ADR-0001 bans an interface introduced for mocking |
| O | How is the group-scoped gate expressed? | **in-handler**, `CanAdministerGroupAsync` (writes) / `IsGroupMemberOrAdminAsync` (hub read), answering `Send.ForbiddenAsync` | it is a *disjunction* over a *route value*; `PermissionRequirement` carries one opaque string and `GetMetadata<T>` returns one |
| P | Affiliation gate — declarative or in-handler? | **declarative**: a second metadata record `AffiliationRequirement` + a branch in the existing `PermissionEnforcer`; one line in `Configure()` | it needs no route value and no disjunction, and keeping the gate visible in `Configure()` is worth the small addition |
| Q | Does a domain `Unauthorized` result map to 401 or 403? | **split the symbol**: new `ResultErrorKind.Forbidden` → **403** for every permission or visibility failure; `Unauthorized` keeps **401** and is reserved for credential failures (`Login`, `Refresh`) | ADR-0006 makes a 401 terminal in the Club-App — a permission failure answered 401 logs the member out; but `LoginAsync` already returns `Unauthorized` for a wrong password, so one symbol with two HTTP meanings would make `SendFailureAsync` unsafe in exactly the endpoint §3.4 tells everyone to copy |
| R | Which endpoint carries the client's keys and Gruppen? | **`GetMe`** carries `isAffiliated` + `permissionKeys`; **`GetMyGroups`** carries the Gruppen | `GetMe` already gates the tree (no extra round trip, one source of truth for "who am I"); the Gruppen list is unbounded, changes independently, and is the hub index in its own right |
| S | The website needs Gruppen publicly, but `/api/groups` is affiliated-gated | **a separate anonymous endpoint** `GET /api/public/groups` with name, description and openness only | one page = one concern = one gate; widening an affiliated endpoint to serve anonymous callers is the opposite |
| T | Verwaltung nav group — "one entry per held key", but `persons.read_details` has no page | the group appears when **at least one of the three keys that have a surface** is held; `persons.read_details` never opens it. This is a **declared reinterpretation of plan §4's navigation paragraph** and belongs written back into the plan when that file is next touched (the treatment decision A gives `identity-foundation.md`) | the fourth key changes what a Person card shows, not the navigation |
| U | Can a Ruhezeit or a Beitragsermäßigung be deleted? | **no** — add and edit only (`POST` / `PUT`), per the plan's surface table; a mistake is corrected, not erased | nothing in P1 deletes a dated fact |
| V | Does archiving a Gruppe end its Zugehörigkeiten? | **no** — rows are untouched; they simply stop conferring affiliation (decision D). The mock copy promising otherwise is corrected in §10.6 | „Archivieren löscht nichts" must be literally true |
| W | Does the seeded Admin Rolle get reconciled on every start? | **no** — it is created once, when no Rolle named `Admin` exists, with every key and an open Inhaberschaft; afterwards it is ordinary data | ruling 11 says exactly that; re-adding a key the club removed would be a hidden privilege escalation |
| X | Is the Gruppe's **name** writable from the Hub? | **no** — `PutGroupInfo` writes description and openness; renaming is `PutGroup` under `groups.manage` | a Gruppen-Admin curates her Gruppe; naming it is a club-level act |
| Y | Does `@furria/ui` own the German state vocabulary? | **no** — `KkChip` takes `tone`/`dot`/children; the `aktiv`/`ruht`/`beendet` mapping is `lib/state-chips.ts` in the app, unit-tested | the package is shared with the public website and must stay free of Club-App domain copy |
| Z | Paging on the long lists? | **none in P1** — `/members` and `/manage/persons` return the whole set; letter dividers plus the A–Z index do the navigating | ~150 rows; a table that hides 140 of them behind „… weitere" is a list in disguise |

### Decided in revision 2 (after the three adversarial audits)

| # | Question | **Decision** | Why |
|---|---|---|---|
| AA | A Person whose Mitgliedschaft ended but who still dances in a Gruppe is affiliated — what chip does `/members` show her? | **`beendet`, with its own filter chip and a real count**, built by the shared `toStateFilterOptions` (§5.1). §10.4's earlier „Personenverwaltung only" line is corrected: what is Personenverwaltung-only is the *unaffiliated* former member (ruling 2), which stays true | the old text claimed she „is not affiliated and is not in the payload", which §2.5 and the seed both contradict — she would have matched no chip and vanished from a single-select filter. Collapsing her to „kein Mitglied" was the alternative and was **rejected**: she *was* a Mitglied, and hers is exactly the case ruling 1 exists to make visible |
| AB | Where does a person picker get its Personen? | **a new endpoint, `GET /api/person-search?q=` (§4.41)**, name and id only, gated on `CanSearchPersonsAsync` | `GET /api/members` contains only *affiliated* Personen, so a freshly created Person — the normal case for a Kindergarde six-year-old or a non-member helper — provably cannot appear in it, and the dialog's own instruction dead-ends. `AddHolderDialog` is worse: a `roles.manage` holder need not hold `persons.manage`, so `GET /api/manage/persons` 403s for her and the page's second half is inert |
| AC | Do route-bound `required` properties need `[RouteParam]`? | **yes, always** (§4.0) | System.Text.Json enforces `required` before route binding runs, so without the attribute every one of ~20 mutations throws on its own route id — and the typed test client needs the same annotation. Confirmed against the FastEndpoints documentation |
| AE | Is `ArchivedOn` a date you choose or a fact you stamp? | **stamped**: `ArchiveGroup`/`ArchiveRole` take no date, the service writes `ClubClock.Today(...)`, `archivedOn` leaves `KkDateField`'s consumer list | every consumer in the codebase tests `ArchivedOn == null`, so a future date would archive instantly — nine Zugehörigkeiten silently stop conferring affiliation today for a date two years out. Making the field a real date with an `IsArchivedOn(today)` helper in six call sites was the alternative and was **rejected**: bigger, and „Archivieren löscht nichts: Die Gruppe **verschwindet**" is written in the present tense because that is what the club means |
| AF | What is a Person whose only Mitgliedschaft starts next month? | **`None` / „kein Mitglied"** until the day it starts; `MemberSince` ignores periods that have not begun (§2.4) | the old rule returned `Ended` — the app would have told a brand-new member that she had quit, with a „Mitglied seit" in the future. A fifth state `Pending` was the alternative and was **rejected**: decision G pins four display values, and a fifth would add a chip, a label and a filter on eleven surfaces to describe a row Person bearbeiten already shows with the `geplant` chip |
| AG | Is a Person who is **only** a Gruppen-Admin affiliated? | **no** — `AffiliationQuery` follows CONTEXT.md and ruling 1 exactly; her Hub works, `/members` and `/groups` answer 403. Stated in §2.5 and given data in §9.4 | the model is pinned and a widened predicate is not a contract author's call. The remedy, if the club wants her in the register, is a Zugehörigkeit or a Rolle — a club act. Flagged for Florian rather than silently changed |
| AH | Are the German `ResultError.Message` strings user copy or developer text? | **user copy, rendered verbatim** for 409 and 422 (§5.0a) | it is the only way the three different 422 causes of `PutMembership` stay distinguishable to the person fixing the data, and it gives `ClubSession.LabelOf` its backend consumer. A machine-readable `ResultError.Code` plus a client lookup table was the alternative and was **rejected** — one string with one meaning beats two artefacts that can drift |
| AI | Can a Mitgliedschaft that *ruht* open-endedly be ended? | **yes** — `EndMembership` clamps any open-ended pause to `ClubSession.YearOf(EndedOn)` in the same transaction, and the confirmation says so | otherwise an open-ended pause spans `[first … ∞)`, containment can never hold against a finite membership, and *kündigen while ruhend* — an ordinary club event — would 422 forever with no path out, because decision U forbids deleting the pause |
| AJ | What does the Mein-Profil preview preview? | **the contact block** (`MemberContactPanel`, fed by `toPreviewContact`), on every viewport | the card is about who may see your phone number; a `KkPersonRow` renders no contact data at all, and `MeSchema` carries no groups or roles, so the component built so it *cannot lie* would have rendered „keine Gruppe" for every Tanzgarde member on its first paint |
| AK | May a closed dated fact be edited? | **`Ändern` on every row; `Beenden` only on a running one** (§5.8) | decision U says a mistake is *corrected, not erased* — with no action on a closed row the only remedy for a typo in a 2019 date would be no remedy, and `PutMembership`'s failure modes would be unreachable code. This supersedes the earlier blanket „a closed row carries no actions" |
| AL | Does a relationship row say „seit 2019" or „seit 2018/19"? | **the Session** (`formatSinceSession`), for every running relationship. **Exact dates stay** for „Mitglied seit" and for every period span | the club's unit of time is the Session, `lib/club.ts` has computed the label since P0, and the width cost is three characters. Converting the Mitgliedschaft's own start too was **rejected**: the Beitrittserklärung has a day on it |
| AM | The openness counterpart chip | **„sucht gerade niemanden"**, not „Team komplett" | CONTEXT.md's **Gruppe** entry bans the word *team*; this was user-visible German on four surfaces naming a Gruppe with the one word the glossary retires |
| AN | Success and failure feedback for seventeen write flows | **`KkToast` + `useKkToast`** (§7.3), mounted once in `AppShell`; every mutation toasts on success, every rejection surfaces (§5.0a) | without it the two *optimistic* writes snap back silently — a switch that turns itself off two seconds later reads as broken, on the surface that controls who sees a member's phone number |
| AO | What decides whether something is a primitive? | **"every pixel it draws already comes from a `Kk*`"**, not the consumer count (§7.4) | consumer-counting produced unbuildable specifications under `noDesignSx` — the accent member count on `/groups` and the dimmed archived card could not have been built at all, and the implementer's only escape would have been a lint bypass ADR-0007 forbids |
| AP | Does a guard withhold its children while `me` is pending? | **no** — it renders them, so the page's own query starts in parallel; `denied` replaces the subtree, and a 403 never renders as an error (§5.0) | the old shape made `GetMe → list` a serial hop on every cold open of the club's most-linked surfaces, and `RequireGroupAccess` added a *third* hop to duplicate a gate the endpoint already enforces. `RequireGroupAccess` is deleted |
| AQ | Where does Gruppenverwaltung's override panel get its `groupId`? | **`?group=<id>`** with `ManagedGroupsSearchSchema`, mirroring `/manage/roles` (§5.9) | it was specified nowhere; local state would make the one surface whose purpose is „someone sends you here after a lockout" neither linkable nor reloadable |
| AR | Does the phase ship a development data seeder? | **No — Florian's ruling, 2026-09-11 (§9)** | the app seeds nothing that is not technically required. The bootstrap Account and ruling 11's Admin Rolle stay because without them there is no login and no reachable write surface. Density for the UX pass comes from a throwaway scratchpad script against the real write endpoints (§9.2). Slice 3a is struck; the ledger runs the plan's pinned eighteen. |
| AS | German name sorting and searching | **ICU collation server-side** (`de-DE-x-icu`) plus pure `toIndexLetter` / `normalizeForSearch` on the client (§4.0, §5.1) | `postgres:18-alpine` is musl: every umlaut would sort after `Z` while the client buckets `Kühnel` under `K`, and „müller" would not find „Müller". A German club's register is the wrong place to discover this |
| AT | Does `KkModalFrame` swap `Dialog` ↔ `Drawer` on the breakpoint? | **no** — one `Dialog`, presentation switched through `slotProps` (§7.3) | they are different element types at the same position, so a tablet rotating unmounts react-hook-form state, a half-typed Funktion and a chosen date without warning |

### Raised by the audits and deliberately **not** changed

| Finding | Answer |
|---|---|
| „X Personen **tanzen** oder helfen mit, ohne Mitglied zu sein" is wrong for Elferrat, Technik, Musik, Festkomitee and Archiv | **Kept verbatim.** The sentence already says „tanzen **oder helfen mit**" — the disjunction covers both halves of the club, which is why it is the best line in the bundle. (The Hub *eyebrow* „du tanzt hier mit" **was** wrong, because it is asserted of one Gruppe at a time, and it is fixed.) |
| Add a fifth `MembershipState` value `Pending` for a future-dated Mitgliedschaft | **Rejected**, decision AF: four display values are pinned by decision G, and the honest answer today is „kein Mitglied". The future row is visible where it matters (Person bearbeiten, `geplant` chip). |
| Collapse `ended` → „kein Mitglied" on `/members` | **Rejected**, decision AA: she *was* a Mitglied; the chip would be false, and the case would stop being visible. |
| Make `ArchivedOn` a real future-capable date with an `IsArchivedOn(today)` helper in six call sites | **Rejected**, decision AE: the smaller and more honest change is that archiving has no future tense. |
| Repoint `/members`' „no affiliated Personen at all" empty state at „the API returned an empty array" | **Rejected**: that is a bug, not a state, and the error state already covers it. The empty state is **deleted** — the viewer is in her own list, so it can never render. |
| Give `PersonFormDialog` its own route `/manage/persons/new` | **Rejected**: a second page the plan's route table does not have, and the cut rule is not negotiable for a form. It becomes a **full-height** sheet on mobile instead (§5.7). |
| Add a machine-readable `ResultError.Code` for the client to key its copy off | **Rejected**, decision AH: one German string with one meaning, rendered verbatim. |
| Keep „a closed (historic) row carries **no** actions" | **Rejected**, decision AK: it would make decision U („corrected, not erased") false. `Beenden` stays running-only. |
| Route both Session-year fields through `KkSelectField` | **Rejected**: a Session year is neither a date nor an arbitrary option. `KkSessionField` (§7.3) owns it, and `KkSelectField` keeps its one real consumer. |
| Ship a `DevelopmentDataSeeder` with ~150 invented Personen and ten invented Gruppen | **Struck by Florian, 2026-09-11.** The first draft of §9 specified it and decision AR defended it; both are superseded. §9 now pins what is seeded (bootstrap Account, Admin Rolle) and how the UX pass gets density without shipping fiction. |
| Write decisions T, A and AA back into `plan/club-app/p1-registry-and-groups.md` now | **Not done here.** The plan is pinned and is Florian's; each reinterpretation is declared in this table with the instruction to fold it back when that file is next touched. |
