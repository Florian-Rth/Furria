# Permissions come from Rollen and from running relationships

CA-P1 shipped an authorization system in which every Berechtigung reaches a Person through a
Rolle: `PermissionAuthorizer.GrantedKeysAsync` reads her running Inhaberschaften and collects
their keys. Affiliation — whether she is connected to the club at all — was computed separately
and never expressed as a key. Shaping the Club-App's hub gates on 2026-09-18 forced the two
together: the Verein hub is for Mitglieder, which is a gate, and every gate in the app should be
one shape. Decided while shaping CA-P3.

## The decision

**Every gate in the app is `has(key)`. Nothing is ever gated on "is Mitglied" in a call site.**
A surface asks for a Berechtigung and never inspects a Mitgliedschaft, a Zugehörigkeit or a
Rollen-Inhaberschaft. This is the whole point: the gate system is generic, and what opens a gate
is a question answered in one place.

**A Person's effective keys come from two sources, unioned:**

```
GrantedKeys(person) = KeysFrom(running Rolle-Inhaberschaften)   // club data
                    ∪ KeysImpliedBy(running Mitgliedschaft)      // code constant
                    ∪ KeysImpliedBy(running Zugehörigkeiten)     // code constant, Gruppe-scoped
```

**The implied mapping is a code constant, not club data.** It is the anti-lockout floor: if the
club could edit what a Mitgliedschaft implies, one mis-click locks every member out of the app
with no way back in — the same failure `EnsureAdminRoleIsHeldAsync` already exists to prevent.
It can become club data later without touching a single call site, precisely because every gate
is already `has(key)`.

**Nothing derived is ever stored.** A running Mitgliedschaft supplies `club.read` at the moment
the question is asked. There is no Mitglied-Rolle, no affiliation flag, no membership row in
`RoleHoldings`.

**An Account with no running relationship resolves to the empty key set.** That is the
self-registered ticket buyer, and it needs no Rolle, no onboarding step and no bookkeeping.

## Considered options

**Auto-assign a Rolle when a Person is created** — a Mitglied-Rolle for every new Mitglied, a
website-user Rolle for self-registration, a limited Rolle for non-member Gruppen people.
Rejected on four counts:

- It is the stored flag `CONTEXT.md` bans. Affiliation is derived *at the moment it is asked*,
  from the relationships that are running. A Mitglied-Rolle is that flag in a costume, and two
  truths for one fact drift.
- There is no correct sync rule. A **Ruhezeit is counted in whole Sessions**; an **Inhaberschaft
  is dated in days**. They do not share a time granularity, so every Beitritt, Austritt,
  Wiedereintritt and Ruhezeit would need a parallel write that is wrong somewhere each season.
- **Rollen are club data.** The club creates, renames and archives them. Archiving the
  Mitglied-Rolle would lock out every member — a system-critical Rolle the club can edit is a
  footgun.
- It does not even solve the case that motivated it. Non-member Gruppen people hold a
  **Zugehörigkeit**: many-to-many, per-Gruppe, dated. A flat Rolle cannot say *which* Gruppe, so
  the scoped gates would read the Zugehörigkeit anyway and both systems would be carried.

**Gate some surfaces on the relationship directly** (`if (isMitglied)`) and keep Rollen for
jobs. Rejected because it produces two gate shapes, so "who can see this" has two answers and
neither the rights matrix nor a future audit surface can show the whole picture.

## Consequences

- `GrantedKeysAsync` gains a second source. `IsAffiliatedAsync` stays, but as one input to the
  resolver rather than a parallel gate consulted by call sites.
- The permission-key constant set grows with keys nobody grants through the rights matrix
  (`club.read`). The rights matrix must show them as granted-by-relationship, not as unheld, or
  it will read as a bug.
- **Admin sees everything without a bypass.** The Admin Rolle holds every key by construction
  (`BootstrapAdminSeeder` seeds `FurriaPermissions.All`), so it passes every gate. There is no
  `if (isAdmin) return true` anywhere — a hard bypass would contradict both `CONTEXT.md`'s "no
  built-in super-role" and CA-P1's decision W, which says keys the club removes from the Admin
  Rolle are never re-granted.
- A Gruppe-scoped implied key needs a scoped check, so the resolver's Zugehörigkeit source
  answers "for which Gruppe", not only "yes". Gruppen-Admin already works this way.

## Amendment 2026-09-19 — the Vorstand is a fourth implying relationship

Shaping the Verein hub added the **Vorstand** as a recorded body: a Person holds a dated
**Vorstandssitz** under a club-created **Vorstandsfunktion**. Every Verein has a Vorstand and
members ask who is on it, so the fact is worth storing — but it must not become the super-role
`CONTEXT.md` bans.

It does not, because it resolves through the mechanism this ADR already defines. The Vorstand may
name **one Rolle every seat implies**, and each Vorstandsfunktion may name **one Rolle it
implies**. A running Sitz therefore contributes those Rollen's keys the same way a running
Mitgliedschaft contributes `club.read`:

```
                    ∪ KeysImpliedBy(running Vorstandssitz)       // club data: the named Rollen
```

Two things this deliberately is **not**:

- **Not an auto-assigned Rolle.** No Inhaberschaft row is written when a seat opens, and none is
  cleaned up when it closes — the rejected option above, rejected again for the same reasons. The
  keys appear and vanish with the seat because they were never stored.
- **Not a new key source.** The implied Rollen are ordinary club-created Rollen. Unlike the
  Mitgliedschaft and Zugehörigkeit mappings, **this one is club data**, not a code constant, and
  that is safe: naming no Rolle is the harmless default, and no member's access depends on it.

Consequence for the resolver: a fourth source, resolving Rolle → keys through the same path the
Inhaberschaft source already uses.
