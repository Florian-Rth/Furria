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

## Open Questions

- **Real hero photo** — deferred: no club asset yet; `KkPhotoPlaceholder` ships for launch and the
  real photo is a one-line swap later (asset task, not P1).
- **Real member / group counts** — deferred: `180+` / `12` are placeholders until the club confirms
  figures (or P5 wires live data).

## Done When

- The hero renders desktop (split) + mobile (stacked), light + dark, with headline, CTAs,
  stats, photo + seal, and contained confetti — all from shared tokens.

## References

- Mock: `fcc-ds-landing.jsx` (`BestDesktop` hero grid, `HeroPhoto`, `BestConfetti`).
