---
status: shaped 2026-09-25; S0 and S1 built 2026-09-25, S2–S11 planned
phase: CA-P8 — Accounts & invitations
shaped_with: Florian, grilling session 2026-09-25
binding: docs/adr/0005 (to be amended for passkeys), docs/adr/0011, docs/adr/0016,
  docs/adr/0018, docs/adr/0019, CONTEXT.md (account, account state, account eligibility,
  invitation, access recovery, contact details, club record)
---

# CA-P8 — Accounts & invitations

Every member surface CA-P1…P7 built can only be reached by the seeded bootstrap admin: the server
has login and refresh, and no way for anyone else to get an account. This phase lets the club
onboard its members, with one goal above all others: **the least possible work for the people
who run the club.**

**The club's only job is to keep the email in each person's contact details right. Everything
else is self-service.**

---

## What was ruled on 2026-09-25

1. **Self-request needs no approval** ([ADR-0018](../../docs/adr/0018-access-is-proven-by-the-inbox-recovered-in-person.md)).
   *Zugang anfordern* with the contact email on record mails an invitation there; controlling
   that inbox is the proof. The on-screen answer never reveals whether the address matched.
2. **Account eligibility is derived**: affiliated, no account, at or above the club's age of
   consent. **An unknown birth date** blocks self-request and bulk invitation; a holder of
   `accounts.manage` may invite her by hand, vouching for her age.
3. **Group admins do nothing with accounts.**
4. **Two rights.** `persons.manage` issues first invitations (mail, in person, bulk, reminder).
   The new `accounts.manage` does access recovery, disable/enable, and vouching for an unknown
   birth date. By default only the Admin role holds it.
5. **Login email ≠ contact email, linked from her side only.** It starts as a copy; her own
   change of login email updates the contact email (opt-out); a manager's edit of contact details
   never touches the login.
6. **A shared inbox is entitled for everyone it serves.** The request mail carries one link per
   eligible person; the first to redeem takes the address, the others choose their own login
   email, confirmed by code.
7. **Nothing is sent by the system on its own.** Invitations go out per person or through
   *Alle einladen*.
8. **Bulk invitation reaches the never-invited only**; *Erinnern* re-sends to open invitations.
   Both show their count before sending.
9. **One live invitation per person**, newest voids the previous. Mail link 14 days, in-person
   code 15 minutes.
10. **Password always, passkey optional**, built in this phase. .NET 10 Identity ships passkeys;
    the challenge state it keeps in a cookie has to be carried across our bearer-token API, and
    ADR-0005 is amended once that is built.
11. **Redemption is short**: name, login email, password → one skippable passkey offer → in the
    app. No tour, no checklist.
12. **She keeps her own contact details**: phone, address and contact email, each change showing
    who and when. Name and birth date stay with the club.
13. **An account outlives affiliation**: the keys fall away, the app shows *nicht im Verein aktiv*
    plus her profile, and rejoining lights it up again.
14. **Only she deletes her account**, after signing in again; her person stays with the club. The
    club only disables.
15. **Duplicates are adopted, not merged by hand** ([ADR-0019](../../docs/adr/0019-duplicate-persons-are-adopted-not-merged-by-hand.md)):
    the person editor offers to adopt a non-affiliated person with the same email, and redemption
    to an address that already has an account signs her in and moves that account onto the club's
    person.
16. **Plain SMTP.** No provider API, no bounce knowledge. Mailpit in development and tests.
17. **Links land on the club app's base URL, configured by environment** (the same value feeds the
    passkey domain). Android App Links in this phase; iOS universal links with the native shell's
    Phase B.
18. **Recovery in person only**: QR and short code on the manager's screen; the previous login
    email is told.
19. **Nothing is printed.** Two channels exist: mail link, and the in-person screen (QR plus a
    short typeable code, same 15 minutes).
20. **Security defaults**: a notice to the login email on every credential change (the old address
    for an email change), *Überall abmelden* without a device list, passwords of at least 10
    characters and no other rule, rate limits per IP and per address on every signed-out endpoint.
21. **The club gets its own record** — the club record, holding founded year and age of consent
    (default 16), written in club management. It closes P6's open *founded year* item.
22. **Managers see state, reason, history — never last sign-in.**

---

## The model

Four changes. Everything else — eligibility, account state, the reason she cannot be invited — is
**derived at the moment it is asked** and has no column.

