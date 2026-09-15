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
  and the track's bottom padding during page rework. Selection mode, a _mode_ rather than a layer,
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

**Done.** `kkTokens.shell` carries the metrics (`gutter`, `barHeight`, `navHeight`,
`threadHeight`, `scrollTravel`) and `kkTokens.shell.material` the two ends of the material —
blur, shadow offset, shadow blur, a shadow ink per scheme, and per-scheme `rest`/`dense`
opacities for tint, hairline and shadow. The tint rides on `color.*.bg`, the hairline on
`color.*.ink`, so no colour is duplicated. `internal/chrome-density.ts` splits into
`chromeDensityAt(scrollOffset)` → clamped 0…1 and `chromeMaterialAt(density)` → every value at
that density, both schemes in one object; the split exists because the navigation and the notice
float over content permanently and pass `1` rather than a faked scroll offset.
`internal/KkChrome.tsx` takes `density`, `component` and `sx` and owns no spacing, so the gutter
and the heights come from the caller.

> Existing values are reused wherever they exist — `radius.base`, `glass.blur`, `shadow.rest`,
> `chrome.light/dark`. §9.12 forbids introducing a value that is not a token, so every new value
> lands in `tokens.ts` and nowhere else. The ground stays `#F1F2F4`; the mocks' slightly warmer
> `#F5F4F2` is not adopted.

### Slice 2 — the shell, the bar, the content track, and the swap

The spine of the phase.

Eight rulings taken while building it, each amending the text below:

- **The document is the scroll container.** `KkShell` owns the scroll _position_, not a scroll
  element: chrome is `position: fixed` and the track carries padding computed from the tokens.
  An inner scroller would have bought nothing and broken `use-letter-position`,
  `scrollElementIntoView` and every `scrollIntoView` in the package, all of which already read
  the document. §3.2's "exactly one scroll container" stays true — it is the document.
- **Back mode follows from `origin`, not from `kind`.** A screen that declares where "up" goes is
  inside a destination (§3.3) and its bar is in back mode; a screen without one is a destination
  root. That is what lets `/members` be a `list` _and_ sit inside Verein in slice 3, which §6's
  table alone cannot express.
- **`section` moves to slice 3.** It has no consumer until the navigation exists, and it is then
  needed on exactly three routes — the Übersicht plus the two screens slice 3 creates.
- **Search mode moves to slice 5.** Its mechanism is a search param, and slice 5 is where that
  plumbing lands. Building the mode on local state first and rewriting it there is precisely the
  interim version `CLAUDE.md` forbids. The bar ships rest and back; search is the third mode and
  arrives with its URL.
- **The `header` contract ships here, its behaviour in slice 4.** A screen declares `title` plus a
  `header` node from this slice on, and the shell renders the node at the top of the track. Slice
  4 adds the fade, the drift, the handover and `@furria/ui`'s standard header parts. The
  alternative — deleting eleven page headers now and restoring them in slice 4 — is churn, and it
  would leave the app with no titles for two slices. §9.3 holds at rest from here: with a header
  declared the bar's leading side stays on the brand lockup (or the back affordance), and the
  title lives in the header alone.
- **The declaration lives in each route's top component**, not in the thin route file: a detail
  screen's title is data (`MemberPage` knows the member's name, the route does not). The
  `*Page` component loses its `AppPageHeader` portal and gains the declaration — the call-site
  rehoming the phase boundary allows.
- **Reduced motion snaps densification** rather than animating it: `chromeDensityAt` takes a
  motion argument and returns 0 or 1 under `prefers-reduced-motion`. That is the one consumer
  §7's reduced-motion rule has in this slice.
- **`AppShell` survives this slice** as the club-app's wiring — `KkToastProvider`, `KkShell` and
  the router `Link` injected once for the back affordance and, later, the navigation. It dies in
  slice 7, once slice 6 has rehomed the toasts. `useIsMobile` also survives: login's
  `KkSplitLayout` still uses it, so only the shell and its call sites lose their branching.

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

**Done.** `KkShell` sits in `packages/ui/src/KkShell/` with `KkScreen` beside it — two public
faces of one system, everything else under `internal/`. The root owns the scroll position
(`use-track-scroll`, one rAF-coalesced window listener), resolves it through `chromeDensityAt`
against `prefers-reduced-motion`, and publishes `{ density, link }` on one context; the router's
`Link` is injected once so the package stays router-agnostic. `KkShellChrome` is the fixed top
block at `theme.zIndex.appBar` (1100), which puts `KkModalFrame` (MUI `modal`, 1300) and its
backdrop above it, and `KkToast` (MUI `snackbar`, 1400) above that — checked, not assumed.
`KkShellTrack` is the `main` landmark and carries the chrome clearance and the safe-area insets;
`index.html` gained `viewport-fit=cover`, without which those insets are always zero.
`KkShellBar` reads the density off the context, so a scroll frame re-renders the bar and nothing
else — the content track is a stable element and React bails out of it.

