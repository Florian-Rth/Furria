---
rfc: 0004
title: Beer list — the drinks warden's private pot, crates by QR, tabs, stock forecast, reminders
status: draft
github_issue: 59
branch: feat/rfc-59-beer-list
created: 2026-11-04
---

# RFC 0004: Beer list — the drinks warden's private pot, crates by QR, tabs, stock forecast, reminders

## Summary

Today a sheet of paper hangs next to the pallet in the clubroom, cash goes into a tin, and the
drinks warden chases euros for months. This RFC moves the **beer list** (*Bierliste*) into the
club app as the **drinks warden's private pot**, outside the club's books (ADR-0035):
- people opt in with an **enrollment**
- they book whole **crates** onto their own **tab** (*Deckel*) by scanning the **pallet code** on the pallet
- operators book payments and keep the **stock**
- the app forecasts when the beer runs out
- the app reminds people of open tabs by itself

The domain is fixed in `CONTEXT.md` (**Beer list**, **Enrollment**, **Tab**, **Stock**,
**Pallet code**). The decisions come from the grilling session of 2026-11-04.

## Motivation

- **The pain is real and recurring.** The drinks warden fronts the money and carries the debt
  risk. Members forget what they took, and the paper list cannot remind anyone.
- **The design handoff got the money model wrong.** It put a "drinks till" into the club's
  ledger, but the club never owns the beer (ADR-0035).
- **The booking moment is physical.** Someone stands at the pallet with a crate in one hand, late
  in the evening. Anything slower than "scan, confirm" loses against the paper list.

Constraints:
- ADR-0011 (permissions come from roles and running relationships)
- ADR-0031 (the app only runs installed on phones)
- the live host's hand-kept compose: new required config needs Florian's approval
- *build the end state*

## Proposal

### Domain (binding: `CONTEXT.md`, ADR-0035)

- **Pot:**
  - exactly one open pot at a time
  - one **owner** person, recorded as a fact on the pot and never derived from a role
  - the owner must hold `beer_list.manage`
  - one **price per crate**; a crate keeps the price it was taken at
  - the owner's **payment details**: a paypal.me link and/or free text such as an IBAN
  - no purchase prices, no balance of the owner's money, no Session boundary
- **Handover:**
  - closes the owner's pot; open crates stay owed to the old owner
  - opens the successor's pot with the remaining stock as a **count only**, no euros
- **Enrollment:**
  - any affiliated person enrolls herself by confirming a declaration
  - she may end it herself; an operator may end it for her
  - a running enrollment implies `beer_list.take` (ADR-0011); age plays no part
  - ending it stops new crates, never touches the debt, and the holder keeps seeing her own tab
  - re-enrolling continues the same history
- **Crate:**
  - one booked crate on one person's tab, in the pot it was booked in
  - records the price, who entered it and when
  - members book only for themselves; operators book for anyone
  - a member can undo only in a short window (~10 s) right after confirming; later corrections are an operator's
- **Payment:**
  - booked by an operator only, settling whole crates of one tab, oldest first
  - no partial payments, no credit, no member "I paid" report, no payment provider
- **Stock:**
  - lowered by every booked crate (an undo restores it)
  - raised by a **delivery**
  - changed by a **stock correction** with a reason: Schwund, Bruch or Zählfehler
  - never below zero: a booking against empty stock is refused
- **Visibility:**
  - enrolled people see who gave how many crates
  - open and paid are visible only to the tab's holder and to operators
  - people who are neither enrolled nor operators see nothing
- **Forecast:**
  - pace = crates booked over the last 21 days
  - projected empty date = stock ÷ pace
  - operators get one push when the projection falls within 7 days; it re-arms after a delivery
  - no fixed threshold
- **Reminders (worker):**
  - a push once the oldest open crate on a tab is 7 days old, then every 7 days until settled
  - sent only between 10:00 and 20:00 Europe/Berlin
  - nobody sends reminders by hand

### Permissions

- `beer_list.manage`, granted through a role: operate the pot (stock, payments, bookings for
  others, ending enrollments, handover). Only a holder can be the owner.
- `beer_list.take`, implied by a running enrollment and never on a role. Holders see the beer list
  and book crates for themselves. It is added to `FurriaPermissions.ImpliedByRelationship` and
  derived in `PermissionAuthorizer`, the same way `club.read` is derived from a membership.

