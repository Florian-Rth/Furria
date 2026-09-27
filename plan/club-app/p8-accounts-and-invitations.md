---
status: built 2026-09-25/27 — S0–S11; device checks for S7 and S10 outstanding
phase: CA-P8 — Accounts & invitations
shaped_with: Florian, grilling session 2026-09-25
binding: docs/adr/0005 (amended for passkeys), docs/adr/0011, docs/adr/0016,
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
    for an email change), *Überall abmelden* without a device list, passwords of at least 8
    characters and no composition rule (Florian, 2026-09-27: the club has many older members;
    settles open question 3),
    rate limits per IP and per address on every signed-out endpoint.
21. **The club gets its own record** — the club record, holding founded year and age of consent
    (default 16), written in club management. It closes P6's open *founded year* item.
22. **Managers see state, reason, history — never last sign-in.**

Ruled on 2026-09-27 (Florian):

23. **No email does not mean no invitation.** A missing contact email refuses the mail channel
    only; the in-person invitation reaches her, and she types her own login email while redeeming
    (ADR-0018). Mail invitation, *Alle einladen*, *Erinnern* and *Zugang anfordern* still skip her.
24. **Contact changes keep only the latest change and its actor** — no per-field history
    (settles open question 2).
25. **A stray person holding any club data, past memberships included, refuses claim-in as
    *taken*.** Her history is never absorbed (settles open question 5).

---

## The model

Four changes. Everything else — eligibility, account state, the reason she cannot be invited — is
**derived at the moment it is asked** and has no column.

**Club record** (`ClubRecord`, `Furria.Core/Club`) — at most one row (`TheOnlyId`), created by
its first write and never seeded; until then every read sees the defaults. Built wider than
shaped (S0): three sections, each its own detail write.

| Field | Type | Rule |
|---|---|---|
| `Name` · `ShortName` | `string?` | *Name & Gründung* |
| `FoundedYear` | `int?` | `>= 1800` and not in the future |
| `Street` · `Zip` · `City` · `Email` · `Phone` · `WebsiteUrl` · `InstagramUrl` · `FacebookUrl` | `string?` | *Anschrift & Kontakt* |
| `AgeOfConsent` | `int` | `12..21`, default `16` — *Zugang zur App* |

**Invitation** (`Invitation`, `Furria.Core/Identity`) — one row per token ever issued, never
deleted. It replaces the handoff's `invitation` table in `docs/design/FCC-Schema.txt`.

| Field | Type | Rule |
|---|---|---|
| `PersonId` | `int` | required |
| `Purpose` | `InvitationPurpose` | `Onboarding` · `Recovery` |
| `Channel` | `InvitationChannel` | `Mail` · `InPerson` · `Request` (her own) |
| `TokenHash` | `string` | SHA-256 of the link token; unique. The token itself is never stored |
| `CodeHash` | `string?` | the in-person short code's hash; `InPerson` only |
| `IssuedByPersonId` | `int?` | null for `Request`; a reminder records the manager who sent it, even when it re-issues a `Request` invitation. `SetNull` when that person is deleted |
| `IssuedAt` · `ExpiresAt` | `DateTimeOffset` | 14 days for `Mail`/`Request`, 15 minutes for `InPerson` |
| `RedeemedAt` · `VoidedAt` | `DateTimeOffset?` | at most one set |
| `IsReminder` | `bool` | sent by *Erinnern* |

**One live invitation per person**: issuing voids every earlier row of that person that is
neither redeemed nor voided — expired ones included — in the same transaction, and a partial
unique index on `PersonId` where both `RedeemedAt` and `VoidedAt` are null makes a second live row
impossible. *Never invited* means no row with `Purpose = Onboarding` exists for the person.
An **offene Einladung** is a live `Onboarding` row — neither redeemed nor voided, **expired or
not** — of a person without an account.

**Email confirmation** (`EmailConfirmation`, `Furria.Infrastructure/Identity`) — the
*Bestätigungscode* that proves she controls a login email she chose (S2).

