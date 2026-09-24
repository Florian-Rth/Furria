---
title: SEO & Meta
slug: seo-meta
type: foundation
status: building
mock: -
adrs: [docs/adr/0003-website-rendering-strategy.md]
---

## What & Why

A public marketing site must be discoverable and shareable. This covers the document head: per-page
title/description, canonical URLs, Open Graph / Twitter cards (so a shared event or news link renders
a rich preview), favicon/app icons, and sitemap/robots. Ties into the event planner's "auto-generate
shareable material" ambition on the public side.

## Scope / Slices

- P0: base document head + defaults + favicon/app icons + `robots.txt`.
- Per-page title/description/canonical (with each page). Shipped for `/join` and `/join/apply` in P6
  (2026-07-30) through the existing `RouteHead`/`pageTitle` mechanism — no new mechanism, nothing new
  decided.
- Open Graph / social-share cards, especially for events and news detail.
- Sitemap (once real public routes exist).

## Decisions

- German content; brand-true share imagery.
- **Head management via TanStack Router's built-in `head` API** (`head: () => ({ meta, links })` on
  routes + `<HeadContent/>` in `__root`) — no `react-helmet`. Forward-compatible: works SPA-injected
  now, prerendered later.
- **Static-first, no SSR** ([ADR 0003](../../docs/adr/0003-website-rendering-strategy.md)): prerender
  stable routes for crawlable HTML; inject OG/`<title>` meta for bot user-agents on dynamic detail
  pages (event, news) — social scrapers don't run JS, so this is how share previews work.

**P0 base:**

- Root-route defaults: title template `%s · FURRIA`, default description, `lang="de"` (already set),
  `theme-color`, OG/Twitter defaults (`og:locale de_DE`, default share image, card type).
- Favicon/app-icon `<link>`s wired; a placeholder mark is acceptable — real broom/FURRIA icons are a
  tracked **asset task**, not a P0 blocker.
- **`robots.txt` disallows indexing while gated** (only the teaser is public pre-launch); flip to
  allow at launch. **Sitemap deferred** — no real public routes to list yet.

**P4 (news) — per-post head only:**

- The news detail route sets its own head from the resolved post: title, description from the
  teaser, OG title/description, **`og:type: article`** (overriding the root's `website`), published
  time, canonical. No new mechanism — the existing `head` API, correct SPA-injected today and
  exactly what a prerender bakes in later.
- *As built (2026-07-26):* `lib/seo.ts`'s `RouteHead` type gained an optional **`links`** field (it
  previously typed `meta` only) so the canonical goes through the same `head` API. The canonical is
  **root-relative** (`/news/{slug}`, built by the pure `buildPostHref`): no production origin is
  configured anywhere in the app, and a relative canonical is spec-valid — it resolves with the
  absolute `og:image` URL in P7.

**P5 (Gallery) — per-Album head only (shipped 2026-07-29):**

- The Album route sets its own head from the resolved Album: title, description from its intro,
  OG title/description, root-relative canonical (`/gallery/{albumSlug}`). **No new mechanism** —
  the same `head` API and the same root-relative-canonical decision as the news post route.
- **The title carries the derived session** (`Prunksitzung 2025/26 · FURRIA`), unlike the news post
  route's bare title. Album titles are honest event types and therefore **repeat across sessions** —
  two seeded Alben are "Prunksitzung", two "Rosenmontagsumzug" — so a bare title would publish
  duplicate `<title>`/`og:title` for distinct canonical URLs. `buildAlbumDocumentTitle` appends
  `albumSession(album).yearsLabel`, so nothing new is stored ("session is derived, never stored"), and
  the visible H1 stays the bare title.
- **`og:type` stays the root's `website`** — an Album is not an `article`, and there is no published
  time to declare.
- **`?photo` is not reflected in the head.** A search param must not change the canonical, or every
  photo of an Album would compete with the Album page for the same content.
- Prerenderable in P7 like everything else: Album content is compile-time TS constants, so every
  `albumSlug` is known at build time.

**Revised in P4 grilling (2026-07-25) — prerender and injection both moved out of P4:**

- **Prerendering gated routes would defeat the preview gate.** The gate is client-side
  (`sessionStorage` + a `beforeLoad` redirect), so prerendered HTML for `/news/:slug` is readable
  with a plain `curl` — no JS, no session. Prerender and the gate are mutually exclusive while the
  site is gated, which makes prerender a **launch** task, not a content-phase task. It is also
  currently payoff-free: `robots.txt` is `Disallow: /`.
- **Static-in-repo content removes the need for bot injection entirely.** ADR-0003 justified
  injection because social scrapers don't run JS and *dynamic* pages would otherwise share blank.
  But news content is **compile-time TS constants**, so every slug is known at build time and the
  pages **prerender** with correct per-post OG meta baked in. **Injection is only ever needed for
  backend-driven detail pages** (real events, backend-served news posts) → Deferred with the
  Club-App. See the [ADR-0003](../../docs/adr/0003-website-rendering-strategy.md) amendment.
- Both, plus the robots flip, the absolute `og:image` URL and the sitemap, now live in the
  master plan's **P7 — Launch**.

**Deferred:**

- **Prerender mechanism → P7 (Launch).** Its own spike: emotion/MUI style extraction to static HTML,
  a TanStack Router static entry, and no light/dark hydration flash. The `head` API is already
  prerender-ready.
- **Bot OG-meta injection mechanism** (edge middleware vs. a `<meta>`-serving endpoint on the API) →
  **only for backend-driven detail pages**; deferred with the Club-App backend.
- Per-event OG images generated (matching the planner's advertising feature) vs. static.
- **Absolute share-image URL** — P0 ships `og:image` as root-relative `/og-default.png`
  (placeholder art); scrapers need an absolute URL, but none exists until a production domain
  is fixed → resolve in P7 (Launch).
- **`noindex` on the 404** — the site-wide `NotFoundPage` ships in P4, but a not-found is not a
  route, so it carries the root head; moot while `robots.txt` disallows everything → P7.

**P6 (2026-07-29):**

- Per-route `head` for **`/join`** and **`/join/apply`**, no new mechanism. Both are **indexed** —
  "beitrittsantrag" is a real search intent and the form page is not thin content.
- **Both stay prerenderable**, because their body copy is static constants. The Jeck-Check
  fetches, but it is interactive UI with no indexable content — the deliberate split recorded in
  [API-Client](feature-api-client.md). The rule to carry forward: **anything that must be indexed
  must not be async.**

## Done When

- Every page has a correct title/description; shared links render a branded preview.
- Search engines can crawl the public routes (post-launch).

## References

- Design README §9 (event planner → advertising: auto-generated shareable material).
