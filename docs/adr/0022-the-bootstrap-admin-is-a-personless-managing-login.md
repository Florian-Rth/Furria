# The bootstrap admin is a personless managing login

ADR-0005 seeds one configured bootstrap admin so the first account can exist under invite-only
onboarding. Until now it was an ordinary account with a person of its own holding the seeded
*Admin* role: it showed in the register, in the counts and among the role's holders, it could
change or delete its own login, and once deleted it stayed gone while other accounts remained.
Person deletion (ADR-0021) made the last point urgent. Decided with Florian on 2026-10-07 while
starting L5b.

## The decision

**The bootstrap admin is a managing login: an account with no person, configured wholly by the
environment** (`Auth:BootstrapAdmin` — email and password).

- **It always exists.** Every start brings the one managing login in line with the environment —
  login email, password, enabled — and recreates it if it is gone. A changed email moves the same
  account; it never makes a second one.
- **It holds every key by itself**: `FurriaPermissions.All`, as a third source of
  `GrantedKeysAsync` beside roles and relationships — no role, no holding. It has no relationship,
  so no `club.read` and no affiliation: it manages, it does not take part.
- **Nothing in the app shows it.** Without a person it is in no register, count, picker, member
  list or role's holders. Where it acts on someone's record — an invitation, a disabling, an
  admission, a contact change — the actor stays empty and the act names nobody.
- **Its login is not editable in the app**: no login email change, no password change or reset,
  no passkeys, no *Account löschen*. Only the environment changes it; signing out stays.
- **The seeded *Admin* role stays** for the club to make admin-like persons: every start creates it
  when missing, restores it from the archive and grants it every key it lacks, so new keys reach
  its holders. Nobody holds it unless the club hands it out.
- **The former bootstrap admin's person is erased** on the first start: her account becomes the
  managing login, her person goes with every chain about her (ADR-0021).

## Considered options

- **Keep a person and hide it everywhere.** Rejected: every person query would have to remember
  the filter, and the one that forgets is the hint.
- **A new account per configured email.** Rejected: there is one managing login; it follows the
  environment.
- **A role holding as its source of keys.** Rejected: a holding needs a person, and the role's
  holders would show it.

## Consequences

- `Account.PersonId` is nullable for exactly the managing login; a check constraint allows no
  other personless account.
- Every write that records an actor takes an empty one. An actorless act reads without *von …* —
  the same as an act of a deleted person (ADR-0021).
- ADR-0011's "Admin sees everything without a bypass" still holds for persons: a person reaches
  every key only through the *Admin* role. The managing login's keys flow through
  `GrantedKeysAsync` like any other, so every gate keeps its one shape, `has(key)`.
- The app shows the managing login only what its keys open — Start and the club management — and
  never *nicht im Verein aktiv*, a profile or *Anmeldung & Sicherheit*.
- The `FirstName` and `LastName` settings of `Auth:BootstrapAdmin` retire.
