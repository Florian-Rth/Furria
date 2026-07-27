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

### P7 — Launch
**Status:** planned (created 2026-07-25, split out of P4)
Flipping the site public. Everything here was **blocked by the preview gate**, not by content — see
the P4 cross-cutting notes: prerendering gated routes would publish the content the gate withholds,
and `robots.txt` is `Disallow: /` until this phase.

- [ ] [SEO & Meta](feature-seo-meta.md) — **prerender mechanism** (its own spike: emotion/MUI style
      extraction + a TanStack Router static entry + no light/dark hydration flash). With static
      content every route, **including `/news/:slug`**, is prerenderable — no bot injection needed
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
