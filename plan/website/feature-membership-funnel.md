---
title: Mitglied werden
slug: membership-funnel
type: capability
status: shipped
mock: docs/design/join-page/
adrs: [docs/adr/0004-website-writes-membership-applications.md]
---

## What & Why

The "Mitglied werden" funnel: turns an interested visitor into a **Beitrittsantrag** that reaches
the club. Destination of the home [Mitmachen-Band](feature-mitmachen-band.md) and of the recruit
band on `/club`. It explains what membership costs and means, and it captures the Antrag.

The page's thesis — taken from the mock and kept, because it is right — is that what keeps people
out of a Karnevalsverein is **not** the Beitrag but the fear of not fitting in and of not being
good enough. Hence the headline **"DU MUSST NICHT TANZEN KÖNNEN."** and hence the
[Konfetti-Kompass](feature-group-matcher.md), which is its own feature.

## Scope / Slices

- `/join` — info page: hero, Konfetti-Kompass, the Ticket, the four steps, FAQ, contact, closing band.
- `/join/apply` — the Antrag form, and the confirmation rendered in its place on success.
- `@furria/ui` — promote **`KkStatRow`** (rule of three).
- `lib/seed/` — the deletable stand-in for the future backend payloads.

## Decisions

### Submission — see [ADR-0004](../../docs/adr/0004-website-writes-membership-applications.md)

- The Antrag posts to **our own API** (`POST /api/membership-applications`), which persists it and
  mails the club. No third-party form service, no `mailto:`-only path, no client-side PDF. The ADR
  carries the full reasoning and the consequences; do not restate them here.
- **The master plan's "no backend" banner is amended, not broken.** It was always about Club-App
  data; the website has called `POST /api/preview/unlock` since P0 and the full stack deploys
  together.