The bar's leading side is one component with three returns: back affordance, title, or brand
lockup. The trailing side types §9.6 — `KkScreenActions` is a union of five tuples, so a third
action and a second emphasised one are both compile errors.

Eleven screens declare themselves. `AppPageHeader`, `page-header-context`, `use-section-title`
and `AppBackLink` were deleted here rather than in slice 7: slice 2 removed their last caller, and
leaving them would have been dead code. `RequireAffiliation` is the one guard that declares a
screen of its own, because on denial it replaces the whole `_affiliated` outlet and no page
declaration is left to carry the bar; `RequirePermission` sits inside a page that has already
declared one, so it stays a plain body.

### Slice 3 — navigation, the Verein hub, Mehr

Inherited from slice 2: `section` lands on the three destination roots, `origin` on `/members`,
`/groups`, `/profile` and the `/manage/*` screens, and `KkShellTrack`'s bottom clearance grows
from one gutter to clear the navigation. `AppUserLink` and `AppSignOutButton` are uncalled until
Mehr gives them a home.

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
_Meine Gruppen_ entries lose their home; they are rehomed during page rework, not faked here.

**Done.** The destination set is **injected into `KkShell` once** (`destinations`) rather than read
from a route table, so the package stays router-agnostic; a screen declares `section` and the nav
resolves the active destination from it. That makes §6's navigation column a compile error:
`section` is **required** on `overview`, and `list` splits into a root variant (`section`, no
`origin`) and a nested one (`origin`, no `section`), while `detail`, `working` and `fullscreen`
carry `section?: never`. Verein and Mehr are both `overview` screens — the two hubs behave alike,
and §6 already reserves brand identity for that type.

`KkShellNav` sits in `internal/ui/` beside a `KkShellFoot` positioner that mirrors `KkShellChrome`
at the bottom edge; both float permanently and pass density `1`. The active destination is the
**filled** icon in red ink with a `text.primary` label, the inactive one outlined and secondary —
the mock's red square above the icon is not reproduced. `KkIcon` gained `club`/`clubFilled` and
`more`/`moreFilled`; the Übersicht's filled counterpart is the `home` it already had.

**The keyboard is the shell's business.** `internal/logic/keyboard-inset.ts` is pure — viewport
metrics → open or not, unit tested — and `use-keyboard-open` feeds it the visual viewport and
publishes the answer on the shell context, where `KkShellNav` reads it and renders nothing. No
screen touches it.

`KkHubRow` is the one new content primitive: icon, label, optional description, optional hint
chip, link **or inert**. Both hubs are a `KkPanel` of them, so the five "kommt später" entries need
no second component. Mehr groups them under `KkPanelHeader`s — Profil, Verwaltung, Kommt später —
with the permission filter now a pure `toPermittedSections`, which is what survives of
`buildNavGroups` and its test.

`AppUserLink` had to leave `KkAppShell.Identity`: that part reads the curtain context and throws
outside `KkAppShell`. It is a `KkPersonRow` now, and `AppSignOutButton` a labelled button rather
than a bare icon — both are call sites the phase boundary allows, and both are the end state.

`/my-groups/$groupId` deliberately gets **no** origin. It is reachable from a Gruppe's detail and
from Profil, so a single declared origin would be a lie; it keeps the brand lockup and no back
affordance until page rework rehomes it.

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

**Done.** `internal/logic/handover.ts` is the second pure module: scroll offset → header opacity
and drift, bar rest opacity, bar title opacity and rise. It runs on the **same `scrollTravel` as
densification** (§7 says the same distance), so the shell measures nothing and the header needs no
ref. One constant splits that travel: the header fades and drifts over the first share, the bar
title fades in and rises over the rest, and because both sides read the same constant, §9.3 is an
**invariant rather than a hope** — `headerOpacity × titleOpacity` is 0 at every offset, and
`restOpacity + titleOpacity` is always 1, so the bar's leading side always shows exactly one whole
element. Symmetry is tested as monotonicity: the header only ever falls and the title only ever
rises, so scrolling up runs the same numbers backwards. Reduced motion snaps, as with density.

The shell publishes `handover` beside `density` on its context. `KkShellHeader` applies the fade
and the drift and is `pointer-events: none` — nothing in a header is tappable, so an invisible one
can never swallow a tap. `KkShellBarSwap` stacks the rest element and the title in one grid cell
and cross-fades them, which is what makes back mode honest: the leading side carries the origin's
name at rest and the screen's title after handover, with the back chevron sitting outside the swap
and never moving.

`KkScreenHeader` is the kit and `KkTitleHeader` the standard header — title plus optional lead,
which is what seven screens needed. The kit ships only the parts that did not exist yet: the row
root, the leading-visual slot, the text column, the meta row and the title. Eyebrow, lead and meta
text stay `KkEyebrow`, `KkLead` and `KkMeta`; wrapping them again would have duplicated the system
rather than composed from it. Chips now sit in the meta row **below** the title instead of wrapping
beside it — at phone width the old inline row broke badly. `KkPageHeader` was deleted here, its
last caller gone. `KkAppShell.PageTitle`, `PageLead` and `Greeting` are uncalled now but stay:
`KkAppShellNavItem` still imports a type from `PageTitle`, and the whole compound dies in slice 7
anyway. `AppStageGreeting` is composed from the parts too, so every one of the eleven headers is
now system material.

