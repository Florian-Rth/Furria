---
status: S1–S6 built (S1–S5 2026-10-02, S6 2026-10-05 on main with L2 + L5 merged), not yet merged — the /manage To-do panel is L3's
phase: L4 — CA-P10 Membership applications end to end (plan/launch.md; L3 before the 2026-10-02 split)
shaped_with: Florian, grilling session 2026-10-02
binding: docs/adr/0004
base: main with L5 merged (feat/l5-public-read-api — built 2026-10-02; S2 builds on its form changes)
---

# L4 — Membership applications end to end

`/join/apply` stops failing into its fallback. A visitor's **membership application** reaches the
club, is confirmed from her inbox, waits as work for whoever decides applications, and ends in an
**admission** — a membership on a new or existing person, and an invitation when she is eligible —
or in a decline that deletes it.

Read first: `CONTEXT.md` → **Membership application**, **Admission**, **Account eligibility**,
**Invitation**, **Membership**, the club record's **age of consent**; ADR-0004, ADR-0011, ADR-0019.

---

## What was ruled on 2026-10-02

1. **Only someone who has reached the club's age of consent applies, and for herself.** The form
   validates the birth date against `ClubRecord.AgeOfConsent` (16 by default) and the API enforces
   it. The age of consent widens to *the age from which a person acts for herself on the platform*;
   its club-app label becomes *Mindestalter für App und Online-Antrag*. A younger child joins by
   asking the club, which records her by hand. The website reads the age from
   `GET /api/public/club` — L4 adds `ageOfConsent` to it.
2. **The guardian block leaves the website.** No guardian fields in the form, the payload, the
   fallback mail or the consent wording (*Als gesetzliche Vertretung …* goes). `Person` gains
   nothing.
3. **A minor is checked before she is admitted.** An applicant **under 18 on the admission date**
   is marked *minderjährig* in the club app, and admitting her requires confirming *Einwilligung
   der gesetzlichen Vertretung liegt vor*. The confirmation is recorded with its author (§107 BGB:
   the club obtains the consent offline, at first contact).
4. **Group interests are removed for the MVP** — from the form, the payload and the Jeck-Check's
   `?groups=` handoff. The application names no groups. This reverses L5 ruling 8, which L5 built
   (`groupInterests` as numeric `groupId`s on `/join/apply`); S2 removes it. `/club`'s use of
   `public/groups` stays.
5. **Double opt-in.** Submitting sends a mail with *Antrag bestätigen*; only a confirmed
   application reaches the club — no notice, no to-do before. An unconfirmed one is deleted after
   48 hours. The mail repeats the first name and nothing else typed into the form.
6. **Abuse protection:** self-hosted **Altcha** proof of work — the challenge is issued and verified
   by our API (HMAC key from configuration), no third party, no puzzle shown — plus the existing
   honeypot, `SignedOutRateLimiting.PerIpPolicy`, and a new `AddressRateLimitScope` keyed on the
   applicant's address.
7. **Deciding applications is its own permission**, `membership_applications.decide`. Its holders
   see applications, get the arrival notice, and admit **without `persons.manage`** — the admission
   writes person, membership and invitation under its own authority.
8. **The arrival notice** goes, on confirmation, to every holder of the key who has an email: the
   applicant's name and a link to the application in the club app — no birth date, address or
   phone in any inbox. `ClubRecord.Email` gets nothing.