- **P6 is frontend-only, and the backend is deferred — not scheduled.** The contract lives in
  [master-plan → Deferred → Antrag- und Gruppen-Backend](master-plan.md#antrag--und-gruppen-backend-not-scheduled).
  Until it exists the mutation calls the real
  URL, gets a 404, and the form shows its normal error state — which **always** offers the human
  fallback (Mail). Nothing fake, nothing disabled, and the frontend needs zero changes on the day
  the endpoint lands. Only testers can see it: the preview gate is up until P7.
- **Spam:** a honeypot field ships in P6 (off-screen, `aria-hidden`, `tabIndex={-1}`,
  `autoComplete="off"`; filled → report success, drop silently). Per-IP rate limiting and a possible
  privacy-preserving challenge (self-hosted **Altcha**, or **Friendly Captcha**) belong to the
  deferred backend — never a third-party captcha on the page where a child's data is entered.

### Routing

- **Two routes**: `/join` (persuade) and `/join/apply` (a focused, distraction-free form). The
  confirmation **replaces the form in place** on `/join/apply` — no `/join/done` orphan to guard
  against direct visits and no route to `noindex`.
- The Kompass hands over via search param: `/join/apply?groups=a,b`, `validateSearch` + Zod,
  **unknown ids dropped rather than 404**. This is also what keeps the two features decoupled.

### Seed data — the pattern for every future backend-bound feature

- Questions, Gruppe positions and the Gruppen themselves are all **destined for the DB**. So the
  frontend is built **as if it already fetched them**: Zod schemas, React Query hooks in the
  feature's `api.ts`, real loading and error paths. Only the `queryFn` differs — it resolves from a
  **seed module** instead of calling `apiFetch`. The later swap is one line per query.
- The seed lives **upstream of features** (`src/lib/seed/`) and is shaped **exactly** like the
  future API payloads, Zod-parsed at that boundary (precedent: P4's `changelog.json`). It is
  **deleted when the endpoints land**.
- **`/club` reads the same seed synchronously and is not migrated to queries.** Its Gruppen list is
  indexable content and P7 prerenders every route — making it async would blank the section for
  crawlers ([ADR-0003](../../docs/adr/0003-website-rendering-strategy.md)). The matcher is
  interactive and has no SEO value, so it may fetch freely. One source of truth, two access paths,
  no duplication to guard and no shipped page reopened for a refactor that would hurt SEO.
- A `GroupId` **union with compile-time exhaustiveness was considered and rejected**: ids will come
  from the database at runtime, so the guarantee would evaporate exactly when it mattered.

### Domain corrections (the mock and the old glossary were both wrong)

- **`Passiv` is not a Mitgliedschaftsart.** The domain expert overturned the 2026-07-16 note during
  this shaping: `Passiv` was the word for a membership that **pauses for a Session**, which is a
  **status**. Art is now **Aktiv / Jugend / Ehren**; status is **aktiv / paused / beendet**.
  `CONTEXT.md` and `docs/design/FCC-Schema.txt` are corrected. In German copy the membership
  **ruht** — the word "Passiv" never appears on the page.
- **Only Aktiv and Jugend are joinable.** **Ehren** is conferred and is **not published on the
  public website** — the mock's line about the Mitgliederversammlung conferring it is dropped.
- **The Mitgliedschaftsart is derived from the Geburtsdatum, never asked.** The mock lets you tick
  "Aktiv" while entering a 2015 birth date; the form must not permit that contradiction. Under 18
  at submission → Jugend (15 €), otherwise Aktiv (30 €). Shown back to the applicant as a
  consequence, not as an input. (The mock also invented a "Kind" tier, which does not exist.)
- **There are no open, drop-in trainings.** Nobody can simply turn up. This kills the mock's entire
  *"ERST VORBEIKOMMEN, DANN ENTSCHEIDEN"* premise, its dated open-training list, and the
  "Turnschuhe reichen / ohne Anmeldung" copy everywhere it appears. The low-commitment first step
  is now the Kompass (costs nothing, asks for nothing) and an **Anfrage**, which is always welcome.
- **Gruppen are independent of the Mitgliedschaft.** Person↔Gruppe is many-to-many and a Mitglied in
  no Gruppe is normal — hence the Antrag's group field is **optional and multi-select**, framed as
  interest, never as a commitment. An empty answer is a normal answer.
- **No "Vorstand", in code or copy** (glossary law, and P4 already fixed this twice). The mock's
  *"Vorstand nimmt auf"*, *"Der Antrag geht direkt an den Vorstand"* and *"spricht mit dem
  Vorstand"* all go. Copy says **"der Verein"** or **"wir"** and does not name a body it cannot
  name correctly.
- **Applicant ≠ Mitglied.** The confirmation does not say "WILLKOMMEN" — the club has not decided
  yet. New glossary term **Beitrittsantrag** in `CONTEXT.md`.
- **Kostüme are not (all) paid by the club.** The mock's *"Kostüme gestellt oder bezuschusst"*
  claim is removed everywhere.

### `/join` — the info page

Order: **Hero → Konfetti-Kompass → Ticket → Die vier Schritte → FAQ → Kontakt → Band**.
`PageLayout` + `KkHeroSection` + `KkSection`/`KkSectionHeader` + `KkBandSection`, per P4.1 — no
page shell, `<main>` or `Container` of its own.

- **Hero.** Eyebrow `MITGLIED WERDEN · SESSION 2026/27`, H1 **DU MUSST NICHT TANZEN KÖNNEN.**,
  lead, and **Antrag primary / Kompass secondary** — the page has one job, and the visitor who
  arrived ready should not hunt for the form. Stats: **three, derived** from `lib/club.ts`
  (`MEMBER_COUNT_PLACEHOLDER`, `GROUP_COUNT_PLACEHOLDER`, `currentSession`). The mock's fourth
  stat, *"14 Neue 2026/27"*, is invented and unverifiable — dropped. The `Aside` slot stays
  decorative.
- **The Ticket** — the page's one signature object. A **gold** surface with ink text (gold is the
  background, so contrast is sound in both schemes), a **genuine perforated edge** cut with
  radial-gradient notches, a vertical `FURRIA` stub, ~1.5° tilt on `shadow.raised` so it lies on
  the page like a physical thing, the stub as the CTA (lifts on hover), and a blank dotted
  **`MITGLIED NR. ____`** line instead of the mock's fake "NR. 185". `useReducedMotion`-aware.
  - It is an **info flyer in the shape of a ticket** — the one-glance answer for someone
    considering joining — not a purchase and not a Probeticket. Rows: **BEITRAG** (30 € / bis 17
    Jahre 15 € / keine Aufnahmegebühr) · **LAUFZEIT** (pro Session, Kündigung zum Sessionende) ·
    **PAUSE** (eine Session aussetzen — die Mitgliedschaft ruht) · **GRUPPEN** (eine, mehrere oder
    keine) · **DRIN** (Training in deiner Gruppe, Auftritte, Ordensfest & Orden, Club-App) ·
    **ERWARTET** (in Auftrittsgruppen regelmäßige Proben in der Session, beim Aufbau mit anfassen)
    · **FRAGEN** (jederzeit, auch ohne Antrag). Objection chips: *Keine Aufnahmegebühr · Kein
    Vorsingen · Wohnort egal*.
  - The mock's hard `10px 10px 0` offset shadow and barcode are **not** adopted: hard offset
    shadows stay rejected as the system (fifth phase running), and `shadow.posterOffset` stays
    reserved for hero headlines. The WOW comes from the **object**, not from a shadow.
  - **Website-local** (`features/membership/components/MembershipTicket/`), a compound kit — not
    promoted to `@furria/ui`, exactly as P3 kept the club hero's numeral + ribbon local.
- **Die vier Schritte** — rewritten, since "vorbeikommen" is gone and "Vorstand" is banned:
  **01 Gruppe finden** (oder ohne Gruppe starten) · **02 Antrag stellen** (ein Formular, zwei
  Minuten) · **03 Aufnahme** (wir entscheiden in der nächsten Sitzung und melden uns) ·
  **04 Willkommen**.
- **FAQ** — kept; it is the mock's second-best idea. MUI `Accordion`. The mock's seven questions are
  reused only where still true: *"Muss ich tanzen können?"*, *"Ich bin nicht von hier"*, *"Was
  kostet mich das wirklich?"* and *"Ein Jahr keine Zeit — muss ich kündigen?"* (→ the membership
  **ruht**) survive. The ones resting on drop-in trainings or on groups we do not have
  (Werkstatt, Technik, Showtanz, Jugendgarde) are rewritten against the real six. Added: *"Muss
  ich in eine Gruppe?"* (no). The mock's hardship answer keeps its warmth but loses "Vorstand".
