# Mobile UI Shell — Build Specification

> Designer's handoff, kept verbatim. **How we ruled on it is in [`README.md`](README.md) — read that
> first.** Where the two disagree, the README wins: it records deliberate amendments.

**Status: binding.** This document defines the app's base UI. It is not a suggestion and not a style inspiration. Any screen that does not fit these rules is a screen whose requirements need a decision, not a screen that gets its own chrome.

**Scope: structure only.** No domain, no content, no routes, no product logic. Every screen in the product is assembled from the layers defined here.

**Reference mocks** (`FCC App - Mobile Shell.html`, `FCC App - Mobile Leiste.html`) show this system rendered. Their content is dummy material with no requirements behind it. **Only the structure and behaviour are binding — never copy their content, their example pages, or their code.** Code in this document is skeletal, for disambiguation only; implement it properly in the project's own stack.

There is **no dark mode**. One light appearance, everywhere, including full-screen and live views.

---

## 1. Principle

Mobile first. One shell, assembled once, used by every screen.

A screen does not build a header. It **declares which layers it needs**, and the shell renders them. This is the whole idea: chrome is a shared, fixed cost of one row at the top and one bar at the bottom, and everything else on the display belongs to content.

Three consequences, all binding:

- A screen may not introduce a header, toolbar, title block, or floating control of its own invention.
- Chrome never scales with content. A screen with a lot to say gets a longer content track, not a taller header.
- If two screens need the same thing, it becomes a layer or a slot in the shell — not a local component copied twice.

---

## 2. Material

Chrome is made of exactly one material: a **floating card**.

- A rounded rectangle that sits *above* the content track, with a gap to the screen edges on both sides.
- A hairline border, a blurred translucent background, and one soft shadow.
- It **densifies on scroll**: as the content track scrolls away from the top, the background becomes more opaque and the shadow deepens, over a short distance. At rest it is nearly transparent; over scrolled content it is a solid object.

Two rules keep this readable:

1. **Chrome material ≠ content material.** Content surfaces (cards, rows, sheets) use the project's content surface treatment. Chrome uses the floating-card treatment. They must not converge — a user must always be able to tell what is page and what is frame.
2. **One emphatic surface per screen.** If the project's design language has a loud, high-contrast surface treatment, at most one element per screen may use it, and it is never chrome.

All colours, radii, shadows, type sizes, and spacing come from the **project's existing token set**. Do not introduce a value that is not already a token. If a needed value does not exist, it is a token decision, not a local override.

---

## 3. The seven layers

Three are mandatory, four are optional. Nothing else exists.

| # | Layer | Status | Position |
|---|-------|--------|----------|
| 1 | Bar | **mandatory** | top, sticky |
| 2 | Content track | **mandatory** | fills remaining space, scrolls |
| 3 | Navigation | **mandatory** on top-level screens | bottom, in thumb reach |
| 4 | Opener | optional | top of the content track, scrolls away |
| 5 | Tool row | optional | sticks under the bar |
| 6 | Notice | optional | floats above the navigation |
| 7 | Action bar / Sheet | optional | bottom, replacing navigation / above everything |

### 3.1 Bar — mandatory

One row, roughly 52 px tall, sticky at the top, made of the floating-card material.

**Purpose:** say where the user is, and offer the actions that belong to *this* screen.

**Contains:** on the leading side, the location — a section label, or the screen title, or a back affordance. On the trailing side, at most **two** actions, of which at most **one** is visually emphasised.

**Must not contain:** anything that is not about the current screen. No global status, no notifications feed, no live state, no upload progress, no connectivity banner. That is layer 6.

**Never collapses away.** It may densify, it may hand its label over to a title, it may change mode — it does not disappear on scroll.

### 3.2 Content track — mandatory

The scrolling region. It owns the vertical axis: **there is exactly one scroll container per screen.**

- No nested scroll areas, no `height: 100%` + `overflow` panes inside content, no independently scrolling columns, no horizontal carousels that swallow vertical drag.
- The track scrolls *under* the bar and *behind* the navigation, which is why chrome is translucent and densifies.
- Bottom padding must clear whatever floats above it (navigation, notice, action bar). Content is never hidden underneath chrome.

### 3.3 Navigation — mandatory on top-level screens

A bottom bar of a small, fixed set of destinations (four plus an overflow entry is the working shape), in thumb reach, with a clear active marker drawn from the brand.

- The destination set is **global and constant**. It never changes per screen, and never re-orders.
- Screens that are *inside* a destination (details, working views) **replace** navigation with a back affordance in the bar, and optionally an action bar (3.7).
- Never show navigation and an action bar at the same time.

