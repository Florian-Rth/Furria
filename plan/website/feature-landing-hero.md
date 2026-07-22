---
title: Landing-Hero
slug: landing-hero
type: capability
status: building
mock: docs/design/fcc-ds-landing.jsx
adrs: []
---

## What & Why

The identity centerpiece of the home page — the first thing a visitor sees and the strongest
expression of the brand. Asymmetric editorial split: eyebrow badge, two-tone headline, intro,
CTAs, a stat row, and the anchor photo.

## Scope / Slices

- Eyebrow badge: `★ SESSION 2026 · 11.11. ERÖFFNUNG`.
- Two-tone headline: line 1 ink **GROSS**, line 2 red **FURRIA!** with the whisper poster
  head-shadow (`3px 3px 0 ink`) — the one allowed hard shadow.
- Intro paragraph (Großbesenstadt / fünfte Jahreszeit copy).
- Two CTAs: primary **Tickets sichern →**, secondary **Programm ansehen**.
- Stat row: `180+ Mitglieder · 12 Garden & Gruppen · 1971 gegründet`.
- Hero photo: subtle tilt, ink keyline, soft shadow, "Seit 1971" tag, floating **11.11 seal**.
- Contained **confetti** (≤13 chips, never over the reading column).
- **Mobile (P1.1):** a dedicated, from-scratch mobile treatment — immersive full-bleed photo band
  (mode-invariant legibility scrim, two-tone headline pinned to its bottom edge) — distinct from
  desktop's asymmetric split, not a stacked copy of it. See Decisions below.

## Decisions

- The two-tone headline + poster head-shadow is the single sanctioned hard-shadow moment.
  Rendered via the shared **`KkTwoToneHeadline`** (`@furria/ui`) with its poster-shadow prop **on**
  (the shadow uses the `ink` token, which auto-flips to cream in dark mode).
- Confetti is decorative, deterministic, boxed — never over text. Uses a new **static**
  `@furria/ui` primitive **`KkConfettiScatter`** (≤13 chips, seeded, positioned behind the reading
  column via z-index) — distinct from the existing `KkConfettiRain`/`KkConfettiBurst`.
- Narrenruf headline is **GROSS FURRIA!** (local law).
- **Stats are static in P1** (live wiring is P5). Single-sourced from `lib/club.ts`: `1971` from
  `FOUNDING_YEAR`; `180+ Mitglieder` and `12 Garden & Gruppen` are **clearly-marked placeholder
  constants** pending real figures / live data. (See [Session](../../CONTEXT.md) term.)
- **Eyebrow badge derives from `lib/club.ts`** — same source as the masthead, so nothing hardcodes
  a year and they never drift: `SESSION {currentSession.yearsLabel}` + the `11.11.` opening
  (from exported opening day/month constants) + `ERÖFFNUNG`.
- **CTAs link to real routes:** primary **Tickets sichern →** `/tickets` (matches the masthead
  Tickets button), secondary **Programm ansehen** → `/program`. Both resolve to the branded
  `PlaceholderPage` until their features ship (Tickets = P6, Program = P5). No same-page anchor
  (the Programm-Teaser block is P2) and no dead buttons.
- **Hero photo is a branded placeholder for launch:** new shared `@furria/ui` primitive
  **`KkPhotoPlaceholder`** (hatched box + label + tint), reused later by Programm-Teaser (P2) and
  Gallery (P7). The "Seit {year}" tag derives from `FOUNDING_YEAR`.
- The broom watermark uses the shared **`KkBroomMark`** (`@furria/ui`); the 11.11 seal uses
  **`KkSeal`** (`@furria/ui`). All hero motion (seal float, confetti, headline) honours
  reduced-motion.
- **Build sequence:** delivered across P1 slices 2–4 — see the Implementation plan in
  [Landing](feature-landing.md).

### Mobile hero (P1.1 — decided in the P1.1 grilling session)