| Field | Type | Rule |
|---|---|---|
| `Purpose` | `EmailConfirmationPurpose` | `InvitationRedemption` · `LoginEmailChange` (S6) |
| `InvitationId` | `int?` | the invitation being redeemed; cascade on delete; `InvitationRedemption` only |
| `AccountId` | `int?` | the account changing its login email; cascade on delete; `LoginEmailChange` only |
| `Email` | `string?` | the address as she typed it |
| `NormalizedEmail` | `string` | the address the code was mailed to |
| `UpdatesContactEmail` | `bool` | the contact email follows when the code is confirmed (ruling 5) — her own change and a recovery's |
| `CodeHash` | `string` | hash of the 6-digit code; the code itself is never stored |
| `IssuedAt` · `ExpiresAt` | `DateTimeOffset` | 15 minutes |
| `FailedAttempts` | `int` | dead at 5 |
| `ConsumedAt` · `VoidedAt` | `DateTimeOffset?` | at most one set; one live row per purpose, invitation and account (a unique index `NULLS NOT DISTINCT`); three check constraints tie each subject column to its purpose |

**Account events** (`AccountEvent`, `Furria.Infrastructure/Identity`) — the history the *Zugang*
panel shows: `PersonId`, `Kind` (`Invited` · `Reminded` · `Redeemed` · `Recovered` · `Disabled` ·
`Enabled` · `Deleted` · `LoginEmailChanged` · `RecoveryIssued`), `ActorPersonId?`, `At`. The kind
is stored as a string, so a new kind needs no migration. Written by the service that
performs the act, never derived after the fact. **No sign-in event exists** (ruling 22).

**Contact details** gain `ContactChangedAt` and `ContactChangedByPersonId` on `Person` — the last
change and who made it. The foreign key is `SetNull`, like `Invitation.IssuedBy`: deleting the
person who made a change (S9's absorption of a stray person) must never be blocked by it, and a
change whose actor is gone reads as no change. It stays the latest change only — no per-field
history (ruling 24).

**Account** stays as it is (`PersonId`, `IsDisabled`, `LastSeenAnnouncementAt`), with two
consequences: its unique `PersonId` stays, but nothing may treat it as fixed (ADR-0019); and
Identity schema version 3 adds the passkey table (slice S7).

**Data-protection keys** (`data_protection_keys`, migration `DataProtectionKeys`) are
infrastructure, not model: ASP.NET's key ring, persisted through `PersistKeysToDbContext` under
the application name `Furria`, so Identity's reset tokens survive a restart. The test reset
leaves the table alone.

---

## Permissions

One new key, grantable through the rights matrix and added to `FurriaPermissions.All`.

| Key | Covers |
|---|---|
| `persons.manage` (existing) | first invitations — by mail, in person, bulk, reminder; the *Zugang* panel's read |
| `accounts.manage` (new) | access recovery, disable/enable, inviting a person with no birth date (the vouch); reading the persons register, the person and her *Zugang* panel, so she can reach whom she recovers. By default only the Admin role holds it — `BootstrapAdminSeeder` grants it with the rest |
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

**What was built — 2026-09-25**
- The record grew to the club's whole self-description (model above, `CONTEXT.md` *club record*):
  `GET manage/club-record` and one write per section — `PUT manage/club-record/identity` (name,
  short name, founded year), `PUT manage/club-record/contact` (address, email, phone, links) and
  `PUT manage/club-record/access` (age of consent), all `club.manage`, one test file each.
- No migration seed (project rule): the row is created by its first write, reads fall back to
  the defaults. 1971 is not written anywhere; Florian enters it in the editor.
- `GetManageHub`'s `clubRecord` panel carries `name` and `missingFactCount` (name, founded year,
  full address, email), shown as *4 Angaben fehlen*.
- Club-app: `/manage/club-record` with the sections *Name & Gründung*, *Anschrift & Kontakt* and
  *Zugang zur App*, each opening its detail write at `/manage/club-record/{identity,contact,access}`;
  the age carries the consequence line *Wer jünger ist, kann nicht eingeladen werden*.

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

**What was built — 2026-09-25**
- Mail: `MailService` over MailKit (`Mail:Host/Port/User/Password/From`), German plain text plus
  HTML per template, sent by `MailDispatcher` from `MailQueue` with retry; every send is logged
  by template and person id only. Links are built from `ClubApp:BaseUrl`.
