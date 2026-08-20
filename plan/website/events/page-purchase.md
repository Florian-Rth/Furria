---
title: Kauf & Karte
slug: purchase
route: steps 2–3 inside /events/$eventSlug/order (?step) + /orders/$orderCode (pinned 2026-08-18)
type: page
status: shipped
mock: docs/design/events-page/ (fcc-web-tickets.jsx — EvKarteDesktop / EvKarteMobile, EvTicket)
depends-on: [foundation-events-data, page-order-flow]
adrs: []
---

## What & Why

From "Deine Daten" to a Bestellung in hand: the buyer form (step 2), the Bestellübersicht +
Zahlung (step 3), and the confirmation page at `/orders/$orderCode` the mail links to. **The
mock skips the checkout step entirely** — it jumps from seat selection straight to
"BEZAHLT"; the real flow needs the step the mock omitted.

The 2026-08-19 shaping session **re-litigated every prior decision that touches this page**
(user instruction: question everything). Outcome: guest checkout, the capability URL and
the single-flow route all **survived on their merits**; the payment model changed
(Stripe-only, embedded); and a second undecided club fact surfaced (**Einlasskontrolle**,
`CONTEXT.md`), which blocks the digitale Karte's face the way Sitzplatzvergabe blocks the
Kartenwahl.

## Mock inventory (inspiration only)

- Confirmation page: "BEZAHLT · MAIL IST UNTERWEGS" hero, Wallet / PDF / calendar actions
- `EvTicket`: the printed-ticket object (FURRIA masthead, Nº, seats, paid line, QR stub,
  "Handy oder Ausdruck — beides geht")
- "Was jetzt passiert" steps (mail with QR, reminder two days before, live Ablauf on the
  evening)
- Return/swap teaser into the Kartenbörse, cross-sell card for the other open evening
- Payment mentions across the mock: Kreditkarte, PayPal, "reservieren und bar im
  Vereinsraum zahlen" (all unverified)

Rulings per item live in the [mock README](../../../docs/design/events-page/README.md).

## Decisions (shaping session, 2026-08-19)

1. **Guest checkout reconfirmed** (challenged and upheld): buying never requires an
   Account; `/orders/$orderCode` stays the guest's retrieval path; the Kartenübersicht is
   the *additional* view Account holders get later. `CONTEXT.md` (Account, Bestellung)
   stands unchanged.
2. **One buyer per Bestellung — Vorname, Nachname, E-Mail. Nothing else.** No phone, no
   postal address, no per-Karte attendee names (anti-scalping personalization is friction
   with no threat model here, and DSGVO minimization wins).
3. **Stripe is the single payment provider for Karten sales** — this *amends* the carried
   stub decision "Stripe (card) + PayPal" (design §10): the concrete methods (Karte,
   PayPal, Apple/Google Pay, …) are whatever the club enables in its Stripe config; the
   website never hand-maintains a method list. Scope is **Karten only** — other money
   flows (Beitrag, Shop, Getränkekasse) stay open, so no ADR.
4. **Embedded Payment Element, not hosted Checkout** (user decision over the raised
   maintenance recommendation): payment happens on our page, no redirect. Consequence:
   **§312j BGB (Button-Lösung) is ours** — the final pay action must be worded as an
   order-with-obligation-to-pay (pinned wording: **"Zahlungspflichtig bestellen"**) on the
   same screen as the summary and total.