**Club record** (`ClubRecord`, `Furria.Core/Club`) — exactly one row, seeded by migration.

| Field | Type | Rule |
|---|---|---|
| `FoundedYear` | `int?` | `>= 1800`, the same check `Group.FoundedYear` carries |
| `AgeOfConsent` | `int` | `12..21`, default `16` |

**Invitation** (`Invitation`, `Furria.Core/Identity`) — one row per token ever issued, never
deleted. It replaces the handoff's `invitation` table in `docs/design/FCC-Schema.txt`.

| Field | Type | Rule |
|---|---|---|
| `PersonId` | `int` | required |
| `Purpose` | `InvitationPurpose` | `Onboarding` · `Recovery` |
| `Channel` | `InvitationChannel` | `Mail` · `InPerson` · `Request` (her own) |
| `TokenHash` | `string` | SHA-256 of the link token; unique. The token itself is never stored |
| `CodeHash` | `string?` | the in-person short code's hash; `InPerson` only |
| `IssuedByPersonId` | `int?` | null for `Request` |
| `IssuedAt` · `ExpiresAt` | `DateTimeOffset` | 14 days for `Mail`/`Request`, 15 minutes for `InPerson` |
| `RedeemedAt` · `VoidedAt` | `DateTimeOffset?` | at most one set |
| `IsReminder` | `bool` | sent by *Erinnern* |

**One live invitation per person**: issuing voids every earlier row of that person that is
neither redeemed nor voided — expired ones included — in the same transaction, and a partial
unique index on `PersonId` where both `RedeemedAt` and `VoidedAt` are null makes a second live row
impossible. *Never invited* means no row with `Purpose = Onboarding` exists for the person.

**Account events** (`AccountEvent`, `Furria.Infrastructure/Identity`) — the history the *Zugang*
panel shows: `PersonId`, `Kind` (`Invited` · `Reminded` · `Redeemed` · `Recovered` · `Disabled` ·
`Enabled` · `Deleted` · `LoginEmailChanged`), `ActorPersonId?`, `At`. Written by the service that
performs the act, never derived after the fact. **No sign-in event exists** (ruling 22).

**Contact details** gain `ContactChangedAt` and `ContactChangedByPersonId` on `Person` — the last
change and who made it. Open question 2 decides whether it grows into a per-field history.

**Account** stays as it is (`PersonId`, `IsDisabled`, `LastSeenAnnouncementAt`), with two
consequences: its unique `PersonId` stays, but nothing may treat it as fixed (ADR-0019); and
Identity schema version 3 adds the passkey table (slice S7).

---

## Permissions

One new key, grantable through the rights matrix and added to `FurriaPermissions.All`.

| Key | Covers |
|---|---|
| `persons.manage` (existing) | first invitations — by mail, in person, bulk, reminder; the *Zugang* panel's read |
| `accounts.manage` (new) | access recovery, disable/enable, inviting a person with no birth date (the vouch). By default only the Admin role holds it — `BootstrapAdminSeeder` grants it with the rest |
| `club.manage` (existing) | the club record |

**`CanSearchPersonsAsync` learns `accounts.manage`** — the same lockout P5 found: a holder of only
that key must be able to find the person whose access she recovers.

**The manage hub's `RequireAnyPermission` learns `accounts.manage`.**

Signed-out endpoints carry no permission; they carry **rate limits** instead (ruling 20):
per IP, and per address or token where there is one.

---

## The page set

Agreed 2026-09-25. Concerns only; layout is decided when each page is built.

**Signed out**
1. **Login** — gains three ways on: *Zugang anfordern*, *Passwort vergessen*, *Code eingeben*.
2. **Request access** — email → neutral confirmation.
3. **Forgot password** — email → neutral confirmation.
4. **Enter code** — the in-person code.
5. **Redeem** — *Hallo Anna*, login email, password. Branches: a typed or changed email is
   confirmed by a mailed code; an address that already has an account asks her to sign in with it
   (claim-in, ADR-0019); a dead invitation offers a new request or tells her to ask the club.
6. **Passkey offer** — once, right after redemption.
7. **Set new password** — from the reset link.

**Signed in — her own**

8. **Profile → Anmeldung & Sicherheit** — login email, password, her passkeys, *Überall abmelden*,
   *Account löschen*.
