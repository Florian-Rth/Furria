# CA-P2 — the mobile shell

Shape agreed with Florian on 2026-09-15 in a grilling session. The binding specification is
[`docs/design/mobile-shell/HANDOFF.md`](../../docs/design/mobile-shell/HANDOFF.md); every ruling
that amends it is in that folder's [`README.md`](../../docs/design/mobile-shell/README.md); the
architectural decision is [ADR-0009](../../docs/adr/0009-club-app-runs-on-one-declarative-mobile-shell.md).
Read all three before writing code. This file is only the order of work.

## The boundary of this phase

**This phase builds layout components. It does not rework pages.**

- Page bodies move into the content track as they are. They will look unpolished inside correct
  chrome, and that is the expected state at the end of the phase.
- The Übersicht stays deliberately empty. `/manage/roles` stays as it is.
- Two screens are nevertheless **new**, because the navigation is dead without them: the
  **Verein** hub and **Mehr**. Both are link lists. That is their final form until the area
  structure is worked out, not an interim version.
- The only page edits allowed are at call sites of primitives this phase deletes — a FAB, a
  sticky toolbar, a page header. Their job moves into a shell declaration; nothing else in the
  body is touched.
- Dialogs are **not** migrated to sheets or wizards here. That is page rework.
- **Three layers ship without a caller** — tool row, action bar and sheet — deliberately. They are
  layers, not features: leaving one out would reopen the scroll model, the bottom stacking order
  and the track's bottom padding during page rework. Selection mode, a *mode* rather than a layer,
  is left out on the opposite reasoning.

Anything beyond this boundary is CA-P3.

## Vertical slices

Each slice ends green on `pnpm lint && pnpm typecheck && pnpm test && pnpm build`, and from
slice 2 on, the app runs on the new shell so every slice can be opened and looked at.

### Slice 1 — tokens and the floating-card material

The one material all chrome is made of: rounded rectangle, gap to both screen edges, hairline
border, blurred translucent background, one soft shadow, and a density that runs from nearly
transparent to solid.

- Extend `kkTokens` with what the material needs and the existing set does not have: the rest and
  dense tint, the blur radius at each end, the rest and dense shadow, the hairline opacity at each
  end, the chrome gutter, the bar height, the navigation height, the thread thickness, and the
  scroll distance over which densification and handover run. Light **and** dark values — dark mode
  stays.
- `chrome-density.ts` — **pure**: scroll offset → the material's values at that offset. Unit
  tested, no DOM. This is the house idiom (`sheet-snap.ts`, `letter-index-cells.ts`,
  `scheme-paint.ts`).
- One internal `KkChrome` surface component consuming both.

Nothing is visible yet. The slice is proved by its unit tests.

> Existing values are reused wherever they exist — `radius.base`, `glass.blur`, `shadow.rest`,
> `chrome.light/dark`. §9.12 forbids introducing a value that is not a token, so every new value
> lands in `tokens.ts` and nowhere else. The ground stays `#F1F2F4`; the mocks' slightly warmer
> `#F5F4F2` is not adopted.

### Slice 2 — the shell, the bar, the content track, and the swap

The spine of the phase.

- `KkShell` — the single scroll container, the scroll position, the sticky bar block, the bottom
  padding that clears floating chrome, safe-area insets for the Capacitor wrapper, and
  `prefers-reduced-motion` collapsing animation to state changes.
- `use-track-scroll` — the only scroll listener in the app.
- `KkScreen` — the declaration. Typed by screen kind (`overview | list | detail | working |
  fullscreen`) so §6's table and §9's prohibitions are compile errors. Navigation is never passed;
  it follows from the kind.
- `KkShellBar` — 52 px, floating-card material, three modes (rest · search · back); selection mode is
  deliberately not built until a multi-select screen exists.
  Leading side: the brand lockup at rest, the screen title after handover, or a back affordance
  with the origin's name. Trailing side: at most two screen actions, at most one emphasised.
  **No notification slot, no account slot.** Search is always a bar action, never a tool-row
  field, so the tool row is free for filters and segmented switches.
- **The swap.** `_app.tsx` mounts `KkShell`; every route returns a `KkScreen` declaring its
  section, title and kind, with its existing body as children.
- **Full width, no breakpoint branching.** The phone shell renders at every viewport. `use-is-mobile`
  and the `desktop` breakpoint branching inside the shell and its call sites go; the `desktop`
  breakpoint itself stays in the theme for the website.
- **`KkModalFrame` must stack above the new chrome.** The dialogs survive this phase, so their
  z-index and backdrop are checked against the bar, the navigation and the notice slot in this
  slice — not discovered during page rework.

At the end of this slice the app runs on the new shell with the old `KkAppShell` still in the
package but uncalled.

### Slice 3 — navigation, the Verein hub, Mehr

- `KkShellNav` — the bottom bar, generic: a destination set passed in, 44 px minimum targets,
  thumb reach, safe-area aware. The active destination is marked by the **filled** icon variant.
- **The keyboard.** When the on-screen keyboard opens the navigation hides; an action bar rides
  above the keyboard. Driven by the visual viewport, owned by the shell, never by a screen.
- **`KkIcon` has no filled variants** — everything is Outlined except `home`. Each nav
  destination's icon gains a filled counterpart here.