5. **The payment region ships as a designed, recognisable placeholder** — the phase's
   sanctioned exception to the end-state rule (the first was step 1's core, E4). Rationale
   recorded: the Element cannot render, be tested or be exercised at all without a
   backend-issued `clientSecret`, so wiring it now is an *unverifiable integration*, not
   "relying on data that can't be fetched yet". E4's step-3 placeholder body is **stale**
   ("Womit du bezahlen kannst, legt der Verein noch fest" — now decided) and is updated:
   the provider is decided, the backend is missing.
6. **Einlasskontrolle is undecided club practice** (`CONTEXT.md` flagged ambiguity,
   2026-08-19): QR scan vs. name list vs. no check is open, so **no surface may show or
   promise a scannable code, PDF ticket, Wallet pass or calendar file**. The confirmation
   page shows the Bestellung honestly without codes; the mock's `EvTicket` QR face is
   embargoed, not rejected.
7. **The confirmation page `/orders/$orderCode` is the digitale Karte** — four blocks:
   state hero → Bestellung summary → cross-sell (another purchasable evening, derived from
   the seed) → Kartenbörse existence teaser (links the live placeholder route, says only
   *that* it exists — glossary rule). **Cut:** reminder-mail-two-days-before (unverified
   practice, unbuilt) and live-Ablauf-on-the-evening (event-app territory) promises. The
   "mail ist unterwegs" line is safe: the backend that creates the Bestellung is the thing
   that sends the mail.
8. **The Bestellung payload carries a `paymentStatus`** — `paid | processing` — because
   embedded Stripe means some methods confirm asynchronously. The page renders both faces
   (**bezahlt** / **Zahlung in Bearbeitung**) in final form; there is **no failed face** —
   a failed or abandoned payment never produces a mail or a URL. Demo seed shows `paid`.
9. **The capability URL shows buyer name *and* email** (user decision): the link-equals-mail
   trust model (E4) already grants the link holder the mail's content, so hiding the email
   protects nothing.
10. **No AGB checkbox in this build.** Karten-AGB do not exist; a consent checkbox linking
    to nothing would be a dead link *inside a legal act*. **Karten-AGB are flagged as an
    open club/legal fact and a blocker for real online sales** (deferred contract). The
    **Widerruf-exemption notice ships now** (§312g Abs. 2 Nr. 9 BGB — dated leisure
    events; settled law, not club choice), alongside the §312j summary + total price on
    step 3.
11. **Step 2 ships fully final**: RHF + Zod form (the P6 idiom) for Vorname / Nachname /
    E-Mail; values live in flow-local state; validation gates "Weiter zur Zahlung →".
    **No login/register offer** — the future account area retrofits it into step 2 (E2
    retrofit precedent; a dead login CTA fails the P5 Instagram-band test). This resolves
    the question E4 deferred here.
12. **Step 3 ships final-except-blocked**: real buyer summary (from step 2's state) + the
    Widerruf notice + a **visibly-placeholder Karten line** (the selection Sitzplatzvergabe
    still blocks) + the placeholder payment region. The bottom-bar CTA keeps E4's
    "Zur Bestätigung →" — a placeholder action must not carry a pay-obligation label; the
    §312j wording activates when payment becomes real.
13. **`/orders/demo` renders the real confirmation page** on a seeded, **visibly fake**
    demo Bestellung (invent-visibly rule) via the normal query hook; **any other
    `orderCode` fails honestly** into the page's error state. Nothing pretends real money
    moved.
14. **Both routes get `robots: noindex`** — the site's first per-route robots meta. A
    capability URL must never be indexed; the flow is transactional chrome. (E4 punted
    this here.)

## Blocked — waiting on the club

- **Einlasskontrolle** → the Karten face (QR per Karte? name list?), PDF/Wallet/calendar
  artifacts, and the eventual event-app scanner. (`CONTEXT.md`, 2026-08-19)
- **Sitzplatzvergabe** → step 3's real Karten line + sum, and everything E4 lists for
  step 1. (`CONTEXT.md`, 2026-08-18)
- **Karten-AGB** → the consent checkbox + `/agb` legal page; blocker for real online
  sales, not for this build.

## Done When

- `/orders/demo` renders the final confirmation page from the seeded demo Bestellung;
  every other `orderCode` renders the honest error state with the human fallback.
- Step 2 is a fully functioning validating form; invalid data blocks progression; the
  typed values appear in step 3's Bestellübersicht.
- Step 3 carries the Widerruf-exemption notice and the §312j summary framing; the Karten
  line and the payment region are recognisably placeholder; no shipped surface claims
  payment methods, entry mechanics, codes, PDF, Wallet or reminder mails.
- The confirmation renders both payment faces (bezahlt / in Bearbeitung), shows buyer
  name + email, no codes; cross-sell and Kartenbörse teaser link correctly.
- Both routes carry `noindex`; the E4 honesty test grows the new banned claims.
- Full gates green (typecheck, tests, lint, build); as-built notes recorded here.

## Implementation plan (E5)

Four slices, per-slice review + full gates:

1. **S1 — Bestellung model + seed + route hygiene**: `lib/seed/orders.ts` (Zod schema:
   event ref, karten count/price/total, buyer, `paymentStatus`; the visibly-fake demo
   Bestellung), the `events` feature's order query hook (demo resolves, unknown codes
   fail), `noindex` on both routes, and the stale step-3 placeholder body update.
2. **S2 — Step 2 "Deine Daten"**: the final RHF + Zod buyer form, flow-local state,
   progression gating. (The account-retrofit seam is recorded in this plan, never as a
   code comment.)
3. **S3 — Step 3 "Zahlung"**: Bestellübersicht (real buyer data, visibly-placeholder
   Karten line), Widerruf notice, updated placeholder payment region, CTA semantics.
4. **S4 — Confirmation page**: the four blocks + both payment faces + error state; tests
   (states, honesty sweep, noindex); assembly + as-built notes.

## As-built (E5, 2026-08-20)

Built as the four planned slices (S3 and S4 in parallel); final gates green (typecheck,
**1021 tests** — 14 ui + 1007 website —, lint, build). The plan held; the decisions and
deviations worth carrying forward:

- **Step 3's CTA is disabled, and the walk into `/orders/demo` ends at step 3.** E4 pointed its
  *placeholder* step-3 action at the demo confirmation on purpose, so the whole shell could be
  walked end to end. E5 makes step 3 real-except-blocked, and that rationale expired with it: the
  action now sits under the reader's own typed name, so handing them a stranger's BEZAHLT page is
  exactly what the area's standing rule forbids ("disable honestly — nothing that pretends money
  moved"). `OrderFlowAction` gained `kind: 'pending'` — decision 12's **"Zur Bestätigung →"** label
  intact, button disabled — and `buildOrderConfirmationHref` was deleted as the resulting dead code.
  `/orders/demo` is now reachable by URL only; no dev-only affordance was invented to restore the
  walk. **This reverses an explicit E4 instruction — recorded here, not silent.**
- **The §312j information set is deliberately incomplete, and guarded.** Summary and Widerruf notice
  ship on step 3; the **Gesamtpreis does not**, because decision 12's visibly-placeholder Karten
  line means the count is unknown. The copy says so out loud ("Solange fehlt auch die Summe") and
  `buildOrderDraftSummaryRows` provably omits Karten/Summe. "Zahlungspflichtig bestellen" may not
  ship until count *and* total sit on the same screen — pinned by `not.toMatch(/zahlungspflichtig/i)`
  over every flow constant *and* over the rendered step.
- **Three placeholder regions ship, not the two the plan names**: step 1's selection core
  (E4-sanctioned), step 3's Karten line (a consequence of step 1, decision 12) and step 3's payment
  region (decision 5). Everything else is final.
- **"Recognisably placeholder" became a named token instead of a convention.** One
  `features/events/components/OrderPanel.tsx` carries `tone="placeholder"` (dashed) vs
  `tone="content"` (solid); that pair plus the `PLATZHALTER` eyebrow *is* the recognisability.
  Markers: `data-kk-order-panel` + `data-kk-order-panel-tone`.
- **A fourth step-3 state the plan never named: the missing-buyer face.** The buyer draft lives in
  flow-local `useState`, so a `?step=3` deep link or a reload legitimately has no buyer.
  `OrderFlowMissingBuyerNotice` plus a `Zu deinen Daten →` action
  (`deriveOrderFlowAction(step, hasBuyer)`) is the designed behaviour — it is what keeps a deep link
  honest without a silent redirect.
- **The sticky bar submits through the same `form.handleSubmit` the `<form>` uses**, not a native
  `button[form=…]` association (happy-dom does not implement it). Test-pinned consequence: submitting
  from the bar moves focus into the first invalid field, so errors are never revealed off-screen.
- **The Widerruf notice is a `role="note"`, never `role="alert"`** — a permanent legal statement must
  not interrupt on every load. Pinned in both directions.
- **`src/test/embargo.ts` is repo infrastructure now**, not one test's helper: `EMBARGOED_MECHANICS`
  and `PLATZ_LANGUAGE` are swept by seven copy-constant tests, two page-level `textContent` sweeps
  and a new seed-prose guard. It can never be applied site-wide as written — E3's "DIE REIHENFOLGE
  DES ABENDS" matches its `Reihe` branch — so it is a per-copy-set guard by construction.
- **One seed copy edit crossed phases:** the Rentnerfasching description lost "mit mehr Platz
  zwischen den Reihen" (it encoded a Sitzplatzvergabe variant on E3's shipped page) for "mit mehr
  Zeit für ein Gespräch". Now enforced by the seed embargo sweep rather than remembered.
- **The strongest honesty tension in E5 is deliberate:** `/orders/demo` shows a BEZAHLT hero for
  Max Mustermann while the reader's own name sits on step 3. Decision 13 sanctions exactly one
  visibly-fake demo Bestellung and forbids a second code; the **BEISPIELBESTELLUNG** band
  (`isDemoOrder`) and the severed step-3 CTA are what keep it honest. Nobody should later read it
  as a bug.
- **Homes a later phase needs:** `DEMO_ORDER_CODE`, `OrderSchema`/`Order`, `OrderEventSchema`,
  `OrderBuyerSchema`, `PaymentStatusSchema`, `buildOrder`, `DEMO_ORDER` all live in
  `lib/seed/orders.ts` (not barrel-exported); `LocalDateTimeSchema` is exported from
  `lib/seed/events.ts` so the order seed reuses one date shape; `NO_INDEX_META` in `lib/seo.ts` is
  the site's robots convention for any further capability route (and neither transactional route
  emits a canonical — that would be contradictory signalling); `formatWeekdayAndFullDate` joined
  `lib/date.ts` (the capability URL carries the year, the in-session kicker deliberately does not);
  `kkTokens.headline.{page,compact}` is the page-h1 scale; `components/SummaryRow.tsx` is the shared
  label/value row; `ExchangeTeaserBand` was promoted out of `EventListPage/internal/ui`;
  `EventCardSummary` was extracted from `EventSiblingCard` and is shared with the cross-sell card.