### Surfaces

- **Member beer list:**
  - a club-app screen, shown in navigation only to `take`/`manage` holders, or to a former enrollee with an open tab
  - shows her tab, the owner's payment details, and who gave crates
  - booking is hold-to-confirm with a count of 1–3
- **Operator hub:** a management hub in the existing hub system (`manage-hub`). Panels:
  - tabs (dense, open and paid)
  - book a payment
  - book for someone
  - stock with deliveries and corrections, plus the forecast
  - enrollments
  - pot settings (price, payment details)
  - the printable pallet code
  - handover
- **Booking page** (`/beer-list/book`):
  - the pallet code's target: bare, no shell, no navigation away
  - exempt from the install gate (ADR-0031 amendment)
  - Android hands the link to the installed app; iOS finishes in Safari after a one-time inline sign-in
  - offers enrollment inline (declaration) when the scanner isn't enrolled
- **Start:** an open tab is a personal task, with the amount and the owner's payment details.
- **Profile:** enroll and end the enrollment (*Mein Profil*).

### Push

There is no Web Push in the platform yet. A generic foundation comes first:
- VAPID keys as config
- push subscriptions per account and device
- a service-worker push handler
- a permission prompt raised from a user gesture
- a send pipeline that prunes dead subscriptions

It goes into its own ADR, because live direction's "you're up next" will reuse it. iOS delivers
push only to installed home-screen apps (16.4+), which ADR-0031 already enforces.

## Phases

Each phase leaves the system intact (builds, tests green, migrations complete, every endpoint has a
caller in the app) and fits roughly 120k tokens. Backend behaviour is built test-first (tdd).
Phases that need a verdict from Florian are marked ⚖.

### Phase 1 — ⚖ Member screen and operator hub: lab variants
Goal: Florian picks the member beer list and the operator hub layout before anything is built into them.
- [ ] Lab seed of a realistic pot (owner, ~10 tabs, deliveries, corrections, 60 days of crates) as client fixtures
- [ ] Three divergent variants of the member beer list at 390 px (tab, booking, who gave crates) in the lab
- [ ] Three divergent variants of the operator hub (dense, work first: tabs, payment booking, stock + forecast) at 390 px and desktop
- [ ] Bare booking page variant(s) at 390 px, including the not-enrolled state with the declaration
- [ ] Pitch + Florian's pick; rulings recorded in this RFC

### Phase 2 — Pot and enrollment
Goal: an operator opens the pot, people enroll and leave, and `beer_list.take` exists.
- [ ] Core: `BeerPot` (owner person, crate price, payment link, payment note, opened/closed), `BeerListEnrollment` (person, started/ended, ended by, declaration confirmed), migration
- [ ] Permission keys `beer_list.manage` + implied `beer_list.take` (`PermissionAuthorizer`), roles matrix shows `manage`
- [ ] Rules: one open pot; the owner holds `manage`; only affiliated persons enroll; ending keeps history; re-enrolling continues it
- [ ] Endpoints + tests: open pot, edit pot settings, enroll self, end own enrollment, end someone's enrollment, list enrollments
- [ ] Club app: enroll/leave with the declaration in *Mein Profil*; hub shell with pot settings and the enrollment panel in the picked design

### Phase 3 — Stock and forecast
Goal: operators keep the stock; the hub shows the projected empty date.
- [ ] Core: `BeerStockMovement` (pot, kind delivery/correction/handover-carry, count ±, reason, by, at), migration
- [ ] Stock = movements − booked crates (crates come in phase 4; until then movements only); never below zero
- [ ] Pure forecast: 21-day pace → projected empty date (tested), no pace → no projection
- [ ] Endpoints + tests: book delivery, book correction with reason, read stock + forecast
- [ ] Hub: stock panel with history, delivery and correction actions, forecast readout

### Phase 4 — Crates on tabs
Goal: enrolled people book crates for themselves, operators for anyone, and the member screen is live.
- [ ] Core: `BeerCrate` (pot, person, price at booking, entered by, booked at, undone at?, paid by payment?), migration
- [ ] Rules: members only for themselves; operators for anyone enrolled or with history; stock never below zero; undo only by the booker within the window; stock follows
- [ ] Endpoints + tests: book crates (count), undo, operator book-for, my tab, who gave crates
- [ ] Member beer list screen in the picked design; navigation entry gated; former enrollee with open crates sees only her tab
- [ ] Hub: book-for-someone panel; tabs table (counts only until phase 5)

