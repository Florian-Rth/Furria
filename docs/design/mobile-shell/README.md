# Handoff: FURRIA Club-App — Mobile UI Shell

The Club-App's base UI, redesigned in Claude Design and handed over as a binding build
specification. It replaces the CA-P0/CA-P1 shell (dark stage + floating pill + curtain menu +
desktop rail). The designer's text is kept verbatim in [`HANDOFF.md`](HANDOFF.md); this file
records **how we ruled on it** during the grilling session on 2026-09-15.

> **Read `docs/design/README.md` → "READ FIRST" first.** The design *language* is binding;
> layouts, flows, features and copy are inspiration, not spec. This handoff is the exception
> that proves the rule: it deliberately contains **no** layouts, flows, features or copy — only
> structure — which is why it is binding almost in full.

## What the handoff contains

Ten things, no more: a shell, a screen declaration, and the eight visible layers (bar, content
track, navigation, opener, tool row, notice, action bar, sheet) plus the thread. `screenshots/`
holds the eight reference frames as delivered. **The mock HTML files
(`FCC App - Mobile Shell.html`, `FCC App - Mobile Leiste.html`) were never handed over** — only
the screenshots exist. Their content is dummy material: `Anna Brunner`, `Große Garde`,
`Beitrag offen · 30,00 €`, `Du bist in 12 Minuten dran`, `TAG 42 VON 118` are sample data and
several of them name features the platform cannot build yet.

## The idea we took

**A screen declares, the shell renders.** Chrome is a fixed cost of one row at the top and one
bar at the bottom; everything else on the display belongs to content. No screen builds a header,
a toolbar, a title block or a floating control ever again.

## Rulings

### Scope — this step builds layout components only

Ruled 2026-09-15. **The pages are not reworked in this step.** The shell and its layers are
generic and domain-free; existing page bodies move into the content track as they are and look
unpolished inside correct chrome. The Übersicht stays deliberately empty and
`/manage/roles` stays as it is. Page rework is the next step.

The one exception is chrome that pages currently build themselves — a FAB, a sticky toolbar, a
page header. Those primitives are deleted, so their call sites are rehomed into shell
declarations in the same step. That is not page rework; it is removing the thing the shell
replaces.

### Phone-first, and desktop is knowingly ugly

Ruled 2026-09-15. The Club-App renders the phone shell at **full width** on every viewport.
No rail, no split view, no second information architecture, no `use-is-mobile` branching. The
desktop variants are a later piece of work, deliberately deferred — **the app will look bad on a
laptop until then, and that is accepted, not a defect.**

### Dark mode stays; light and dark are never mixed

The handoff's "there is no dark mode" is **rejected as written**. Dark mode follows the OS in
both apps and keeps doing so. The rule that survives is the 2026-09-08 one: *in light
appearance no dark surfaces, in dark appearance no light ones.*

The consequence for §2's "one emphatic surface per screen": **ink-dark is a control treatment,
never a surface.** The mocks' dark notice card is not reproduced; a notice distinguishes itself
from the bar by tone, border and shadow within the floating-card material. This continues the
existing ruling that "the menu pill stays dark ink + cream in both modes — it is a button, not a
surface".

### Navigation: three destinations, and the set is a placeholder

`Übersicht · Verein · Mehr`. **Explicitly provisional.** Once the rebuild is done, the area
structure gets worked out properly — mobile-optimised, and possibly per-user: different entries
by usage, or customisable. Recorded as an open decision, not as a design.

Today's seven-entry nav (three live, a dynamic *Meine Gruppen* group, a permission-gated
*Verwaltung* group and five inert "kommt später" entries) collapses into it:

| Today | Goes to |
|---|---|
| Übersicht | Destination 1 |
| Mitglieder, Gruppen | Screens inside **Verein** |
| Meine Gruppen (dynamic) | Not a destination — rehomed when the pages are reworked |
| Verwaltung (Personen, Gruppen, Rollen) | Screens behind **Mehr** |
| The five "kommt später" entries | Behind **Mehr**, still inert |