- **Kontakt** — **one official channel**, `CLUB_CONTACT_EMAIL`. The mock's three named people with
  private mobile numbers are cut: P5 already banned inventing plausible real people in an Amt, and
  publishing private mobiles is a spam and DSGVO problem even when the people are real.
- **No Helfer-Liste.** Its target does not exist (P5's dead-link precedent), and the need it served
  — *unterstützen, ohne mitzumachen* — has no separate home in the model.
- **No Gruppen showcase section.** The Kompass result lists them; `/club` owns the showcase. One
  link, no third roster surface.
- **No landing teaser.** `/` is static-final and P4 spent its one slot on news; the
  Mitmachen-Band already points here.

### `/join/apply` — the Antrag

- **Fields:** Vorname\*, Nachname\*, Geburtsdatum\*, Straße\*, PLZ\*, Ort\*, E-Mail\*, Telefon,
  Gruppen-Interessen (optional, multi), Einwilligung\*. The address matches the `person` table the
  Club-App will eventually own; the mock's city-only "Wohnort" is useless for a Verein's records.
- **Derived, not asked:** Mitgliedschaftsart and Beitrag (from Geburtsdatum), shown back live.
- **Under 18 → a required guardian block** (Name\* + E-Mail oder Telefon\*), appearing when the
  derived age says so, and the Einwilligung is then **worded as given by the guardian**: a minor
  cannot validly consent to a Vereinsbeitritt alone (§107 BGB). The mock's promised **SMS
  confirmation link is not built** — no second channel, no flow. The club confirms in first
  contact. This matters most for Kindergarde (6–11), the group the page is most likely to convert.
- **Consent: one unchecked, required checkbox** — Satzung and Datenschutzhinweise. Two mock defects
  fixed: it **defaults to checked** (legally invalid) and it **bundles photo consent** into the
  same box (Kopplungsverbot) on a topic `CONTEXT.md` explicitly flags as unresolved. **No photo
  consent here** — it belongs to whoever eventually designs the Fotoerlaubnis.
- **The Satzung is linked** even though no `/satzung` route exists yet, accepting the branded 404
  in the interim (user's call, P4's archive-button precedent). Two consequences: it must be a
  **plain anchor**, because a typed `Link` cannot compile against a route that does not exist
  (P4's finding); and **shipping `/satzung` is a P7 launch blocker** — this link sits inside a
  legal consent, unlike P4's invisible derived button.
- **A derived summary panel** stays (Mitgliedschaft · Beitrag · *jetzt fällig: 0 €*) — the mock's
  best form idea, because "nothing is being charged" is the objection that stops people. It echoes
  **derived** values only, not the fields.
- **Confirmation, in place:** eyebrow `ANTRAG IST DA`, **DANKE, <Vorname>.**, three honest next
  steps (Bestätigung · Aufnahme · Willkommen), one `KkSeal`, and links to `/program` and `/`. **No
  invented "Vorstandssitzung 3. September"** and no second list of dates.
- **The Club-App is advertised as a membership benefit** (ticket `DRIN` row, confirmation step 03) —
  a deliberate decision by the user against the recommendation. Recorded because the app is
  unbuilt and unscheduled, so this is a promise with no date on the page where trust is built.
  **P7 should re-check it** if the Club-App still does not exist at launch.

### Testing

Pure functions, unit-tested directly, never through rendered mock data: age → Mitgliedschaftsart
→ Beitrag derivation (incl. the birthday-today boundary), the search-param parser, and the form
schema. Beware the P5 date trap: `new Date('YYYY-MM-DD')` is **UTC** midnight — parse date-only
strings on the local calendar.

## What shipped (P6, 2026-07-30)

All ten slices, frontend only, on `feat/website-p6-join-fe` (`86018a5`…`b581d3c`). Every decision
above shipped as written. The deviations, so nobody reads this file as a lie about the code:

- **Structure.** `features/membership/` owns `/join` (`JoinPage` + `JoinHero` + `MembershipTicket` +
  `JoinSteps` + `JoinFaq` + `JoinContact` + `JoinClosingBand`) and `/join/apply`
  (`ApplyPage` → `ApplyForm` compound + `ApplyConfirmation`). `JoinPage` **takes children** and the
  route composes it with the Kompass — the matcher is a separate feature and features never import each
  other, so the route is the only place that can join them.
- **The Antrag route file is `join_.apply.tsx`** — the trailing underscore, exactly P4's finding: the
  dotted name nests the form inside `JoinPage`, which renders no `<Outlet/>`. A route test pins it.
- **Form state is RHF's own `FormProvider`/`useFormContext`**, not a hand-rolled compound context — the
  library already provides the context this kit would have duplicated. The interest chips go through
  **`useController`** (`hooks/use-group-interests-field.ts`): the first cut read the form with `watch`
  from a child, and react-hook-form only re-renders at the `useForm` component, so **the chips could
  not be ticked or unticked at all**. A prefill test in slice 10 caught it. *Lesson: `watch` in a child
  of `FormProvider` silently does nothing.*
- **The POST body carries no Mitgliedschaftsart and no Beitrag.** Both stay derived on the server from
  `birthDate` — shipping a client-asserted tier would have reintroduced the mock defect this feature
  exists to fix. The response schema is `z.object({})`; nothing is read back, so no contract was
  invented.
- **The Gruppen come from a `useGroupsQuery`** in the feature's `api.ts` resolving from
  `lib/seed/groups` — build-as-if-fetched, with real loading and error paths, and the swap is one line.
- **`?groups=` is filtered twice:** unknown ids are dropped when prefilling the chips *and* again from
  the submitted payload (`selectKnownGroupIds`). `validateSearch` + Zod `.catch(undefined)`; a
  malformed param renders the normal form and never 404s.
- **Only the hero's Antrag CTA is a typed `Link`.** The Kompass result CTA stays a plain href:
  `renderWithProviders` mounts no router (a TanStack `Link` throws), and a typed `search={{ groups }}`
  serialises through `URLSearchParams`, turning the documented `?groups=a,b` into `?groups=a%2Cb`.
- **The Ticket's stub does not stack at `xs`** — it stays a narrow vertical column at every breakpoint,
  because stacking loses both the silhouette and the perforation at 360px. Gold `warning.main`, ink
  `warning.contrastText`, notches `background.default`, stub `warning.dark`.
- **Two MUI/layout realities:** `Checkbox.inputRef` is gone in MUI v9 (the consent ref goes through
  `slotProps={{ input: { ref } }}`), and the summary aside **cannot be sticky** because `PageLayout`'s
  root sets `overflow: hidden`.
- **Copy deltas.** The closing band CTA is *"Jetzt Antrag stellen →"* — the hero already owns
  *"Antrag stellen →"* and the duplicate accessible name made three `findByRole` queries ambiguous. The
  hero's secondary CTA is *"Wo passe ich hin? ↓"* rather than naming the Kompass (one line at 360px,
  and the arrow reads as an in-page jump). The third hero stat is the **Session ordinal**, so it does
  not repeat the eyebrow's `yearsLabel`. The FAQ shipped **eight** questions; answer 1 says *"der
  Elferrat trägt die Prunksitzung"* because step 03 uses "Sitzung" in the meeting sense on the same
  page, and the child question became *"Mein Kind möchte mitmachen."* since the mock's version rested
  on drop-in trainings. The Kontakt section states outright that there is no phone number.
- **Slice 9's review found real defects** and they were fixed: an inline `setValue` handler in JSX (→ a
  per-item `ApplyInterestChoice` part), a fetch plus fallback-link derivation living in a presentational
  assembly (→ `fallbackMailHref` moved onto the hook's state), a drilled `GroupsSource` prop with one
  live consumer (→ the consumer calls the hook), and a 165-line section mixing altitudes (→
  Person/Address/Contact fieldsets extracted; 67 lines of pure composition left).
- **Verification debt, carried forward:** only the Ticket was checked in a real browser (headless
  Chrome, 360px dark + 1280px light). The four steps, the FAQ, the Kontakt block and the band rest on
  token reuse and CSS reasoning — **not eyeballed at 360px or in the dark scheme.** Same debt P5
  recorded; it is still owed.

## Open Questions

- `CLUB_CONTACT_EMAIL` is still a placeholder, and there is no club phone number. Both block the
  contact section from being real (P7).
- Retention/deletion rule for applicant data in the Datenschutzerklärung — lands with the deferred
  backend, and no later than P7, per ADR-0004.
- Every membership fact on the page (30 €/15 €, keine Aufnahmegebühr, Kündigung zum Sessionende,
  Ruhen, who decides an Aufnahme) is **unverified against the Satzung**. Accepted for now; a P7
  launch task.

## Done When

- A visitor on a phone or a desktop, in light or dark, understands what membership costs and means,
  can find where they might fit, and can submit an Antrag that either reaches the club or fails
  honestly into a human fallback — with a confirmation that does not call them a Mitglied yet.

## Implementation plan (phases)

Ten vertical slices, each leaving the app building and working. **Frontend only** — the backend is
[deferred](master-plan.md#antrag--und-gruppen-backend-not-scheduled). Review each slice with
`react-code-reviewer`, plus `react-composition-guru` on the compound-heavy ones (3, 5, 6, 7, 9).

1. **Seed module + schemas.** `src/lib/seed/groups.ts` shaped like `GET /api/groups`
   (`id`, `name`, `ageRange`, `isRecruiting`, result line), Zod-parsed at that boundary; the six real
   Gruppen. `/club`'s `groups-content.ts` reads it for the roster and keeps its editorial copy keyed
   by id — **still synchronous**. *Verify:* `/club` renders identically; a roster/content key
   mismatch is caught by tests; unit tests on the parse.
2. **`KkStatRow` in `@furria/ui`.** Slotted compound; migrate `HeroStatRow` and `ClubStoryStats`.
   *Verify:* both pages unchanged visually, light + dark; `packages/ui` tests.
3. **`/join` page shell + hero.** `PageLayout` + `KkHeroSection`, replacing `PlaceholderPage`;
   headline, lead, Antrag-primary/Kompass-secondary CTAs, three derived stats via `KkStatRow`,
   decorative `Aside`, per-route `head`. *Verify:* route test, 360/390/900/1280px, light + dark.
4. **Kompass logic, no UI.** `features/group-matcher/`: schemas, seed for the eleven questions and
   all 6 × 11 positions, `api.ts` query hooks, and the pure scoring module. *Verify:* unit tests for
   normalisation, skips, filter exclusion, zero-answers, all-excluded, and tie stability.
5. **Kompass stepper.** One question per step, progress, `zurück`, `überspringen`, `sessionStorage`.
   *Verify:* interaction tests; refresh keeps answers.
6. **Kompass result.** Ranking with bars, derived «warum», recruiting badges, excluded-with-reason
   list, CTAs, and the `?groups=` handoff. *Verify:* the empty/all-excluded states render honestly.
7. **The Ticket.** `MembershipTicket` compound: gold surface, perforation notches, vertical stub,
   tilt, blank `MITGLIED NR. ____`, stub CTA, `useReducedMotion`. *Verify:* contrast in both schemes;
   no horizontal overflow at 360px; reduced-motion path.
8. **Vier Schritte · FAQ · Kontakt · closing band.** `KkSectionHeader`, MUI `Accordion`,
   `CLUB_CONTACT_EMAIL`, `KkBandSection`. *Verify:* accordion a11y; `/join` reads end-to-end.
9. **`/join/apply`.** Route + form: RHF + Zod, derived Art/Beitrag summary, conditional guardian
   block, unchecked required consent (plain `/satzung` anchor), honeypot, mutation to
   `POST /api/membership-applications`, error state with the human fallback. *Verify:* unit tests on
   the derivation (incl. the birthday-today boundary — parse date-only strings **locally**, P5's
   trap) and the schema; a failing submit shows the fallback.
10. **Confirmation + handoff.** In-place confirmation (`ANTRAG IST DA`, `DANKE, <Vorname>.`, three
    steps, `KkSeal`, links out) and `?groups=` prefilling the interest chips, unknown ids dropped.
    *Verify:* full flow test; a bad param never 404s.

## References

- `CONTEXT.md` (**Mitgliedschaft**, **Mitgliedschaftsart**, **Ruhende Mitgliedschaft**,
  **Beitrittsantrag**, **Gruppe**, **Account**, **Einladung**, **Beitrag**).
- [ADR-0004](../../docs/adr/0004-website-writes-membership-applications.md) ·
  [ADR-0003](../../docs/adr/0003-website-rendering-strategy.md) (prerender vs. fetched content).
- Mock: [`docs/design/join-page/`](../../docs/design/join-page/README.md) — adopted/rejected there.
- Sibling: [Konfetti-Kompass](feature-group-matcher.md). Entry point:
  [Mitmachen-Band](feature-mitmachen-band.md).