9. **An application lives only until it is decided** — the retention rule ADR-0004 demands:
   - **Aufnehmen** — the details go into the registry, the application is deleted; the admission
     remains (its date, who admitted, who confirmed a minor's consent).
   - **Ablehnen** — deletes it at once, behind a confirmation dialog; it also disposes of spam and
     withdrawals. No mail to the applicant: a rejection is said by a person.
   - **Undecided** — stays a to-do until decided; never deleted on its own.
10. **Admission** takes an **admission date** — today by default, never before she applied,
    possibly in the future — and opens her membership from it:
    - **Candidates first.** The review lists every person sharing her email, or her first name,
      last name and birth date, with their state (*Mitglied beendet*, *in Tanzgarde*,
      *kein Verein*). The admitter picks **Das ist sie** or **Neue Person**; nothing is matched
      automatically.
    - On an existing person the application only fills fields the registry lacks; *Mitglied seit*
      is kept. A person whose membership is running cannot be admitted (*ist bereits Mitglied*).
    - **The invitation is issued in the same act when she is eligible that day** (affiliated
      today, age of consent reached, email on record); otherwise none, and she becomes *einladbar*
      on her admission date like anyone else. The system never invites on its own.

---

## Slices

| # | Slice | Note |
|---|---|---|
| S1 | **Receive and confirm** — `MembershipApplication` + migration; Altcha challenge endpoint; `POST /api/membership-applications` (Altcha, per-IP + per-address limits, age-of-consent check, honest validation errors); the confirmation mail; the confirm endpoint (expired → its own answer); the 48-hour purge of unconfirmed applications (rulings 1, 5, 6, 9) | See *the outbox* and *the website's address* below |
| S2 | **The website form** — guardian block, group interests and `?groups=` removed; `ageOfConsent` on `public/club`; birth date validated against it; Altcha in the form; the confirmation in place says *check your inbox*; a confirm route (confirmed / expired / already confirmed); the FAQ's children answer rewritten (*unter 16? Schreib uns*) (rulings 1, 2, 4, 5) | |
| S3 | **The permission and the notice** — `membership_applications.decide` in `FurriaPermissions` (and the rights matrix); the arrival notice to its holders on confirmation; *Mindestalter für App und Online-Antrag* relabel (rulings 1, 7, 8) | |
| S4 | **Review in the club app** — the applications in `/manage` (hub panel, list, detail with *minderjährig*), *Ablehnen* (rulings 3, 9) | The `/manage` hub's gating gains the key |
| S5 | **Admission** — candidates, *Das ist sie* / *Neue Person*, admission date, the minor's consent, the membership, the invitation when eligible, the admission recorded, the application deleted (rulings 3, 9, 10) | |
| S6 | **The to-do** — a confirmed, undecided application is a to-do for the key's holders, on Start and in `/manage`'s To-do panel | The contract moved into L2 (built); the `/manage` panel is L3's |

**L4 is done when** S1–S6 are merged on a green `main` and an application submitted on
`/join/apply` can be confirmed, seen, admitted or declined without anyone touching the database.

### S1 as built (2026-10-02) — the contract S2 builds on

- **Challenge** — `GET /api/membership-applications/challenge` answers the Altcha widget v3's
  own format (PoW v2: `PBKDF2/SHA-256`, `{ parameters, signature }`, deterministic key with a
  `keySignature`), valid 10 minutes, each spendable once. Hand-written against altcha-lib 2.5
  (no library): `Api/Altcha/`. Difficulty is configuration (`Altcha:Cost`, `MinCounter`,
  `MaxCounter`; altcha-lib's recommended 5 000 / 5 000–10 000 by default); the key is
  `Altcha:HmacKey` (`ALTCHA_HMAC_KEY`, ≥ 32 characters).
- **Submit** — `POST /api/membership-applications` takes `firstName`, `lastName`, `birthDate`
  (`YYYY-MM-DD`), `street`, `postalCode`, `city`, `email`, `phone` (nullable), `consentAccepted`
  and `altcha` (the widget's base64 payload). Unknown fields — today's `guardian` and
  `groupInterests` — are ignored. Answers: `200 {}`; `400` with field errors (FastEndpoints'
  `errors` map; a refused Altcha is the `altcha` field); `422` when the birth date cannot be right
  or is under the club's age of consent; `429` per IP or after 5 applications per address in
  15 minutes.
- **Confirm** — the mail's link is `{Website:BaseUrl}/join/confirm#token=…` (fragment, like the
  invitation link). `POST /api/membership-applications/confirmation` `{ token }` answers
  `200 { outcome: "confirmed" | "alreadyConfirmed" }` or **`410`** when the link has expired or
  belongs to no application (purged, decided, mistyped).
- **Retention** — an unconfirmed application is deleted 48 h after it was sent
  (`UnconfirmedApplicationPurge`, every 15 min); a confirmed one is never deleted on its own.
- **Outbox** — a mail's recipient is a person or a membership application
  (`recipient_kind` / `recipient_id`); the log reads `Mail … sent to MembershipApplication 7`.
- **Website address** — `Website:BaseUrl`, from `WEBSITE_HOST` or the club domain's apex.

### S2 as built (2026-10-02)

- **`public/club`** carries `ageOfConsent` (the record's, else the default 16).
- **The form** asks for nothing beyond the applicant's own details: guardian block, group
  interests and the Jeck-Check's `?groups=` handoff are gone (the matcher links to plain
  `/join/apply`). The birth date is held against `ageOfConsent` client-side; until the club has
  loaded, only plausibility is checked and the API's `422` lands on the birth-date field. A
  16–17-year-old sees a note that the club obtains the parents' consent before admission; a
  younger one gets the field error and a *Schreib uns* mail button.
- **Altcha, invisible** — `altcha/lib`'s worker solver (`altcha/workers/pbkdf2`, a same-origin
  file, so the CSP holds), no widget. Solving starts once the form is dirty; the proof is kept
  until a minute before its challenge expires and spent on submit (the button waits for it). A
  refused proof is retried once with a fresh one; server field errors land on their fields, `429`
  asks to wait, everything else offers the fallback mail.
- **In place** after submit: *Noch ein Klick* — names the address the mail went to, the 48 hours,
  and the steps *Bestätigen → Aufnahme → Willkommen*.
- **`/join/confirm`** sits outside the preview gate (a mail link opens a fresh tab without the
  preview session). It reads `#token=`, scrubs it from the URL, confirms once and answers
  *bestätigt* / *schon bestätigt* / *gilt nicht mehr* (`410`) / *unvollständig* (no token), or a
  retryable failure. `noindex`.
- **FAQ** — the children answer names the club's age of consent: younger children by mail.
- Verified end to end against the running API (real solver ↔ hand-written verifier, mail link,
  all confirm outcomes). Solving took ~10–20 s single-threaded in Node; the browser spreads it
  over all cores and starts with the first keystroke.

### S3 as built (2026-10-02)

- **The key** — `membership_applications.decide` (`FurriaPermissions.MembershipApplicationsDecide`)
  is in the catalogue, so the rights matrix offers it (*Über Beitrittsanträge entscheiden*) and the
  bootstrap admin's role picks it up on the next start. The club app knows it in
  `PERMISSION_KEYS` with a denial message; nothing is gated on it yet — S4 adds it to `/manage`.
- **Its holders** are whoever the key is granted to today, exactly as `PermissionAuthorizer` grants
  it: a running role holding on an unarchived role, or a running board seat whose office implies an
  unarchived role (`Infrastructure/Authorization/PermissionHolderQuery`, whose predicates the
  authorizer now shares). The account plays no part — a holder without one is still told.
- **The arrival notice** (`MailTemplate.MembershipApplicationArrival`) is staged by
  `MembershipApplicationArrivalNotifier` in the confirmation's own transaction, once per holder
  with a registry email, only on the first confirmation. It carries the applicant's first and last
  name (folded onto one line — it is typed by a visitor and reaches a subject header) and the link
  **`{ClubApp:BaseUrl}/manage/applications/{id}`** — S4's detail route must live there. No holder
  with an email logs a warning; the application still waits for S6's to-do.
- **Relabel** — the club record's age field reads *Mindestalter für App und Online-Antrag*; its
  hint and consequence name both effects (no invitation, no online application).

### S4 as built (2026-10-02)

- **The rule** — `ApplicantBirthDate.AgeOn(birthDate, day)` and `IsMinorOn` (under
  `AgeOfMajority` = 18; a leap-day birthday counts on 28 February, like the age of consent). Every
  read derives *minderjährig* against the club's today; S5 asks it of the admission date.
- **Undecided** = confirmed: `UndecidedApplicationQuery.UndecidedApplications()` (Infrastructure)
  is the one predicate the list, the detail, the decline and the hub share. An unconfirmed
  application answers `404` everywhere — it has not reached the club.
- **Endpoints**, all behind `membership_applications.decide` alone:
  `GET manage/membership-applications` (`{ applications: [{ membershipApplicationId, firstName,
  lastName, age, isMinor, city, confirmedAt }] }`, longest waiting first),
  `GET manage/membership-applications/{id}` (every field she gave plus `age`, `isMinor`,
  `submittedAt`, `confirmedAt`; S5 adds the candidates here) and
  `DELETE manage/membership-applications/{id}` (*Ablehnen*: `204`, deleted at once, no mail, no
  log line — a plain write). `MembershipApplicationService.Review.cs` holds them.
- **Hub** — `manage/hub` admits the key and carries `applications { undecidedCount, minorCount }`;
  the club app shows *Beitrittsanträge* in *Wer dazugehört* after the persons row: gold *n offen*,
  meta *n minderjährig* or *Keine offenen Anträge*. `MANAGE_KEYS` holds the key, so a holder of it
  alone reaches `/manage` and *Mehr → Verein verwalten*.
- **Club app** — `features/manage-membership-applications`: `/manage/applications` (rows: name,
  *17 Jahre · Köln · seit 3 Tagen*, gold *minderjährig* chip) and
  `/manage/applications/$membershipApplicationId` — the arrival notice's link — with *Angaben*
  (name, birth date and age, address, email, phone) and *Eingang* (received, confirmed), the
  minor's consent note, and *Antrag ablehnen* as the screen's danger line behind a
  `KkConfirmDialog`. A decided or unknown application reads *Diesen Antrag gibt es nicht mehr*;
  declining one someone else just decided says so and returns to the list.
- **Tests** — `IdentitySeedBuilder.AddMembershipApplication` seeds applications directly;
  `Expected.MembershipApplication(id)` asserts one.

### S5 as built (2026-10-02)

- **The record** — the admission lives on the membership it opens: `membership.admitted_at`,
  `admitted_by_person_id` (set null when that person is deleted) and `guardian_consent_confirmed`
  (`ck_membership_admission`: no admitter or consent without a date). Its author is the admitter;
  consent is stored only when she is under 18 on the admission date. A membership entered by hand
  records none. `GET manage/persons/{id}` shows it per membership (`admission { admittedAt,
  admittedBy, guardianConsentConfirmed }`); the club app reads *Aufgenommen am … von … ·
  Einwilligung der gesetzlichen Vertretung bestätigt* on the membership row.
- **Candidates** — `GET manage/membership-applications/{id}` adds `appliedOn` (the club day she
  sent it), `ageOfConsent` and `candidates`: every person sharing her email (trimmed,
  case-insensitive) or her first name, last name (German-folded: *ä*→*ae*, *ß*→*ss*, any case) and
  birth date (`AdmissionCandidateQuery`). Each carries name, birth date, email, city,
  `membershipState`, `memberSince`, `isMember` (a membership not ended by today),
  running group and role names, `hasAccount`, `isAffiliated` and `gaps` — what the application
  would fill (`RegistryGaps`: birth date, email, phone, and the address **as one unit**, only when
  the registry holds no part of it).
- **Admit** — `POST manage/membership-applications/{id}/admission` `{ personId | null,
  admittedOn, guardianConsentConfirmed }` (`personId` is required, `null` = *Neue Person*), behind
  `membership_applications.decide` alone. One transaction: claim (delete) the application, create
  the person or fill her gaps (contact change stamped with the admitter), open the membership
  (`MembershipService.AddAdmittedAsync`, the usual open/overlap rules), and invite by mail when she
  is eligible today (`AccountAccessService.InviteAdmittedAsync`, inside the admission's
  transaction). Answers `200 { personId, membershipId, invitation: sent | alreadyHasAccount |
  notYetAffiliated | belowAgeOfConsent }`; `422` before she applied or for a minor without the
  consent; `409` for a person who is no candidate or *ist bereits Mitglied*; `404` when the
  application is decided, unconfirmed or unknown. Concurrent admitters: the second gets `404`.
- **Club app** — the application screen's action bar: *Aufnehmen*, context *n Personen im Register
  passen zu Mia*. `/manage/applications/$id/admission` is the entry editor (ADR-0016): *Im
  Register* as a radio choice (candidates, members disabled with *ist bereits Mitglied*, the chosen
  one chipped *Das ist sie*, then *Neue Person*; with no candidate a note and *Neue Person* preset),
  the gap note, *Aufnahmedatum* (today; *Heute* / *Sessionbeginn*), the consent checkbox while
  she is under 18 on that date, and a consequence line forecasting the invitation. *Mitglied
  aufnehmen* lands on the list with a notice. New primitive: `KkRadioGroup` (+ `.Option`) in
  `@furria/ui`.
- **Tests** — `IdentitySeedBuilder.AddAdmission(membershipAlias, admittedByAlias, admittedAt,
  guardianConsentConfirmed)`; `Expected.Membership(id).ToRecordAdmission(…)`. Verified end to end
  against the running API (candidate chosen, consent, invitation mailed, person screen).

### S6 as built (2026-10-05, on main with L2 merged)

- **The kind** — `ToDoKind.ApplicationWaiting` (wire `applicationWaiting`): the count of
  `UndecidedApplications()` — confirmed, undecided — in `ToDoService.ForAsync`, behind
  `membership_applications.decide` alone. Unconfirmed applications never count; a decided one
  (admitted or declined, so deleted) drops out at once.
- **Start** — ZU ERLEDIGEN reads *1 Beitrittsantrag offen* / *n Beitrittsanträge offen* and lands
  on `/manage/applications`. CONTEXT's to-do table carries the row.
- **`/manage`'s To-do panel** is L3's (it reads `ToDoService.ForAsync`, so the kind lists there
  with no further L4 work).
- **Tests** — `GetStartToDosTests`: counted for a holder of the key alone, unconfirmed left out,
  gone after *Ablehnen*, absent for a board member without the key; `StartWireNamesTests` pins
  the wire name.

---

## Where the code stands (surveyed 2026-10-02)

Nothing for applications exists on the server. What L4 builds on:

- **Website form** — `web/apps/website/src/features/membership/` (`schemas.ts`,
  `hooks/use-apply-form.ts`, `apply-payload.ts`, `apply-fallback.ts`, `membership-derivation.ts`,
  `apply-content.ts`, `faq-content.ts`, `ApplyForm/…`); route
  `src/routes/_site/_gated/join_.apply.tsx`, search parsing in `apply-search.ts`. It already posts
  to `POST {API_BASE_URL}/api/membership-applications`; `apiFetch` parses a JSON body, so success
  must return one (`{}`), not a 204. The honeypot fakes success client-side and is never sent. The
  website reaches the API same-origin (CORS allows only the native shell).
- **Public club** — `Api/Endpoints/Club/GetPublicClub.cs`, `Application/Club/PublicClubDetails.cs`,
  `Infrastructure/Club/ClubService.Public.cs`; website `src/lib/public-club/schemas.ts`.
- **Invitations** — `Infrastructure/Identity/AccountAccessService.cs`
  (`IssueMailInvitationAsync(personId, InvitationIssuer, ct)`; refusals in order: has an account,
  not affiliated today, no birth date unless vouched, under the age of consent, no email for the
  mail channel — `Core/Identity/AccountEligibility.cs`). A future-dated membership is not
  affiliation (`Infrastructure/Registry/AffiliationQuery.cs`), hence ruling 10's *when eligible
  that day*.
- **Registry** — `PersonService.CreateAsync`, `MembershipService.AddAsync` (rejects an open or
  overlapping membership), `PersonAdoptionService` (ADR-0019; not the admission's matching).
- **The outbox** — `Infrastructure/Mail/`: `MailOutbox.Stage(OutgoingMail)` in the caller's
  transaction; mails are `[Pure] Compose(…)` static classes (`AccessRequestMail.cs`,
  `InvitationMail.cs`); `MailTemplate` enum gains entries; `CredentialChangeNotifier` is the
  notice-in-the-same-transaction pattern. **`OutgoingMail.PersonId` is required, but an applicant
  is no person** — the outbox needs a second kind of recipient for the confirmation mail.
- **The website's address** — mail links use `ClubAppOptions.BaseUrl`; nothing knows the
  website's origin. The confirmation link points at the website, so S1 adds that setting (and its
  entry in compose and `docs/ops/`).
- **Rate limits** — `Api/RateLimiting/`: opt in with
  `RequireRateLimiting(SignedOutRateLimiting.PerIpPolicy)`; `AddressRateLimiter` with
  `AddressRateLimitScope` for the per-address limit.
- **Permissions** — `Application/Authorization/FurriaPermissions.cs`; endpoints use
  `RequirePermission(…)`; the bootstrap admin gets `FurriaPermissions.All`.
- **Manage hub** — server `Infrastructure/Management/ManagementService.HubAsync` (nullable panels),
  `Api/Endpoints/Management/GetManageHub.cs`; client `web/apps/club-app/src/features/manage-hub/`
  (`manage-hub-panels.ts`), gating `MANAGE_KEYS` in `features/session/app-sections.ts`.
- **Background work** — hosted services registered in
  `Infrastructure/ServiceCollectionExtensions.cs`; there is no periodic job yet — the 48-hour purge
  is the first.
- **Captcha** — none anywhere yet.

Open to the implementer, within the rulings: where the admission is recorded (the membership it
opens is the natural home), the Altcha server implementation (a maintained library or the small
HMAC verification by hand), the outbox's second recipient kind.

---

## For other phases

- **L3** — `/manage`'s To-do panel reads `ToDoService.ForAsync`, so it lists `ApplicationWaiting`
  with no further L4 work.
- **L8** — the privacy text states ruling 9 (*gespeichert, bis der Verein entschieden hat; danach
  gelöscht, bei Aufnahme in die Mitgliederverwaltung übernommen*) and the confirmation mail;
  `/satzung` remains the consent's link target.
- **Fees and ledger (after launch)** — a minor's reduced fee is a **fee reduction** with basis
  *minderjährig*, recorded by hand; admission does not derive one.
