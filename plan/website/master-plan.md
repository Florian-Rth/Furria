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

A responsive, German-language marketing + ticketing site in the "Konfetti Kinetik" brand.
Guiding constraints (all binding):

- **Web-app first, Capacitor-wrappable** later (native push, widgets) — keep it a standard
  responsive web app.
- **ONE theme across all apps** (Corporate Identity), consumed from `@furria/ui`. No new
  colors, fonts, radii, shadows. Light + dark.
- **Routes/IDs/props = English. Visible text = German.**
- **Narrenruf is "Gross - Furria!"** — never Helau/Alaaf.
- One backend API serves all apps; the website consumes **public read endpoints** only.

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
| [Landing](feature-landing.md) | capability | building | Home page — composes the blocks below |
| [Landing-Hero](feature-landing-hero.md) | capability | building | Identity centerpiece: headline, CTAs, stats, hero photo |
| [Programm-Teaser](feature-program-teaser.md) | capability | idea | Home "DAS PROGRAMM" upcoming-events section |
| [Mitmachen-Band](feature-mitmachen-band.md) | capability | idea | Home recruit CTA → membership funnel |
| [Verein](feature-about-verein.md) | capability | idea | Verein story, Ämter, Gruppen showcase |
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
  data-driven ticker (→ P5), absolute OG image URL (→ launch).

### P1.1 — Mobile hero
**Status:** planned (added 2026-07-22, branch `feat/website-p1-landing-hero-fe`)
A dedicated mobile-only hero treatment (immersive full-bleed photo + pinned headline), replacing
the current mobile behaviour of just stacking the desktop split hero. Sourced from a new mock
(`docs/design/mobile-hero.html` + `docs/design/mobile-hero-handoff.md`), reconciled against the
shipped P1 decisions in a grilling session — see [Landing-Hero](feature-landing-hero.md) Decisions
and the new slices in the [Landing](feature-landing.md) Implementation plan.

- [ ] [Landing-Hero](feature-landing-hero.md) — new `MobileHero` (full-bleed photo + mode-invariant
      scrim + pinned two-tone headline) + `HeroFollow` (reuses `Hero.Intro`/`Hero.Actions`/
      `Hero.StatRow`), mounted alongside the existing `Hero` in `LandingPage`, toggled by
      breakpoint (`xs` vs. `md+`) — same pattern as `MastheadDesktopBar`/`MastheadMobileBar`
- [ ] `@furria/ui` — `kkTokens.aspectRatio` (`portrait: '4 / 5'`, `landscape: '7 / 5'`) replacing
      inline ratio strings; `kkTokens.overlay.photoScrim` (mode-invariant legibility gradient,
      sibling to `kkTokens.color` rather than part of it); `KkPhotoPlaceholder` gains a `fill`
      variant for full-bleed (no aspect-ratio, no radius) use

**Explicitly out of scope (per the mock's READ FIRST — layout/functionality is inspiration, not
spec):** the mock's status bar + transparent overlay nav baked into the hero — the real, shipped
`Masthead` stays untouched, in normal opaque flow, on every route including mobile `/`.

### P2 — Landing complete
**Status:** planned
The full landing page reads end-to-end (still static/placeholder data).

- [ ] [Programm-Teaser](feature-program-teaser.md) — 3 upcoming cards, placeholder data
- [ ] [Mitmachen-Band](feature-mitmachen-band.md) — recruit CTA band

### P3 — Verein
**Status:** planned
`/club` live.

- [ ] [Verein](feature-about-verein.md) — story, Ämter, Gruppen showcase (static content)

### P4 — News
**Status:** planned
`/news` live — the marketing site is content-complete. Before launch: stand up the **prerender
mechanism** (deferred from P0) + **bot OG-meta injection** for the first dynamic detail page.

- [ ] [Aktuelles](feature-news.md) — list + detail
- [ ] [SEO & Meta](feature-seo-meta.md) — prerender mechanism spike + news-detail OG injection

### P5 — Events (real data)
**Status:** planned
Public calendar live; the home page shows real upcoming events + live ticket scarcity.

- [ ] [API-Client](feature-api-client.md) — real public event endpoints; **OpenAPI codegen
      decision** (types vs. types+Zod, likely an ADR)
- [ ] [Veranstaltungskalender](feature-event-calendar.md) — list/calendar + detail
- [ ] [Programm-Teaser](feature-program-teaser.md) — wire to live API + scarcity badge
- [ ] [Landing-Hero](feature-landing-hero.md) — wire stats to live API

### P6 — Ticketing
**Status:** planned
Buy a ticket online. *Depends on backend ticketing domain (not yet schema'd — see design §7).*

- [ ] [Ticket-Shop](feature-ticket-shop.md) — browse, checkout, Stripe/PayPal, confirmation

### P7 — Gallery
**Status:** planned

- [ ] [Bildergalerie](feature-gallery.md) — public event photos

### P8 — Membership funnel
**Status:** planned

- [ ] [Mitglied werden](feature-membership-funnel.md) — info + application
- [ ] [Mitmachen-Band](feature-mitmachen-band.md) — wire CTA to the funnel
