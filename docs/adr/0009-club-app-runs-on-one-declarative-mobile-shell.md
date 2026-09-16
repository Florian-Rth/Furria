# The Club-App runs on one declarative mobile shell

The Club-App shipped CA-P1 on a responsive shell that deliberately had **no app bar**: a dark
stage carrying each page's own header, a floating pill that named the section and opened a
curtain menu, and a permanent left rail above 900 px. A redesign handed over on 2026-09-15
([`docs/design/mobile-shell/`](../design/mobile-shell/README.md)) replaces all of it with a
mobile-first system in which **a screen declares which layers it needs and one shell renders
them**. Decided 2026-09-15 while shaping CA-P2.

## The decision

**One shell owns the vertical axis.** Mounted once above the router outlet, it owns the single
scroll container, the scroll position, the handover from opener to bar, the densification of the
chrome material, the sticky bar + tool-row block, and the bottom padding that clears floating
chrome. A screen file that contains a scroll listener, a sticky header, a `position: fixed`
element or its own back button is wrong by construction.

**Ten components exist, and nothing else.** Shell, screen declaration, bar, content track,
navigation, opener, tool row, notice, action bar, sheet — plus the thread inside the bar's bottom
edge. `KkAppShell`, `KkFab`, `KkStickyBar`, `KkStickyRail`, `KkPageHeader` and `KkToast` are
deleted; their jobs become declarations.

**Forbidden combinations do not compile.** A screen declares its type (overview, list, detail,
working view, full-screen) and the type decides which layers it may pass. The handoff's layer
table and its thirteen prohibitions are TypeScript errors rather than review findings — the same
reasoning as ADR-0007: an agreement that is not machine-enforced is not an agreement.

**The Club-App is a phone app.** It renders the phone shell at full width on every viewport.
The rail, the split view and the per-breakpoint information architecture are deleted, and the
app is knowingly bad on a laptop until desktop variants are designed as separate work.

## Why this reverses "no app bar"

The CA-P0/CA-P1 shell argued that a top bar would repeat the title and repeat the menu, and that
the vertical space belonged to content. That was correct for a shell whose menu was a full-screen
curtain and whose title was a portal from each page. It stops being correct once navigation is a
permanent bottom bar: the title has nowhere else to live, "up" has nowhere else to live, and each
page building its own header is precisely the drift the handoff exists to stop. The bar is not
extra chrome — it is the chrome that the curtain, the pill and eleven page headers add up to,
paid once.

## Considered and rejected

- **Keeping the desktop layout behind the 900 px breakpoint** until a desktop spec exists. It
  would mean two shells and every screen built twice — the interim version `CLAUDE.md` forbids.
- **Building the components first and swapping the app onto them at the end.** Nothing would
  exercise the shell until the riskiest slice, so scroll, handover and stacking bugs would all
  surface at once. The shell is swapped in early instead and every later slice lands in a
  running app.
- **Flat optional props with development warnings** instead of typed screen types. Violations
  reach the browser, and warnings get ignored.

## Consequences

- **Removing dark mode was rejected**, though the handoff calls it binding. Dark mode follows the
  OS in both apps; the surviving rule is that light and dark surfaces are never mixed, which
  makes ink-dark a control treatment and never a surface.
- **The bottom navigation's destination set is an acknowledged placeholder**
  (`Übersicht · Verein · Mehr`). A properly shaped, possibly per-user or customisable area
  structure is owed after the rebuild.
- **Toasts cease to exist as a separate mechanism.** They are absorbed into the notice layer,
  which required amending the handoff's rule that a notice is never about the current screen.
- **Sheets and search live in the URL** so that the browser gesture and Capacitor's hardware back
  button dismiss chrome instead of abandoning the screen. Every sheet therefore needs a stable id.
- **`@furria/ui` carries a shell that only the Club-App uses.** The website keeps `PageLayout` and
  its own site shell; no convergence is attempted.
