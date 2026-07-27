---
title: Aktuelles
slug: news
type: capability
status: shipped
mock: docs/design/news-page/
adrs: [docs/adr/0003-website-rendering-strategy.md]
---

## What & Why

The public **Aktuelles** section (`/news`, nav label **Aktuelles**): the club's own channel for
what is happening between events — Motto-Verkündung, competition results, calls for helpers,
rehearsal changes. It keeps the site alive in the long stretches where the event calendar has
nothing to show, and it is the only page a member is likely to *share* outward.

**Deliberately not a blog.** The board maintains this alongside everything else, so ~10
**Meldungen** a year is the realistic volume. No tags, filters, search, pagination, comments,
author pages, related-post algorithms, newsletter or RSS. The volume never justifies blog
machinery, and building it would create a maintenance surface nobody staffs.

**Static-final for Website v1** — no backend (master-plan scope banner). Content lives in
hand-curated typed constants, so the later swap to real Club-App data is a data-source change,
not a rewrite.

## Scope / Slices

Two routes plus one reusable block:

1. **`/news`** — list page: page head → **Aufmacher** (the newest Meldung, given the page's
   visual weight) → *Weitere Meldungen* rows → list footer → a red band pointing at `/program`.
2. **`/news/:slug`** — article page: back link → meta line → H1 → Anton lead → hero image →
   body → share row → *Weitere Meldungen* (the 3 next-newest).
3. **Landing block** — `NewsTeaser`, the 3 newest Meldungen, mounted on `/` between the
   Programm-Teaser and the Mitmachen-Band.

### Frontend requirements

- New `features/news/` feature: barrel `index.ts`, typed `news-content.ts` + colocated tests,
  `components/<Name>/{Name.tsx, internal/{layout,ui,logic}}`, and three exported entry
  components (`NewsListPage`, `NewsPostPage`, `NewsTeaser`).
- Replace the body of `routes/_site/_gated/news.tsx` (currently `PlaceholderPage`) with
  `NewsListPage`; add `routes/_site/_gated/news.$slug.tsx` — the site's **first parameterised
  route**. Both stay gated behind preview access.
- New shared `src/lib/date.ts` for German date formatting.
- New shared `src/components/CtaBand/` (see Decisions) — also migrates two shipped club sections.
- New shared `src/components/NotFoundPage.tsx` + a `notFoundComponent` on `__root` — the site's
  **first 404 handling** (see [Site-Shell](feature-site-shell.md)).
- `LandingPage` gains one optional node slot for the teaser (see [Landing](feature-landing.md)).
- **Single responsive components throughout** — reflow via `sx` breakpoints, no Desktop/Mobile
  forks (the shipped P3 posture).
- Compose from `@furria/ui` primitives + MUI + `kkTokens`; light + dark; tokens only.

### Backend requirements

- **None.** Fully static.
- **Seam (deferred, NOT scaffolded — YAGNI):** the Club-App later becomes the publishing surface
  and supplies Meldungen over a public read endpoint. The typed `NewsPost` interface is the swap
  point. Do not build a fetch, a Zod schema or an admin UI now.

## Decisions

### Design language — Destillat, no exceptions
- The mock is the most aggressively **"Plakat"** handoff yet (`border-radius: 0` everywhere,
  `2px solid ink` card borders, hard offset shadows like `12px 12px 0 red`, square chips).
  **Rejected as the system**, same ruling as P3: our shipped **Destillat** language wins — MUI
  `Card`, `radius.base` (14), hairline `divider` borders, `shadow.rest`/`shadow.raised`.
  **Standing rule, beyond this mock: our current design always wins; mocks are inspiration only.**
- **No hard offset shadow anywhere on these pages.** `kkTokens.shadow.posterOffset` stays reserved
  for hero headlines (`KkTwoToneHeadline`), as shipped. The **Aufmacher earns its emphasis through
  scale, layout and `shadow.raised`** instead — one bold moment per page, achieved in-theme.
- What we **do** take from the mock, because it is genuinely good and already our idiom: the
  editorial **red date rail**, the Aufmacher-over-list hierarchy, and the **red square + Anton
  label + hairline rule** section header (the shipped `ChapterHeader`/section-rule pattern).
