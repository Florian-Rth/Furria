# The studio is its own package and owns its domain components

The dance studio (music mix, steps, stage, choreography, trainer video, practice, hall) grew to about
30k lines spread over ten club-app feature folders plus about 35 kits in `@furria/ui`, with five stage
renderers and five music tracks. Decided 2026-11-02 (grilling for RFC 0003): it is treated as an app of
its own and lives in one workspace package, **`@furria/studio`**.

## The decision

- **`@furria/studio` owns the studio end to end:** playback engine, music/count/motion models, the
  local edit document with undo, the gesture engine, and the studio's **domain components** (one
  `Stage`, one `Timeline`, transport, practice, hall, editor views).
- **This amends [ADR-0007](0007-furria-ui-owns-every-visible-component.md):** `@furria/ui` owns the
  design system (tokens, primitives, shell, sheets, typography); `@furria/studio` owns the studio's
  domain components and builds them only from `@furria/ui` tokens and primitives, under the **same
  lint rules** (no raw MUI beyond layout, no design-bearing `sx`, no hex/px literals).
- **The studio never fetches.** The club app owns routes, auth, TanStack Query and the endpoints; it
  hands the studio the loaded studio data, media URLs and a **save port**. Media go through one media
  loader inside the studio, so offline caching can be added later without touching it.
- **Routes stay in the club app** — one login, one PWA, one install.

## Considered and rejected

- **A headless studio** (engine and models only, visuals in `@furria/ui`): the stage and the timeline
  are domain components; splitting them from their engine and touch layer keeps the five-renderer
  problem alive across two packages.
- **A separately deployed studio app:** members would switch between two installed apps for one act.