**Verein is a hub screen**, not a list. Mitglieder and Gruppen are *rarely* used — the assumption
that they are the app's most-used screens was wrong — so two taps is the right cost. They open in
back mode without the bottom navigation, per §4 mode 4.

**Mehr is a screen, not a sheet**, because §3.8 forbids navigating onward from inside a sheet.

`SPIELPLAN` from the mock is **not used as a label**: `CONTEXT.md`'s open *Gruppentermin* entry
rules that no copy calls anything a Spielplan. When that destination becomes real it is
**Veranstaltungen**, and the set becomes `Übersicht · Veranstaltungen · Verein · Mehr` — the
mock's exact shape, with no reshuffle.

### The opener is the page header, and every screen has one

**Deliberate amendment to §6 and §3.4.** The table gives Detail "no opener — leading visual
instead" and Full-screen no opener at all; §3.4 calls the opener "a greeting, not a header — no
controls, no tabs, no stats, no actions". Ruled 2026-09-15: the opener **is** the page header, it
is what tells the member where they are, and **every screen has one**.

**The contract is `title` plus a node.** A screen declares `title` as a string — the bar needs it
for the handover anyway — and `header` as any node. **The shell wraps that node and owns the fade
and the drift**, so a custom header is ordinary JSX that knows nothing about scroll, and §8's
"screens receive the scroll state; they do not read or manage it" holds by construction. The
corollary: a header fades as one block, and cannot move its visual and its title at different
rates.

`@furria/ui` ships a standard header plus the parts custom headers are built from — eyebrow,
leading visual, title, lead, meta row — so a bespoke header (the Profil page's identity header is
the first) still composes from system pieces, as ADR-0007 requires. Nothing in a header is ever
tappable.

§9.3 still binds, and it binds hardest here: **the title is visible exactly once at every scroll
position.** On a screen in back mode the bar's leading side carries the back affordance and, at
rest, the name of the origin — never the screen's own title while the header still shows it. The
title fades into the bar only as the header leaves. The mock frame showing "‹ Anna Brunner" in the
bar *above* a large "Anna Brunner" header is unscrolled, and reproducing it would break the
system's central rule.

### The bar leads with the brand lockup at rest

Ruled 2026-09-15, amending §6's "Overview is the only type that may carry brand identity".
Wherever the bar is **not** in back mode, its leading side carries the brand lockup (broom +
FURRIA) at rest and hands that place over to the screen's title as the opener leaves. In back
mode the back affordance holds the same place, with the name of the origin at rest.

### Search is always a bar action

Ruled 2026-09-15. A magnifier on the bar's trailing side turns the bar into the input with a
cancel affordance, and the tool row hides while searching — §4 mode 2 as written. **No screen
puts a search field in its tool row**, which keeps §3.5's "one entry point per function" true by
construction and frees the tool row for filters and segmented switches. The mocks' visible search
field is deliberately not reproduced.

### The navigation's active marker is the filled icon

Ruled 2026-09-15. The active destination is marked by the **filled** variant of its icon, not by
the small red square the mocks draw above it. The inactive state is the outlined variant.

### The bar ships three modes, not four

Ruled 2026-09-15. Rest, search and back are built; **selection mode (§4 mode 3) is not**, because
nothing in the app is multi-select and every mode must ship with a caller. The mode is a state on
the bar, so the fourth is a contained addition in whatever phase introduces a multi-select screen.

The back affordance's origin label is **declared by the screen**, never derived from history — a
deep link has no history to derive from.

When the on-screen keyboard opens, the **navigation hides** and an action bar rides above the
keyboard.

### The bar carries screen actions only

At most two, at most one emphasised, all about this screen. There is **no notification slot and
no account slot** in the shell: the account lives behind Mehr, and the product has no
notifications, so the mock's bell could never show an honest dot. On the Übersicht — the only
type that may carry brand identity — the brand lockup may lead and the trailing side may
optionally carry screen actions.

