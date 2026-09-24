---
status: shaped 2026-09-25, not yet implemented
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

Backend first in every slice, each behaviour test-first (`/tdd`). **No endpoint before its caller**
— each slice builds the endpoints its own pages call, nothing more.

**A0 — mail foundation.** A sending service over SMTP, German plain-text and HTML templates, sent
off the request path with retries, every send logged (ADR-0017) without the recipient's token.
Mailpit in `docker compose` and as a Testcontainer, so integration tests read the real mail —
no mocks (ADR-0001). The link host is the configured club app base URL. Nothing user-visible yet.

**A1 — the club record.** One record, founded year and age of consent, a detail write in club
management. The website's and the club hub's founded year read it instead of a constant.

**A2 — invitation model and eligibility.** The invitation (person, purpose *onboarding* or
*recovery*, channel, token stored only as a hash, expiry, issued by, redeemed or voided at), one
live per person. Eligibility and account state as derived queries, with the reason. Rate
limiting enters the API here, for every signed-out endpoint that follows.

**A3 — redeem.** Redeem by link or code: name, login email, password; the email confirmation code
when the address was typed or changed; the shared-inbox branch; the dead-invitation branch;
redemption logged on the person. Android App Links: `assetlinks.json` served at the base URL, the
intent filter in the manifest.

**A4 — self-request and password reset.** *Zugang anfordern* (one link per eligible person at the
address, the same answer on every path, at most one mail per address per few minutes), *Passwort
vergessen* and *Set new password* on Identity's reset tokens.

**A5 — passkeys.** Identity schema version 3, the challenge state carried without a cookie,
WebAuthn in the Android WebView, registration after redemption and in the profile, sign-in on the
login screen. ADR-0005 is amended here.

**A6 — her own account.** *Anmeldung & Sicherheit*: login email change (code to the new address,
notice to the old, contact email follows unless she opts out), password change, passkey list,
*Überall abmelden*, *Account löschen* after re-authentication. Credential-change notices.
*Kontaktdaten* as her own detail write, with who and when on every change. The *nicht im Verein
aktiv* state.

**A7 — the manager's side.** The *Zugang* panel on the person screen with state, reason and
history; invite by mail; the in-person screen with QR, code, countdown and the live flip; access
recovery with its notice; disable/enable; vouching for an unknown birth date. The `accounts.manage`
key. The *Zugänge* panel in club management with *Alle einladen* and *Erinnern* behind their
counts, and the register's account-state filter.

**A8 — duplicates.** The adopt suggestion in the person editor; the claim-in branch of redemption,
moving the account and absorbing the stray person. Until self-registration ships, the only stray
persons are non-affiliated ones the club itself recorded — the mechanism is the same.

**A9 — the sweep.** `pnpm shot` over every new page at 390 px, light and dark, including each
redemption branch; the copy pass (ADR-0016's five button words).

---

## Deliberately not in this phase

- **Public self-registration** for ticket buyers — its own phase with ticketing; this phase only
  makes sure the claim-in and adoption rules are in place for it.
- **Accepting a membership application** — CA-P10; it will issue an invitation through A2.
- **Start's to-do items** (open invitations, eligible persons without email) — CA-P9 defines the
  item contract; this phase exposes the derived state they will read.
- **iOS universal links** — the native shell's Phase B.
- **Printing, bounce handling, a device list, last sign-in** — ruled out, not deferred.

---

## Open

- **The passkey challenge state over bearer tokens.** Decided that it is built; *how* it is carried
  (a short-lived server-side challenge keyed by an opaque id, most likely) is settled in A5 and
  recorded in the ADR-0005 amendment.
- **Who and when on contact details.** Per field or per change set is an A6 modelling choice; the
  ruling is only that it is visible.