### 3.4 Opener — optional

A one-time greeting block at the very top of the content track: an optional eyebrow, a large display title, and an optional lead sentence.

**Behaviour, binding:** the opener **scrolls away and hands its title to the bar.** As it leaves, it fades and drifts; the bar's leading side cross-fades from the section label to the title. The result is that the title exists exactly once at any moment.

- **Never show the opener's title and the bar's title simultaneously.** That is the single most common way to break this system.
- Screens whose content should start immediately omit the opener. Then the bar carries the title from the start.
- The opener is a greeting, not a header: it holds no controls, no tabs, no stats, no actions.

### 3.5 Tool row — optional

One row, directly under the bar, sticking with it so that bar + tool row read as **one** block of chrome.

**Purpose:** narrow the set the screen is showing — search, filter, or a segmented switch.

**Binding rules:**

- **Always exactly one row.** If the tools do not fit in one row, they belong in a sheet (3.8) opened from the row, not in a second row.
- **One entry point per function per screen.** If the tool row carries a search field, the bar carries no search action. If search lives in the bar as an action, the tool row carries something else (e.g. a segmented switch) or nothing. Never both.
- The trailing side of the bar is then free for what narrowing cannot do: the **order** of the set, and **creating** a new item.

### 3.6 Notice — optional

A floating element **above** the navigation, in the same floating-card material but visually distinct from the bar.

**Purpose:** everything that is happening *right now* and does **not** belong to the current screen — a running process, an upload, a lost connection, something live elsewhere in the app.

**Binding rules:**

- A notice **never** lives in the bar. The bar speaks only about the current screen; this is the reason the split exists.
- **At most two stacked**, ever. The urgent one on top, the quiet system one at the bottom.
- Two sizes only: a single collapsed line, or an expanded card with rows and up to two actions. Expansion is a tap on the line.
- A notice is dismissible or self-resolving. It is not a permanent shelf.

### 3.7 Action bar — optional

A bottom block for a screen that has **exactly one obligatory deed**. One primary action, optionally one secondary next to it, and optionally one line of context above them.

- Replaces navigation; never coexists with it.
- One primary action per screen. If a screen seems to need two, it needs a decision, not two buttons.
- Screens with no obligatory deed do not get an action bar.

### 3.8 Sheet — optional

A panel rising from the bottom over a dimmed backdrop, with a grab handle, a title, scrolling body, and an optional action row pinned at its foot.

**Purpose:** short information or a short decision **without leaving the screen**.

- Use it for previews, quick detail, pickers, confirmations, and overflowing tool options.
- Do not use it as a second page: if the user needs to navigate onward from inside it, it should have been a screen.
- One sheet at a time. Sheets do not stack.

---

## 4. The bar in detail — rules, not pixels

**Leading side, one of:**

- section label → hands over to screen title on scroll (screens with an opener),
- screen title from the start (screens without an opener),
- back affordance, optionally with the name of the origin, plus the title.

**Trailing side:** at most two actions. Icon-only, or one short label-chip. At most one emphasised. Actions are about this screen: create, order, edit, share. Never global, never status.

**Four modes**, same bar, no second bar ever appears:

1. **Rest** — location and actions, as above.
2. **Search** — the bar *becomes* the input: field plus a cancel affordance. The tool row hides while searching.
3. **Selection** — the bar inverts: cancel, a count of what is selected, and the one bulk action.
4. **Back** — inside a destination: back affordance replaces the section label; navigation is gone from the bottom.

Mode changes are transitions of one element, not the appearance of a new element.

---

## 5. The thread — optional, defined by the screen

A thin line (≈2.5 px) along the bottom edge of the bar.

**It has no fixed meaning.** It is a slot the screen may fill with **one** quantity or state that is worth watching while the user works. What it measures, how it is divided, and whether it moves is entirely the screen's business — progress through a sequence, position in a set, a share of something complete versus outstanding, a countdown, a filled capacity. Different screens will use it for entirely different things, and that is intended.

**Binding constraints:**

- **Most screens have nothing to measure and therefore show no thread.** Absence is the default; the thread is earned, not decorative.
- **At most one per screen.** Never two lines, never a segmented stack of meters.
- **Feedback only.** It is not tappable and carries no action. If the number behind it needs explaining, the explanation is a tap on a *labelled* element in the bar or a sheet — not on the line.
- It never becomes a second row: it lives *inside* the bar's bottom edge and adds no height.
- It uses the project's semantic status colours and nothing else. A thread whose colour does not mean anything should be neutral.

