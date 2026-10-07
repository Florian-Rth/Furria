---
status: shaped 2026-10-07 — S1–S6 built 2026-10-07
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
   *archived by* — the reference goes null and the act names nobody: no *von …*, exactly as an
   act of the managing login (ruling 15; *gelöschte Person* was dropped the same day).
2. **`persons.delete` is a key of its own**, apart from `persons.manage`. It joins
   `FurriaPermissions.All`, so the seeded *Admin* role gains it on the next start. Alone it reaches
   the register and a person's screen (archived ones included), as `accounts.manage` does — no
   editing, archiving or inviting.
3. **Deletion is possible at any time**, whatever still runs; she need not be archived first.
4. **The confirmation names what still runs** — *Läuft noch: Mitgliedschaft · Vorstandssitz
   Kassenwart · Schlüssel Lager. Alles wird endgültig gelöscht.* — and the one deleting re-proves
   herself with her password or a passkey, exactly as *Account löschen*.
5. **A holder may delete herself.** No last-holder guard — the managing login always exists
   (ruling 15).
6. **The bootstrap seeder heals** — superseded by ruling 15: the bootstrap admin becomes the
   managing login, which every start brings back.
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
15. **The bootstrap admin is a personless managing login** (ruled when S1 started,
    [ADR-0022](../../docs/adr/0022-the-bootstrap-admin-is-a-personless-managing-login.md)): an
    account with no person, configured wholly by `Auth:BootstrapAdmin` (email, password). Every
    start brings the one managing login in line — login email, password, enabled — and recreates
    it when gone; a changed email moves the same account. It holds every key by itself, no
    relationship (no `club.read`, not affiliated), appears nowhere — register, counts, pickers,
    role holders — and its login is not editable in the app: no login email, password change or
    reset, passkeys or *Account löschen*; signing out stays. The app shows it Start and the club
    management only. The seeded *Admin* role stays, reconciled on every start (created, restored,
    every missing key granted) and held by nobody unless the club hands it out. On the first start
    the former bootstrap admin's account becomes the managing login and her person is erased with
    every chain (ruling 1).
16. **Restoring a group, role or board office lifts the archive** of everyone whose tie in it is
    not yet ended (ruled when S3 started): a tie in an archived group, role or office does not
    hold off archiving, so its restore is what makes it run again (ruling 12).
17. **An archived person's history is closed**: a membership write that would leave her an
    already-ended period — recording an old membership, correcting one that stays ended — is
    refused until she is restored, and so is every write of a membership pause or a fee
    reduction; a membership write leaving a period not yet ended lifts the archive (ruled when S3
    started, rulings 10, 12).

---

## Slices