- **Two sibling components, not one responsive component.** The existing `Hero` compound
  (`features/landing/components/Hero/`) is scoped to `md`+ unchanged. A new `MobileHero` (photo
  band + scrim + headline) and `HeroFollow` (tagline/CTAs/stats wrapper) cover `xs`. There is no
  shared layout markup between the two treatments — only shared **content**, pulled from the same
  `hero-content.ts` / `lib/club.ts` sources both already use, so copy can never drift between
  breakpoints. `LandingPage` mounts both trees and toggles visibility by breakpoint (`sx={{
  display: { xs: ..., md: ... } }}`), the same pattern `MastheadDesktopBar`/`MastheadMobileBar`
  already use. Both headlines render as `<h1>` (`KkTwoToneHeadline` is unchanged) — accepted as a
  standard, harmless responsive pattern since the hidden copy carries identical text and is
  excluded from the accessibility tree.
- **`HeroFollow` reuses `Hero.Intro`/`Hero.Actions`/`Hero.StatRow` directly** (no mobile-specific
  forks) — they're already MUI-generic, card-free, and token-driven, and already structurally match
  the mock's tagline/CTA-row/stats-strip. The mock's slightly different wording ("seit 1971" vs.
  the shipped "seit Generationen"; "Programm" vs. "Programm ansehen"; "Garden" vs. "Garden &
  Gruppen") is **not** carried over — copy isn't binding per the design README's READ FIRST, and
  the shipped wording stays single-sourced.
- **Masthead is untouched.** The mock's status bar + transparent overlay nav baked into the hero
  band is that mock's own guess at chrome that already exists in the real app — per the design
  README's READ FIRST ("layout/functionality is inspiration"), it is dropped entirely. The real,
  shipped `Masthead` keeps rendering in normal opaque flow above the hero, on every route,
  unchanged, including mobile `/`. Consequently the mock's "ensure the OS status bar uses light
  content" note doesn't apply — the OS status bar sits over the opaque masthead, never over the
  photo.
- **No fixed pixel sizes — the hero band is sized by aspect-ratio,** the same pattern the desktop
  `HeroPhoto` already uses via `KkPhotoPlaceholder`'s `aspectRatio` prop, not the mock's literal
  `566px` (which was sized to fit chrome — status bar + nav — that no longer lives inside this
  component). New shared `kkTokens.aspectRatio` scale (`portrait: '4 / 5'`, `landscape: '7 / 5'`) —
  standard photographic ratios, not the mock's derived, arbitrary `400/566`. Desktop `HeroPhoto`
  migrates its inline `"7 / 5"` to `kkTokens.aspectRatio.landscape`; the mobile hero band uses
  `kkTokens.aspectRatio.portrait`.
- **New `kkTokens.overlay.photoScrim`** — a mode-invariant legibility gradient, sibling to
  `kkTokens.color` rather than nested inside it, since (per the mock) it deliberately does **not**
  flip with light/dark mode like every other color token does (it always sits over a photo).
- **`KkPhotoPlaceholder` gains a `fill` variant** (`width/height: 100%`, no `aspectRatio`, no
  border-radius) for the mobile hero's edge-to-edge background, alongside its existing
  aspect-ratio-boxed mode (unchanged, still used by desktop `HeroPhoto`).
- **Folder structure:** `features/landing/components/MobileHero/` and
  `features/landing/components/HeroFollow/`, mirroring `Hero/`'s `internal/layout` +
  `internal/ui` split.

## Open Questions

- **Real hero photo** — deferred: no club asset yet; `KkPhotoPlaceholder` ships for launch and the
  real photo is a one-line swap later (asset task, not P1).
- **Real member / group counts** — deferred: `180+` / `12` are placeholders until the club confirms
  figures (or P5 wires live data).

## Done When

- Desktop (`md`+) renders the asymmetric split hero — headline, CTAs, stats, photo + seal, contained
  confetti — light + dark, all from shared tokens.
- Mobile (`xs`) renders the dedicated `MobileHero` (full-bleed photo, mode-invariant scrim, pinned
  headline) + `HeroFollow` (tagline, CTAs, stats), light + dark, sized by aspect-ratio (no fixed
  pixel heights), reusing the same content sources as desktop.

## References

- Mock: `fcc-ds-landing.jsx` (`BestDesktop` hero grid, `HeroPhoto`, `BestConfetti`).
- Mock (mobile, P1.1): `docs/design/mobile-hero.html` + `docs/design/mobile-hero-handoff.md`
  (source of record `fcc-ds-landing.jsx` → `BestMobileHero`/`BestMobile`).