### A notice may be about the current screen

**Deliberate amendment to §3.6.** `KkToast` is deleted and toasts are absorbed into the notice
layer: a toast becomes a self-resolving notice. Its queue (`toast-queue.ts`) moves into the
notice manager, which enforces the two-slot budget against a burst of confirmations.

**Notices are raised globally, never declared by a screen** — a provider at app root plus a
`useNotice()` hook, so connection loss, session expiry and later background work can raise one
from anywhere. §8's `notice` slot on the shell declaration is deliberately not built.

### Sheets are URL-driven and centrally managed

An open sheet and an active search are search params, so the browser gesture and Capacitor's
hardware back button close the sheet or leave search instead of abandoning the screen. A global
**sheet manager** (provider + `useSheet()` hook) guarantees exactly one open sheet.

### Dialogs become sheets or wizards

Today's six dialogs split: pickers and confirmations become **sheets**; anything more complex
(creating a Gruppe, editing a Person) becomes a **wizard** — a sequence of working views, bar in
back mode, no navigation, one action bar, and the **thread** showing progress through the
sequence, which is a use §5 names explicitly. A wizard is **one route with the step in a search
param**, so back steps backwards through the wizard rather than out of it. Executed with the page
rework, not in this step.

### Forbidden combinations must not compile

A screen declares its type (`overview | list | detail | working | fullscreen`) and the type
decides which layers it may pass. §6's table and §9's thirteen prohibitions are TypeScript
errors, not review findings. Navigation is never passed — it follows from the type. A screen that
genuinely needs a forbidden combination cannot hack it in; it escalates, which is what §6
demands.

### Layers are built even without a caller; modes are not

Ruled 2026-09-15, resolving a tension with REFACTOR-PLAN's "everything in the repo has a caller".
All eight layers are built in this phase even though the tool row, the action bar and the sheet
have no caller until the pages are reworked. They are **layers**: leaving one out means the scroll
model, the bottom stacking order and the track's bottom padding get reopened later, which is when
they are hardest to change.

Selection mode is different in kind — a **mode** of a component that already exists, addable
without touching layout — and is therefore left out until a multi-select screen exists.

### Notice and thread ship with real callers

No layer is built speculatively. The notice is fed by connection loss and session expiry — state
the app already tracks under ADR-0006 — plus the absorbed toasts. The thread is fed by the
Session's progress from `sessionAt`, the one quantity the app can compute honestly today.

### Login is out of scope

Login sits outside `_app`, has no bar, no navigation and no content track, and nothing in the
handoff describes it. It keeps `KkBrandStage` and `KkSplitLayout` — which, contrary to first
appearances, is **login's** chrome and not the lists'. It is revisited only if it starts to look
foreign beside the new chrome.

## Contradictions that must not reach the codebase

| Mock | Ruling |
|---|---|
| `Anna Brunner`, `Große Garde`, `Showtanz` | Sample data. The app shows the signed-in member or nothing |
| `SPIELPLAN` | Banned word — see `CONTEXT.md` → Gruppentermin. The label is **Veranstaltungen** |
| `Ehrenmitglied · Archiv` chip | Ehrenmitgliedschaft was removed from CA-P1; nothing confers or displays it |
| `kein Mitglied` chip | The club has no word for non-member Gruppen people — open in `CONTEXT.md` |
| `Beitrag offen · 30,00 €` | Needs B9. No fee surface exists |
| `Läuft gerade · Du bist in 12 Minuten dran` | Needs B13 (Live-Regie). No live state exists |
| Bell with a red dot | No notification system. A dot could never be honest |
| `TAG 42 VON 118` | The idea is kept — the thread carries the Session's progress from `sessionAt` |
| Dark notice card in light appearance | Rejected — ink is a control treatment, never a surface |