- **No dark ink-panels.** The mock closes the list page with a full-bleed *inverted ink* panel;
  P3 already banned those. It becomes a **red** band (see `CtaBand`).

### Vocabulary (see `CONTEXT.md`)
- **Aktuelles** = the section. **Meldung** = one item. **Kategorie** = its one label.
- **"Beitrag" is banned for news items** — it is the membership fee in this domain, and the mock's
  CTA *"Ganzen Beitrag lesen →"* would collide with the Beitrag tiers advertised elsewhere on the
  same site. Copy becomes **"Ganze Meldung lesen →"**.
- **The heading chain uses one word:** nav chip *Aktuelles* → landing block **AKTUELLES** → page H1
  **AKTUELLES** → section rule **WEITERE MELDUNGEN** on *both* the list and the article page (one
  const, one meaning). The mock's *"AUS DEM VEREIN"* survives only as the `/news` **eyebrow**,
  where it is flavour copy, never doing a label's job. "NEUIGKEITEN" and "Alle News" are dropped.

### Content model
- Typed constants in `features/news/news-content.ts`, exactly like the shipped `program-content.ts`
  / `groups-content.ts`. **No markdown pipeline, no CMS** — the board never authors in the repo
  (publishing moves to the Club-App), so a content pipeline here would be throwaway, and a CMS
  contradicts the no-backend scope banner.
- `NewsPost` fields: `slug`, `title`, `category`, `publishedAt`, `teaser`, `body`, `image`,
  `author`. English field names (code-is-English rule); German values.
- **`body` is a paragraph array** with a `**bold**` inline convention — paragraphs plus inline bold
  is the *entire* richness the design supports. Parsed by one small pure function. No sanitiser
  needed: the content is compile-time, so there is no XSS surface. (When the backend becomes the
  source, sanitisation becomes a real decision — noted as a seam, not built.)
- **`image: string | null`.** `null` is a first-class production state → the **Plakat fallback**
  (below), *not* an empty box. Non-null renders `KkPhotoPlaceholder` in v1, since no real photos
  exist yet — so both branches are exercised. Seed content keeps 2 of 6 posts photo-less.
- **`author: string | null`; when null the byline is omitted entirely.** The mock's fallback
  *"Vorstand"* is banned in code and copy (`CONTEXT.md`: there is no Vorstand super-role; P3
  recorded the same). We do not invent an institutional author.
- **The Aufmacher is derived, never flagged:** posts are sorted by `publishedAt` descending and
  the first one leads. No manual `featured` field — add one only if the club actually asks.
- Pure, unit-tested helpers beside the content: sort-by-date-desc, find-by-slug, category-tint
  resolution, reading-time derivation, byline formatting, inline-bold parsing, WhatsApp-URL
  building.

### Kategorien — 4 fixed, tint derived
- Four label-only categories: **Session · Erfolge · Verein · Gruppen**. No filter UI (the mock has
  none either) — the label is for scanning, not navigation. This resolves the old open question
  ("categories or flat list?") in favour of categories.
- **The mock's per-post `tint` field is dropped.** It was redundant with `category` *and*
  self-contradictory — `Verein` ships as `ink` on one sample post and `red` on another. Tint is
  **derived from category** by one fixed pure map, the same idiom as the shipped `resolveEventTint`
  / `resolveGroupTint`: Session → red (flagship), Erfolge → gold (achievement), Verein and Gruppen
  → ink (both institutional).
- Brand accents are **red / gold / ink only** — `blue`/`green` are reserved status colours and CI
  forbids new ones, so 4 categories deliberately share 3 tints. Tint is decoration; the chip's
  **text** identifies the Kategorie. Gold chips take ink text for contrast.

### Routing, sharing and not-found
- `/news/:slug` resolves the post in a route **loader** and throws not-found for an unknown slug.
- **One site-wide 404**, not a news-local one: `NotFoundPage` on `__root`'s `notFoundComponent`,
  wrapped in the existing `SiteChrome` so masthead + footer stay. It renders **outside `_gated`**,
  so it is publicly reachable (as a 404 must be) and leaks no gated content. Unknown slugs bubble
  to it. Copy is deliberately funny and on-brand: eyebrow *FEHLER 404*, Anton **HIER WAR MAL /
  EINE SEITE.**, *"Jetzt ist hier nur Konfetti. Passiert den Besten von uns."*, exits to `/` and
  `/program`, with confetti + broom watermark from shipped primitives.