---

## 6. Screen types — which layers, structurally

No content, no examples. Only which layers a type may declare.

| Layer | Overview | List | Detail | Working view | Full-screen |
|---|---|---|---|---|---|
| Bar | yes | yes | yes, back mode | yes, back mode | yes, minimal |
| Content track | yes | yes | yes | yes | yes |
| Opener | yes | optional | no — leading visual instead | optional | no |
| Tool row | no | yes | no | optional | no |
| Navigation | yes | yes | **no** | **no** | **no** |
| Notice | optional | optional | optional | optional | no |
| Action bar | no | no | optional | **yes** | optional |
| Sheet | optional | optional | optional | optional | optional |
| Thread | optional | optional | optional | optional | optional |

Notes that are binding, not advisory:

- **Overview** is the only type that may carry brand identity in the bar and opener. Nowhere else.
- **List** is the only type with a tool row.
- **Detail** may open with a leading visual that the bar floats over. It has no opener.
- **Working view** always has exactly one obligatory deed, hence the action bar.
- **Full-screen** strips to bar plus content: no navigation, no notice. It is for a single sustained task or display.

A screen that wants a combination this table forbids is a requirements question. Escalate it; do not improvise chrome.

---

## 7. Behaviour

- **Handover.** Over a short scroll distance near the top: the opener fades and drifts up, the bar's section label fades out and the title fades in from below. One title at a time. Reversible, symmetric on scroll up.
- **Densification.** Over the same distance, the chrome material goes from nearly transparent to opaque, and its shadow deepens. Bar and tool row densify together as one block.
- **Sticking.** Bar and tool row stick as a unit. Nothing else in the content track sticks — no sticky section headers, no sticky sub-navigation.
- **Rise.** Sheets and expanded notices enter from below with a short spring; backdrops fade. Nothing slides in from the side except whole-screen navigation.
- **Motion budget.** Chrome transitions are short (well under half a second) and never bounce. Reserve spring and delay for elements a user just tapped.
- Respect reduced-motion: handover and densification become instant state changes, not animations.

---

## 8. Implementation shape

Minimal, for disambiguation only — build it idiomatically in the project stack.

```
Shell(
  // declaration, not markup:
  head:    'opener' | 'bar' | 'visual'
  nav:     true | false
  actions: [ ...max 2 ]
  tools?:  <one row>
  notice?: <max 2 stacked>
  action?: <one obligatory deed>
  sheet?:  <one at a time>
  thread?: { value, tone, ... }   // screen-defined, usually absent
  children: <content track>
)
```

One shell component owns: the single scroll container, the scroll position, the handover, the densification, the sticky block, and the bottom padding that clears floating chrome. **Screens receive the scroll state; they do not read or manage it.**

Screens are therefore declarations plus content. A screen file that contains a scroll listener, a sticky header, a `position: fixed` element, or its own back button is wrong.

---

## 9. Prohibitions

1. No second bar, ever — not for search, not for selection, not for filters.
2. No two search entry points on one screen.
3. No title visible twice (opener and bar simultaneously).
4. No status, live state, or notifications in the bar.
5. No more than two stacked notices.
6. No more than two actions in the bar; no more than one emphasised.
7. No more than one primary action on a screen.
8. No nested scroll containers; no `height: 100%` + `overflow` inside content.
9. No two-row tool row.
10. No sticky element other than the bar + tool row block.
11. No dark appearance anywhere.
12. No colour, radius, shadow, or type size outside the project token set.
13. No screen-local chrome invention of any kind.

## 10. Acceptance checklist

A screen is done when all of these are true:

- [ ] It declares layers; it renders no chrome of its own.
- [ ] Exactly one scroll container, and nothing is hidden under floating chrome at either end.
- [ ] Top chrome is one row (plus, at most, one tool row); bottom chrome is one bar.
- [ ] The title is visible exactly once at every scroll position, and handover is smooth in both directions.
- [ ] Each function has exactly one entry point on the screen.
- [ ] The bar's trailing side holds at most two actions, at most one emphasised, all about this screen.
- [ ] Navigation and action bar never appear together.
- [ ] Any notice sits above the navigation, is dismissible or self-resolving, and there are at most two.
- [ ] A thread is present only if this screen genuinely has one thing worth watching — and it is not tappable.
- [ ] Every tap target is at least 44 px.
- [ ] All values trace back to project tokens.
- [ ] Reduced-motion collapses chrome animation to state changes.
