---
title: Tester-Changelog
slug: tester-changelog
type: foundation
status: shipped
mock: -
adrs: []
---

## What & Why

A changelog **for testers**, shown when someone comes through the preview gate. Testers keep
revisiting the same evolving site and have no way to tell what changed since last time — so they
re-test the wrong things, or miss new work entirely. This closes that loop: every branch/phase
appends one entry, and each tester sees exactly which entries are new **to them**.

**Tester scaffolding, not a product feature.** It exists only while the site is gated and is
**deleted at launch together with the gate** (P7). It is deliberately never shown to the public — a
carnival club's visitors do not want release notes.

## Scope / Slices

- A **JSON file** in the repo holding one entry per branch/phase, loaded at build time.
- A **modal**: left column (1/3) the entry list newest → oldest, each with a short name + icon and
  a **NEU** marker when unread; right column (2/3) the selected entry's description.
- **Auto-open** on a granted visit when the newest entry is unread, pre-selecting it.
- A **reopen trigger** — a discreet fixed pill carrying the unread count.
- **Per-entry read status in `localStorage`**, so "new" is per tester, not global.

### Frontend requirements

- New `features/changelog/` feature: the entry schema, the JSON import + validation, a
  `localStorage` module, a read-status hook, and one exported `TesterChangelog` component that owns
  **both** the trigger pill and the dialog (and therefore its own open state).
- Mounted **once** in `routes/_site.tsx`, guarded on `granted`. The route already calls
  `usePreviewAccess()`, so the route supplies the gate state and **no feature imports another**.
- New dependency **`@mui/icons-material`**, catalog-pinned to match `@mui/material` (`9.2.0`).
- Content file at `apps/website/src/content/changelog.json` — data, not code, so an agent can append
  to it without touching TypeScript.
- Light + dark, responsive phone → desktop, tokens only.

### Backend requirements

- **None.** The JSON is bundled at build time; read status is client-only.

## Decisions

### Ownership and mounting
- **Its own feature (`features/changelog`), not part of `features/preview-access`.** The gate owns
  *access*; this owns *change communication*. They are coupled only by the trigger condition, and
  that coupling is resolved at the route — which is what routes are for.
- `TesterChangelog` renders **both the trigger pill and the dialog** and owns its open state, so
  mounting it is a one-liner and it can be deleted in one move at launch. It has to be
  self-contained for a structural reason: `Masthead` and `SiteFooter` live in `src/components/`,
  which **may not import features**, so the trigger cannot live in either.
- Mounted in the `_site` **layout**, not the `/` route, so a granted tester who deep-links to
  `/club` still sees it.

### Content: a JSON file, validated
- **JSON, deliberately unlike the rest of the site's content** (news/event-list/groups are typed TS
  constants). The reason is the authoring workflow: entries are appended mechanically at the end of
  a branch, and a data file cannot be broken by a stray brace in the way a `.ts` module can.
- **The JSON is validated with Zod once at module load**, and the inferred type is the entry type
  (`z.infer`, never hand-written). This buys back the compile-time safety TS constants would have
  given: a malformed or half-written entry fails **loudly and immediately** instead of rendering
  broken UI. Consistent with the codebase's Zod-at-the-boundary posture.
- Entry fields: `id` (stable, the branch slug — also the localStorage key), `date`, `title` (the
  short name), `icon`, `description` (paragraph array). **Plain paragraphs only** — no inline
  formatting, so nothing needs parsing or sanitising.
- **Order is derived, never trusted:** entries are sorted by `date` descending at read time, so an
  entry appended in the wrong place in the file still lands correctly.

