# `@furria/ui` owns every visible component, enforced by lint

Three apps — public website, Club-App, Event-App — share one Corporate Identity, and the design
handoff's first non-negotiable convention is "compose the system, don't extend it: no new
colors, fonts, radii, shadows." Decided 2026-09-04, shaping
[CA-P0](../../plan/club-app/p0-shell-and-session.md), because the Club-App is the first app
dense enough for UI drift to actually happen.

## The decision

**App code renders Furria components, not MUI components.** `@furria/ui` exports our own
vocabulary (`Kk*`) — some parts substantial, some a thin well-styled MUI component. A component
that is *only* a styled MUI component still belongs in the lib under a Furria name; what it must
never be is an export named after the MUI component it wraps. MUI remains the implementation
inside the lib, so the `/frontend-work` rule "use an existing MUI component before hand-rolling
with `Box` + `sx`" still applies — one level down.

**The boundary is machine-enforced, not reviewed.** In `web/biome.json`:

- `noRestrictedImports` bans every `@mui/material/*` import in app code except `Stack`, `Grid`
  and `Box`. Those three carry no Furria pixels — they express layout, not identity — and the
  existing rules that mandate them keep working unchanged.
- A Grit plugin bans design-bearing `sx` keys (`color`, `backgroundColor`, `font*`,
  `borderRadius`, `boxShadow`, `border*`) and raw hex or px literals. Layout `sx` stays free.

`theme.components.Mui*` keys are unaffected: those are MUI's configuration API, not exported
components.

## Why enforcement rather than convention

The failure mode this prevents is not a bad component — it is twelve pages that each styled a
text field slightly differently, discovered a year later when nobody can tell which one is
correct. Review does not catch that: each individual `sx={{ borderRadius: 12 }}` looks
reasonable in its own pull request, and drift is only visible in aggregate. Import bans and `sx`
restrictions turn "we agreed to share components" into a build failure, which is the only form
of agreement that survives a deadline.

The structural effect is the point: a page that needs a styled thing *cannot* inline it, so the
thing must exist in `@furria/ui`, so every page that needs it gets the same one.

## Consequences

- **Every new visible component costs a change to a shared package**, reviewed against consumers
  that may not exist yet. This is the deliberate trade: friction at the point of creation buys
  the absence of drift everywhere else.
- **Some `Kk*` components will be thin wrappers** that add a name and a few defaults. That is
  acceptable — the name is what makes the next page reuse it instead of restyling MUI.
- **The rules are scoped to `apps/club-app/**` first.** The shipped website predates this
  decision and is not retrofitted as part of CA-P0; widening the scope is a later, separate
  piece of work.
- **`@furria/ui` grows past its marketing origins.** It currently holds the website's vocabulary
  (`KkHeroSection`, `KkConfettiRain`, `KkTicker`). It becomes the platform's component library,
  and the Club-App's data-dense parts live beside them.