- club-app declares `Übersicht · Verein · Mehr` — **provisional, see the README**.
- **Verein** (hub, overview kind): links to Mitglieder and Gruppen.
- **Mehr** (hub): Profil, the permission-gated Verwaltung screens, the five inert "kommt später"
  entries, Abmelden.
- `/members`, `/groups` and the `/manage/*` screens switch to back mode and lose the bottom
  navigation, per §4 mode 4.

`AppNav`, `AppNavGroup`, `use-nav-groups` and the curtain's footer are deleted here. The dynamic
*Meine Gruppen* entries lose their home; they are rehomed during page rework, not faked here.

### Slice 4 — the page header, tool row, thread

- The **page header** — every screen has one. The screen passes `title` (a string) and `header`
  (a node); the shell wraps the node, owns the fade and the drift, and **hands the title to the
  bar**. `@furria/ui` ships a standard header plus the parts custom headers compose from
  (eyebrow, leading visual, title, lead, meta row). Nothing in a header is tappable.
- `handover.ts` is pure and unit tested: scroll offset → header opacity and drift, and the
  cross-fade between the bar's brand lockup (or back affordance) and the title. §9.3 — the title
  is visible exactly once at every scroll position — is the thing to test hardest, in both scroll
  directions.
- `KkShellToolRow` — one row, sticking with the bar as one block. Never two rows.
- `KkShellThread` — 2.5 px inside the bar's bottom edge, no added height, not tappable, semantic
  status colours only.
- **`sessionAt` does not know when a Session ends** — it returns number, start year and label
  only. `CONTEXT.md` has a Session running 11.11. → Aschermittwoch, which is Easter-derived and
  movable, so the thread's caller needs a new **pure Aschermittwoch computation** and a session
  progress derived from it. Unit tested against known years; no DOM, no clock injection beyond the
  date passed in. The Übersicht is the one screen that declares a thread.

### Slice 5 — the sheet manager

- `KkSheet` — rises from the bottom over a dimmed backdrop: grab handle, title, scrolling body,
  optional pinned action row.
- A **global sheet manager**: provider at app root plus a `useSheet()` hook, guaranteeing exactly
  one open sheet.
- The open sheet is a **search param**, so the browser gesture and Capacitor's hardware back
  button close it instead of leaving the screen. Every sheet needs a stable id. Search mode does
  the same.
- Existing dialogs are **not** migrated here.

### Slice 6 — the notice manager, absorbing toasts

- `KkShellNotice` — floating above the navigation, same material as the bar but visually
  distinct, never ink-dark. Two sizes: a collapsed line, or an expanded card with up to two
  actions. Expansion is a tap.
- A **global notice manager**: provider plus `useNotice()`. Screens never declare notices.
- `KkToast` is deleted; `toast-queue.ts` moves into the manager, which enforces the two-slot
  budget — urgent on top, quiet system notice at the bottom — against a burst of self-resolving
  confirmations.
- Real callers from day one: connection loss and session expiry (ADR-0006), plus every existing
  toast call site.

### Slice 7 — the action bar, then the deletions

- `KkShellActionBar` — one primary action, optional secondary, optional context line. Replaces
  navigation; never coexists with it.
- Delete `KkAppShell` and its 25 internal files, `KkFab`, `KkStickyBar`, `KkStickyRail`,
  `KkPageHeader`, and club-app's `AppShell`, `AppPageHeader`, `AppBackLink`, `AppListLayout`,
  `AppListColumns`.
- **`AppStageGreeting` is not deleted** — the greeting is real data and becomes the Übersicht's
  page header.
- Rehome every call site: a FAB becomes a bar action, a sticky toolbar becomes the tool row, a
  page header becomes the screen's declaration.
- **Kept:** `KkSplitLayout` (login's chrome, not the lists'), `KkPanel` (49 callers — content
  material), `KkModalFrame` (until dialogs migrate), `KkBrandStage` (login).

### Slice 8 — close the phase

- Walk every route at phone width and confirm the acceptance checklist in §10 of the handoff,
  route by route.
- `pnpm shot` for every route. The axes stay phone/desktop × light/dark: dark mode survives, and
  desktop still renders — badly, on purpose.
- Update `docs/web/TESTING.md` if the shell changes how screens are tested.

## What this phase deliberately leaves open

- **The destination set.** `Übersicht · Verein · Mehr` is a placeholder. The real area structure
  — mobile-optimised, possibly per-user or customisable — is owed after the rebuild.
- **Desktop.** The app is knowingly bad on a laptop. Desktop variants are separate, later work.
- **Page rework.** Every body still carries CA-P1's layout. Dialogs are still dialogs, the
  Übersicht is still empty, *Meine Gruppen* has no home.

## Risks

- **The handover is the one genuinely hard behaviour.** Title visible exactly once, symmetric in
  both directions, instant under reduced motion. Keeping the maths in a pure module is what makes
  it testable; do not let it drift into a component.
- **One scroll container is a rule pages currently break.** `KkLetterIndex` scrolls horizontally
  on `xs` and `KkFilterChips` on `xs`; both need checking against §3.2's "no horizontal carousel
  that swallows vertical drag" before they are declared compliant.
- **`borderRadius` in `sx` is a multiplier of `theme.shape.borderRadius` (14), not pixels.**
  Pass an explicit `` `${kkTokens.radius.base}px` ``. This has bitten the shell work before.
- **`theme.applyStyles('dark', …)` keys off an ancestor**, so a component that sets `data-dark`
  on itself can never resolve it. Relevant the moment chrome tries to force an appearance.