- `POST manage/persons/{id}/invitations` (`persons.manage`) → `{expiresAt}`, `409` naming the
  reason (not affiliated, no birth date, under age, no email) or that she already has an
  account. *Amended 2026-09-27 (ruling 23):* the missing email is a refusal of the mail channel
  only; `AccountIneligibilityReason` lost `NoEmail`, and `AccountEligibility.CanBeMailed` is the
  mail channel's own check.
- Signed out: `POST auth/invitations/lookup {token}` → `status` `live` (first name, login email)
  or `dead`, nothing more; `POST auth/invitations/redeem {token, password}` → the session. Both are
  rate-limited per IP and per token (`InvitationTokenRateLimiter`).
- `GetPersonById` gains the `access` block (state, reason, live invitation with channel, issuer,
  issued and expiry, history), absent without the right. `AccountEvent` history reads *Eingeladen*,
  *Zugang eingerichtet* and so on, each with its actor.
- Club-app: the *Zugang* panel on the person screen (*Einladen* / *Erneut einladen* pill, state,
  invitation, *Verlauf*), the entry-shaped `/manage/persons/$personId/invitations/new` (*Per Mail
  einladen*, *Anna bekommt eine Mail an …*), and `/invitation` reading `#token=`.

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

**What was built — 2026-09-26**
- `POST manage/persons/{id}/invitations/in-person` → `{link, code, expiresAt}`, returned once;
  `GET manage/persons/{id}/access-state` → `{state}`, the screen's poll.
- `auth/invitations/lookup` and `auth/invitations/redeem` take `token` **or** `code`. Lookup
  returns `contactEmailTaken`, so the redeem page opens with an empty login email when the
  contact email is already someone's login.
