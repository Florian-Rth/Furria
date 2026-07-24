# Website — Master Plan

The public website of the Furrscher Carnevals Club e.V. ("FURRIA"). One of three apps
served by the single backend (`server/`); this plan covers **only** the public website
(`web/apps/website`).

---

## How this plan works

- **Master plan (this file)** is the dashboard. It holds the feature index and the phases.
  It is the entry point: to know whether a feature exists, look at the index; to know what
  ships next, look at the phases.
- **Feature files** (`feature-*.md`) are durable **intent** documents — what a feature is,
  why, the decisions already made, open questions, and "done when" outcomes. They may name
  patterns and big architectural choices. **No code, ever.** They are evergreen: they
  describe the whole capability and outlive any single phase.
- **Phases** are shippable milestones. A phase links to the features it advances and states
  the **slice** it delivers this phase (many-to-many: one feature can be touched by several
  phases). Phases carry status; feature slices are checkboxes.
- **Decisions:** feature-scoped decisions live in the feature file. Cross-cutting,
  hard-to-reverse decisions become an **ADR** (`docs/adr/`) and the feature file links to it
  — never restate an ADR.
- **Glossary:** domain terms live in `CONTEXT.md` only. This plan uses them, never redefines
  them.
- **Where the "how" goes:** concrete implementation detail (component breakdown, tasks, API
  shapes) is volatile and belongs to the moment of building — the PR or a throwaway working
  doc — **not** these files.

**Feature status** (frontmatter `status`): `idea` → `shaping` → `ready` → `building` → `shipped`.

---

## Overview

