---
title: Programm-Teaser
slug: program-teaser
type: capability
status: shipped
mock: docs/design/fcc-ds-landing.jsx
adrs: []
---

## What & Why

The home page's "DAS PROGRAMM" section: a short teaser of upcoming events (3 cards) with an
"Alle Termine →" link into the full [Veranstaltungskalender](feature-event-calendar.md). It is
the marketing bridge that turns the home page into a reason to buy tickets — and later carries
**live ticket-scarcity** as a scarcity/marketing signal.

Uses the term **Programm** in its **public-website sense** — the season's public event lineup
(see `CONTEXT.md`), *not* the Club-App running-order sense.

## Scope / Slices

- Section header (Anton "DAS PROGRAMM") + "Alle Termine →" link → `/program`.
- 3 upcoming event cards — desktop **photo-topped card** in a 3-col grid, mobile **compact
  photo-less row** (date block, title, venue/time, tint).
- **Static-final** placeholder content (this build has no backend — see below).
- Scarcity badge on cards ("nur noch X Tickets") — **deferred** (needs the Club-App backend).

## Decisions

- **Static, no backend.** This whole website build ships fully static; there is no live event
  data because events originate in the Club-App, which is not built yet. The 3 events are a
  **hand-curated static list**, final for this build. "Next-3-by-date" selection logic,
  scarcity, and empty-state all belong to the deferred backend era (see master plan
  "Deferred — needs Club-App backend").
- **Data-driven, swap-ready interface (the point of this feature).** The cards are **purely
  presentational**, fed by a typed event item; placeholder data lives in an **editable content
  constant** matching that type. Swapping to real data later (curated static edits *or* a
  future backend feed) is a **data-source change only — no component edits**.
  - Item shape: **`{ startsAt: ISO datetime, title, venue }`** — the shape real event data has.
  - The card **derives** the display from `startsAt`: day (`14`), month (`FEB`, German
    uppercase abbrev), and time (`19:11 Uhr`). Derivation is a **pure, unit-tested** function.
  - **Tint is presentational, assigned by card position** (1 = red, 2 = gold, 3 = ink) — *not*
    stored in the data — so the interface stays limited to real event fields.
- **Card visuals follow the mock (`LProgramCard` desktop / `LEventCard` mobile), two
  presentational components** toggled by breakpoint (same pattern as `Hero`/`MobileHero`):
  - **Desktop `ProgramCard`:** `KkPhotoPlaceholder` banner (per-card `tint`) on top + date
    block + title + venue/time, in a 3-col grid.
  - **Mobile `EventRow`:** no photo — date block + title + venue/time + a small tint dot.
  - The desktop banner needs a wider ratio than the existing `portrait`/`landscape` tokens:
    add **`kkTokens.aspectRatio.banner`** to `@furria/ui` (token-pure) and pass it +`tint`.
    Shipped as **`'2 / 1'`**; the position tint is a shared `resolveEventTint(palette, index)` helper
    in `program-content.ts` (0 = `primary.main` red, 1 = `warning.main` gold, 2 = `text.primary` ink),
    consumed by both the desktop grid and the mobile list.
- **Placeholder events (final for this build, swap before launch):**
  - `2026-02-14T19:11` · Große Prunksitzung · Festhalle → 14 / FEB / 19:11 Uhr · red
  - `2026-02-08T14:30` · Kinderfasching · Sporthalle → 08 / FEB / 14:30 Uhr · gold
  - `2026-02-16T13:11` · Rosenmontagsumzug · Dorfplatz → 16 / FEB / 13:11 Uhr · ink
  - Dates line up with the **2025/26 Session** (Rosenmontag = 16 Feb 2026).
- **Ownership / location.** Lives at `features/landing/components/ProgramTeaser/`; the landing
  page (`LandingPage`) composes it below the ticker. The event card is built **locally** here —
  **not** pre-shared. When the full Veranstaltungskalender is built (deferred), the card can be
  promoted/extracted then; no seam is reserved now (YAGNI).
- Reads the same event data as the full calendar *conceptually* — a **teaser view**, not a
  separate source — but there is no shared code until the calendar exists.

## Open Questions

- None for this build — resolved above. The following are **deferred to the Club-App backend
  era** (not this build), tracked in the master plan's Deferred section:
  - How the 3 events are chosen once data is live (next-3-by-date vs. curated/featured).
  - Scarcity: exact threshold + copy for the "nur noch X Tickets" badge.
  - Empty state when there are no upcoming events.

## Done When

- The home page shows the 3 (placeholder) upcoming events — desktop photo cards / mobile rows —
  with a working "Alle Termine →" link to `/program`, responsive, light + dark, tokens-only.
- The event data flows through the typed item interface + content constant, so real data can be
  dropped in with no component change.

## Implementation plan (phases)

Vertical, independently shippable slices; each leaves the app building and working. **Frontend
only** (`web/apps/website` + `@furria/ui`). **Backend: none** — static-final.

1. **Desktop teaser, end-to-end (tracer bullet).** Typed `ProgramEvent` interface +
   placeholder content constant; pure derivation helper (`startsAt` → day / month / time);
   `KkPhotoPlaceholder` banner ratio token (`kkTokens.aspectRatio.banner`); desktop
   `ProgramCard` (photo + date + title + venue, position-assigned tint); section header
   ("DAS PROGRAMM" + "Alle Termine →" → `/program`); 3-col grid mounted in `LandingPage` at
   `md`+ below the ticker, inside the gutter container.
   *Delivers (FE):* the desktop Programm-Teaser live at `/`, driven by the data constant.
   *Verify:* derivation unit test (ISO → `14`/`FEB`/`19:11 Uhr`); `ProgramCard` renders from a
   `ProgramEvent`; `LandingPage` test asserts 3 cards + header + link target `/program`; both
   themes; `pnpm build`/`typecheck` pass.
2. **Mobile rows.** `EventRow` (no photo — date block + title + venue/time + tint dot), stacked,
   mounted at `xs`, fed by the **same** content constant/derivation as desktop.
   *Delivers (FE):* the mobile Programm-Teaser; desktop unchanged.
   *Verify:* renders only at `xs`; shares data source with desktop (no duplicated content);
   component test; both themes.

## References

- Mock: `fcc-ds-landing.jsx` (`LProgramCard`, `LEventCard`, "DAS PROGRAMM").
- `CONTEXT.md` (**Programm** — public-website sense).
- Design README §9 (Vorverkauf → "live remaining-ticket scarcity feeds the public site") —
  deferred to the backend era.
