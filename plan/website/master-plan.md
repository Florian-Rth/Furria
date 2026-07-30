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

> **Scope banner — Website v1 ships fully static; no *Club-App* backend integration.** All live data
> (events, tickets, scarcity, member/group counts, news) originates in the **Club-App**, which
> is **not built yet**. Until it exists, the website is a fully static marketing site: every
> "block" is fed by hand-curated, editable content constants behind clean typed interfaces, so
> real data can be dropped in later as a **data-source change, not a rewrite**. All live-data
> capabilities live in **[Deferred — needs Club-App backend](#deferred--needs-club-app-backend)**
> below, not in the numbered roadmap.
>
> **Amended in P6 shaping (2026-07-29):** this banner was always about *Club-App* data, never about
> our own infrastructure — the site has called `POST /api/preview/unlock` since P0, and
> `docker-compose.example.yml` deploys PostgreSQL, the API and the website **together**. The
> membership funnel therefore writes to **our own API** — though **P6 ships the frontend only** and
> the endpoint itself is deferred, not scheduled. See
> [ADR-0004](../../docs/adr/0004-website-writes-membership-applications.md).

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
| [Tester-Changelog](feature-tester-changelog.md) | foundation | shipped | Per-branch changelog modal for testers *(scaffolding — removed at launch)* |
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
| [Aktuelles](feature-news.md) | capability | shipped | Meldungen (list + detail) + landing teaser |
| [Galerie](feature-gallery.md) | capability | shipped | Public Album index + Album pages + photo viewer |
| [Mitglied werden](feature-membership-funnel.md) | capability | shipped | Membership info + Beitrittsantrag funnel |
| [Konfetti-Kompass](feature-group-matcher.md) | capability | shipped | Wahl-O-Mat-style Gruppen matcher on `/join` |

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
**Status:** done (2026-07-26, branch `feat/website-p4-news-fe`, 8 commits `46e8899`…`eeff7af`)
`/news` + `/news/:slug` + a landing teaser live — the marketing site is **content-complete**.
Static-final (no backend). Shipped as the 10 [Aktuelles](feature-news.md) slices plus the 2
[Tester-Changelog](feature-tester-changelog.md) slices, grouped into 8 commits. Final gates:
typecheck clean, 214 tests (6 ui + 208 website), lint clean, build clean.

Followed the plan closely; build-level choices worth knowing:
- **Router realities forced two shapes.** The article route file is **`news_.$slug.tsx`** (trailing
  underscore), not `news.$slug.tsx`: with the dotted name TanStack nests the article *under*
  `news.tsx`, which renders `NewsListPage` and no `<Outlet/>`, so the article never rendered. The URL
  is unchanged. And card links use **`to={buildPostHref(slug)}`** (a plain string href) rather than
  `to="/news/$slug" params={{ slug }}` — MUI's polymorphic `component={Link}` collapses TanStack's
  `to`-driven param generics to `string`, so the typed form fails overload resolution (TS2769).
- **The 404 does not bubble.** `notFoundComponent` had to be registered on `__root` **and**
  `_site.tsx` **and** `_gated.tsx`: TanStack raises the not-found on the *matched* route, so
  `/news/<unknown>` otherwise rendered the router's generic `<p>Not Found</p>`. Still ONE shared
  page, and still publicly reachable. It ships as two files — `NotFoundPage` (chrome-less) +
  `NotFoundScreen` (`SiteChrome` wrapper) — because the one-component-per-file rule forbids declaring
  the wrapper inside `__root.tsx`. It uses **`KkConfettiRain`**: `KkConfettiScatter` no longer exists
  (dropped in `b34da0e`), and `KkConfettiBurst` is a click-fired one-shot.
- **The archive button ships wired, with an accepted dead target** (decided during the build, see
  [Aktuelles](feature-news.md)): `NewsListFooter` derives it from `resolveArchiveSession(posts, …)`
  and renders a plain `Button href="/news/archive"` — an untyped anchor, since a typed `Link` cannot
  compile against a route the plan forbids building. It is absent in every P4 content state and would
  degrade to the branded 404. The derivation is also load-bearing today: the footer sentence drops its
  "Ältere Meldungen liegen im Archiv." clause while no archive exists.
- **`kkTokens` needed no additions**, but `resolveCategoryContrastText` joins `resolveCategoryTint`:
  "ink on gold" cannot be `text.primary` (cream in the dark scheme), so contrast is read from
  `primary/warning.contrastText` + `background.default`, scheme-aware.
- **`CtaBand` keeps the watermark call-site-owned.** The two shipped watermarks genuinely differ
  (Narrenruf: left, −12°, 0.12, 320; Recruit: centred, −8°, 0.08, 360), so per the no-flag ruling the
  root exposes a `watermark` **node slot** instead of reconciling them. Band-level dev hooks were
  renamed into the compound (`data-kk-cta-band`, `…-row`, `…-column`); call-site hooks are untouched.
- **Seed content is fuller than the mock**, which ships a `body` for only 1 of 6 Meldungen: bodies
  were authored for the other 5 from facts already in their own teasers (`body: [teaser]` would print
  the lead twice on the article page). The mock's JHV teaser "Der **Vorstand** wurde bestätigt" became
  "Alle **Ämter** wurden bestätigt"; "der Beitrag bleibt bei 30 Euro" stays — that is the
  membership-fee sense, which is the glossary-correct use.
- **Two responsive calls:** the red date rail is hidden at `xs` (rail + thumb left ~176px for the
  headline at 360px, and the long date is already in the row's meta line — the mock's own responsive
  notes ask for this); and the landing teaser's header **restates** the section-rule idiom at `h2`
  scale rather than reusing `NewsSectionRule` (an `h5` component), because adding a size prop would be
  the dual-mode API the rules ban. The article page reuses the shipped component unchanged.
- **Reviews** ran per slice (`react-code-reviewer` + `react-composition-guru` on the compound-heavy
  ones). Real fixes applied: an invisible Aufmacher focus ring (the `Card`'s `overflow: hidden`
  clipped the action area's outline → moved to `&:has(.Mui-focusVisible)`), a lying "Link kopiert"
  (the clipboard promise was discarded, so a denied write still reported success → now awaited), a
  `lib/` layering leak (`CLUB_TIME_ZONE` → `APP_TIME_ZONE`), and a missing `aria-describedby` on the
  changelog dialog. The rest were over-flags, each rejected against the real diff.

- [x] [Aktuelles](feature-news.md) — list (Aufmacher + Meldungen rows + `/program` band) + detail
      (article + share row + Weitere Meldungen) + the landing `NewsTeaser`; 4 fixed Kategorien with
      derived tints; typographic Plakat fallback for photo-less Meldungen; static content behind
      typed constants
- [x] [Site-Shell](feature-site-shell.md) — the site's **first 404**: a branded, humorous
      `NotFoundPage` on `__root`'s `notFoundComponent` *(plus `_site` + `_gated` — it does not
      bubble)*, plus the shared `src/components/CtaBand/` full-bleed red-band compound (migrating
      `NarrenrufBand` + `RecruitBand`)
- [x] [Landing](feature-landing.md) — one optional node slot (`newsTeaser`) on `LandingPage` for the
      news teaser, wired by the `/` route; final block order Hero → Ticker → Programm-Teaser →
      **News-Teaser** → Mitmachen-Band
- [x] [SEO & Meta](feature-seo-meta.md) — per-post document head only (`og:type: article`,
      published time, canonical — root-relative; `RouteHead` gained an optional `links` field).
      **No prerender, no bot injection** — moved to P7 / Deferred
- [x] [Tester-Changelog](feature-tester-changelog.md) — per-branch changelog modal for testers
      (build-time `changelog.json` + Zod, vertical `Tabs` master/detail, per-entry read status in
      `localStorage`, reopen pill). **Tester scaffolding — deleted at launch.** Added to P4 by
      request, unrelated to news

**Cross-cutting (decided in P4 grilling, 2026-07-25):**

- **Standing design ruling, beyond this mock: our current design always wins; mocks are inspiration
  only.** The news mock is the most aggressively **"Plakat"** handoff yet (radius 0 everywhere, 2px
  ink borders, `12px 12px 0 red` offsets) — rejected as the system, exactly as in P3. **Destillat**
  wins; `shadow.posterOffset` stays reserved for hero headlines, so the **Aufmacher earns emphasis
  through scale + layout + `shadow.raised`**, not a hard shadow. The mock's genuinely good editorial
  *structure* (red date rail, Aufmacher hierarchy, section rule) is adopted.
- **P4's SEO slice was wrong and is restructured.** Two findings: (a) **prerendering gated routes
  publishes the content the gate withholds** — the gate is client-side (`sessionStorage` +
  `beforeLoad`), so prerendered HTML is `curl`-readable; (b) because news content is **compile-time
  TS constants**, every slug is known at build time, so these pages are **prerenderable and need no
  bot OG-injection at all** — injection is only ever required for *backend-driven* detail pages.
  Plus `robots.txt` is still `Disallow: /`, so prerender's crawl payoff is currently zero. Prerender
  + robots-flip + absolute OG URL + sitemap become the new **[P7 — Launch](#p7--launch)**;
  bot-injection moves to Deferred. **[ADR-0003](../../docs/adr/0003-website-rendering-strategy.md)
  amended** — it had explicitly named news as needing injection.
- **Content stays static typed constants** (no repo markdown, no CMS): the board never authors in
  the repo — publishing moves to the Club-App — so a content pipeline would be throwaway, and a CMS
  contradicts the scope banner. `body` is a paragraph array with a `**bold**` convention; no
  sanitiser needed while content is compile-time (seam noted for when the backend lands).
- **Rule-of-three fired on the red band → shared `src/components/CtaBand/`** (slotted compound;
  layout variation by slot choice, never a flag). **`MitmachenBand` is excluded** — the code shows
  it is a rounded red *card* inside a Container, not a full-bleed band, so folding it in would force
  the boolean-flag API the frontend rules ban. `features/landing` is not reopened for it.
- **Two mock defects fixed:** the per-post `tint` field is dropped (it was redundant with
  `category` *and* self-contradictory — `Verein` shipped as both `ink` and `red`) in favour of a
  derived tint map; and the band CTA's target **`/schedule` does not exist on this site** — it is
  the Club-App's Trainingsplaner, leaked into the public mock. Corrected to `/program`.
- **Two glossary violations fixed:** the mock's *"Ganzen **Beitrag** lesen →"* collides with
  **Beitrag** = membership fee (advertised on the same site) → **"Ganze Meldung lesen →"**; and the
  author fallback **"Vorstand"** is banned in code and copy → the byline is **omitted** when no
  author is set, rather than inventing an institutional one.
- **Glossary:** added **Aktuelles**, **Meldung**, **Kategorie** to [`CONTEXT.md`](../../CONTEXT.md),
  with `Beitrag` explicitly on Meldung's avoid-list. Heading chain locked to one word
  (nav *Aktuelles* → block **AKTUELLES** → H1 **AKTUELLES** → **WEITERE MELDUNGEN** on both pages);
  "Neuigkeiten"/"Alle News" dropped, *"Aus dem Verein"* demoted to flavour eyebrow.
- **Scope trims (YAGNI):** **no archive route** (no older Session exists; the button is *derived*
  and appears by itself when it first becomes true); **no recruit band on article pages** (it is
  already the closing CTA on `/` and `/club`, and the footer sits right below — articles end on
  *Weitere Meldungen* instead); **no `navigator.share`** (a "WhatsApp" button opening a generic
  sheet lies, and the fallback path doubles the surface to verify).
- **Accepted limitation:** while the gate is up, a shared link redirects non-granted visitors to
  `/`. The gate is a temporary launch switch — designing around it would mean re-opening a finished
  page later.
- **Tester-Changelog added to P4 by request** (unrelated to news, so it has its own feature file).
  Two notes worth carrying forward: it is the **first deliberate deviation from design README §5's
  "no icon font, no icon library"** — `@mui/icons-material` is admitted, but **scoped to tester
  scaffolding only** (never public UI) and removed again in P7, and it is consumed via a small
  **explicit allow-map of path default-imports** because a dynamic name lookup would bundle all
  ~2000 icons. And its content is **JSON, deliberately unlike** the site's typed-constant content —
  justified by the mechanical append-per-branch workflow, with Zod parsing at module load buying
  back the compile-time safety TS would have given.
- **Deferred (not P4):** real Meldungen + photos, the archive route, board publishing UI, and
  body-sanitisation once content stops being compile-time.

### P4.1 — Design-system unification
**Status:** done (2026-07-27, `14c07d3` + follow-ups `e811e9d`…`8f5a643`)
**Recorded retroactively during P5 grilling (2026-07-28) — it was built but never written down**,
and P5 is built entirely on its output, so it cannot stay undocumented.

`/club` and `/news` had drifted into reading like two different sites: each page hand-rolled its own
shell, page header and section header, so type scale, rhythm, rules and surfaces diverged. The fix
was to add the missing primitives to `@furria/ui` and rebuild **every** page on them:

- **`PageLayout`** is now the one page shell (`Body` wide / `Prose` reading column) — no component
  outside it renders `<main>` or its own `Container`.
- **`KkHeroSection`** replaces every per-page hero: eyebrow / h1 / description / actions in a left
  column plus a free **`Aside`** slot that lays *behind* the main column at `xs`. Confetti is part of
  every hero.
- **`KkSection`** owns section spacing; **`KkSectionHeader`** replaced `ChapterHeader`,
  `NewsSectionRule`, `NewsTeaserHeading` and `ProgramSectionHeader`.
- **`KkCard`** replaced five card dialects (program, news, Gruppen, Chronik, Season) with
  `Media`/`Badge`/`Body`/`Meta`/`Title`/`Text`/`Footer`.
- **`KkRule`**, **`KkEyebrow`** (replacing nine hand-styled overlines); tokens gained `sectionGap`,
  `blockGap`, `bandY` and the `line` weights.
- **`KkBandSection` replaced `CtaBand`** — see the correction in
  [Site-Shell](feature-site-shell.md).
- **A real a11y fix:** rotating tints no longer colour text. Gold-on-paper was **1.85:1** in badges,
  card links, milestone years and event dates — all now `primary.main` at **4.76:1**.

**Lesson for future phases:** a cross-cutting refactor of this size is exactly what the feature files
exist to carry. Shipping it without recording it left two documents lying about the codebase for a
phase and a half.

### P5 — Galerie
**Status:** done (2026-07-29, branch `feat/website-p5-gallery-fe`, 11 commits `4560845`…`7945270`)
Static-implementable, **no backend**: `/gallery` (Album index) + `/gallery/:albumSlug` (Album) + a
full-screen photo viewer addressed by `?photo=<n>`. Photos remain placeholders — the point of the
phase is that dropping real files in later is a **content change, not a rewrite**. Shipped as the 9
vertical slices in the [Galerie](feature-gallery.md) Implementation plan, one commit each. Final
gates: typecheck clean, **325 tests** (11 ui + 314 website), lint clean, build clean.

Followed the plan closely; build-level choices worth knowing:
- **Date-only strings must be parsed on the local calendar.** `albumSession` parses via
  `` new Date(`${album.date}T00:00`) ``, because `new Date('YYYY-MM-DD')` is **UTC** midnight while
  `sessionAt` reads `getMonth()`/`getDate()` in **local** time. The seeded Sessionseröffnung sits
  exactly on 11.11, so in any UTC-behind timezone it fell into the *older* Session and the required
  4-current/2-older split broke. Any future date-derived content faces the same trap.
- **`KkPhoto` ships flat** (`packages/ui/src/KkPhoto.tsx` + the pure `photo-frame.ts`), not in a
  folder — it has no `internal/` parts, and the precedent for a component plus a co-located pure
  helper is `KkConfettiRain` + `confetti-pieces.ts`. `resolvePhotoFrame` derives whole intrinsic
  pixel dimensions from `kkTokens.aspectRatio` (portrait 960×1200, landscape 1680×1200); **no token
  was added**.
- **Seed content is reconciled with `PROGRAM_EVENTS`** — same dates, venues and names for the same
  occasions (the mock's "Kindersitzung" is the Programm's **Kinderfasching**; its Prunksitzung date
  fell after Aschermittwoch 2026). No cross-feature import, just consistent content.
- **Photo credits are devices, not people** (`Wegwerfkamera vom Kiosk`, `Vereinshandy mit acht
  Prozent Akku`) and the field is `photoCredit`, not `photographer` — the "unmistakably fake" ruling
  without six repetitions of one gag.
- **The featured Album is excluded from the grid *and* from the older-Session groups**, and DIESE
  SESSION only renders when a non-featured Album remains — after 11.11.2026 every seeded Album
  becomes "older", and without that the banner Album would appear twice.
- **Uniform photo-grid height without a pixel value:** `PhotoGrid.Cell` carries `aspectRatio` =
  units × `4 / 5` alongside its span, so a 2-unit landscape's natural height equals a 1-unit
  portrait's and the Grid row stretches every cell. Fluid at every breakpoint, and the equal-height
  invariant is one of the unit-tested properties.
- **One set of viewer controls, re-placed by `grid-template-areas`** (`"prev stage next"` on desktop,
  a thumb-reachable bottom row at `xs`) — the shipped `display: { xs, desktop }` mobile switch would
  have meant two copies of every button in the DOM.
- **The Album head title appends the derived Session** (`Prunksitzung 2025/26 · FURRIA`): two seeded
  Alben are titled "Prunksitzung" and two "Rosenmontagsumzug", so a bare title would publish
  duplicate `<title>`/`og:title` for distinct canonical URLs. The visible H1 stays the bare title.
- **No `notFoundComponent` on the Album route.** P4's "it does not bubble" note applies to the
  *layout* routes: `_gated` already registers it, and `news_.$slug.tsx` registers none either — a
  test proves `/gallery/<unknown>` renders the branded 404 exactly once. A fourth registration would
  have been dead code.
- **`Photo.source` was added in slice 9**, beyond the slice text. The "Done When" bullet *"swapping
  in real photo files is a content change: no component touched"* was **not true**: `KkPhoto` had the
  seam but the `Photo` model had no field for it, so real files would have meant editing four
  components. Album covers derive from the album's first photo.
- **`privacy-content.ts` carried a second copy of the contact address**, which the slice brief did
  not mention — "no second literal anywhere" required refactoring it too. Both legal documents render
  byte-identical prose.
- **Reviews** ran per slice (`react-code-reviewer`, plus `react-composition-guru` on the
  compound-heavy slices 5/7/8/9). Real fixes applied: the local-vs-UTC date defect above, the
  Galerie/Programm naming mismatch, a `KkPhoto` folder that violated the component-structure rule, a
  hand-synced duplicate of the landscape ratio at the card call site, a dead hover transition on the
  older-Session toggle, `kkTokens.color.dark.*` baked into every viewer leaf, and the Zod schema
  moved to the conventional `schemas.ts`. The rest were over-flags, each rejected against the diff.
- **Visual verification is uneven and owes a pass.** Only the viewer (slice 8) was checked in a real
  browser (Playwright, 360/390/900/1280px, light + dark). Every other slice rests on token reuse and
  CSS reasoning, so **the index and Album page have not been eyeballed at 360px or in the dark
  scheme**. Nothing suspicious was found by review; the check is simply still owed.
- ⚠️ **One defect the review loop *introduced* and a later slice hid** (fixed in `7945270`, worth
  carrying forward): slice 8's reviewer correctly objected to `kkTokens.color.dark.*` reads, and the
  fix moved every viewer part onto scheme-agnostic palette values scoped by a `data-dark` attribute
  — the theme's own selector (`cssVariables: { colorSchemeSelector: 'data' }` →
  `[data-dark] &`). Slice 9's closing sweep then removed that attribute as "inert", which silently
  reverted the decision that **the dark surface *is* the backdrop**: the viewer rendered cream in the
  light scheme. The attribute is now named `KK_DARK_SCHEME_ATTRIBUTE` in `@furria/ui` beside the
  config that defines it, and a route test asserts the dialog is inside that scope. **Lesson:** a
  "remove this dead attribute" cleanup needs the same verification as a feature change.

- [x] [Galerie](feature-gallery.md) — Album index (hero + featured newest + current Session grid +
      derived older Sessions + rights note + `/program` band), Album page (own lighter header +
      orientation-aware photo grid + next Album), and the full-screen viewer
- [x] `@furria/ui` — new **`KkPhoto`** primitive: the real-`<img>` seam (lazy, async decoding,
      intrinsic size, **required `alt`**) with `KkPhotoPlaceholder` as the no-source fallback
- [x] [Site-Shell](feature-site-shell.md) — promoted the club contact address to
      **`CLUB_CONTACT_EMAIL`** in `lib/club.ts`; **both** `imprint-content.ts` and
      `privacy-content.ts` now read it. Also `KK_DARK_SCHEME_ATTRIBUTE` in `@furria/ui`
- [x] [SEO & Meta](feature-seo-meta.md) — per-Album document head (title/description/canonical),
      no new mechanism; the title carries the **derived Session** to keep it unique
- [x] [Landing-Hero](feature-landing-hero.md) — **drive-by defect fix** found in P5 grilling: the
      hero said **12 Gruppen** while `/club` derives **6** from `GROUPS.length`. Two shipped pages
      contradicting one fact → `GROUP_COUNT_PLACEHOLDER = 6`, in the same slice that already opens
      `lib/club.ts`

**Cross-cutting (decided in P5 grilling, 2026-07-28):**

- **The viewer's state lives in the URL** (`?photo=<n>`, open pushes / stepping replaces), so Back
  closes it and a photo is linkable — the first time this site puts UI state in a search param.
  Validated with Zod via `validateSearch`; a bad param renders **closed**, only a bad *album slug* is
  a 404.
- **`Album` is one occasion; its Session is derived** from its date via `sessionAt()`, never stored.
  The index's older-Session block is derived too, and **absent while no older Album exists** — the
  P4 archive precedent, but with no dead targets this time.
- **`@furria/ui` gains `KkPhoto`** because this is the first feature where images *are* the content.
  **No build-time image pipeline yet** (AVIF/WebP srcset, blur-up) — a spike worth doing when there
  are input files; deferred. `alt` is required and never empty.
- **The mock's masonry is rejected on a defect, not on taste:** CSS multi-column fills
  top-to-bottom per column, so tab and screen-reader order stop matching the chronology of an
  evening. Replaced by orientation-aware tiles at uniform height (portrait 1 / landscape 2 MUI Grid
  columns), where DOM order equals visual order.
- **Hard offset-shadows stay rejected as the system** (third phase running). The mock leads with
  `12px 12px 0 red`; the featured Album earns emphasis through scale + layout + `shadow.raised`.
- **The hero aside stays decorative** — a fanned Fotostapel, `aria-hidden`, not a link. Making it
  the newest-Album link would have duplicated that Album's cover 200px above itself and turned a
  rotated frame into a tap target.
- **Copy rule, beyond this phase: Großbesenstadt and the broom mark are established brand furniture,
  not a joke well.** The town name ships in masthead, footer, ticker, hero and Chronik and stays —
  but copy must not be *built on* broom gags. Humour comes from the situations, as in `/news`.
  (Raised by the user against a proposed caption; recorded here because it governs all future copy.)
- **Photographer credits must be unmistakably fake**, extending P4's refusal to invent a "Vorstand"
  byline — the mock's *"Foto: Anja Weber"* names a plausible real person in the **Fotograf** Amt.
  Album *titles* stay honest; they are real event types the site already advertises.
- **No Instagram band** while every social href is `#` (P7 owns them): a headline CTA whose whole
  purpose is a dead link is worse than the footer's gracefully-degrading icon row.
- **Glossary:** added **Galerie**, **Bildergalerie** (the Club-App's, *not* this page — the same
  overload trap already documented for **Programm**) and **Album** to
  [`CONTEXT.md`](../../CONTEXT.md).
- **Deliberately no ADR.** The two-gate photo-publication idea was drafted and then **withdrawn on
  the user's correction**: no Fotoerlaubnis rules exist, none are planned, and it is unclear the
  area will ever be built. It sits in `CONTEXT.md` → *Flagged ambiguities* instead, since an ADR
  records a decision that was made. The website needs none of it — it renders what the club put in,
  and the printed takedown contact is the remedy.
- **Scope trims (YAGNI):** no landing teaser (landing is static-final; P4 spent its one slot on
  news); no per-photo share button (the `?photo` URL *is* the share mechanism, and P4 dropped
  `navigator.share`); no download, videos, pagination, filters or per-photo pages.
- **Deferred (not P5):** real photo assets + curation, the image transform pipeline and delivery
  decision (repo vs. CDN — likely an ADR then), the Club-App `eventId` link on an Album, and the
  Instagram band.

### P6 — Membership funnel
**Status:** done (2026-07-30, branch `feat/website-p6-join-fe`, 12 commits `86018a5`…`b581d3c`)
`/join` + `/join/apply` live — the club's growth hook. **Frontend only**; the backend stays
[deferred and not scheduled](#antrag--und-gruppen-backend-not-scheduled), so a submission calls the
real URL, gets a 404 and fails honestly into the form's error state, which always offers the human
fallback. Nothing faked, nothing disabled, and zero frontend change when the endpoint lands. Only
testers see it (gate is up until P7). Shipped as the 10 vertical slices in the
[Mitglied werden](feature-membership-funnel.md) Implementation plan, one commit each plus two
review-fix commits. Final gates: typecheck clean, **708 tests** (14 ui + 694 website), lint clean,
build clean.

> The old P6 line said the form *"submits via email / a static form service (no backend)"*. That
> premise was wrong — see the amended scope banner and
> [ADR-0004](../../docs/adr/0004-website-writes-membership-applications.md).

Followed the plan closely; build-level choices worth knowing:
- **The seed's Gruppen ids are German-transliterated kebab-case** (`tanzgarde`, `maennerballett`,
  `buettenrede`, …), not translated English words. The Gruppen names are proper nouns, the shipped
  slug convention already does this (`sessionseroeffnung-2025`), and translating them would put
  unrecognisable ids in the public `/join/apply?groups=` URL. The **English-code rule still holds** —
  these are content ids, like a slug, not identifiers.
- **`/club`'s local `Group` interface was renamed `GroupProfile`** so the seed can own the plain
  `Group` name for the future `GET /api/groups` payload. `GROUPS` stays a **synchronous module
  constant** built by a pure `buildGroupProfiles(roster, editorial)` — no React Query on `/club`,
  exactly as ADR-0003 requires. The editorial copy (`blurb`/`memberMeta`/`fullText`/`lead`) is keyed
  by id in `GROUP_EDITORIAL`, and key completeness is asserted in **both** directions by tests.
- **The matcher payload embeds the Gruppen.** `SEEDED_GROUP_MATCHER` carries
  `{ groups, questions }`, so slices 5/6 get **one** query with one loading/error path instead of a
  second groups query. This changes the deferred contract: `GET /api/group-matcher` must return the
  Gruppen too — recorded in [Deferred](#antrag--und-gruppen-backend-not-scheduled).
  `GET /api/groups` is still needed separately, for the Antrag's interest chips.
- **The eleven questions are 1 `filter` (age band) + 10 `weighted` theses.** Elferrat is the one
  seeded Gruppe with `isRecruiting: false`, so both badge states are real code paths. The
  roster-splitting content rule, the age-band coverage rule and "no adult ever matches Kindergarde"
  are all **unit-tested properties of the authored content**, not just of the algorithm.
- **Zod placement follows the dependency rule:** the payload schemas live in `lib/seed/*.ts` (where
  the payload shape lives) because `lib` may not import `features`; each feature's `schemas.ts` holds
  only its own schemas (the answer map, the form schema). The `to >= from` age invariant is a **test
  assertion, not a Zod refine** — there is no refine/superRefine precedent in this codebase.
- **`KkSectionRoot` gained an optional `id`** so a section can own its anchor and the hero's
  secondary CTA can jump to the Kompass. One prop, no behaviour change.
- **`JoinPage` takes children and the route composes it with `KonfettiKompass`** — the two are
  separate features and features never import each other, so the composition has to happen in the
  route. The Kompass anchor id lives in `join-content.ts` and is deliberately **not** barrel-exported.
- **`join_.apply.tsx` needs the trailing underscore** — P4's router finding again: the dotted name
  would nest the form inside `JoinPage`, which renders no `<Outlet/>`. A route test proves it renders
  standalone.
- **The POST payload deliberately omits the derived Mitgliedschaftsart and Beitrag.** The server
  derives them from `birthDate`; a client-asserted tier is exactly the mock defect being fixed. The
  response schema is `z.object({})` because nothing is read back — no contract was invented.
- **RHF's own `FormProvider`/`useFormContext` replaced a hand-rolled compound context** for the form
  parts, and the interest chips go through **`useController`**. That was a real bug found in slice 10
  by a prefill test: slice 9 read the form with `watch` from a child, and react-hook-form only
  re-renders at the `useForm` component — the chips could not be ticked or unticked **at all**.
  **Lesson:** `watch` in a child of `FormProvider` silently does nothing; only a subscribing hook
  (`useController`/`useWatch`) works.
- **Two environment realities:** MUI v9 dropped `Checkbox.inputRef`, so the consent box passes the ref
  via `slotProps={{ input: { ref } }}`; and a sticky summary aside is impossible because
  `PageLayout`'s root sets `overflow: hidden`, which kills `position: sticky`.
- **Only the hero's Antrag CTA became a typed `Link`.** The Kompass result CTA keeps a plain href for
  two concrete reasons: `renderWithProviders` mounts no router, so a TanStack `Link` throws and would
  force 20+ component tests onto `renderAtRoute`; and a typed `search={{ groups }}` serialises through
  `URLSearchParams`, turning the documented `?groups=a,b` into `?groups=a%2Cb`.
- **`?groups=` is defensive twice over:** `validateSearch` + Zod `.catch(undefined)`, and unknown ids
  are dropped both when prefilling the chips **and** again from the submitted payload via
  `selectKnownGroupIds`. A malformed param renders the normal form; nothing 404s.
- **The Ticket's stub stays a vertical column at every breakpoint** (it does not stack to a bottom
  band at `xs`) — stacking would lose both the ticket silhouette and the perforation at 360px. Gold is
  `warning.main`, ink `warning.contrastText`, notches `background.default`, stub `warning.dark`, so
  every colour switches with the scheme.
- **Copy adjustments forced by the page itself:** the band CTA reads *"Jetzt Antrag stellen →"*, not
  *"Antrag stellen →"*, because the hero already owns that accessible name and three `findByRole`
  queries went ambiguous. The hero's secondary CTA reads *"Wo passe ich hin? ↓"* rather than naming the
  Kompass (fits one line at 360px, and the arrow signals an in-page jump). The third hero stat is the
  **Session ordinal**, so it does not repeat the eyebrow's `yearsLabel`. The FAQ shipped **eight**
  questions.
- **Reviews** ran per slice (`react-code-reviewer`, plus `react-composition-guru` on slices 2/3/5/6/7/9).
  Two slices needed fixes: slice 5 had the whole step machine derived inline in a presentational part
  (→ moved into `use-kompass-progress`, with the derivation extracted as pure selectors), and slice 9
  had an inline `setValue` handler in JSX, a fetch + fallback-link derivation inside a presentational
  assembly, a drilled `GroupsSource` prop with a single live consumer, and a 165-line section mixing
  altitudes (→ per-item `ApplyInterestChoice`, `fallbackMailHref` moved into the hook, the prop deleted
  in favour of the hook, and Person/Address/Contact fieldsets extracted, shrinking the section to 67
  lines). One duplicate finding was rejected against the diff; every other slice reviewed clean.
- **Visual verification is uneven again, and owes a pass** (same debt P5 recorded). Only the Ticket
  was checked in a real headless browser (360px dark, 1280px light, via a temporary local grant file
  that was deleted, not committed). Every other section rests on token reuse and CSS reasoning — the
  Kompass stepper/result, the four steps, the FAQ and the band have **not** been eyeballed at 360px or
  in the dark scheme.
- **The all-excluded Kompass state is verified through the pure selector**, with a synthetic matcher,
  because the plan's own content rule ("no age band may come back empty") means the real seed can never
  produce it. The plan's testing rule prefers that level anyway.

- [x] [Mitglied werden](feature-membership-funnel.md) — `/join` info page (hero · Kompass · Ticket ·
      vier Schritte · FAQ · Kontakt · Band) and `/join/apply` (Antrag + in-place confirmation),
      wired to `POST /api/membership-applications`
- [x] [Konfetti-Kompass](feature-group-matcher.md) — eleven questions, Gruppe-owned positions and
      weights, `weighted` + `filter` question roles, normalised scoring as a tested pure function,
      ranked result with derived «warum» and recruiting badges
- [x] `@furria/ui` — promoted **`KkStatRow`** (slotted compound: root + `.Item`/`.Value`/`.Label`) and
      migrated `HeroStatRow` + `ClubStoryStats` onto it; `/join`'s hero is the third call site. Scale
      and colour stay at the call site — no size flag. Also **`KkSectionRoot` gained an optional `id`**
- [x] [Verein](feature-about-verein.md) — drive-by: `/club`'s Gruppen content reads the shared seed
      (stays **synchronous**, so it stays prerenderable) instead of its own roster
- [x] [SEO & Meta](feature-seo-meta.md) — per-route `head` for `/join` and `/join/apply`, no new
      mechanism
- [x] [Mitmachen-Band](feature-mitmachen-band.md) — CTA already points at `/join`; nothing to do

**Cross-cutting (decided in P6 grilling, 2026-07-29):**

- **The website writes to its own API for the first time** —
  [ADR-0004](../../docs/adr/0004-website-writes-membership-applications.md). A third-party form
  service would have put a (usually US) processor in the path of applicants' addresses, birth dates
  and, for under-18s, a guardian's contact details.
- **New pattern, governing every future backend-bound feature: build as if it already fetched.**
  Zod schemas + React Query hooks in the feature's `api.ts`, real loading/error paths, and only the
  `queryFn` differs — it resolves from a **deletable seed module** (`src/lib/seed/`, shaped exactly
  like the future payload) instead of `apiFetch`. The later swap is one line per query.
- **Async is not prerenderable, so the split is deliberate:** the interactive matcher fetches;
  `/club`'s indexable Gruppen list keeps reading the same seed **synchronously**. One source of
  truth, two access paths ([ADR-0003](../../docs/adr/0003-website-rendering-strategy.md)).
  A compile-time `GroupId` union was considered and rejected — ids come from the DB at runtime.
- **Glossary corrections, one of them a retraction.** **`Passiv` is not a Mitgliedschaftsart** — it
  was the word for a membership that *pauses for a Session*, i.e. a **status**. The 2026-07-16
  "resolved" note is retracted in [`CONTEXT.md`](../../CONTEXT.md); Art is **Aktiv / Jugend /
  Ehren**, status is **aktiv / paused / beendet**, and `docs/design/FCC-Schema.txt` is corrected
  (`passive` removed, `inactive` → `paused`). Added **Ruhende Mitgliedschaft** and
  **Beitrittsantrag**; extended **Gruppe** with per-Gruppe recruiting openness and the fact that
  **no drop-in trainings exist**. *Lesson: the old note resolved the ambiguity from the handoff
  rather than from the club.*
- **Two domain facts killed large parts of the mock.** There are **no open, drop-in trainings** and
  no recurring public training times — so *"erst vorbeikommen, dann entscheiden"*, the dated
  open-training list, the free-spot counts and the "Turnschuhe reichen" copy are all gone; the
  low-commitment step is the Kompass plus an Anfrage. And **Kostüme are not (all) club-funded**, so
  that benefit claim is removed everywhere.
- **Mitgliedschaftsart is derived from the Geburtsdatum, never asked** — the mock's form allows
  "Aktiv" with a 2015 birth date. Only **Aktiv** and **Jugend** are joinable; **Ehren** is not
  published publicly. The mock's invented "Kind" tier does not exist.
- **The Ticket stays, as an info flyer in the shape of a ticket** — the page's one signature object
  (gold, real perforation notches, vertical stub, slight tilt, blank `MITGLIED NR. ____`). Its
  content was rewritten from scratch; the mock's rows were partly false. **Hard offset-shadows stay
  rejected as the system — fifth phase running.**
- **Three mock features cut:** the three named contacts with private mobile numbers (P5's
  invented-people ban plus a real spam/DSGVO problem), the **Helfer-Liste** (dead target, P5's
  dead-link precedent), and a **Gruppen showcase** on `/join` (the Kompass result plus `/club`
  already cover it — no third roster surface).
- **Two form defects fixed:** the consent checkbox **defaults to checked** (legally invalid) and it
  **bundles photo consent** into the same box (Kopplungsverbot) — on a topic `CONTEXT.md` flags as
  unresolved. Photo consent is absent by design. Under-18s get a **guardian block** and the consent
  is worded as the guardian's (§107 BGB); the mock's promised SMS confirmation flow is not built.
- **`Vorstand` scrubbed from copy for the third phase running** (P4 fixed it twice already): copy
  says *der Verein* / *wir* and never names a body it cannot name correctly.
- **Rule of three fired on the stat row** → `KkStatRow` in `@furria/ui`, following P4.1's
  five-card-dialects lesson. Scale and colour stay at the call site — no size flag, which is what
  P4 refused for `NewsSectionRule`.
- **Accepted, against the recommendation (user's call):** the **Club-App is advertised** as a
  membership benefit although it is unbuilt and unscheduled → P7 re-check; and the **Satzung is
  linked** with no `/satzung` route, accepting the branded 404 → it must be a plain anchor (a typed
  `Link` cannot compile against a missing route, per P4) and shipping `/satzung` becomes a **P7
  launch blocker**, since this link sits inside a legal consent.
- **Deferred (not P6):** the **entire backend** — see
  [Deferred → Antrag- und Gruppen-Backend](#antrag--und-gruppen-backend-not-scheduled) — a
  privacy-preserving captcha, real Gruppen content and recruiting flags, verified Satzung facts,
  and a real club contact address/phone.

### P7 — Launch
**Status:** planned (created 2026-07-25, split out of P4)
Flipping the site public. Everything here was **blocked by the preview gate**, not by content — see
the P4 cross-cutting notes: prerendering gated routes would publish the content the gate withholds,
and `robots.txt` is `Disallow: /` until this phase.

- [ ] [SEO & Meta](feature-seo-meta.md) — **prerender mechanism** (its own spike: emotion/MUI style
      extraction + a TanStack Router static entry + no light/dark hydration flash). With static
      content every route, **including `/news/:slug` and `/gallery/:albumSlug`**, is prerenderable —
      no bot injection needed
- [ ] [SEO & Meta](feature-seo-meta.md) — flip `robots.txt` to allow; resolve the **absolute
      `og:image` URL** (blocked on a production domain since P0); add a sitemap
- [ ] [Preview-Gate](feature-preview-gate.md) — remove the gate; gated marketing routes become
      public and shared news links start resolving for everyone
- [ ] [Tester-Changelog](feature-tester-changelog.md) — **delete it** along with the gate: the
      feature folder, `changelog.json`, the `_site.tsx` mount and the `@mui/icons-material`
      dependency. Release notes are not public-site content, and dropping the dep restores design
      README §5 ("no icon library") for shipped UI
- [ ] [Site-Shell](feature-site-shell.md) — real social URLs (P0 shipped `#` placeholders); real
      favicon/app-icon art (tracked asset task, placeholder since P0); `noindex` on the 404
- [ ] [Galerie](feature-gallery.md) — the mock's **Instagram band** becomes buildable once the real
      social URLs land here (held out of P5 precisely because it would have been a dead link)
- [ ] [Site-Shell](feature-site-shell.md) — **ship `/satzung`** as a third legal page. **Launch
      blocker:** P6 links it from inside the Antrag's legal consent, accepting a 404 in the interim
- [ ] [Mitglied werden](feature-membership-funnel.md) — **verify every membership fact against the
      Satzung** before the gate comes down: Beitrag 30 €/15 €, keine Aufnahmegebühr, Kündigung zum
      Sessionende, Ruhen der Mitgliedschaft, and who decides an Aufnahme. Also **re-check the
      Club-App promise** on the Ticket and the confirmation if the app still does not exist, and
      replace the placeholder `CLUB_CONTACT_EMAIL` with a real address (plus a phone, if there is
      one)

---

## Deferred — backend work

Everything below is **not scheduled** in this website build; kept here for intent. Most of it
requires the internal **Club-App** (the system of record for events, tickets, members) to exist.
When the backend lands, these become real phases.

### Antrag- und Gruppen-Backend *(not scheduled)*

The one exception that does **not** need the Club-App: it serves `/join` alone, on the API we
already deploy. **P6 shipped the frontend only** (done 2026-07-30) and the contract is fully designed
in [Mitglied werden](feature-membership-funnel.md) and
[Konfetti-Kompass](feature-group-matcher.md) — recorded here so nothing is re-litigated later.
Until it exists, a submitted Antrag fails honestly into the form's error state, which always offers
the human fallback.

**The shipped frontend pins these shapes** — `web/apps/website/src/lib/seed/{groups,group-matcher}.ts`
holds the Zod schemas the endpoints must satisfy, and they are the executable version of this list.

- `POST /api/membership-applications` — validate, persist, notify. Per
  [ADR-0004](../../docs/adr/0004-website-writes-membership-applications.md): the row is the source of
  truth, the mail is the notification, and a mail failure is not a lost Antrag. **The request body
  carries no Mitgliedschaftsart and no Beitrag** — the API derives both from `birthDate`, because a
  client-asserted tier is the very mock defect P6 fixed. Nothing is read back from the response.
- `GET /api/groups` — `id` (kebab-case content slug, German-transliterated), `name`, `ageRange`
  (`from` plus `to`, where `to: null` means an open upper bound), **`isRecruiting`**, and `tagline`
  (the result-card line). Consumed by the Antrag's interest chips.
- `GET /api/group-matcher` — `{ groups, questions }`: the eleven questions with every Gruppe's stance
  + weight, **plus the same Gruppen payload embedded**. The embedding is deliberate (P6 build decision)
  so the matcher needs one query with one loading/error path — do not split it back apart without
  reopening the matcher's data layer. Questions are a discriminated union on `role`: `weighted`
  (`positions[]` of `{ groupId, stance, importance }`) and `filter` (`options[]` plus `positions[]` of
  `{ groupId, accepts[] }`).
- Outbound mail: SMTP credentials, a real sender domain with SPF/DKIM, a real recipient.
- Per-IP rate limiting; decide on a privacy-preserving challenge (self-hosted **Altcha** or
  **Friendly Captcha**) — never a third-party captcha on the page where a child's data is typed.
- Retention/deletion rule for applicant data — incl. minors and guardians — plus the matching
  Datenschutzerklärung text.
- **Delete `src/lib/seed/`** and point the query hooks at `apiFetch` (one line each).
- Follows `/backend-work` and `docs/server/TESTING.md` (integration tests, Testcontainers, no
  mocks — [ADR-0001](../../docs/adr/0001-no-mocks-integration-testing.md)).

**Sequencing caveat:** `/join` is only half-useful until this lands, so it should not be the last
thing done before P7 flips the site public — a live funnel that cannot submit is worse than none.

### Club-App-dependent

- **Events (real data)** — real public event endpoints (+ an **OpenAPI codegen decision**: types
  vs. types+Zod, likely an ADR); the full [Veranstaltungskalender](feature-event-calendar.md)
  (list/calendar + detail) at `/program`; wire the [Programm-Teaser](feature-program-teaser.md) to
  live data + add the **scarcity badge**, event-selection logic, and empty state; wire the
  [Landing-Hero](feature-landing-hero.md) **stats** and the data-driven ticker to live data.
- **Ticketing** — [Ticket-Shop](feature-ticket-shop.md): browse, checkout, Stripe/PayPal,
  confirmation. Depends on the backend ticketing domain (not yet schema'd — see design §7).
- **Bot OG-meta injection** (edge middleware vs. a `<meta>`-serving endpoint on the API) — **only
  ever needed for backend-driven detail pages**, whose content is not known at build time and so
  cannot be prerendered. Re-scoped out of P4 in the P4 grilling: static-in-repo pages like
  `/news/:slug` are prerenderable and need nothing. See the
  [ADR-0003](../../docs/adr/0003-website-rendering-strategy.md) amendment.
- **News (real data)** — the Club-App becomes the publishing surface for **Meldungen** and serves
  them over a public read endpoint; the typed `NewsPost` interface is the swap point
  ([Aktuelles](feature-news.md)). Brings with it body **sanitisation** (content stops being
  compile-time), real photos, board publishing UI, and the **archive route** once an older Session
  exists.
