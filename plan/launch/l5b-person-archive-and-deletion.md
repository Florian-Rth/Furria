---
status: shaped 2026-10-07 — not started
phase: L5b — Person archive and deletion (plan/launch.md, between L5 and L6)
shaped_with: Florian, 2026-10-07 (grill-with-docs)
---

# L5b — Person archive and deletion

The board has entered real people since L1, and an erasure request can arrive any day; the register
also fills with former members and ticket buyers nobody needs to see. Person management gains
**archiving**, and a new key, `persons.delete`, gains **deletion** — the one exception to "ended,
never deleted" ([ADR-0021](../../docs/adr/0021-a-person-is-erased-never-anonymised.md)).
`CONTEXT.md` carries both terms: **Person deletion**, **Archived person**.

---

## What was ruled on 2026-10-07

1. **Deletion erases, never anonymises.** Her person and every chain about her go — memberships
   (with pauses and admissions), fee reductions, group memberships, group-admin tenures, role
   holdings, board seats, key holdings, attendance responses, her account with passkeys, logins,
   tokens, invitations, account events and to-do marks. Where she acted on someone else's record —
   announcement author, *admitted by*, *issued by*, *contact changed by*, account-event actor,
   *archived by* — the reference goes null and reads *gelöschte Person* (*von einer gelöschten
   Person* after "von").
2. **`persons.delete` is a key of its own**, apart from `persons.manage`. It joins
   `FurriaPermissions.All`, so the seeded *Admin* role gains it on the next start. Alone it reaches
   the register and a person's screen (archived ones included), as `accounts.manage` does — no
   editing, archiving or inviting.
3. **Deletion is possible at any time**, whatever still runs; she need not be archived first.
4. **The confirmation names what still runs** — *Läuft noch: Mitgliedschaft · Vorstandssitz
   Kassenwart · Schlüssel Lager. Alles wird endgültig gelöscht.* — and the one deleting re-proves
   herself with her password or a passkey, exactly as *Account löschen*.
5. **A holder may delete herself.** No last-holder guard.
6. **The bootstrap seeder heals**: it recreates the configured person and account whenever the
   configured email has no account — today it does so only while no account exists at all
   (`BootstrapAdminSeeder.EnsureBootstrapAccountAsync`, the `Users.AnyAsync` early return).
7. **She is told if she has an account**: one outbox mail to her login email, *Deine Daten wurden
   vom Verein gelöscht*, with the club record's contact; her sessions end. A person without an
   account is told nothing.
8. **No trace in the app.** One operational log line carrying only the two person IDs (ADR-0017).
9. **Money records the law obliges the club to keep are spared** — none exist yet; the ledger
   inherits the rule.
10. **Archiving needs nothing running**: she is not **active in the club** and holds no running key
    holding. Archiving ends nothing; a refusal names what still runs.
11. **Archived means out of the default register and every chain-opening picker**
    (`person-search`); admission matching and the adoption candidate still find her.
12. **Archived and running exclude each other**: every write that opens a chain on her lifts the
    archive; *Wiederherstellen* on her screen lifts it by hand. Her account is untouched.
13. **Archiving records date and actor** — *Archiviert von Anna am 7. Okt.*; only the latest,
    cleared on restore.
14. **One person at a time**, on her own screen. No bulk action, no to-do.

---

## Slices

| # | Slice | Note |
|---|---|---|
| S1 | **The key and the seeder** — `persons.delete` in `FurriaPermissions` and `All`; `GetPersons`, `GetPersonById` and `GetPersonAccessState` admit it; the web's `PERMISSION_KEYS` and rights-matrix copy (*Personen endgültig löschen* — *Eine Person mit allem, was der Verein über sie festgehalten hat, unwiderruflich löschen, auch wenn noch etwas läuft.*); `persons.manage`'s line gains *Personen archivieren und wiederherstellen.*; the seeder recreates the bootstrap admin whenever its email has no account (rulings 2, 5, 6) | Backend + web |
| S2 | **What runs, on her screen** — `ManagedPersonDetails` gains her running group-admin tenures, board seats and key holdings, so the screen can name every blocker and every consequence (rulings 4, 10) | Feeds S3–S6 |
| S3 | **Archiving, backend** — `Person.ArchivedOn` + `ArchivedByPersonId` (set null); `PutPersonArchived` (`persons.manage`) refusing with the running items named; every chain-opening write lifts the archive (membership, admission, group membership, group admin, role holding, board seat, key holding); `person-search` leaves archived persons out; the register excludes them unless filtered; admission matching and adoption keep them (rulings 10–13) | One test file per endpoint; each chain write gets a "lifts the archive" case |
| S4 | **Archiving, web** — *Archivieren* / *Wiederherstellen* as the quiet line at the end of her screen (ADR-0016), the blocker list when refused, *Archiviert von … am …*, the *Archiviert* register filter (rulings 10–14) | |
| S5 | **Deletion, backend** — migration: the chain FKs move from restrict to cascade (membership, fee reduction, group membership, group admin, role holding, board seat, key holding, attendance response); `Announcement.AuthorPersonId` becomes nullable, set null. `DeletePersonById` (`DELETE manage/persons/{personId}`, `persons.delete`) takes the re-proof as `DeleteMyAccount` does (`ReauthenticationProof`), queues the mail in the same transaction when she has an account, erases, logs IDs only. A still-valid access token of the erased account is refused (rulings 1, 3, 5, 7, 8) | Prove every chain and actor reference with a seeded person holding one of each |
| S6 | **Deletion, web** — *Person löschen*, the danger line at the end of her screen for `persons.delete`; the confirmation screen with the consequence line from S2 and the password / passkey proof reused from *Account löschen*; success lands on the register with the success strip; deleting herself signs her out; *gelöschte Person* wherever an actor renders — contact change line, access history, admission, announcement author, *archiviert von* (rulings 1, 3–5) | |

**L5b is done when** S1–S6 are merged on a green `main`, an archived person is gone from the
register's default view and every picker, and erasing a person holding one of everything leaves no
row naming her.

---

## For later phases

- **Ledger** — its rows are the first a person's deletion spares: they keep her until their
  statutory retention ends (ruling 9, ADR-0021).
- **L8** — the privacy policy names erasure on request and that erased data lives in backups until
  they rotate.
- **Backups** (deferred out of L1) — their rotation period is what the privacy policy promises.
- **Every new chain or actor reference** to a person picks cascade or set null — ADR-0021 allows no
  third.