`KkShellToolRow` is its own chrome card inside `KkShellChrome`, one `chromeGap` under the bar, so
the two stick and densify as one block without the thread ending up between them. `KkShellTrack`
lost its `sx` and takes `headClearance` and `footClearance` numbers instead, because the head
clearance now depends on whether a tool row is declared. §6's tool-row column is a compile error:
`tools` is a node on `list` and `working` and `never` everywhere else, which is why
`KkNestableScreen<TKind>` split into one interface per kind.

`KkShellThread` sits absolutely inside the bar card, inset by `radius.base` so it clears the
rounded corners, and adds no height. It is a `progressbar` with the screen's label, never tappable.
Its tone is `Exclude<KkTone, 'ink'>` — ink is a control treatment, never a surface, so it cannot be
a status.

`ashWednesdayOf` (Gregorian Easter minus 46 days) and `sessionProgressAt` live in `lib/club.ts`
beside `sessionAt`, tested against the known Aschermittwoche 2024–2038. **`sessionProgressAt`
returns `null` between Aschermittwoch and the next Eröffnung**: `sessionAt` still names that
Session for membership maths, but nothing is running, and a thread pinned at full for eight months
would be decoration. `toSessionThread` turns that into a declaration or into nothing, so the
Übersicht simply has no thread in the summer — §5's "absence is the default", as data.

### Slice 5 — the sheet manager

- `KkSheet` — rises from the bottom over a dimmed backdrop: grab handle, title, scrolling body,
  optional pinned action row.
- A **global sheet manager**: provider at app root plus a `useSheet()` hook, guaranteeing exactly
  one open sheet.
- The open sheet is a **search param**, so the browser gesture and Capacitor's hardware back
  button close it instead of leaving the screen. Every sheet needs a stable id. Search mode does
  the same.
- Existing dialogs are **not** migrated here.

**Done.** Scope ruled with Florian on 2026-09-15: **search mode ships here with its callers.** The
sheet is a _layer_ and may land callerless, but search is a _mode_, and the phase's own rule is
that a mode ships with a caller — so the five lists that already had a search field declare it and
their toolbars lose it. The alternative, holding search until slice 7's tool-row rehoming, would
have shipped the URL mechanism with nothing exercising it.

**Both mechanisms are one search param each, declared once on `_app`.** `sheet` and `q` are shell
state, so they sit in `_app`'s `validateSearch` and every screen beneath inherits them; no list
needed a schema of its own. The package stays router-agnostic the way it does for `link` and
`destinations`: `KkSheetProvider` takes `openSheetId` plus an open and a close callback, and
club-app's `useSheetManager` binds them to the param. **One param holds one id, so "exactly one
open sheet" is the URL's guarantee**, not a runtime check.

`KkSheet` is built on MUI's `Dialog` — the same machine `KkModalFrame` uses, and the reason the
sheet gets focus trapping, Escape and `aria-labelledby` for free — anchored to the bottom edge
with a `Slide`-up transition (`KkSheetRise`, because v9 types the transition slot's props without
`direction`). Parts are `Body` (the scrolling region) and `Actions` (the row pinned at the foot);
the root mounts the grab handle and the title. **The handle closes on tap and is not draggable.**
Drag-to-dismiss is an addition to one component that changes no contract — the same reasoning that
left selection mode out — and the sheet already closes four ways: handle, backdrop, Escape and the
back gesture.

**Search mode is `q`'s presence, not a second flag.** No `q` is rest mode; `q` present — empty
string included — is search mode, so opening search is one navigation and the browser gesture
closes it. Typing **replaces** the entry while opening and cancelling **push**, so back leaves
search in one step instead of walking backwards through the query letter by letter. The bar
_becomes_ the input (§9.1: no second bar), the tool row hides while searching (§4 mode 2) and the
track's head clearance follows it, and the magnifier is rendered as an ordinary bar action, which
is what the README means by "search is always a bar action".

§9.2 is now true by construction: `MembersToolbar` and its four siblings are filter chips and
nothing else, and the query they filter by comes from the URL through `useSearchQuery` rather than
`useState`. §9.6 is a compile error again — a screen that declares `search` may carry **one**
further action, and `overview`, `detail` and `fullscreen` cannot declare search at all. All four
forbidden combinations were checked against `tsc`, not assumed.

`internal/safe-area.ts` moved out of `KkShell/internal/` into the package's shared internals,
because the sheet's foot needs the same inset. One repair on the way through: slice 1's
`chromeMaterialAt` test compared interpolated opacities with `toEqual`, which floating point
breaks at density 1; it compares each value with `toBeCloseTo` now.

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
  Übersicht is still empty, _Meine Gruppen_ has no home.

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