- **Share row ships now**, with **two explicit buttons**: *WhatsApp* (a `wa.me` link built from
  title + `location.href`) and *Link kopieren* (`navigator.clipboard` + a **2 s inline label swap**
  to "Link kopiert ✓"). No snackbar system is invented for a single confirmation — per the
  frontend rules, `snackbarManager` waits for a second caller.
- **`navigator.share` is deliberately not used.** A button labelled "WhatsApp" that opens a generic
  share sheet lies about what it does, and the fallback path doubles the surface to verify while
  the primary path is untestable in happy-dom. `location.href` is absolute at runtime, so sharing
  needs no production domain (unlike `og:image`).
- **Known limitation, accepted:** while the preview gate is up, a shared link redirects
  non-granted visitors to `/`. The gate is a temporary launch switch, not a permanent constraint —
  designing around it would mean re-opening a finished page later.
- **No archive route in P4.** The site is brand new; there is no older Session to archive, and ~10
  posts a year means the list shows everything for years. The footer sentence stays; the "Archiv
  «Session»" button is **derived** from whether posts from an older Session exist, so it appears by
  itself when it first becomes true — at which point the route is worth building.

### Shared `CtaBand` (extracted here)
- The full-bleed red band idiom hits its **third** call site with this page, so it is extracted to
  `src/components/CtaBand/` as a slotted compound: the root mounts the fixed decoration (red
  surface, broom watermark slot, overflow, inner container, z-index) and accepts `sx` so the
  **parent owns padding**; layout variation is a **choice of slot** (`Row` vs `Column`), never a
  flag. `NarrenrufBand` and `RecruitBand` migrate onto it.
- **`MitmachenBand` is deliberately excluded.** Reading the code, it is not a band at all — it is a
  rounded (`radius.base`) red **card** inside the landing's `Container`, with a row layout. Folding
  it in would force a `fullBleed`-style variant prop, i.e. the boolean-flag API the frontend rules
  ban. It stays exactly as shipped, and `features/landing` is not reopened.
- It lives in `src/components/`, not `@furria/ui`: a recruit/CTA band is **website chrome**, not a
  token-pure cross-app primitive, and P1 deliberately sharpened that boundary.

### Layout, type and behaviour
- **Breakpoints are MUI `xs`/`md`/`lg`**, not the mock's raw `700px`/`1100px` media queries — the
  rules forbid hardcoded px and every shipped section already reflows on `xs`/`md`.
- **Truncation is CSS `line-clamp`**, not the mock's character counts (~72 mobile / ~90 teaser).
  Character counting breaks mid-word and cannot adapt to viewport width. Body copy keeps
  `text-wrap: pretty`; the article body never drops below 16px; tap targets stay ≥44px.
- **`NewsPlakat` (the typographic fallback) stays news-local** — not promoted to `@furria/ui`,
  matching the P3 ruling that kept the club hero's numeral + ribbon local (YAGNI: one consumer,
  and its size API would be designed before a second use case could validate it). It composes
  `KkBroomMark` (watermark, ~16%, `aria-hidden`), `kkTokens.font.display` and the category tint.
- **It must be impossible for a Meldung to look broken because the board had no picture** — this is
  the fallback's whole point, and it is production behaviour, distinct from `KkPhotoPlaceholder`
  (which means "a real photo goes here" and dies at launch).
- Hover: list row lifts to `paper` with the headline going red, at stable row height; cards lift
  subtly. Focus: a visible ring on **every** card link — the page is a set of large link targets.
  All transitions 120–160 ms, `prefers-reduced-motion` respected (the site already gates motion).
- Every Aufmacher / row / teaser card is a **real link**, never a button flipping state.
- **Empty state** (a Session with no Meldungen yet): page head + rule + one quiet hairline panel,
  *"Noch keine Meldungen in dieser Session."* No illustration, no spinner.