> **Scope banner — Website v1 ships fully static; no backend integration.** All live data
> (events, tickets, scarcity, member/group counts, news) originates in the **Club-App**, which
> is **not built yet**. Until it exists, the website is a fully static marketing site: every
> "block" is fed by hand-curated, editable content constants behind clean typed interfaces, so
> real data can be dropped in later as a **data-source change, not a rewrite**. All live-data
> capabilities live in **[Deferred — needs Club-App backend](#deferred--needs-club-app-backend)**
> below, not in the numbered roadmap.

A responsive, German-language marketing + ticketing site in the "Konfetti Kinetik" brand.
Guiding constraints (all binding):

- **Web-app first, Capacitor-wrappable** later (native push, widgets) — keep it a standard
  responsive web app.
- **ONE theme across all apps** (Corporate Identity), consumed from `@furria/ui`. No new
  colors, fonts, radii, shadows. Light + dark.
- **Routes/IDs/props = English. Visible text = German.**
- **Narrenruf is "Gross - Furria!"** — never Helau/Alaaf.
- One backend API serves all apps — but **Website v1 consumes no backend; it is fully static**.
  Public read endpoints are a deferred, post-Club-App capability (see the scope banner).

**References:** [`CONTEXT.md`](../../CONTEXT.md) · [design handoff](../../docs/design/README.md)
(READ FIRST governs mock usage) · [`docs/adr/`](../../docs/adr/).

---

## Feature index

| Feature | Type | Status | Purpose |
|---|---|---|---|
| [Site-Shell](feature-site-shell.md) | foundation | shipped | Masthead nav, footer, theming, layout, `@furria/ui` wiring |
| [Preview-Gate](feature-preview-gate.md) | foundation | shipped | Pre-launch access gate (tester portal removed 2026-07-20) |
| [API-Client](feature-api-client.md) | foundation | building | Data layer to the backend public read endpoints |
| [SEO & Meta](feature-seo-meta.md) | foundation | building | Meta tags, Open Graph / social-share cards |
| [Ticker](feature-ticker.md) | foundation | building | Flat red/gold marquee signature chrome |
| [Landing](feature-landing.md) | capability | shipped | Home page — composes the blocks below |
| [Landing-Hero](feature-landing-hero.md) | capability | building | Identity centerpiece: headline, CTAs, stats, hero photo |
| [Programm-Teaser](feature-program-teaser.md) | capability | shipped | Home "DAS PROGRAMM" upcoming-events section |
| [Mitmachen-Band](feature-mitmachen-band.md) | capability | shipped | Home recruit CTA → membership funnel |
| [Verein](feature-about-verein.md) | capability | shipped | Verein story, Ämter, Gruppen showcase |
| [Veranstaltungskalender](feature-event-calendar.md) | capability | idea | Public event list/calendar + detail |
| [Ticket-Shop](feature-ticket-shop.md) | capability | idea | Browse ticketed events, checkout, payment |
| [Aktuelles](feature-news.md) | capability | idea | News posts (list + detail) |
| [Bildergalerie](feature-gallery.md) | capability | idea | Public event photo gallery |
| [Mitglied werden](feature-membership-funnel.md) | capability | idea | Membership info + application funnel |

---

## Phases

### P0 — Shell & theme
**Status:** done (2026-07-20, branch `feat/website-p0-frontend`, 4 commits `61b7e51`…`5f94be6`)
Deployable branded shell behind the preview gate: masthead + footer + light/dark, real pages at
their final English URLs, tester portal at `/apps`, `@furria/ui` wired, the app builds and deploys.
Deviations from plan are recorded in the feature files (Site-Shell: color-scheme init script;
SEO & Meta: share-image URL deferral).

- [x] [Site-Shell](feature-site-shell.md) — `_site` layout route (masthead + footer), TanStack
      Router skeleton, full data-driven nav + shared `PlaceholderPage`, theme toggle; rename
      `/impressum`→`/imprint` & `/datenschutz`→`/privacy`
- [x] [Preview-Gate](feature-preview-gate.md) — three-zone gate (legal public / marketing gated /
      portal gated); portal → `/apps`, app-launch cards *(portal removed again right after P0 —
      see feature file)*
- [x] [API-Client](feature-api-client.md) — `apiFetch` helper + env + query-client defaults +
      Zod-at-boundary rule (no domain endpoints/mocks)
- [x] [SEO & Meta](feature-seo-meta.md) — TanStack Router `head` base, defaults, favicon links,
      `robots.txt` disallow-while-gated

### P1 — Landing hero
**Status:** done (2026-07-21, branch `feat/website-p1-landing-hero-fe`, 7 commits `cf18d47`…`578fc4e`)
The home page's identity centerpiece is live (static content). Built as the 6 vertical slices in the
[Landing](feature-landing.md) Implementation plan. Followed the plan closely; minor build-level
choices worth knowing: the relocated teaser is named `PreviewTeaser`
(`features/preview-access/components/PreviewTeaser/`); `LandingPage` was flattened out of its
per-component folder (no `internal/` parts left); the hero poster-shadow offset is tokenised as
`kkTokens.shadow.posterOffset` (colour still theme-driven `ink`→cream). All six new `@furria/ui`
primitives shipped as planned.

- [x] [Landing](feature-landing.md) — real home page owns `/`; teaser relocated to preview-access;
      block composition/order locked (Hero → Ticker → [P2 blocks]); `/` granted-branch renders the
      real landing in `SiteChrome`; branded home `head`
- [x] [Landing-Hero](feature-landing-hero.md) — full hero block (static copy/stats derived from
      `lib/club.ts`; CTAs → `/tickets` · `/program`; placeholder photo)
- [x] [Ticker](feature-ticker.md) — marquee under the hero (static, session label derived)

**Cross-cutting (decided in P1 shaping):**

- **`@furria/ui` gains the shared brand gestures/primitives** the hero + ticker need: `KkSeal`,
  `KkBroomMark`, `KkConfettiScatter` (static, distinct from `KkConfettiRain`/`Burst`),
  `KkPhotoPlaceholder`, `KkTwoToneHeadline`, `KkTicker`. This **sharpens the Site-Shell boundary**:
  `@furria/ui` = theme + token-pure brand primitives/gestures (reusable by all apps); website-local
  = chrome (masthead/footer) + composed sections (hero, blocks). The footer's local `BroomMarkIcon`
  is refactored to consume the shared `KkBroomMark` (de-dupe).
- **Teaser ownership moved** `features/landing` → `features/preview-access` (see
  [Preview-Gate](feature-preview-gate.md)); `KkTwoToneHeadline` is promoted to `@furria/ui` and
  consumed by both the teaser (no shadow) and the hero (poster shadow).
- **Glossary:** added **Session** to [`CONTEXT.md`](../../CONTEXT.md).
- **Deferred (not P1):** real hero photo, real member/group counts (→ placeholders), live stats +
  data-driven ticker (→ Deferred — needs Club-App backend), absolute OG image URL (→ launch).

### P1.1 — Mobile hero
**Status:** planned (added 2026-07-22, branch `feat/website-p1-landing-hero-fe`)
A dedicated mobile-only hero treatment (immersive full-bleed photo + pinned headline), replacing
the current mobile behaviour of just stacking the desktop split hero. Sourced from a new mock
(`docs/design/mobile-hero.html` + `docs/design/mobile-hero-handoff.md`), reconciled against the
shipped P1 decisions in a grilling session — see [Landing-Hero](feature-landing-hero.md) Decisions
and the new slices in the [Landing](feature-landing.md) Implementation plan.

- [x] [Landing-Hero](feature-landing-hero.md) — new `MobileHero` (full-bleed photo + mode-invariant
      scrim + pinned two-tone headline) + `HeroFollow` (reuses `Hero.Intro`/`Hero.Actions`/
      `Hero.StatRow`), mounted alongside the existing `Hero` in `LandingPage`, toggled by
      breakpoint (`xs` vs. `md+`) — same pattern as `MastheadDesktopBar`/`MastheadMobileBar`
- [x] `@furria/ui` — `kkTokens.aspectRatio` (`portrait: '4 / 5'`, `landscape: '7 / 5'`) replacing
      inline ratio strings; `kkTokens.overlay.photoScrim` (mode-invariant legibility gradient,
      sibling to `kkTokens.color` rather than part of it); `KkPhotoPlaceholder` gains a `fill`
      variant for full-bleed (no aspect-ratio, no radius) use

**Explicitly out of scope (per the mock's READ FIRST — layout/functionality is inspiration, not
spec):** the mock's status bar + transparent overlay nav baked into the hero — the real, shipped
`Masthead` stays untouched, in normal opaque flow, on every route including mobile `/`.

### P2 — Landing complete
**Status:** done (2026-07-23, branch `feat/website-p2-landing-complete-fe`, 3 commits `7a0e9f1`…`9abaaed`)
The full landing page reads end-to-end — **static-final** (this build has no backend). Added the two
remaining blocks below the shipped Hero → Ticker; final block order Hero → Ticker → Programm-Teaser
→ Mitmachen-Band → Footer, no restructuring of P1. Both blocks live under
`features/landing/components/` and are composed by `LandingPage` inside a gutter-constrained
`Container` (below the full-bleed ticker). Followed the plan closely; build-level choices worth
knowing: `kkTokens.aspectRatio.banner` shipped as **`'2 / 1'`**; the position tint mapping is a
shared `resolveEventTint(palette, index)` helper in `program-content.ts` (red = `primary.main`,
gold = `warning.main`, ink = `text.primary`) consumed by both the desktop grid and the mobile list,
with the event `.map` done in the `ProgramTeaser` assembly so the layout slots (`ProgramGrid`,
`ProgramList`) stay pure children-only slots; the Mitmachen watermark sits at 0.1 opacity (vs the
hero's 0.05) as it is white-on-red, not ink-on-cream. Final copy shipped exactly as planned.

- [x] [Programm-Teaser](feature-program-teaser.md) — "DAS PROGRAMM": section header + "Alle Termine
      →" (→ `/program`) + 3 event cards. **Desktop** photo-topped `ProgramCard` (3-col grid),
      **mobile** compact photo-less `EventRow` (two presentational components). **Data-driven via a
      typed `{ startsAt, title, venue }` interface + editable placeholder constant** (card derives
      day / month / time; tint assigned by position) — swapping to real data is a data-source change
      only. New token `kkTokens.aspectRatio.banner` for the card photo.
- [x] [Mitmachen-Band](feature-mitmachen-band.md) — one **responsive** recruit band (desktop row /
      clean mobile stack — the mock's mobile is broken and is *not* the target), reworked final copy,
      `KkBroomMark` watermark, CTA "Mitglied werden →" → `/join`.

**Cross-cutting (decided in P2 grilling, 2026-07-23):**

- **Website v1 is fully static — no backend.** All live-data slices (real events, scarcity, live
  hero stats, real endpoints, ticketing) moved to **[Deferred — needs Club-App
  backend](#deferred--needs-club-app-backend)**. See the scope banner.
- **Blocks are data-driven behind clean typed interfaces** fed by editable content constants, so
  the later real-data swap is a data-source change, not a rewrite.
- **`@furria/ui` gains `kkTokens.aspectRatio.banner`** (token-pure) for the event-card photo.
- **Glossary:** added **Programm** (public event-lineup sense vs. Club-App running-order sense) to
  [`CONTEXT.md`](../../CONTEXT.md).
- **Domain fact:** the club's real Gruppen are Tanzgarde, Männerballett, Elferrat, **Büttenrede** —
  **not** Spielmannszug (a mock error), recorded in [Mitmachen-Band](feature-mitmachen-band.md).
- **Deferred (not P2):** event-selection logic, scarcity badge, empty state (all need live data);
  the full Veranstaltungskalender at `/program` (stays a placeholder this build).

### P3 — Verein
**Status:** done (2026-07-24, branch `feat/website-p3-verein-fe`, 9 commits `013401c`…`6994ba9`)
`/club` live — a single scrolling editorial page, **static-final** (no backend), rendered by
`features/club/ClubPage`. Shipped as the 9 per-section vertical slices in the
[Verein](feature-about-verein.md) Implementation plan. Followed the plan closely; build-level
choices worth knowing:
- **`ClubPage` composition:** hero + story share a gutter `Container`; the two red bands
  (`NarrenrufBand`, `RecruitBand`) are full-bleed **siblings** rendered outside the Container (not
  negative-margin); chronik/season/gruppen/people sit in a second Container. Section order exactly
  as planned.
- **`Group` interface uses English field names** `lead`/`schedule` (not the plan's `leitung`/
  `treffen` — code = English rule); the German visible labels ("Leitung"/"Treffen") live in a
  `groupsModalLabels` const. Fields: `{ title, blurb, memberMeta, fullText, lead, schedule }`.
- **Gruppen = 6** (Tanzgarde, Männerballett, Elferrat, **Büttenrede**, Kindergarde, Organisation —
  no Spielmannszug); the group-count stat derives from `GROUPS.length`, matching the grid.
- **Modal (slice 7)** lives under `GruppenGrid/internal/{logic,ui}`, not a separate section folder.
  Two logic hooks: `use-group-modal` (the `openGroupId | null` state) + `use-modal-presence` (the
  exit-animation latch, extracted from the panel during review-fix). MUI `Modal` base + `motion.div`
  panel, `useReducedMotion`-aware.
- **Hero mobile** is distilled via `sx` toggles — the framed photo column (incl. the `KkSeal`
  opening-date) is hidden at `xs`; the giant numeral is the single mobile anchor; ribbon
  desktop-only. `ChapterHeader` numeral + kicker/title reused by story/chronik/season/gruppen/people.
- **Reviews** ran per slice (`react-code-reviewer` + `react-composition-guru` on hero/grid/modal);
  fixes applied: ChapterHeader `xs` title overflow, English field rename, the mode-baked color read
  in the recruit band (→ `primary.contrastText`), and the modal-presence hook extraction. All
  gates green each slice (267 tests total: 30 ui + 237 website; typecheck/build/lint clean).

- [x] [Verein](feature-about-verein.md) — hero (derived numeral + ribbon) → story+stats → narrenruf
      → chronik → season → gruppen (grid + motion detail modal) → people (Ämter) → recruit; static
      content behind typed constants

**Cross-cutting (decided in P3 grilling, 2026-07-24):**

- **Mock moved** to `docs/design/verein-page/`. Its "Plakat-Kapitel" direction (hard offset-shadows
  as the leading elevation, square corners, 2px ink borders everywhere) is **rejected as the
  system** per the design README's READ FIRST — our shipped **Destillat** language wins (MUI cards,
  `radius.base` 14, hairline borders, soft elevation). Only the **hero** keeps bold gestures
  (two-tone poster shadow + ribbon + giant *derived* session numeral).
- **No dark ink-panels.** All sections on the normal theme background; red appears only as **two
  full-bleed strips** (Narrenruf + Recruit). Rhythm comes from the numbered `ChapterHeader`.
- **The Gruppen detail modal is the page's one interaction** — MUI `Modal` base (a11y) + a
  `motion.div` panel (`AnimatePresence` spring scale-fade, `useReducedMotion`-aware, `motion` already
  a dep). Uses `PreviewAccessDialog`'s a11y pattern.
- **People wall is keyed on Ämter, never "Vorstand"** (glossary law); code field `amt`; placeholder
  faces for v1.
- **Single responsive components throughout** (no Desktop/Mobile forks) — every section reflows;
  the hero's mobile branch is a *distilled* variant (numeral as the single anchor, ribbon
  desktop-only). Unlike the landing hero's two-tree split.
- **New feature folder** `features/club/`; the giant numeral + ribbon are club-hero-local (not
  promoted to `@furria/ui`, YAGNI).
- **Glossary:** no new/sharpened term — the page reuses **Amt / Gruppe / Session / Beitrag /
  Narrenruf** as already defined in [`CONTEXT.md`](../../CONTEXT.md).
- **Deferred (not P3):** real Vereinsgeschichte + Chronik milestones, real Gruppen/Ämter/photos,
  live member & group counts, and the backend **per-Amt "show on public page" flag** (seam noted,
  not scaffolded) — all need the Club-App backend.

### P4 — News
**Status:** planned
`/news` live — the marketing site is content-complete. Before launch: stand up the **prerender
mechanism** (deferred from P0) + **bot OG-meta injection** for the first dynamic detail page.

- [ ] [Aktuelles](feature-news.md) — list + detail
- [ ] [SEO & Meta](feature-seo-meta.md) — prerender mechanism spike + news-detail OG injection

### P5 — Gallery
**Status:** planned
Static-implementable: public event photos shipped as **curated static assets** (no backend).

- [ ] [Bildergalerie](feature-gallery.md) — public event photos (static assets)

### P6 — Membership funnel
**Status:** planned
Static-implementable: the info page is static; the application **form submits via email / a static
form service** (no backend). Any backend-backed provisional-Person creation is deferred.

- [ ] [Mitglied werden](feature-membership-funnel.md) — info + application (email/static submission)
- [ ] [Mitmachen-Band](feature-mitmachen-band.md) — point CTA at the funnel (already → `/join`)

---

## Deferred — needs Club-App backend

Everything below requires the internal **Club-App** (the system of record for events, tickets,
members) to exist. **Not scheduled** in this website build; kept here for intent. When the backend
lands, these become real phases.

- **Events (real data)** — real public event endpoints (+ an **OpenAPI codegen decision**: types
  vs. types+Zod, likely an ADR); the full [Veranstaltungskalender](feature-event-calendar.md)
  (list/calendar + detail) at `/program`; wire the [Programm-Teaser](feature-program-teaser.md) to
  live data + add the **scarcity badge**, event-selection logic, and empty state; wire the
  [Landing-Hero](feature-landing-hero.md) **stats** and the data-driven ticker to live data.
- **Ticketing** — [Ticket-Shop](feature-ticket-shop.md): browse, checkout, Stripe/PayPal,
  confirmation. Depends on the backend ticketing domain (not yet schema'd — see design §7).
