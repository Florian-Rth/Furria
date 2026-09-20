---
status: shaped 2026-09-18, all eight slices implemented 2026-09-18
phase: CA-P3, packages C and A
shaped_with: Florian, grilling session 2026-09-18
binding: docs/adr/0010, docs/adr/0011, CONTEXT.md (Session, Aushang, Kalendereintrag, Berechtigung)
---

# CA-P3 — the panel kit and the Session

Two packages, shaped together because the Verein hub (package D, next phase) needs both and
neither is useful alone. **Neither package ships an endpoint**: nothing reads a Session until D
and nothing writes one until *Verein verwalten* (G). That is the rule, not a reduction —
see `.claude/skills/backend-work/SKILL.md`.

## What was ruled on 2026-09-18

The decisions that bind this work. Full reasoning in the floor plan's "Settled" section and
ADR-0011.

1. **A panel is a Panel.** `KkPanelSection` is the component. `KkBandSection` is the *website's*
   full-bleed marketing band and is unrelated — it has no club-app caller and is not touched.
2. **Hubs elide, records state.** An empty panel does not render on a hub; on a detail page it
   shows a `KkEmptyState`, exactly as ~30 call sites do today. Elision is the hub's job, not a
   `whenEmpty` prop on the panel.
3. **A hub is one query.** One request per hub, so the hub knows its shape before it paints.
4. **Payload shape follows viewer variance.** The Verein hub is identical for every viewer, so it
   is a typed `ClubHubSummary` and caches as one entry. Start varies, so it is a server-shaped
   list. (Both are package D and F; recorded here because they decide what A's data is for.)
5. **Every gate is `has(key)`** — ADR-0011. Nothing is gated on "is Mitglied" at a call site.
6. **The Session Nº is evidence, not arithmetic.** One record per season the club knows
   something about; every field but the year optional; nothing inferred from a neighbour.
7. **The app must work with no data at all.** Every degradation step is listed under package A.
8. **Only English identifiers.** German belongs in UI copy, never in a type, field or symbol.
9. **A hub's loading state**: the opener renders instantly (it is date-derived), the panel area
   shows three generic placeholders. Ruled here, **built in D** — no hub exists to use it yet.
10. **No media store.** SVG is markup, not a binary asset. The store gets designed when the first
    real binary asset needs it, and its plan starts from photo consent, GDPR erasure and the
    deployment target — three questions nobody has answered.

---

## The slices

Eight slices, run **one at a time**. Each is a complete, shippable step that leaves both stacks
green — no slice depends on a later one to compile or to make sense.

**Gates run once, at the end of a slice** — never between its steps.

```bash
cd web    && pnpm lint && pnpm typecheck && pnpm test && pnpm build
cd server && dotnet csharpier format . && dotnet build && dotnet test
```

`dotnet test` needs Docker running (Testcontainers). Screenshot proof is
`pnpm shot <route>` and needs a dev server plus the API.

| # | Slice | Stack | Touches | Depends on |
|---|---|---|---|---|
| **C1** | `KkPanelStack` and its token | `@furria/ui` | 2 new files, `tokens.ts`, `index.ts` | — |
| **C2** | Adopt it at all 19 call sites | club-app | 13 files | C1 |
| **C3** | Collapse the two stragglers onto `KkPanelSection` | club-app | 4 files, 1 deleted | C2 |
| **A1** | Delete the server's Nº arithmetic | server | 2 files | — |
| **A2** | Delete the club-app's Nº arithmetic | club-app | 5 files | — |
| **A3** | Remove the wrong public Session stat | website | 4 files | — |
| **A4** | The `Session` entity and its migration | server | 4 new files, 1 migration | A1 |
| **A5** | The SVG sanitiser | server | 2 new files | — |

All eight are in: C1 `9dd16f2`, C2 `fd5f44a`, C3 `8b7d956`, A1 `0beccef` + `531b72d`,
A2 `c4863f5` + `1f5a0f8`, A3 `1f5a0f8`, A4 `9484492`, A5 `860fe91`.

C and A are independent; C1→C2→C3 and A1→A4 are the only hard chains. A2 and A3 may run in any
order. **A3 is not blocked** by the open founding-year question — it removes the computed Nº and
leaves `FOUNDING_YEAR` alone.

---

### C1 — `KkPanelStack` and its token

**Goal.** Give the panel rhythm a name so `3.5` stops being a magic number.

- `web/packages/ui/src/tokens.ts` — add the panel-stack gap beside the other rhythm values.
- `web/packages/ui/src/KkPanelStack.tsx` — new. Children plus optional `sx`. It owns the vertical
  gap and `minWidth: 0`, and nothing else: it knows nothing about elision, data or hubs.
- `web/packages/ui/src/index.ts` — export it.

**Done when** the web gate is green. No call site changes yet, so nothing renders differently.

### C2 — adopt `KkPanelStack` at all 19 call sites

**Goal.** One rhythm, one definition.

Replace every `<Stack sx={{ gap: 3.5, minWidth: 0 }}>` in the club-app:

`manage-groups/GroupOverridePanel`, `manage-groups/GroupOverrideSkeleton`,
`group-hub/HubSkeleton`, `groups/GroupSkeleton`, `more/MoreBody`, `profile/ProfilePanels` (×2),
`profile/ProfileSkeleton` (×2), `manage-persons/PersonEditView` (×2),
`manage-persons/PersonEditSkeleton`, and the remainder the grep reports — all 19.

Occurrences nested inside a `Grid` column keep their `Grid`; only the inner `Stack` changes.
Drop the now-unused `Stack` imports.

**Done when** the web gate is green **and** `pnpm shot /profile`, `pnpm shot /more`,
`pnpm shot /members` are visually identical to before. No visual change is intended; a diff is a
bug in this slice.

### C3 — collapse the two stragglers onto `KkPanelSection`

**Goal.** One panel component, not three.

- Delete `profile/components/ProfilePanel.tsx`; its call sites in `ProfilePanels` use
  `KkPanelSection` directly.
- `more/components/MoreSectionPanel.tsx` keeps its file — it owns the "no sections, no panel"
  elision and the row mapping — but composes `KkPanelSection` instead of re-implementing
  `KkPanelHeader` + `KkPanel`.

**Done when** the web gate is green and `pnpm shot /profile`, `pnpm shot /more` are unchanged.

### A1 — delete the server's Nº arithmetic

**Goal.** Stop shipping a formula that cannot be right.

- `Furria.Core/Club/ClubSession.cs` — delete `FoundingYear` and `NumberOf`. Keep `YearOf`,
  `OpeningMonth`, `OpeningDay` and `LabelOf`: those are date arithmetic and correct.
- `server/tests/Furria.Api.Tests/Club/ClubSessionTests.cs` — delete the two `NumberOf` assertions,
  including `NumberOf(2026) == 56`, which pins a wrong answer.

`NumberOf` has no production caller, so nothing else moves.

**Done when** the server gate is green.

### A2 — delete the club-app's Nº arithmetic

**Goal.** Same, on the app side; the login screen stops naming a number it cannot know.

- `lib/club.ts` — remove `FOUNDING_YEAR` and `number` from `Session`/`sessionAt`. `startYear`,
  `yearsLabel`, `sessionProgressAt` and `ashWednesdayOf` stay.
- `lib/club.test.ts` — delete "counts the founding session 1971/72 as number one".
- `features/login/stage-meta.ts` — the meta line becomes `SESSION 2026/27`; drop the
  `formatSessionNumber` import.
- Its test, if it asserts the Nº.
- `lib/membership-labels.ts` — **keep** `formatSessionNumber`; A4's records will use it.

**Done when** the web gate is green and `pnpm shot /login` shows the session line without a Nº.

### A3 — remove the wrong public Session stat

**Goal.** The live website currently prints an `N. Session` stat computed as `year − 1971 + 1`.
Take it down.

- `features/club/story-content.ts` — drop the `sessionNumber` parameter and the `Session` stat
  from `buildStoryStats`.
- `features/club/components/ClubStory/internal/logic/use-story-stats.ts` — stop passing it.
- `features/club/story-content.test.ts` — update the expectations.
- `lib/club.ts` — remove `number` from the website's own `sessionAt` and the founding-session
  test, mirroring A2.

**Keep `FOUNDING_YEAR`** in the website: "EST. 1971", "feiert seit 1971" and "gegründet" are brand
copy, not a computation. Its correctness is the open question below, not this slice's business.

**Done when** the web gate is green and `pnpm shot /club` shows the stat row with three stats.

### A4 — the `Session` entity and its migration

**Goal.** Somewhere for the club to write down what it knows.

- `Furria.Core/Club/Session.cs` — `StartYear`, `Number?`, `Motto?`, `ArtworkSvg?`, plus the
  `ITimestamped` members the other entities carry.
- `Furria.Infrastructure/Persistence/Configurations/SessionConfiguration.cs` — `StartYear` unique;
  `Number` unique where not null; check constraint `number > 0`; sensible max lengths on `Motto`
  and `ArtworkSvg`.
- Register on `AppDbContext`; `dotnet ef migrations add Sessions`.
- Integration tests for the constraints, per `docs/server/TESTING.md`.

No `ClubSettings` and no founding-year column: the founding year is the earliest record's year.

**Done when** the server gate is green with Docker up.

### A5 — the SVG sanitiser

**Goal.** Make artwork safe to store before anything can store it.

- `Furria.Core/Club/SvgSanitizer.cs` — a pure function, no DbContext, no DI. Strips `<script>`,
  event-handler attributes (`on*`) and external references.
- Unit tests covering each of those, plus a benign SVG passing through unchanged.

It is called on write, which lands in G. A ships the function and its tests.

**Done when** the server gate is green.

---

## Deliberately not in this phase

- **Any endpoint.** D adds the read, G adds the write.
- **Panel identity for pinning and search.** Nothing resolves an id until E and F.
- **A `KkHub` container.** `KkScreen kind="overview"` is it; a wrapper with one caller would be an
  abstraction guessed rather than extracted.
- **The hub skeleton.** Ruled (opener instantly, three generic placeholders), built in D where it
  has a caller.
- **A media store**, an upload path, a `MediaAsset` table.
- **`wasHeld` / why a season is missing.** An absent record means both "we have no record" and "no
  Session happened". Nothing cares yet; the club timeline will, and can add a nullable field then.
- **The Session span server-side.** `ashWednesdayOf` stays client-only until a server caller exists.

---

## Open — needs Florian

- **Is 1971 the founding year?** It is in the public masthead ("GROSSFURRA · EST. 1971"), the
  footer, a hero stat and the Chronik. Florian wrote "founded 1974 (or whatever)" on 2026-09-18,
  so it is not certain, and it is on the public site today. Blocks nothing in this phase.