9. **Profile → Kontaktdaten** — her own detail write.
10. **Nicht im Verein aktiv** — where an unaffiliated account lands; the profile stays reachable.

**Manager**

11. **Person screen → Zugang panel** — state, reason, history; *per Mail einladen*, *vor Ort
    zeigen*, *Zugang wiederherstellen*, *sperren/entsperren*, *Geburtsdatum bestätigen*, each gated
    by its permission.
12. **In-person screen** — QR, short code, countdown; flips live to *Anna ist drin* on redemption.
13. **Club management → Zugänge panel** — *62 von 80 haben Zugang*, *Alle einladen*, *Erinnern*,
    and the persons register filtered by account state.
14. **Person editor → adopt suggestion**.

Plus the club record's detail write in club management (founded year, age of consent).

---

## The slices

Twelve slices, each complete and shippable, each shipping a page **with** the endpoints it calls
— no endpoint before its caller, no dead route. Every backend behaviour is test-first (`/tdd`),
one test file per endpoint. **Gates run once, at the end of a slice** — never between its steps.

```bash
cd web    && pnpm lint && pnpm typecheck && pnpm test && pnpm build
cd server && dotnet csharpier format . && dotnet build && dotnet test
```

| # | Slice | Stacks | Depends on |
|---|---|---|---|
| **S0** | The club record | server + club-app | — |
| **S1** | Invite by mail, redeem by link — the tracer | server + club-app | — |
| **S2** | In person: QR, code, the typed login email | server + club-app | S1 |
| **S3** | Self-request and forgotten password | server + club-app | S2 |
| **S4** | Bulk invitation, reminder, the *Zugänge* panel | server + club-app | S1 |
| **S5** | `accounts.manage`: recovery, disable, the vouch | server + club-app | S2 |
| **S6** | Her sign-in and security | server + club-app | S2 |
| **S7** | Passkeys | server + club-app | S6 |
| **S8** | Her contact details, and *nicht im Verein aktiv* | server + club-app | S1 |
| **S9** | Duplicates: adopt and claim in | server + club-app | S2 |
| **S10** | Android App Links | club-app (native) + deploy | S1 |
| **S11** | The sweep | web | all |

S0 is independent of everything and can run in parallel from the start. Once S1 lands, S4, S8 and
S10 are independent of one another; once S2 lands, S3, S5, S6 and S9 are.

---

### S0 — the club record

**Goal.** The club has a record of its own, and club management writes it.