### Icons — MUI icons behind a closed allow-map
- **`@mui/icons-material` is installed** so entries can pick from a real icon set without hand-
  drawing SVGs. This is a **deliberate deviation** from design README §5 ("no icon font, no icon
  library"), scoped tightly: icons-material is used **only by this tester scaffolding**, never by
  public site UI, and it leaves the project at launch with the rest of the feature. The public
  pages keep hand-rolled SVGs.
- **A dynamic name lookup is not acceptable** — resolving an arbitrary string against the package
  pulls all ~2000 icons into the bundle. Instead a small **explicit allow-map** in the feature maps
  each permitted icon key to a **path default import** (`@mui/icons-material/AutoAwesome`), which
  tree-shakes and satisfies the "always default imports from MUI" rule.
- **Zod validates `icon` against the allow-map's keys**, so an entry can never name a missing icon.
  Adding a new icon is a deliberate one-line addition to the map — the JSON alone cannot widen it.

### Open + read semantics
- **Auto-open only when the newest entry is unread**, and pre-select that entry. This terminates by
  construction: selecting marks it read, so the next visit stays shut until a new entry ships.
- **Selecting an entry marks that entry read. Closing marks nothing.** Read status is therefore
  genuinely per-entry: older unseen entries keep their **NEU** marker and can be found via the pill,
  but they never force the modal open again. Rejected alternatives: *closing marks all read* (makes
  per-entry status decorative) and *open while any unread* (nags forever if one entry is skipped, so
  testers learn to dismiss reflexively).
- **`localStorage`**, not the gate's `sessionStorage` — read status must survive across sessions,
  which is the whole point. Stored as a list of read entry ids under a namespaced key.
- Storage access follows the shipped `preview-access/session-storage.ts` precedent: a tiny module of
  pure functions taking an injected `Storage`, so it is unit-testable without a browser. **Malformed
  or absent stored data degrades to "nothing read"** rather than throwing — a tester with a corrupt
  key must not get a broken site.
- **Nothing auto-opens when there are no entries at all.**

### Layout and a11y
- **MUI `Tabs` with `orientation="vertical"` + a tab panel**, not a hand-rolled list. This is a
  master/detail selection, which *is* a tablist — so MUI supplies roles, `aria-controls`/
  `aria-selected` wiring and arrow-key navigation for free, per the "use an existing MUI component
  before hand-rolling" rule.
- **One component tree, responsive** (the shipped P3 posture — no Desktop/Mobile forks): the
  dialog body is a `Stack` that is `row` at `md+` (tabs 1/3, panel 2/3) and `column` at `xs` (tabs
  full-width above the panel). `orientation` stays vertical at every size; only the container
  direction and widths change. The tab list gets a capped height with internal scroll so a long
  history never pushes the panel off screen on a phone.
- MUI `Dialog` (`maxWidth="md"`, `fullWidth`) reusing `PreviewAccessDialog`'s a11y idiom —
  `aria-labelledby`, tinted `slotProps.backdrop`, focus trap and Esc for free.
- The **trigger pill** is a real focusable button, fixed to a screen corner, with the unread count
  as a badge; it must not overlap the site footer's legal links or the 404's CTAs.
- Respect `prefers-reduced-motion` (the site already gates its motion).

### Sequencing with the gate
- The unlock dialog closes **before** the changelog opens — `granted` flipping true is what mounts
  it — so two dialogs never animate over each other. Worth verifying by hand, since the unlock flow
  also blurs the page behind it.

### Testing posture
- **Pure functions only**, per the standing rule: date-descending sort, unread derivation, the
  newest-is-unread predicate, read-id add, and storage read/write with an injected `Storage`
  (including the malformed-data path). No render-and-assert-the-fixture tests.

### As built (P4, 2026-07-26) — where the code differs from the plan above

- **`resolveJsonModule` was not needed.** TypeScript 7.0.2 with `moduleResolution: bundler` resolves
  and typechecks `import … from '@/content/changelog.json'` cleanly, so `apps/website/tsconfig.json` is
  unchanged (verified by removing/restoring the flag and comparing `tsc --noEmit`).
- **Six icon keys**, all in use: `palette`, `campaign`, `smartphone`, `home`, `groups`, `newspaper`,
  each a path default import typed as `Record<ChangelogIconKey, typeof SvgIcon>` so a missing or extra
  key is a compile error.
- **P1.1's entry id is `website-p1-1-mobile-hero`, not a branch slug.** P1.1 shipped on P1's branch, and
  ids double as localStorage read keys, so reusing the slug would have collided. A test asserts id
  uniqueness.
- **Existing route tests needed a seam.** Mounting an auto-opening MUI `Dialog` makes `ModalManager`
  mark the app root `aria-hidden`, so every granted-visit route test (index, `_gated`, 404, news slug)
  timed out looking for its heading. Added `src/test/changelog.ts` with `markChangelogSeen()`, called
  from `beforeEach`, so those tests exercise the page as a tester who has already seen the log. This
  required exporting `writeReadEntryIds` from the barrel (so the helper does not reach past `index.ts`);
  `useChangelogReadStatus` left the barrel, being internal to the dialog hook.
- **Tab activation is MUI's default manual mode** (arrows move focus, Enter/Space selects), *not*
  `selectionFollowsFocus`: selection marks an entry read, so automatic activation would silently mark
  every entry read while arrowing past it.
- **The trigger pill sits bottom-right with a `spacing(12)` (`xs`) / `spacing(8)` (`sm+`) bottom
  offset** — anything tighter overlaps the footer's legal links when scrolled to the bottom.
- **`changelog-copy.ts`** holds the German dialog/trigger strings; `buildTriggerLabel` composes the
  accessible name from them so it contains the visible label text (WCAG 2.5.3).
- **`aria-describedby`** was added alongside `aria-labelledby` (review catch — `PreviewAccessDialog`
  sets both).

## Open Questions

- **Who writes entries, and when** — the intended workflow is that the agent appends one entry at
  the end of a branch/phase on request. Worth a line in `CLAUDE.md` once the shape is proven, so it
  becomes routine rather than something to remember. *Still open after P4.*
- **Backfill** — *resolved in the P4 build:* the log **backfills P0–P3** (P0 shell & theme, P1 + P1.1
  landing hero, P2 landing complete, P3 Club) plus a P4 entry, so testers see the full history rather
  than a log that starts mid-project.

## Done When

- A tester unlocking the gate immediately sees the newest change, with older ones listed newest →
  oldest and unread ones marked.
- Selecting an entry shows its description and marks only that entry read; reloading does not
  reopen the modal; a new entry reopens it.
- The pill reopens the log at any time and shows the unread count.
- Read status survives a browser restart and degrades safely if the stored value is corrupt.
- A malformed `changelog.json` fails the build/tests loudly, and no entry can name a missing icon.
- Works phone → desktop, light + dark, tokens only.

## Implementation plan (phases)

Two slices, both frontend-only, appended to the P4 build after the news slices.

1. **Data + read state (no UI).** Add `@mui/icons-material` to the catalog + app; create
   `changelog.json` with the icon allow-map and Zod schema (parsed at module load); add the
   `localStorage` module and the read-status hook with the date sort, unread derivation and
   newest-is-unread predicate.
   *Delivers (FE):* validated entries and correct read state, fully unit-tested, nothing rendered.
   *Verify:* schema rejects a bad `icon`/missing field; sort is date-descending regardless of file
   order; unread/newest-unread logic covered; corrupt localStorage degrades to empty;
   `pnpm typecheck`/`test`/`lint` pass.
2. **Modal + trigger, mounted.** Build `TesterChangelog` (vertical `Tabs` + panel, responsive
   row/column, MUI `Dialog`, NEU markers, icons from the allow-map) plus the fixed trigger pill with
   its unread badge; mount it once in `routes/_site.tsx` behind `granted`.
   *Delivers (FE):* the changelog opens for testers on a granted visit and is reopenable.
   *Verify:* auto-opens when the newest is unread and not otherwise; selecting marks only that entry
   read; keyboard navigation + Esc work; both breakpoints and themes; no `features/changelog` ↔
   `features/preview-access` import in either direction; `pnpm build` passes.

## References

- Trigger state + launch coupling: [Preview-Gate](feature-preview-gate.md) (owns `granted`; its
  removal at launch removes this feature too — master plan **P7 — Launch**).
- Idioms reused: `PreviewAccessDialog` (MUI `Dialog` + tinted backdrop + a11y),
  `preview-access/session-storage.ts` (injected-`Storage` pure module), `ChipNavScroller`
  (scrollable overflow list).
