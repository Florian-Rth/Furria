# Permissions come from roles and from running relationships

CA-P1 shipped an authorization system in which every permission reaches a Person through a
role: `PermissionAuthorizer.GrantedKeysAsync` reads her running role holdings and collects
their keys. Affiliation — whether she is connected to the club at all — was computed separately
and never expressed as a key. Shaping the Club-App's hub gates on 2026-09-18 forced the two
together: the club hub is for members, which is a gate, and every gate in the app should be
one shape. Decided while shaping CA-P3.

## The decision

**Every gate in the app is `has(key)`. Nothing is ever gated on "is a member" in a call site.**
A surface asks for a permission and never inspects a membership, a group membership or a
role holding. This is the whole point: the gate system is generic, and what opens a gate
is a question answered in one place.

**A Person's effective keys come from two sources, unioned:**

```
GrantedKeys(person) = KeysFrom(running role holdings)           // club data
                    ∪ KeysImpliedBy(running membership)          // code constant
                    ∪ KeysImpliedBy(running group memberships)   // code constant, group-scoped
```

**The implied mapping is a code constant, not club data.** It is the anti-lockout floor: if the
club could edit what a membership implies, one mis-click locks every member out of the app
with no way back in — the same failure `EnsureAdminRoleIsHeldAsync` already exists to prevent.
It can become club data later without touching a single call site, precisely because every gate
is already `has(key)`.

**Nothing derived is ever stored.** A running membership supplies `club.read` at the moment
the question is asked. There is no member role, no affiliation flag, no membership row in
`RoleHoldings`.

**An Account with no running relationship resolves to the empty key set.** That is the
self-registered ticket buyer, and it needs no role, no onboarding step and no bookkeeping.

## Considered options

**Auto-assign a role when a Person is created** — a member role for every new member, a
website-user role for self-registration, a limited role for non-member group people.
Rejected on four counts:

- It is the stored flag `CONTEXT.md` bans. Affiliation is derived *at the moment it is asked*,
  from the relationships that are running. A member role is that flag in a costume, and two
  truths for one fact drift.
- There is no correct sync rule. A **membership pause is counted in whole sessions**; a **role
  holding is dated in days**. They do not share a time granularity, so every joining, leaving,
  rejoining and membership pause would need a parallel write that is wrong somewhere each season.
- **Roles are club data.** The club creates, renames and archives them. Archiving the
  member role would lock out every member — a system-critical role the club can edit is a
  footgun.
- It does not even solve the case that motivated it. Non-member group people hold a
  **group membership**: many-to-many, per-group, dated. A flat role cannot say *which* group, so
  the scoped gates would read the group membership anyway and both systems would be carried.

**Gate some surfaces on the relationship directly** (`if (isMember)`) and keep roles for
jobs. Rejected because it produces two gate shapes, so "who can see this" has two answers and
neither the rights matrix nor a future audit surface can show the whole picture.

## Consequences

- `GrantedKeysAsync` gains a second source. `IsAffiliatedAsync` stays, but as one input to the
  resolver rather than a parallel gate consulted by call sites.
- The permission-key constant set grows with keys nobody grants through the rights matrix
  (`club.read`). The rights matrix must show them as granted-by-relationship, not as unheld, or
  it will read as a bug.
- **Admin sees everything without a bypass.** The Admin role holds every key by construction
  (`BootstrapAdminSeeder` seeds `FurriaPermissions.All`), so it passes every gate. There is no
  `if (isAdmin) return true` anywhere — a hard bypass would contradict both `CONTEXT.md`'s "no
  built-in super-role" and CA-P1's decision W, which says keys the club removes from the Admin
  role are never re-granted.
- A group-scoped implied key needs a scoped check, so the resolver's group-membership source
  answers "for which group", not only "yes". Group admin already works this way.

## Amendment 2026-09-19 — the board is a fourth implying relationship

Shaping the club hub added the **board** as a recorded body: a Person holds a dated
**board seat** under a club-created **board office**. Every club has a board and
members ask who is on it, so the fact is worth storing — but it must not become the super-role
`CONTEXT.md` bans.

It does not, because it resolves through the mechanism this ADR already defines. The board may
name **one role every seat implies**, and each board office may name **one role it
implies**. A running seat therefore contributes those roles' keys the same way a running
membership contributes `club.read`:

> **Amended 2026-09-20 —** only the board office's role ships. The board-wide role every
> seat would imply was cut before CA-P4 wave 2: it had no home until *club management* exists,
> and inventing one was rejected. `BoardOffice.ImpliedRoleId?` is the resolver's single new
> source; read the line below as `KeysImpliedBy(running board seat)` = the office's role.

```
                    ∪ KeysImpliedBy(running board seat)          // club data: the named roles
```

Two things this deliberately is **not**:

- **Not an auto-assigned role.** No role holding row is written when a seat opens, and none is
  cleaned up when it closes — the rejected option above, rejected again for the same reasons. The
  keys appear and vanish with the seat because they were never stored.
- **Not a new key source.** The implied roles are ordinary club-created roles. Unlike the
  membership and group-membership mappings, **this one is club data**, not a code constant, and
  that is safe: naming no role is the harmless default, and no member's access depends on it.

Consequence for the resolver: a fourth source, resolving role → keys through the same path the
role-holding source already uses.