**Server**
- `ClubRecord` entity, configuration, migration seeding the single row (`FoundedYear = 1971`,
  `AgeOfConsent = 16` — 1971 is the handoff's year; Florian confirms it in the editor, not here).
- `ClubRecordService` — `GetAsync`, `UpdateAsync`.
- `GetClubRecord`, `PutClubRecord` — `club.manage`.
- `GetManageHub` gains a `ClubRecord` panel DTO for `club.manage` holders: founded year and age of
  consent as its summary line.

**Club-app**
- `features/manage-club-record` — a *Vereinsdaten* row on the manage hub, opening a detail write
  at `/manage/club-record/edit` (ADR-0016): *Gründungsjahr*, *Mindestalter für einen Zugang*, the
  consequence line for the age (*Wer jünger ist, kann nicht eingeladen werden*).

**Done when** `GetClubRecordTests` and `PutClubRecordTests` cover the read, the write, both range
checks and the permission; the hub test covers the new panel's presence and absence.

---

### S1 — invite by mail, redeem by link (the tracer)

**Goal.** A manager invites Anna from her person screen; Anna opens the mail, sets a password and
is in. The whole chain, end to end, on the narrowest path: invitation by mail, redemption with the
pre-filled login email.

**Server**
- **Mail foundation.** `MailService` over SMTP (`MailKit`, settings `Mail:Host/Port/User/
  Password/From` as options with the section name as a constant), templates as German plain text
  plus HTML built in code, sent from a background queue with retry so no request waits on SMTP.
  Every send is logged by template and person id — **never the address, never the token**
  (ADR-0017). `ClubApp:BaseUrl` is the option every link is built from (ruling 17).
- **Mailpit** joins `docker compose` for development and becomes a second Testcontainer in
  `ApiTestFixture`; `Tests.Common` gains a `MailpitInbox` that reads mails through Mailpit's HTTP
  API and polls with a timeout — tests read the real mail, extract the real link, redeem it. No
  mocks (ADR-0001).
- `Invitation`, `AccountEvent`, their configurations, the migration.
- `AccountAccessService` — eligibility and account state as one derived query per person (state,
  the reason she cannot be invited, the live invitation, the event history); issuing an
  invitation (voiding the previous one, writing the event, queueing the mail).
- `GetPersonById` gains an `access` block: state, reason, live invitation (channel, issued at,
  issued by, expires), history. `persons.manage` only — the block is absent for everyone else.
- `PostPersonInvitation` — `persons.manage`; refused with a conflict when she is not eligible,
  naming the reason.
- Signed out: `LookUpInvitation` (token in the body, never the URL path → first name, pre-filled
  login email, or *dead*) and `RedeemInvitation` (token, password → the account is created, the
  invitation redeemed, the event written, **session tokens returned** — she is signed in).
- Identity: `AddDefaultTokenProviders()`, which the existing `AddIdentityCore` lacks. Rate limits
  enter the API here with the two signed-out endpoints.

**Club-app**
- `features/account-access` — the *Zugang* panel on the person screen: the state, the reason, the
  history; *per Mail einladen* as an entry-shaped act with its consequence line (*Anna bekommt eine
  Mail an anna@web.de*). The success notice from P7's chassis.
- `features/redeem` — the public route `/invitation` reading the token from the fragment
  (`#token=…`, so it never reaches a server log or a referrer), *Hallo Anna*, the login email
  shown read-only, the password field with the right autofill hints, the *dead invitation*
  branch (for now: *wende dich an den Verein*). Redemption stores the session exactly as login
  does and lands in the app.
- Pure functions, tested: the access-state decision → which actions the panel offers.

**Done when** an integration test issues an invitation, reads it from Mailpit, redeems it and
calls `GetMe` with the returned token; `PostPersonInvitationTests` cover eligibility (each reason),
voiding the previous invitation and the permission; `RedeemInvitationTests` cover expired, voided,
redeemed, unknown and the happy path; `LookUpInvitationTests` never reveal anything for a dead
token beyond *dead*.

---

### S2 — in person, and the typed login email

**Goal.** At training, the manager shows a QR and a code; Anna scans or types it and chooses her
login email herself. Redemption becomes complete.

**Server**
- `PostPersonInvitationInPerson` — `persons.manage`; returns the link token and the short code
  (8 characters from an unambiguous alphabet, shown `K7M4-Q2XP`) once, never again; 15 minutes.
- `GetPersonAccessState` — the lightweight poll the in-person screen uses to flip.
- `RedeemInvitation` learns a **chosen login email**: when it differs from the contact email or
  the contact email is already someone's login, the first call returns *confirmation required*
  and mails a 6-digit code to the chosen address; the second call carries the code. A shared
  address that is already taken is refused as *taken* and she chooses another (ruling 6).
- `LookUpInvitation` accepts the short code in place of the token.

**Club-app**
- The in-person screen (`kind="fullscreen"`): QR, code, countdown; polls every two seconds while
  open and flips to *Anna ist drin*; *Neuer Code* when the countdown ends.
- `/login` gains *Code eingeben*; the code page normalises what she types
  (`k7m4 q2xp` → `K7M4-Q2XP`).
- Redeem: the login email becomes editable; the code step; the *taken* branch.
- Pure functions, tested: code normalisation, countdown formatting, the redeem step decision.

**Done when** the tests cover code redemption, code expiry, confirmation-code mismatch and expiry,
the taken branch, and that the code is returned by exactly one call.

---

### S3 — self-request and forgotten password

**Goal.** Nobody in the club has to do anything for a member whose email is on record.

**Server**
- `RequestAccess` — signed out; always `202`, whatever happened. When the address is the contact
  email of eligible persons with a known birth date, one invitation per person (`Channel =
  Request`) goes into **one** mail, one link per name (ruling 6). At most one mail per address per
  five minutes.
- `RequestPasswordReset` — signed out; always `202`; mails Identity's reset link to a login email.
- `ResetPassword` — token + new password; ends every session of the account (the refresh token
  families) and sends the credential-change notice (ruling 20).

**Club-app**
- `/login` gains *Zugang anfordern* and *Passwort vergessen*; both pages end on the same neutral
  confirmation. `/reset-password` reads its token from the fragment.
- The dead-invitation branch of redeem gains *Neue Einladung anfordern*.

**Done when** the tests prove the answer is byte-identical for a match, a miss, an ineligible
person and a person with no birth date; the shared-inbox mail carries one link per eligible
person; the per-address throttle holds; a reset ends existing sessions.

---

### S4 — bulk invitation, reminder, the *Zugänge* panel

**Goal.** Launch day is one tap, and so is every later round.

**Server**
- `GetManageHub` gains the `Accounts` panel for `persons.manage`: persons with access out of
  eligible-plus-active, open invitations, eligible persons without email.
- `GetBulkInvitationPreview` — how many *Alle einladen* and *Erinnern* would reach, and how many
  are eligible without email.
- `PostBulkInvitation` — every eligible, never-invited person with an email and a known birth
  date; `PostInvitationReminders` — every open, unredeemed `Mail` or `Request` invitation older
  than three days, re-issued with `IsReminder`. Both queue their mails and return the count sent.
- `GetPersons` gains an `access` filter (`none` · `invited` · `active` · `disabled` ·
  `not-invitable`).

**Club-app**
- The *Zugänge* panel on the manage hub; *Alle einladen* and *Erinnern* each confirm with their
  count first (*Einladung an 47 Personen senden*).
- The persons register gains the access filter, reachable from the panel.

**Done when** the tests prove a second bulk invitation sends nothing to anyone already invited,
reminders reach only open invitations, and the preview's counts equal what is then sent.

---

### S5 — `accounts.manage`: recovery, disable, the vouch

**Goal.** The rare, dangerous acts exist — behind their own key.

**Server**
- `FurriaPermissions.AccountsManage`, into `All`, into `CanSearchPersonsAsync`, into the manage
  hub's gate, granted by `BootstrapAdminSeeder`.
- `PostPersonAccessRecovery` — `accounts.manage`, in person only: a `Recovery` invitation with
  code and QR, 15 minutes. Redeeming it sets a new password (and optionally a new login email,
  confirmed by code) on the existing account, ends every session and **mails the previous login
  email** (ruling 18).
- `PutPersonAccountDisabled` — `accounts.manage`; disabling ends every session.
- `PostPersonInvitation` and `PostPersonInvitationInPerson` admit a person with no birth date
  when the caller holds `accounts.manage`.

**Club-app**
- The *Zugang* panel gains *Zugang wiederherstellen* (the in-person screen, recovery flavour),
  *sperren*/*entsperren* with `KkConfirmDialog`, and — for a person with no birth date — the
  invite actions with the vouch as the consequence line (*Du bestätigst, dass Anna mindestens 16
  ist*).
- Redeem learns the recovery flavour (*Neues Passwort für Anna*).

**Done when** the tests prove `persons.manage` alone cannot recover, disable or vouch; recovery
ends sessions and notifies the old address; a disabled account cannot sign in or refresh.

---

### S6 — her sign-in and security

**Goal.** Everything about her own login is hers.

**Server**
- `PutMyLoginEmail` (mails a code to the new address) and `ConfirmMyLoginEmail` (code; the
  contact email follows unless she opted out; notice to the old address).
- `PutMyPassword` (current + new; notice).
- `LogoutEverywhere` — revokes every refresh token family of the account.
- `DeleteMyAccount` — re-authentication by password (or passkey after S7); deletes the account,
  its refresh tokens and passkeys; the person stays; the event is written.

**Club-app**
- `/profile/security` — *Anmeldung & Sicherheit*: login email, password, *Überall abmelden*,
  *Account löschen* with its consequence line (*Deine Vereinsdaten bleiben beim Verein*).

**Done when** the tests cover each write, each notice, that deletion leaves the person and her
memberships intact, and that a deleted person can be invited again by hand but not by bulk.

---

### S7 — passkeys

**Goal.** *Mit Fingerabdruck anmelden*, on the web and in the Android app.

**Server**
- Identity schema version 3 and its migration; `IdentityPasskeyOptions.ServerDomain` from
  `ClubApp:BaseUrl`.
- The challenge state Identity keeps in a cookie is carried as a short-lived server-side challenge
  keyed by an opaque id the client echoes back (open question 1). ADR-0005 is amended here.
- `PostPasskeyCreationOptions`, `PostMyPasskey`, `DeleteMyPasskeyById` (signed in);
  `PostPasskeyRequestOptions`, `LoginWithPasskey` (signed out, rate-limited). `GetMe` gains her
  passkeys (name, added at). Adding one sends the notice.

**Club-app**
- The passkey offer after redemption (*Einrichten* / *Später*), the passkey list in
  *Anmeldung & Sicherheit*, *Mit Fingerabdruck anmelden* on `/login`.
- Android: WebAuthn enabled in the Capacitor WebView; `assetlinks.json` (S10) declares the
  credential-sharing relation as well as the link handling.

**Done when** the server tests cover attestation, assertion and challenge expiry; a device check
on Android signs in with a passkey created on the web.

---

### S8 — her contact details, and *nicht im Verein aktiv*

**Goal.** Members fix their own entries; a former member meets an honest screen.

**Server**
- `PutMyContactDetails` — phone, street, zip, city, contact email; writes `ContactChangedAt` and
  `ContactChangedByPersonId`. `PutPerson` writes them too, with the manager as the actor.
- `GetPersonById` shows the last change (*geändert von Anna am 3. Okt.*).

**Club-app**
- `/profile/contact/edit` — her detail write.
- `RequireAffiliation`'s copy is wrong for this case (*Dein Konto ist noch keiner Person im Verein
  zugeordnet* describes an account without a person, which cannot exist). It becomes the
  *nicht im Verein aktiv* state, with the profile reachable from it.

**Done when** the tests cover her write, the actor on both writes, and that her write never
touches her login email.

---

### S9 — duplicates: adopt and claim in

**Goal.** ADR-0019, both halves.

**Server**
- `GetPersonAdoptionCandidate` — `persons.manage`; by email, the non-affiliated person holding it.
- `RedeemInvitation` learns the claim-in: when the login email already belongs to an account of a
  non-affiliated person, the answer is *sign in with it*; the next call carries that account's
  password (or passkey), moves the account onto the invited person and absorbs the stray person
  in one transaction.

**Club-app**
- The person editor shows the adopt suggestion under the email field; adopting opens that
  person's screen instead of creating a second.
- Redeem gains the claim-in branch.

**Done when** the tests cover the move, the absorption, a wrong password leaving both persons
untouched, and that an affiliated person is never a candidate.

---

### S10 — Android App Links

**Goal.** A link in a mail opens the installed app.

- `/.well-known/assetlinks.json` served by the club app's deploy, generated from the configured
  host and the signing certificate's fingerprint.
- The manifest's intent filter with `autoVerify`, its host from the same configuration
  (`capacitor.config.ts` reads it at build time).
- `/invitation`, `/reset-password` and the confirmation links route inside the app.

**Done when** a device check opens an invitation link from Gmail straight into the app.

---

### S11 — the sweep

`pnpm shot` over every new page at 390 px, light and dark, including each redeem branch and the
in-person screen; the copy pass against ADR-0016's five button words; `CONTEXT.md` and this file's
*What was built*.

---

## Deliberately not in this phase

- **Public self-registration** for ticket buyers — its own phase with ticketing; this phase only
  makes sure the claim-in and adoption rules are in place for it.
- **Accepting a membership application** — CA-P10; it will issue an invitation through S1's `AccountAccessService`.
- **Start's to-do items** (open invitations, eligible persons without email) — CA-P9 defines the
  item contract; this phase exposes the derived state they will read.
- **iOS universal links** — the native shell's Phase B.
- **Printing, bounce handling, a device list, last sign-in** — ruled out, not deferred.

---

## Open

1. **The passkey challenge state over bearer tokens.** Decided that it is built; *how* it is
   carried — a short-lived server-side challenge keyed by an opaque id, most likely — is settled
   in S7 and recorded in the ADR-0005 amendment.
2. **Who and when on contact details.** S8 records the last change and its actor on the person.
   Whether the club wants a per-field history is Florian's; the ruling is only that it is visible.
3. **Password length.** Ruling 20 says *at least 10 characters*, but `AddIdentityCore` already
   requires **12**. Lowering an existing rule needs Florian's word; until then S1 keeps 12.
4. **The founded year's readers.** S0 gives it a home; the website keeps `FOUNDING_YEAR` until its
   API client (`plan/website/feature-api-client.md`, *building*) can read the club record.