- The redeem response is an outcome union: `redeemed` (with the session) or
  `confirmationRequired` (with the code's expiry). *Taken*, a wrong code and a dead code are
  refusals on the field they concern.
- `EmailConfirmation` (model above): 6-digit code, 15 minutes, 5 attempts. The mail's subject
  comes from a per-purpose factory (`EmailConfirmationSubject`) — the seam S6 reuses for the
  login-email change.
- **The taken check comes first**, before any confirmation code is mailed. It is the point S9
  branches into the claim-in.
- Club-app: `/invitation/code` (*Code eingeben*) and the QR's `#code=` fragment, both landing on
  the same redeem flow; the in-person screen at `/manage/persons/{id}/invitations/in-person`.
  `KkQrCode` in `@furria/ui`, drawn over `uqr`.
- Tests run with 10 permits per invitation token (`ApiTestFixture.PermitsPerInvitationToken`).
- *Added 2026-09-27 (ruling 23):* the in-person invitation reaches a person without a contact
  email. Lookup answers `loginEmail: null`, so she types one; redeem refuses a missing one on
  `loginEmail` and always confirms the typed address by code (there is nothing to match). On
  redemption her empty contact email becomes that confirmed login email, written through
  `PersonService` with her as actor (S8's stamp). A claim-in keeps the claimed account's login
  and fills nothing.

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

**What was built — 2026-09-26**
- `POST auth/access/request {email}` → `202`, empty, always. `POST auth/password/request-reset
  {email}` → `202`, always. `POST auth/password/reset {reset, password}` → `204`; a dead or
  unknown `reset` is one neutral refusal on `reset`, a weak password one on `password`.
- The mail work leaves the request path: `SignedOutMailRequestQueue` and its worker handle both
  requests one at a time, so the answer's timing reveals nothing either.
- The self-request throttle lives in the database: one mail per address per five minutes,
  counting the non-reminder `Request` invitations of **every** person at that address. The reset
  throttle is in memory, five minutes per login email. Both endpoints also carry the per-address
  limiter (5 per 15 minutes) and the per-IP one.
- The reset link carries one opaque blob (account id and Identity's token, base64url) in the
  fragment; it lives one hour. A reset clears the lockout, ends every session and sends the
  `PasswordReset` notice. **It does not sign her in**: the page signs out locally and lands on
  `/login?passwordReset=1`.
- Identity's tokens are protected by data-protection keys persisted in the database (model
  above), so a reset link survives a restart.
- Club-app: `/request-access`, `/forgot-password`, `/reset-password` (`#reset=`). The login's ways
  on are *Zugang anfordern*, *Code eingeben* and *Passwort vergessen*; the old help note is gone.
  The dead invitation offers *Neue Einladung anfordern*. `apiFetch` reads `202` like `204`.

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

**What was built — 2026-09-26**
- `GET manage/invitations/preview` → `{inviteCount, remindCount, eligibleWithoutEmailCount}`;
  `POST manage/invitations/bulk` and `POST manage/invitations/reminders` → `{sentCount}`.
- `GetManageHub` gains the `accounts` block: `withAccessCount` (affiliated, enabled account),
  `ofCount` (that plus the eligible without account), `openInvitationCount`,
  `eligibleWithoutEmailCount`.
- `GetPersons?access=` takes `none` · `invited` · `active` · `disabled` · `not-invitable` — one
  per access state, every person in exactly one — and `with-access` · `open-invitation` ·
  `without-email`, the sets the hub counts.
- **Every hub count equals the list it links to.** The hub counts and the filters read the same
  `AccessQuery` sets; `GetManageHubTests` pins it over a club holding every case.
- An *offene Einladung* includes an expired one: it was issued and never answered, which is
  exactly who *Erinnern* is for. An `InPerson` invitation is never reminded.
- A reminder records the manager as its issuer, even when it re-issues a `Request` invitation.
- **The five state filters are a partition**: account state first, then an unexpired live
  invitation, then eligibility. `not-invitable` leaves out a person with an unexpired live
  invitation, so a vouched, invited person without a birth date is `invited` only (fixed in the
  wave-2 integration; `GetPersonsTests` proves every person falls in exactly one).
- *Amended 2026-09-27:* the five state filters read one derived expression,
  `AccessQuery.AccessStateOn` (`RegisterAccessState`: `none` · `invited` · `active` · `disabled` ·
  `notInvitable`), and every `GetPersons` row carries it as `accessState` in the same query. While
  an access filter is on, the register row shows that state in place of the membership chip:
  *kein Zugang*, *eingeladen*, *Account aktiv*, *gesperrt*, *nicht einladbar*. It replaces rather
  than joins the membership chip — at 390 px a second chip beside the withheld one crowds the
  name, and the filter note already says the list is about access.
- *Amended 2026-09-27 (ruling 23):* a person without email is eligible, so she files under `none`
  (or `invited`), never `not-invitable`. `without-email` — the eligible without account and
  without email — now means *only invitable in person*: filter note *ohne E-Mail-Adresse, nur vor
  Ort einladbar*, hub row *3 Personen – nur vor Ort einladbar*, round dialog *3 Personen – nur vor
  Ort*. `ofCount` counts her as invitable. *Alle einladen* and *Erinnern* select through
  `EligibleForMailWithoutAccount`.

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

**What was built — 2026-09-26**
- `POST manage/persons/{id}/access-recovery` (`accounts.manage`) → `{link, code, expiresAt}`,
  shown once; `409` when she has no account or it is disabled. It writes `RecoveryIssued`
  (*Wiederherstellung gestartet*) with the manager as actor.
- `PUT manage/persons/{id}/account/disabled {isDisabled}` → `204`, idempotent. **Self-disable is
  refused** (`409`). Disabling ends every session and **voids a live recovery**; enabling restores
  nothing. Access tokens (15 minutes) are not re-checked per request; the permission gates, `me`
  and refresh refuse a disabled account.
- Lookup gains `purpose` (`onboarding` · `recovery`, null when dead); a recovery pre-fills her
  current login email and is never claimable.
- Recovery redemption: a new password (a missing one is refused on `password`), the lockout
  cleared, optionally a new login email confirmed by code — **the contact email follows unless she
  opts out** (`updateContactEmail`, carried on the confirmation and written through
  `PersonService` with her as actor, ruling 5; migration `RecoveryContactEmailFollow` drops S6's
  check that allowed the flag on a login-email change only). Every session ends, `Recovered` (and
  `LoginEmailChanged`) is written, the `AccessRecovered` notice goes to the **previous** login
  email, and she is signed in.
- `GetPersonById`'s access block gains `rights {canInvite, canManageAccount}` and
  `ageOfConsent`; the access-state poll gains `isRecoveryOpen`.
- The vouch: `InvitationIssuer {PersonId, VouchesForAge}`. **The vouch is recorded as the
  `Invited` event's actor**, and **redemption does not re-check a vouched birth date**.
- **A holder of only `accounts.manage` reaches the person**: `GetPersons`, `GetPersonById` and
  `GetPersonAccessState` admit `persons.manage` or `accounts.manage`, and writes of the person stay
  `persons.manage`. The hub shows her the persons panel, and the person screen shows her the
  *Zugang* panel alone.
- Club-app: the in-person screen takes a purpose; `/manage/persons/$personId/access-recovery`;
  *sperren* (danger line) and *entsperren* (quiet) behind `KkConfirmDialog`; the vouch line *Du
  bestätigst, dass Anna mindestens 16 ist.*; redeem's recovery heading *NEUES PASSWORT FÜR ANNA*;
  the rights-matrix copy *Zugänge wiederherstellen und sperren*.

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

**What was built — 2026-09-26**
- `PUT auth/me/login-email {loginEmail, updateContactEmail = true}` → `200
  {confirmationExpiresAt}`; `409` taken, `400` her own address, `403` disabled, `429` past five
  codes per account in 15 minutes (`AccountRateLimiter`, `RateLimits:Account`).
- `POST auth/me/login-email/confirmation {code}` → `204`; `400` on `code`; `409` when the address
  was taken meanwhile. It sets `Email` and `UserName`, writes `LoginEmailChanged` (her), lets the
  contact email follow through `PersonService` (S8's stamp) unless she opted out, and tells the old
  address. Her sessions stay.
- `PUT auth/me/password {currentPassword, newPassword}` → `200` with a fresh session: **the change
  ends every session, this device's included, and returns a new one** — the refresh family is not
  in the access token.
- `POST auth/me/logout-everywhere` → `204`, this device included.
- `DELETE auth/me {password}` → `204`. Re-authentication runs through `CheckPasswordSignInAsync`
  with the login's lockout. It voids her live invitations, writes `Deleted` (her) and deletes the
  account with its tokens; her person and memberships stay. She reads *no access*; bulk invitation
  skips her (she was invited before), a manager can invite her by hand.
- `EmailConfirmation` gains the account subject (model above); migration
  `LoginEmailChangeConfirmations`. S7's seam: `ReauthenticationProof {Password}` on
  `DeleteAccountCommand`.
- `BootstrapAdminSeeder` creates the bootstrap account **only while no account exists at all**,
  so an admin who deleted hers or changed her login email is not resurrected; it still
  reconciles the Admin role's keys on every start.
- Club-app: `/profile/security` (*Anmeldung & Sicherheit*), `/profile/security/login-email` (two
  steps, *Kontakt-E-Mail ebenfalls ändern*), `/profile/security/password`; *Account löschen* is a
  danger `KkConfirmDialog` asking for the password and lands on `/login?farewell=account-deleted`.
  `KkCheckboxRow` joins `@furria/ui`.

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

**What was built — 2026-09-26**
- Identity schema version 3 (`account_passkey`) and `passkey_challenge`; migration `Passkeys`.
  The ceremonies run through `IPasskeyHandler<Account>`, never the cookie-bound `SignInManager`
  passkey methods (ADR-0005 amendment, open question 1 settled).
- `POST auth/me/passkeys/creation-options` → `{challengeId, options}`; `POST auth/me/passkeys
  {challengeId, credential, name?}` → `{id, name, addedAt}`, `400` on a dead challenge or a failed
  attestation, notice mail; `DELETE auth/me/passkeys/{passkeyId}` → `204`, `404` for a passkey not
  hers, notice mail. Signed out, both per IP: `POST auth/passkeys/request-options` → `{challengeId,
  options}`; `POST auth/login/passkey {challengeId, credential}` → the session, one identical
  `401` for every refusal. `GetMe` gains `passkeys` (`id`, `name`, `addedAt`).
- A challenge lives 5 minutes, is single use (the first presentation deletes it), carries its
  purpose and, for a creation, its account; expired rows are deleted on the next issue.
- The relying party is the host of `ClubApp:BaseUrl`; resident key and user verification are
  required. Accepted origins: the `ClubApp:BaseUrl` origin and `android:apk-key-hash:…` for every
  entry of `ClubApp:AndroidCertFingerprints` (an array, or one comma-separated string, so
  `ANDROID_CERT_FINGERPRINTS` feeds the API and the club-app deploy alike). Cross-origin ceremonies
  are refused.
- A name left out becomes *Passkey vom 26. Sep. 2026*. **The password lockout never blocks a
  passkey**: a user-verified passkey is not guessable, so a locked-out account still signs in,
  re-authenticates and claims in by passkey; a disabled one never does (lead ruling).
- `DELETE auth/me` takes `{password}` or `{passkey: {challengeId, credential}}`; the assertion must
  be a passkey of the signed-in account, refused on `passkey`. Redeem's claim-in takes
  `claimPasskey` beside `claimPassword` (S9).
- Club-app: *Mit Fingerabdruck anmelden* on `/login`; the one passkey offer after redemption
  (*Einrichten* / *Später*), skipped after a claim-in by passkey; the *Passkeys* panel in
  *Anmeldung & Sicherheit* with *Passkey hinzufügen* and `/profile/security/passkeys/$passkeyId`
  (*Passkey entfernen*); *Mit Passkey bestätigen* when deleting the account; *Mit Fingerabdruck
  bestätigen* on the claim step. Everything passkey hides where WebAuthn is unavailable.
- Android: `MainActivity` turns on `WEB_AUTHENTICATION_SUPPORT_FOR_APP` in the Capacitor WebView
  (`androidx.webkit`); `assetlinks.json` (S10) declares `get_login_creds`.
- Device check outstanding: Android signs in with a passkey created on the web.

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

**What was built — 2026-09-26**
- `PUT auth/me/contact-details` — phone, street, zip, city, contact email.
- The stamp is written **only on an actual change** of one of those five, by her write or by
  `PutPerson`; saving unchanged values leaves the previous stamp.
- `contactChange` (`at`, `changedBy`) on `GetPersonById` and `GetMe`, shown as *Kontaktdaten
  geändert von Anna am 3. Okt.* — *von dir* when she made it.
- Club-app: `/profile/contact/edit`. *Nicht im Verein aktiv* replaces `RequireAffiliation`'s copy
  on the `_affiliated` routes and on `/`, with the profile reachable; rejoining shows on the next
  `me` fetch.
- Open question 2 settled 2026-09-27: the latest change with its actor is enough (ruling 24).

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

**What was built — 2026-09-26**
- `GET manage/persons/adoption-candidate?email=` (`persons.manage`) → `{personId, firstName,
  lastName, hasAccount}`, `404` without one, `400` for a malformed address. Only a non-affiliated
  person is a candidate; of several, the newest `UpdatedAt` wins, then the highest id. **Adopting
  opens that person; nothing is written** (ADR-0019's reading confirmed).
- Redeem gains `claimPassword`, and with S7 `claimPasskey {challengeId, credential}` as its
  alternative (at most one of the two, refused on `claimPasskey`); `password` may be left out only
  together with a claim. A claim passkey must assert the claimable account itself, or it is
  refused on `claimPasskey` with both persons untouched. A login email
  that belongs to a **claimable** account answers `claimRequired`; a wrong claim password is
  refused on `claimPassword` with the login's lockout; a non-claimable one stays `409` *taken*.
  Lookup gains `claimableLoginEmail`. A recovery never offers claim-in.
- Claimable: the login email matches, the account is not disabled, its person is not affiliated
  and **holds no club data** — any club data, past memberships included, refuses the claim as
  *taken*; her history is never absorbed (ruling 25).
- The claim is one transaction: the invitation redeemed, the stray person absorbed
  (`StrayPersonAbsorption` moves the account, voids and repoints her invitations, repoints
  `issued_by`, her account events and the contact stamps she left on others, and deletes her
  last), `Redeemed` written, every session ended, a session returned. **A claimed account keeps
  its login email and password.**
- Club-app: the person editor's adopt suggestion under the email field (400 ms debounce, create
  only, *Diese Person übernehmen* opens her screen); redeem's claim step.

---

### S10 — Android App Links

**Goal.** A link in a mail opens the installed app.

- `/.well-known/assetlinks.json` served by the club app's deploy, generated from the configured
  host and the signing certificate's fingerprint.
- The manifest's intent filter with `autoVerify`, its host from the same configuration
  (`capacitor.config.ts` reads it at build time).
- `/invitation`, `/reset-password` and the confirmation links route inside the app.

**Done when** a device check opens an invitation link from Gmail straight into the app.

**What was built — 2026-09-26**
- The club-app image writes `/.well-known/assetlinks.json` at container start
  (`deploy/41-android-asset-links.sh`) from `ANDROID_PACKAGE_NAME` (default `de.furria.club`) and
  `ANDROID_CERT_FINGERPRINTS` (comma-separated, upper-case keytool form), declaring
  `handle_all_urls` and `get_login_creds` for every fingerprint. Empty fingerprints: no file,
  `404`; a malformed entry stops the container. nginx serves it as `application/json`, no
  redirect, and every other `/.well-known/` path `404`s instead of falling back to the SPA.
- The manifest's `autoVerify` intent filter claims only `/invitation` and `/reset-password` on the
  host from `CLUB_APP_HOST` / `-PclubAppHost` (Gradle `manifestPlaceholders`, not
  `capacitor.config.ts`). A release build without it fails; a debug build gets
  `club-app.invalid`, which never verifies.
- In the app, `useAppLinks` routes a launch URL and every later `appUrlOpen` of the club-app
  origin onto those two paths, fragment included; anything else stays with the browser. A second
  link arriving while its screen is already open remounts that screen, so the new fragment is
  read.
- **The "confirmation links" item is void**: login-email and redemption confirmations mail a
  6-digit code, not a link, so there is nothing more to route.
- Setup and verification: `web/apps/club-app/README.md` → *Android App Links*. Device check
  outstanding: an invitation link from Gmail opens straight into the app.

---

### S11 — the sweep

`pnpm shot` over every new page at 390 px, light and dark, including each redeem branch and the
in-person screen; the copy pass against ADR-0016's five button words; `CONTEXT.md` and this file's
*What was built*.

**What was built — 2026-09-27**
- Every page of the set was shot at 390 px in both schemes against data created through the
  running app and API (Mailpit for links and codes). Passkeys ran for real in headless Chrome
  through a CDP virtual authenticator (offer after redemption, the list, a passkey's screen).
  The claim-in step can't be reached through the app yet — only a future self-registration
  makes a claimable account — so it was shot with the lookup answer rewritten in the browser;
  *Erinnern* can't be shown sending, because nothing is three days old.
- `KkBrandStage` no longer pushes the wordmark into the stage's meta line when the sheet is tall
  (login with a notice): the brand is centred in the room between meta and sheet, and slides
  under the sheet when there is none.
- The password hint says the whole rule Identity enforces on redeem, reset and change alike,
  from one `lib/password-rule.ts` — since 2026-09-27 *Mindestens 8 Zeichen.* (ruling 20). The
  server holds the rule once, `PasswordRule` (`RequiredLength = 8`, every composition rule off,
  `RequiredUniqueChars = 1`); the redeem and change validators read its length, and every
  refusal says *Das Passwort braucht mindestens 8 Zeichen.*
- The in-person countdown no longer opens at *15:01*: `useNow` restarts its clock when ticking
  starts.
- A group screen refused for a viewer who is not affiliated shows *nicht im Verein aktiv*, not
  the stale *Dein Konto ist noch keiner Person zugeordnet*.
- Copy: *Account* throughout for the login (CONTEXT.md), *Andere Adresse eingeben* in every code
  step, confirmation eyebrows name the act (*Account löschen*, *Überall abmelden*, *Passkey
  entfernen*), *Verlauf* as an eyebrow, the register filter note no longer wraps *Alle zeigen*.
- `pnpm shot` signs in again (the passkey button made *Anmelden* ambiguous).

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

1. ~~**The passkey challenge state over bearer tokens.**~~ Settled in S7: a 5-minute, single-use
   `passkey_challenge` row keyed by an opaque id the client echoes back (ADR-0005 amendment).
2. **The founded year's readers.** S0 gives it a home; the website keeps `FOUNDING_YEAR` until its
   API client (`plan/website/feature-api-client.md`, *building*) can read the club record.