| # | Slice | Note |
|---|---|---|
| S1 | **The key and the managing login** — `persons.delete` in `FurriaPermissions` and `All`; `GetPersons`, `GetPersonById`, `GetPersonAccessState` and the hub admit it; the web's `PERMISSION_KEYS`, `MANAGE_KEYS`, `PERSON_READ_KEYS` and rights-matrix copy (*Personen endgültig löschen* — *Eine Person mit allem, was der Verein über sie festgehalten hat, unwiderruflich löschen, auch wenn noch etwas läuft.*); `persons.manage`'s line gains *Personen archivieren und wiederherstellen.* The managing login (ruling 15): `Account.PersonId` nullable + `IsManagingLogin`, `ManagingLoginSeeder` (create, follow the configured email and password, re-enable, convert and erase the former bootstrap admin), every key in `PermissionAuthorizer`; every actor-recording write takes an empty actor; self-service login edits, passkeys, reset and claim-in refuse it; GetMe answers `person: null`; Start shows it its to-dos. The erasure migration moved here from S5: the chain FKs cascade, `Announcement.AuthorPersonId` is nullable, set null, and an actorless contact change, invitation, admission or announcement names nobody (ruling 1). Web: Start + Mehr only, no profile (`_personal` layout), a title header on Start, no *von …* on actorless lines (rulings 1, 2, 5, 15) | Backend + web; done 2026-10-07 |
| S2 | **What runs, on her screen** — `ManagedPersonDetails` gains her running group-admin tenures, board seats and key holdings, so the screen can name every blocker and every consequence (rulings 4, 10). Built as `UnendedGroupAdminTenures`, `UnendedBoardSeats`, `UnendedKeyHoldings` on `GetPersonById`: everything not yet ended — running today or dated to begin later, so a key handed out ahead never vanishes unseen — each with its since/until; tenures and seats in an archived group or office are left out (as for **active in the club**), a key counts whatever its venue's state. Ordered as the club orders them: groups by name, offices and venues by their sort order. The web reads them in S4 and S6 | Backend only; done 2026-10-07 |
| S3 | **Archiving, backend** — `Person.ArchivedOn` + `ArchivedByPersonId` (set null); `PutPersonArchived` (`persons.manage`) refusing with the running items named; every chain-opening write lifts the archive (membership, admission, group membership, group admin, role holding, board seat, key holding); `person-search` leaves archived persons out; the register excludes them unless filtered; admission matching and adoption keep them (rulings 10–13). Built as `PUT manage/persons/{personId}/archived` `{ isArchived }`, idempotent (archiving again keeps the first date and actor): what blocks is everything not yet ended — dated ahead included, as S2 lists it — named in the club's order in one 409 line, *Archivieren geht erst, wenn nichts mehr läuft. Läuft noch: Mitgliedschaft · Gruppe Tanzgarde · Rolle Kassenprüfung · Gruppen-Admin Jugendgarde · Vorstandssitz Kassenwart · Schlüssel Lager.* `GET manage/persons` takes `?archived=true` for the archived persons alone (an access filter narrows either view); the hub's person count leaves them out; `GetPersonById` carries `archive { archivedOn, archivedBy }`. Restores lift (ruling 16); ended membership, pause and fee-reduction writes on her are refused (ruling 17) | Backend only; done 2026-10-07 |
| S4 | **Archiving, web** — *Archivieren* / *Wiederherstellen* as the quiet line at the end of her screen (ADR-0016), the blocker list when refused, *Archiviert von … am …*, the *Archiviert* register filter (rulings 10–14) | Web only; done 2026-10-07. Built as the foot of her screen's side column for `persons.manage`: *Person archivieren* (danger line + confirm) when nothing runs; while something runs, the blocker line in its place, read from S2 the server's way (`toRunningTies`, shared with S6) — a racing 409 still lands in the dialog; when archived, *Wiederherstellen* as the new neutral `KkWriteScreen.Quiet`. The header carries *Archiviert von Anna am 7. Okt.* for every viewer (`toActLine`, shared with the contact-change line). The register's chip row gains *archiviert* (shown once anyone is, count follows the search, `?archived=true` in the URL so back returns to it; stats stay the default register's). Ruling 17 on the web: while archived no *+ Ermäßigung* / *+ Ruhezeit*, their rows open nothing, one pointer line says why; the membership editor refuses an ended period with that line and names the lift on a running one |
| S5 | **Deletion, backend** — the erasure migration landed in S1. `DeletePersonById` (`DELETE manage/persons/{personId}`, `persons.delete`) takes the re-proof as `DeleteMyAccount` does (`ReauthenticationProof`), queues the mail in the same transaction when she has an account, erases, logs IDs only. A still-valid access token of the erased account is refused (rulings 1, 3, 5, 7, 8) | Backend only; done 2026-10-07. Built as `PersonErasureService`: the deleter's password or passkey is proven by `ReauthenticationService` (pulled out of `AccountSecurityService`, so lockout and messages match *Account löschen*; a refusal is a 400 on `password` / `passkey`), the managing login proves with its configured password. One transaction drops every mail still queued for her, queues *Deine Daten wurden vom Verein gelöscht* to her login email (greeting, the club record's name, e-mail, phone and address; *Wende dich an den Verein* when it has none) and deletes her row — the S1 cascade takes every chain and her account, sessions included; an unknown or already erased person is a 404. One log line, `Person {PersonId} erased by person {ActorPersonId}` (null for the managing login). Her still-valid access token: `GetMe` now answers 401 for an account that no longer exists, as for a disabled one, so the app signs her out; every keyed endpoint was already 403. A schema test walks every cascade from `person` and fails on any foreign key on the way that neither cascades nor sets null (ADR-0021) |
| S6 | **Deletion, web** — *Person löschen*, the danger line at the end of her screen for `persons.delete`; the confirmation screen with the consequence line from S2 and the password / passkey proof reused from *Account löschen*; success lands on the register with the success strip; deleting herself signs her out; *archiviert von* names nobody once its actor is gone, like every other actor line since S1 (rulings 1, 3–5) | Web only; done 2026-10-07. Built as `PersonDeletionLine`, the last line of her screen for `persons.delete` — below the archive foot, or alone under the access panel for a holder without `persons.manage`. The *Account löschen* proof became the shared `useReauthentication` + `ReauthenticationProofFields` in `account-security` (password, passkey when the deleter has one). The dialog names what still runs (`toRunningTies`, shared with S4), *Alles wird endgültig gelöscht.*, and who is told: she is signed out and mailed when she has an account, told nothing without one. Success steps back to the register (its filter kept) with *Anna Schmidt ist gelöscht.* and drops every cached query; a 404 lands there too with *… war schon gelöscht.* Deleting herself ends the session onto the login screen with the new *person-erased* farewell. *Archiviert von* already names nobody through `toActLine`'s null actor |

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
