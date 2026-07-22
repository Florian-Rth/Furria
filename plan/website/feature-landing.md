---
title: Landing
slug: landing
type: capability
status: shipped
mock: docs/design/fcc-ds-landing.jsx
adrs: []
---

## What & Why

The home page (`/`) — the club's front door and the most important page on the site. It is a
**composition** of independently-planned blocks in a deliberate order; this file owns the page
itself (route, block order, responsive desktop/mobile layout, page-level meta), while each
block is planned in its own feature file.

## Scope / Slices

Block order (top → bottom), from the "Destillat" mock:

1. Masthead nav — [Site-Shell](feature-site-shell.md)
2. [Landing-Hero](feature-landing-hero.md) — asymmetric editorial hero
3. [Ticker](feature-ticker.md)
4. [Programm-Teaser](feature-program-teaser.md) — "DAS PROGRAMM"
5. [Mitmachen-Band](feature-mitmachen-band.md) — recruit CTA
6. Footer — [Site-Shell](feature-site-shell.md)

## Decisions

- The landing is a **thin composition**; all real substance lives in the block features.
- Desktop = asymmetric split hero; mobile = stacked (per mock's `BestDesktop` / `BestMobile`).
- **`features/landing` owns the REAL home page.** The pre-launch coming-soon **teaser** that used
  to live here (the P0 `LandingPage` with the "DIE FÜNFTE JAHRESZEIT BEGINNT HIER." wordmark +
  `Einlass` button) has moved to `features/preview-access` (it is the gate's face, not the front
  door — see [Preview-Gate](feature-preview-gate.md)). `features/landing/LandingPage` is now the
  real landing.
- **Final block order (locked, mock order, no extras):** Masthead (shell) → [Landing-Hero](feature-landing-hero.md)
  → [Ticker](feature-ticker.md) → [Programm-Teaser](feature-program-teaser.md) → [Mitmachen-Band](feature-mitmachen-band.md)
  → Footer (shell). **No** news-teaser or gallery-strip block in v1 (news = P4, gallery = P5; a
  landing teaser for either can be reconsidered then). P1 delivers **Hero → Ticker** only, laid out
  so the P2 blocks slot in below the ticker with no restructuring.
- **`/` routing:** the `/` route branches on preview access —
  **ungated** → the coming-soon teaser (preview-access) + unlock dialog (unchanged);
  **granted** → the real `LandingPage` inside `SiteChrome` (masthead + footer), **replacing** the
  P0 "Willkommen" placeholder. At launch the gate flips off and the granted view becomes public.
  **Revised (2026-07-23, post-P2 bugfix):** `/` is now the **`_site` index** (`routes/_site/index.tsx`),
  **not** a standalone route. It originally stood alone and rendered its *own* `SiteChrome`; that mounted
  a second masthead/footer separate from the `_site` layout's, so navigating `/` ↔ inner pages fully
  remounted the chrome (visible flash + the nav-link confetti burst never animated, since the landing's
  masthead unmounted on click). Moving `/` under `_site` makes one `SiteChrome` instance persist across
  the landing and every inner page. The teaser stays chrome-less: the `_site` layout renders a bare
  `Outlet` only for the ungated home (`!granted && pathname === '/'`) and `SiteChrome` otherwise (so
  ungated `/imprint` + `/privacy` keep their chrome). See [Preview-Gate](feature-preview-gate.md).
- **Page-level meta:** `/` sets its own document head via the TanStack Router `head` API — a
  **branded German title** (brand + tagline, *not* the `%s · FURRIA` name-suffix template),
  a landing meta description, and OG title/description. The OG **image** stays the P0
  placeholder / deferred (absolute URL blocked until a production domain — see [SEO & Meta](feature-seo-meta.md)).

## Open Questions

- None for P1 — resolved in the P1 grilling session (folded into Decisions above). The
  post-launch fate of the teaser is tracked by [Preview-Gate](feature-preview-gate.md).

## Done When

- `/` renders all P1 blocks in order (Masthead → Hero → Ticker → Footer), responsive, light + dark,
  using only shared tokens; the home tab shows the branded title.

## Implementation plan (phases)

The P1 build for the whole page (Hero + Ticker + the shared primitives they need + the `/` rewire).
Small, ordered, independently testable vertical slices; each leaves the app building and working.
Block-specific requirements live in [Landing-Hero](feature-landing-hero.md) and [Ticker](feature-ticker.md).

- **Frontend requirements:** everything below (`web/apps/website` + `@furria/ui`).
- **Backend requirements: none.** The page is fully static; the website's live public read
  endpoints (stats, events, scarcity) are **deferred — need the Club-App backend** (see the master
  plan's Deferred section and [API-Client](feature-api-client.md)).

1. **Real landing reachable (tracer bullet).** Move the teaser + its parts (`TeaserLayout`,
   `Wordmark`) into `features/preview-access`; promote the two-tone headline to `@furria/ui`
   (`KkTwoToneHeadline`, shadow **off**) and have the relocated teaser consume it. Free
   `features/landing` and make the `/` **granted** branch render a minimal real `LandingPage`
   (headline + intro only) inside `SiteChrome`.
   *Delivers (FE):* real landing visible at `/` when granted; teaser unchanged when ungated.
   *Verify:* existing `index`/gate tests updated & green; ungated → teaser, granted → masthead +
   footer + real headline; `pnpm build`/`typecheck` pass.
2. **Hero text column.** Eyebrow badge (session + `11.11.` from `lib/club.ts`), poster-shadow
   headline (`KkTwoToneHeadline` shadow **on**), intro paragraph, two CTAs (**Tickets sichern** →
   `/tickets`, **Programm ansehen** → `/program`), stat row (`1971` from `FOUNDING_YEAR`; `180+` /
   `12` placeholder constants).
   *Delivers (FE):* left column of the hero, responsive, light + dark.
   *Verify:* renders both themes; CTAs navigate to the branded placeholders; stat/eyebrow text
   derives from club globals (unit + component tests).
3. **Hero photo column + split layout.** New `@furria/ui` primitives `KkPhotoPlaceholder` and
   `KkSeal`; assemble the tilted photo + ink keyline + "Seit {FOUNDING_YEAR}" tag + floating 11.11
   seal; wire the **asymmetric split** (desktop) / **stacked** (mobile) grid.
   *Delivers (FE):* complete hero layout at both breakpoints.
   *Verify:* split on desktop, stacked on mobile; seal float honours reduced-motion; component test.
4. **Hero decoration.** New `@furria/ui` `KkBroomMark` (faint hero watermark) — refactor the
   footer's local `BroomMarkIcon` to consume it — and `KkConfettiScatter` (static, deterministic,
   ≤13 chips, boxed, behind text via z-index).
   *Delivers (FE):* broom watermark + contained confetti; footer de-duplicated.
   *Verify:* confetti never overlaps the reading column; reduced-motion respected; footer still
   renders the mark (regression test).
5. **Ticker.** New `@furria/ui` `KkTicker` (content-agnostic red/gold Anton marquee, seamless loop,
   reduced-motion aware); mount it under the hero with content built from club globals
   (`GROSS FURRIA ✶ GROSSBESENSTADT ✶ SESSION {yearsLabel} ✶`).
   *Delivers (FE):* marquee under the hero on the landing.
   *Verify:* seamless scroll; static under reduced-motion; tokens-only; component test.
6. **Home meta.** Set the `/` route `head` (branded title, description, OG title/description).
   *Delivers (FE):* correct home document head.
   *Verify:* head/meta assertions in the `/` route test.

### P1.1 — Mobile hero slices

Added 2026-07-22 from a dedicated mobile-hero mock, reconciled against the P1 decisions above in a
grilling session. Details in [Landing-Hero](feature-landing-hero.md) Decisions ("Mobile hero").

7. **Token foundations.** `@furria/ui`: add `kkTokens.aspectRatio` (`portrait: '4 / 5'`,
   `landscape: '7 / 5'`); add `kkTokens.overlay.photoScrim` (mode-invariant legibility gradient);
   give `KkPhotoPlaceholder` a `fill` variant (full-bleed, no aspect-ratio/radius). Migrate the
   desktop `HeroPhoto`'s inline `"7 / 5"` to `kkTokens.aspectRatio.landscape`.
   *Delivers (FE):* no visible change; desktop hero photo now token-sourced.
   *Verify:* `KkPhotoPlaceholder` unit test covers the `fill` variant; desktop hero regression
   (still renders identically); `pnpm typecheck`/`pnpm test` pass.
8. **`MobileHero`.** New `features/landing/components/MobileHero/` — full-bleed photo
   (`KkPhotoPlaceholder fill`, `aspectRatio.portrait`) + `kkTokens.overlay.photoScrim` + pinned
   `KkTwoToneHeadline`, absolutely stacked inside an aspect-ratio-sized band. No status bar, no nav
   — the real `Masthead` stays untouched above it.
   *Delivers (FE):* immersive mobile-only hero photo band, light + dark (scrim invariant, photo
   placeholder theme-tinted).
   *Verify:* renders only at `xs`; both themes; component test.
9. **`HeroFollow`.** New `features/landing/components/HeroFollow/` wrapping the existing
   `Hero.Intro`/`Hero.Actions`/`Hero.StatRow` in mobile-appropriate spacing — no forked copy, no
   card.
   *Delivers (FE):* tagline/CTAs/stats directly beneath the mobile hero photo.
   *Verify:* same CTAs/stats/copy as desktop (shared source); component test.
10. **Wire into `LandingPage`.** Mount `Hero` (existing) at `md`+ and `MobileHero` + `HeroFollow`
    at `xs`, both breakpoint-toggled via `sx` (same pattern as `MastheadDesktopBar`/
    `MastheadMobileBar`); `LandingTicker` stays a single shared instance beneath either.
    *Delivers (FE):* complete mobile landing hero, end to end.
    *Verify:* `LandingPage.test.tsx` covers both breakpoints; `pnpm build`/`typecheck` pass.

### P2 — Landing complete (composition)

The page gains its final two blocks below the ticker — **still fully static, no backend**. Block
detail + build slices live in each block's own feature file; the landing only owns the composition.

11. **[done]** **Compose the P2 blocks.** Mount [Programm-Teaser](feature-program-teaser.md) then
    [Mitmachen-Band](feature-mitmachen-band.md) in `LandingPage` below `LandingTicker`, inside a
    gutter-constrained container (`kkTokens.layout` gutters), for both breakpoints. Final order:
    Hero → Ticker → Programm-Teaser → Mitmachen-Band → Footer. No restructuring of the P1 layout.
    *Delivers (FE):* the full landing reads end-to-end at `/`, responsive, light + dark.
    *Verify:* `LandingPage.test.tsx` asserts all blocks present in order at both breakpoints;
    `pnpm build`/`typecheck` pass.

## References

- Mock: `fcc-ds-landing.jsx` (`BestV`, `BestDesktop`, `BestMobile`).
