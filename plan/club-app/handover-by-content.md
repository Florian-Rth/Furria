# Handover by content

The four handover stages leave the lab. Every screen's header → bar handover plays the
stage that fits its content. The assignment is fixed, never random.

## 0. English names

The stages are renamed while they move. This covers identifiers, folders and files.

| Lab name | New name | Motion |
|---|---|---|
| Fallblatt | `splitFlap` | Letters flip like a departure board |
| Konfetti-Dock | `confetti` | Title flies in and lands with confetti |
| Tusch | `fanfare` | Title lands like a stamp, the bar pulses three times |
| Schunkeln | `sway` | Letters sway arm in arm into the bar |

## 1. The screen declares a scalar, the shell resolves it

- `KkScreen` gets `handover?: KkHandoverName` with
  `KkHandoverName = 'splitFlap' | 'confetti' | 'fanfare' | 'sway'`. The value is a
  scalar and no longer a component object.
- `@furria/ui` resolves the name to its stage internally, through a module-level
  `HANDOVER_STAGES` record, so the stage object is always the same stable reference.
- `KkHandoverStage`, `KkHandoverSwapProps`, `KkHandoverHeaderProps` and the four
  `*Stage` exports leave the public surface. The app can no longer inject components
  into the chrome (this follows the "shell owns the chrome, screens declare" rule).
- If a screen has no `handover`, it gets the plain fade (today's `KkShellBarSwap` /
  `KkShellHeader`). That covers screens without a header and forms.
- The stages move from `KkShell/lab/*` to
  `KkShell/handover/{split-flap,confetti,fanfare,sway}`, keeping the compound-kit
  split they already have. `HANDOVER_STAGES` lives next to them in
  `handover/handover-stages.ts`. The confetti reduced-motion fallback reuses
  `KkShellBarSwap` instead of keeping its own copy.

### Banner screens

A banner header (the club hub's motto stage, the group hub) has no headline to fly into
the bar. Every stage still plays on it:

- `confetti`: the geometry's headline is optional. Without one, the title fades into the
  bar and still lands with squash, glow and burst.
- `sway`: the bar title's own letters step in one by one, linked arm in arm, and swing
  when they dock (`arrivalPoseAt`, the mirror of how the old bar text leaves).
- `fanfare` already stamps without a headline. `splitFlap` flips inside the bar.

## 2. The app owns the content → stage table

- `app-sections.ts` gets one `AREA_HANDOVERS` record keyed by content area. It is the
  only place where the mapping lives.
- Every screen in an area reads from it: list, detail and edit screens alike (for
  example the members list and member detail both use `AREA_HANDOVERS.members`). The
  motion always tells you where you are.

| Area | Stage | Why |
|---|---|---|
| Overview, Club | `confetti` | Home and club stage, the festive front door |
| Calendar | `splitFlap` | Departure board = dates and times |
| Members, Groups, Profile | `sway` | People linked arm in arm |
| Announcements, Manage, More | `fanfare` | Official stamp = notices, records, admin |

## 3. Scrolling renders nothing

Today `useTrackScroll` keeps the scroll position in React state inside `KkShell`, and
the shell context carries `density` and `handover` as plain numbers. As a result,
**every scroll frame re-renders `KkShell` and all 11 `useKkShell()` consumers**, including
`KkScreen`, which re-portals the whole bar. The stages already avoid this by using
motion values.

End state:

- `KkShell` owns one `scrollY` motion value (from motion's `useScroll`) and puts it into
  its own stable context (`KkShellScrollContext`). Reduced motion is applied once, there.
- `density` and `handover` leave `KkShellState`. Their readers derive them with
  `useTransform` from `handoverAt` / `chromeDensityAt`. The pure functions stay and
  stay tested.
- `KkShellHeader` and `KkShellBarSwap` bind motion values through `motion.*` `style`.
- The glass material is pure CSS. `KkChrome` paints every value as
  `calc(rest + span * var(--kk-chrome-density, 0))` (colors through `color-mix`), so
  the light and dark rules stay in CSS. The chrome host sets `--kk-chrome-density` from
  a motion value, and the bar and tool row inherit it. The nav and notice cards pin it
  with `density={1}`.
- The stages read the shell's `scrollY` instead of each calling `useScroll()`: one
  source and one reduced-motion rule.
- `useTrackScroll` and `useKkShellHandover` are deleted.
- `KkShellState` then changes only on navigation, host mounts or a keyboard inset
  change.

## 4. The lab bank goes

The handover lab (four routes, `HandoverLabPage`, `HANDOVER_LABS`, the lab hub bank) is
deleted, because the stages now live on real screens. That leaves the lab hub empty, so
it goes too, along with its entry in Manage.

## Out of scope

User-facing copy stays German, because that is the product's language.

## Checks

- `pnpm lint`, `pnpm typecheck`, `pnpm test`.
- React DevTools "highlight updates" while scrolling Members: nothing highlights.
- `pnpm shot` on one screen per stage (phone/desktop × light/dark).

## Result

Commits counted through the React DevTools hook while scrolling 400px on a phone viewport:

| Page | Before | After |
|---|---|---|
| Members (`sway`) | 50 | 1 |
| Calendar (`splitFlap`) | 50 | 0 |
| Announcements (`fanfare`) | 50 | 1 |
| Overview (`confetti`) | 50 | 2 |

The commits that remain are one-off stage measurements, not per-frame renders. In light
mode, the bar and tool-row glass is pixel-identical to before at rest and mid-scroll.
Dark mode matches within ±2–10 channel values (`color-mix` rounding).