- **`vite.config.ts` is unchanged from HEAD.** A slice had widened `testTimeout` globally to survive
  `ApplyPage.test.tsx`; the audit reverted it and scoped the cap to that one file
  (`describe('ApplyPage', { timeout: 20_000 }, …)`). Measured: `userEvent.setup({ delay: null })`
  does not help it — the cost is the MUI DatePicker and a large form under 4-way parallelism.
- **Outstanding:** no headless-browser pass again (E3's precedent, E4's caveat) — the disabled bar
  action, the demo band and the summary-row overflow fix were verified by test and measurement, not
  by screenshot. The disabled CTA is also not focusable and carries no programmatic reason; it
  resolves itself when payment becomes real, and wants a `KkButton`-level disabled-tone primitive
  if it outlives this phase.

## References

- [Area plan](master-plan.md) · [Karten-Bestellflow](page-order-flow.md) ·
  [Kartenbörse](page-ticket-exchange.md)
- [`CONTEXT.md`](../../../CONTEXT.md) — Bestellung, Karte, Account, Ledger +
  Sitzplatzvergabe / Einlasskontrolle / Gast-Registrierung flags
- [ADR-0004](../../../docs/adr/0004-website-writes-membership-applications.md)
  (honest-failure precedent) · Mock rulings:
  [events-page README](../../../docs/design/events-page/README.md)