### SEO
- P4 ships **per-post document head only**, via the `head` API already in use: title, description
  from the teaser, OG title/description, `og:type: article` (overriding the root's `website`),
  published time, canonical.
- **No prerender mechanism and no bot OG-injection in P4** — see [SEO & Meta](feature-seo-meta.md)
  and the ADR-0003 amendment. Because content is compile-time, every slug is known at build time,
  so these pages are **prerenderable** and need no bot-targeted injection at all; and prerendering
  gated routes would publish the very content the gate withholds.

### Testing posture
- **Pure functions only** — sorting, slug lookup, category tint, reading time, byline, date
  formatting, inline-bold parsing, WhatsApp URL. No tests that render a mock and assert its own
  values back out, and no trivial-UI assertions (standing rule; cf. the `test(web): remove
  implementation and UI-only tests` commit).

### As built (P4, 2026-07-26) — where the code differs from the plan above

Everything above shipped as decided, except these build-level realities. Recorded so a future agent
does not "fix" them back:

- **Article link mechanism.** Cards link with `to={buildPostHref(slug)}` (a plain string href), not
  `to="/news/$slug" params={{ slug }}`: MUI's polymorphic `component={Link}` collapses TanStack's
  `to`-driven param generics to `string`, so the typed form fails overload resolution (TS2769).
  `buildPostHref` is a pure exported helper, also used for the canonical link.
- **Route file name** is `routes/_site/_gated/news_.$slug.tsx` (trailing underscore, route id
  `/_site/_gated/news_/$slug`), not `news.$slug.tsx`. The dotted name makes TanStack nest the article
  *under* `news.tsx`, which renders `NewsListPage` and no `<Outlet/>` — the article never rendered.
  Public path, gate and 404 behaviour are unchanged and `news.tsx` was not touched.
- **The archive button is wired, with an accepted dead target.** The plan wanted a *derived* button
  and no archive route, which leaves it no valid typed destination — resolved by decision during the
  build: `NewsListFooter` takes `{ posts, reference }`, derives via `resolveArchiveSession`, and
  renders a plain `Button href={newsArchiveHref}` (`/news/archive`, an untyped anchor). It is absent
  in every P4 content state and would degrade to the branded 404; swap it to a typed `Link` the day
  the route lands. The derivation is load-bearing today too: `buildNewsListFooterNote` drops the
  "Ältere Meldungen liegen im Archiv." clause while no archive exists (it was otherwise a factual
  lie), and restores it alongside the button.
- **`resolveCategoryContrastText` joins `resolveCategoryTint`.** "Ink text on gold" cannot be
  `text.primary` — that token is cream in the dark scheme, i.e. cream on gold. Contrast is read from
  `primary/warning.contrastText` and `background.default`, so all three tints stay legible in both
  schemes without baking a mode value.
- **`categoryLabels` was not built** — all four `NewsCategory` keys already *are* their German labels,
  so the map would be a pure identity map. The chip renders the value and uppercases via CSS.
- **`NewsMedia`** is the single place that resolves the `image` branch (`KkPhotoPlaceholder` vs.
  `NewsPlakat`), shared by Aufmacher, rows, cards and the article hero. Feature-internal, not
  exported from the barrel.
- **The date rail is hidden at `xs`.** Rail + gaps + thumbnail left ~176px for the headline at 360px,
  and the long date already sits in the row's meta line — which is also what the mock's documented
  responsive behaviour asks for ("<700px: drop the date rail into the meta line"). Unchanged at `md+`.
- **The landing teaser's header restates the section-rule idiom rather than reusing
  `NewsSectionRule`.** That component renders its label at `h5`, correct for an in-page rule but
  broken next to the landing's sibling `DAS PROGRAMM` at `h2`; adding a size prop would be the
  dual-mode API the rules ban, so `NewsTeaserHeading` restates the three elements (~10 lines) at `h2`.
  The article page reuses the shipped component and the shared `moreNewsLabel` const exactly.
- **The teaser's lead card is emphasised by `shadow.raised` alone**, not a wider grid span — a 6/3/3
  split letterboxed the lead card's media and shrank the other two. All three keep `md: 4`.
- **`NewsRelated` reads `NEWS_POSTS` internally** and takes only `currentSlug`, matching
  `NewsTeaser`/`ProgramTeaser`, so `NewsPostPage`'s prop shape stays `post`.
- **Section guards:** both the list's *WEITERE MELDUNGEN* rule and the related/teaser blocks are
  guarded on a non-empty result, so a Session with exactly one Meldung never renders a rule over an
  empty list. Not in the plan, but the same derived-data state the empty branch handles.
- **Seed content is fuller than the mock.** The mock ships a `body` for only `motto-56`, so bodies
  were authored for the other five from facts already stated in their own teasers plus names already
  in `groups-content.ts` (`body: [teaser]` would have printed the article's lead twice). The JHV
  teaser's "Der **Vorstand** wurde bestätigt" is now "Alle **Ämter** wurden bestätigt"; "der Beitrag
  bleibt bei 30 Euro" stays — the membership-fee sense is the glossary-correct one.
- **The canonical is root-relative** (`/news/{slug}`) — no production origin is configured anywhere in
  the app, and inventing a domain was out of scope. `lib/seo.ts`'s `RouteHead` gained an optional
  `links` field to carry it through the existing `head` API.
- **`useCopyLink` awaits the clipboard write** (a review catch): the first cut discarded the promise
  and reported "Link kopiert ✓" even when the write was denied, and threw in an insecure context.

### UI/UX review pass (2026-07-27, commit `5ee1f12`)

A critical design/a11y review of the shipped page produced 11 findings, all fixed in one pass. Where
they change decisions recorded above:

- **Red text stays `primary.main` — the contrast finding is NOT fixed, deliberately.** The review
  measured brand red `#E11D2A` on cream at **4.35:1**, below the 4.5:1 AA floor for normal-size text
  (the page eyebrow, the Aufmacher CTA, the article back link, the teaser link, the copy-link hover).
  The first attempt introduced a second, darker red as a `redInk` palette token; that was **reverted on
  2026-07-27** — ONE THEME means one red, and a second red is a new colour no matter which slot it
  hides in. `primary.dark` is not an escape either: it is a visibly different red in light mode, and in
  the dark scheme it drops to **3.94:1**, worse than what it replaces.
  **Open, needs a design decision:** the only fixes inside one theme are (a) stop using red for
  small text — the design README itself says "red is accent and action only, never body text" — or
  (b) raise those texts to the WCAG large-text threshold (18.66px bold) so 4.35:1 passes at 3:1.
  Large display red (the `12.07.` rail, hover headlines) already clears that bar and is fine.
- **Reading time is now derived with a 3-minute minimum.** `deriveReadingTime` returns `string | null`
  and the Aufmacher footer renders nothing below the threshold — a one-minute estimate is noise. Every
  seeded Meldung is 50–140 words, so **the label is invisible on the shipped page by design** and
  self-reveals for a longer Meldung, the same idiom as the archive button. A unit case documents this.
- **The `AUFMACHER` flag is gone** (jargon, redundant with scale/position, and the one element fighting
  `radius.base`), along with `aufmacherFlagLabel` and the flag component.
- **The eyebrow is the plain constant `AUS DEM VEREIN`** — the masthead already states the Session twice,
  and the old eyebrow claimed 2025/26 while the lead announces the 56. Session. `buildNewsEyebrow` and
  its tests were deleted rather than left as an identity function. Consequence: at `xs` the running
  Session is no longer named on this page (the masthead meta rails are `md+` only) — accepted.
- **The Aufmacher is content-driven, not ratio-driven.** The media slot is `aspectRatio: { xs: banner,
  md: 'auto' }` + `minHeight: { md: '16rem' }`, so the text column sets the card height and the media
  stretches into it — this removed ~145px of dead space between the teaser and the footer.
- **The photo placeholder is tinted neutrally** (`text.primary`), because a red-tinted stripe box read as
  an error state *and* pre-empted `NewsPlakat`'s meaning. `resolveCategoryTint` is now used only by the
  Plakat and the category chip; `KkPhotoPlaceholder`'s shared default is untouched.
- **Exactly one date per row per breakpoint** — the meta-line long date is now the complement of the rail
  (`xs` only). Accepted trade-off: at `md+` the year is absent from the reading order; a `<time
  dateTime>` element would be the proper fix.
- **Every card link carries `aria-label={post.title}`** (Aufmacher, rows, cards) — the accessible name
  was previously the whole card, ~40 words. `NewsAufmacherRoot` takes `post` instead of `slug`.
- **The hover lift moved to the `Card`** — on the `CardActionArea` it was clipped by the card's own
  `overflow: hidden` (2px cut off the media top, a paper sliver at the bottom).
- **The intro is a `subtitle1`-weight standfirst** and lost its defensive middle clause; the tester
  changelog pill was demoted from brand-red CTA styling to a neutral utility control.

**Still owed, no gate covers it:** a visual pass at `xs`/`md`/`xl` in both schemes. Two known judgement
calls: in dark mode the neutral placeholder hatch may read as near-flat grey (the lever is the tint, never
a prop on `KkPhotoPlaceholder`), and the demoted pill is white-on-white over `paper` rows in light mode
(the lever is a stronger `borderColor`, never restoring `color="primary"`).

**Out of scope, found during the pass — needs its own commit:** white on **dark-mode** red `#FF3B47` is
**3.52:1**, so red *fills* fail AA in dark mode app-wide (`NewsWhatsAppShareButton`, `NewsCategoryChip`,
`MitmachenBand`, `CtaBand`, `KkTicker`) — that is an `onRed`/fill-token decision, not a per-component
patch. And the small-red-text failure still exists outside news at `components/NotFoundPage.tsx:45`,
`components/SiteTextLink.tsx:51`/`:58`, `Masthead/internal/MastheadDesktopBar.tsx:34`, landing
`ProgramSectionHeader.tsx:19` and club `PersonPortrait.tsx:34` — whatever resolves the news sites
resolves those too.

## Open Questions

- **None blocking.** All three original open questions are resolved:
  - *Content ownership?* → **typed constants in-repo** for v1; the Club-App becomes the publishing
    surface later (seam noted, not scaffolded). No CMS, no repo markdown, no ADR needed — it
    follows the existing scope banner and the shipped content-constant precedent.
  - *Categories or flat list?* → **4 fixed, label-only categories**, tint derived.
  - *Rich text / images?* → **paragraphs + inline bold**, nothing more; `image` nullable with a
    production typographic fallback.
- **Deferred (need real content or the Club-App backend):** real Meldungen and photos, the archive
  route, board publishing UI, and body-sanitisation once content stops being compile-time.

## Done When

- `/news` renders page head → Aufmacher → Weitere Meldungen → footer → red `/program` band, as one
  responsive page, light + dark, tokens only.
- `/news/:slug` renders a readable article with a working share row; an unknown slug lands on the
  site-wide 404; the landing shows the 3 newest Meldungen and links through.
- No "Vorstand" and no "Beitrag" (news sense) in code or copy; the Aufmacher is derived by date;
  every category renders a consistent tint; photo-less Meldungen never look broken.
- `NarrenrufBand` + `RecruitBand` render identically to before on the shared `CtaBand`.

## Implementation plan (phases)

Small, ordered, independently testable **vertical slices** (tracer bullet first, then widen). Each
leaves the app building and working. **Frontend only. Backend: none** for every slice.

1. **Tracer bullet — content model + list skeleton.** Stand up `features/news/` with
   `news-content.ts` (typed `NewsPost`, `NewsCategory`, German `categoryLabels`, the derived tint
   map, 6 seeded Meldungen with 2 photo-less) and `src/lib/date.ts` (long + short German dates).
   Replace the `/news` placeholder with `NewsListPage`: eyebrow + H1 **AKTUELLES** + intro + rule +
   the *Weitere Meldungen* rows (red date rail, chip, headline, teaser). Page head meta.
   *Delivers (FE):* `/news` is a real, readable page, responsive, light + dark.
   *Verify:* route renders `NewsListPage`, not `PlaceholderPage`; rows come from the sorted array;
   helpers unit-tested; head asserted; `pnpm build`/`typecheck`/`test`/`lint` pass.
2. **Aufmacher.** The lead card above the rows — newest post by derived sort, photo + flag,
   category chip + date, Anton headline, teaser, "Ganze Meldung lesen →" + reading time. Emphasis
   via scale + `shadow.raised`, no hard offset.
   *Delivers (FE):* the list page's single bold moment.
   *Verify:* the Aufmacher is the newest post and is not repeated in the rows below; both themes.
3. **`NewsPlakat` fallback.** Tint block + broom watermark + category name in Anton, at Aufmacher,
   row-thumb and (later) teaser scales.
   *Delivers (FE):* photo-less Meldungen render as intentional posters, not empty boxes.
   *Verify:* `image: null` renders the fallback and non-null renders the placeholder; gold tint
   takes ink text; watermark is `aria-hidden`.
4. **Shared `CtaBand` + migration.** Extract the compound to `src/components/CtaBand/`; migrate
   `NarrenrufBand` (Row) and `RecruitBand` (Column); add the news list's *"NICHTS VERPASSEN / ALLE
   TERMINE DER SESSION → Zum Programm"* band. **`/program`, not the mock's `/schedule`** — that is
   a Club-App route the mock leaked into the public site.
   *Delivers (FE):* one band shell, three call sites, no visual change on `/club`.
   *Verify:* `/club` renders identically (both bands, both themes); no boolean flag in the API;
   `features/landing` untouched.
5. **List footer + empty state.** Footer sentence, the derived (currently hidden) archive button,
   and the zero-Meldungen quiet panel.
   *Delivers (FE):* the list page is complete end-to-end.
   *Verify:* the archive button is absent with only current-Session posts; empty state renders from
   an empty array.
6. **Site-wide 404.** `src/components/NotFoundPage.tsx` (confetti copy above) + `notFoundComponent`
   on `__root`, wrapped in `SiteChrome`.
   *Delivers (FE):* any bad URL lands on a branded, funny 404 with working exits.
   *Verify:* an unmatched path renders it with masthead + footer; reachable while ungated; both
   themes; reduced-motion respected.
7. **Article page.** `routes/_site/_gated/news.$slug.tsx` with a loader + not-found; back link,
   meta line (byline omitted when null), Anton H1, Anton lead, hero image or Plakat + caption, body
   paragraphs with inline bold. Per-post head meta (`og:type: article`, published time, canonical).
   *Delivers (FE):* a shareable, readable Meldung at its own URL.
   *Verify:* a known slug renders; an unknown slug hits the 404; bold parsing unit-tested; body
   ≥16px; head asserted.
8. **Share row.** *TEILEN* + WhatsApp (`wa.me`) + *Link kopieren* with the 2 s label swap.
   *Delivers (FE):* the detail page's reason to exist.
   *Verify:* URL builder unit-tested and encoded correctly; the copied flag resets; buttons are
   keyboard-reachable.
9. **Weitere Meldungen (article).** The 3 next-newest as quiet cards, reusing the list page's
   section rule and the same *WEITERE MELDUNGEN* label; 2 as horizontal cards at `xs`.
   *Delivers (FE):* the article page is complete; the reader stays in the content.
   *Verify:* excludes the current post; caps at 3; reflows at `xs`.
10. **Landing teaser.** `NewsTeaser` (section header **AKTUELLES** + "Alle Meldungen →" + 3 cards,
    the first emphasised) exported from the news barrel; `LandingPage` gains its optional node slot
    between `ProgramTeaser` and `MitmachenBand`; `routes/_site/index.tsx` wires the two features.
    *Delivers (FE):* the home page surfaces news — the phase is content-complete.
    *Verify:* no `features/news` ↔ `features/landing` import in either direction; `LandingPage`
    still renders correctly with the slot omitted; block order asserted; `pnpm build`/`typecheck`
    pass.

## References

- Mock: `docs/design/news-page/` (`src/fcc-ds-news.jsx` → `NewsPage`/`NewsTeaser`; README = the
  handoff). **Inspiration for structure and copy only — Destillat + `@furria/ui` are binding.**
- `CONTEXT.md` (Aktuelles, Meldung, Kategorie, Beitrag, Session). `lib/club.ts` (derived facts).
- Reuse map: `ChapterHeader`/section-rule idiom, `ProgramTeaser` typed-content + tint pattern,
  `RecruitBand`/`NarrenrufBand` red-surface idiom, `SiteChrome`, `KkBroomMark`, `KkPhotoPlaceholder`,
  `KkConfettiBurst`, `program-content.ts` (typed-const precedent).