### Phase 5 — Payments and the Start task
Goal: operators settle tabs; open tabs reach their holders on Start.
- [ ] Core: `BeerPayment` (pot, person, crate count, booked by, at) settling oldest open crates, migration
- [ ] Rules: whole crates only, never more than open; a correction of a payment by an operator
- [ ] Endpoints + tests: book payment, tabs with open/paid for operators, own tab open/paid
- [ ] Hub: tabs table with open/paid and the payment action in the picked design
- [ ] Start: an open tab as a personal task with the amount and the owner's payment details (Start service + client)

### Phase 6 — Pallet code and booking page
Goal: scan, confirm, done, on Android and iOS.
- [ ] `/beer-list/book`: bare page, no shell, no navigation away; hold-to-confirm, count, undo window
- [ ] Install gate exemption (`install-gate.ts`) + inline sign-in in the tab (iOS keeps its own Safari session)
- [ ] Not enrolled → inline enrollment with the declaration, then the crate; not affiliated → plain explanation
- [ ] Android: confirm the installed app captures the link (manifest scope/`launch_handler`); device check on iPhone + Pixel
- [ ] Hub: printable pallet code (`KkQrCode`) with print-ready layout
- [ ] ADR-0031 amendment rewritten from "decided" to built, with the route

### Phase 7 — Web Push foundation
Goal: the platform can push to installed apps.
- [ ] ADR: Web Push for the installed app (VAPID, subscriptions, iOS installed-only)
- [ ] Config `Push:VapidPublicKey/PrivateKey/Subject`; live host compose edit prepared, **applied only with Florian's approval**
- [ ] Core/Infra: push subscription per account+device, subscribe/unsubscribe endpoints + tests, sender that prunes 404/410 subscriptions
- [ ] Service worker push + notification-click handler (opens the target route); permission prompt UX from a user gesture
- [ ] A test push path for `system.view` to prove delivery on devices

### Phase 8 — Reminders and the stock warning
Goal: open tabs and running out remind by themselves.
- [ ] Hosted worker: tabs whose oldest open crate is ≥ 7 days and last reminder ≥ 7 days ago, inside 10:00–20:00 Europe/Berlin → push; state per person
- [ ] Hosted worker: projected empty within 7 days → one push to operators; re-arms after a delivery
- [ ] Tests for both schedules with a controllable clock (no `Task.Delay`)
- [ ] Notification copy + click targets (own tab / hub stock panel)

### Phase 9 — Handover
Goal: the pot changes hands cleanly.
- [ ] Rules: close the current pot, open the successor's with a handover-carry movement of the remaining count; the old pot's open tabs stay owed to the old owner and stay payable
- [ ] Endpoint + tests: hand over (successor holds `manage`)
- [ ] Hub: handover flow; closed pots readable with their open tabs; members see open crates of a closed pot on their tab
- [ ] CONTEXT.md / ADR-0035 touched where behaviour changed

## Risks & alternatives

- **iOS Safari sign-in on the booking page.** It's a second session that lives outside the
  installed app. If Safari's storage is purged after 7 days of not being used, the member signs in
  again on the next scan. Accepted, because the native app's universal links remove it later.
- **Web Push on iOS** needs the installed app plus a granted permission. Members who decline get
  only the Start task, which still covers every reminder.
- **New required config (VAPID)** breaks the hand-kept live compose until it is edited. Phase 7
  prepares the edit and waits for approval.
- **A forecast built from lumpy weeks** can mislead. The 21-day window is a default and is
  revisited after the first season.
- **Rejected options:**
  - a drinks till in the ledger
  - several people fronting money
  - purchase prices
  - partial payments and credit
  - member payment reports
  - tabs for groups or the club
  - a shared clubroom tablet
  - a fixed low-stock threshold
  - manual reminders
  (all ADR-0035 / grilling 2026-11-04)

## Out of scope

- Other drinks, single bottles
- A leaderboard or scoreboard
- PayPal or Stripe integration
- A CSV export of the owner's history
- Native universal links (they come with the Capacitor shell)
