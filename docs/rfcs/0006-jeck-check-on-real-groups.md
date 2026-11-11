---
rfc: 0006
title: Jeck-Check on real groups — shared statement pool, group stances, club review
status: done
github_issue: 73
branch: feat/rfc-73-jeck-check
created: 2026-11-11
---

# RFC 0006: Jeck-Check on real groups — shared statement pool, group stances, club review

## Summary
The website's **Jeck-Check** stops running on a hard-coded seed. It runs on the app's real
**groups** and one club-wide pool of at most ten approved **statements**. Group admins propose
statements and maintain their group's **stances** and **admission ages** on the group's own
Jeck-Check page. Whoever holds the new `group_matcher.manage` permission approves, rewords, orders
and rejects statements. A group takes part automatically once it has answered every approved
statement. Decisions: [ADR-0039](../adr/0039-the-jeck-check-is-one-shared-pool-of-statements.md);
terms: `CONTEXT.md` → *Jeck-Check*, *Statement*, *Stance*, *Admission ages*.

## Motivation
`web/apps/website/src/lib/seed/group-matcher.ts` holds ten joke statements and six placeholder
groups that do not exist in the app, so the Jeck-Check is held back from launch (`plan/launch.md`:
"without real questions the Jeck-Check is absent at launch"). The groups know best what they
stand for, so they must maintain their own part, but the result only works when every group
answers the same statements (voting-advice model). The scoring, ranking, reasons and result UI on
the website already work and stay as they are; only their data source changes.

## Proposal

### Domain (rules from the grilling, 2026-11-11)
- **Statement pool.** A statement is *proposed* (by a group admin, for their group), *approved* or
  *rejected* (no reason). At most **10 approved**, ordered by the club. Rewording an approved
  statement keeps all stances and marks it **changed** for every group until that group touches
  its stance again. Deleting a statement deletes its stances. The proposing group can withdraw a
  proposal that is still open.
- **Stance.** Per (group, approved statement): `yes | neutral | no` + importance `1 | 2 | 3`.
- **Admission ages.** Fixed code-side bands `under-12, 12-13, 14-15, 16-17, 18-plus` (labels
  as on the website today). Each group ticks any subset; none ticked = never knocked out.
- **Taking part.** Automatic: a group is in once it has answered every approved statement, and is
  stamped as taking part from then on. A statement approved later never pushes it out. Archived
  groups drop out but keep their stances and stamp. The website's section and route stay out while
  fewer than **2** groups take part or no statement is approved.
- **To-dos.** For group admins: one per group with unanswered or changed approved statements
  (all non-archived groups, taking part or not). For `group_matcher.manage` holders: proposals
  waiting.
- **Seed carry-over.** A data migration inserts the ten seeded statements as approved, in seed
  order, with no stances. The seed stances are dropped.

### Backend
- Tables (names indicative): `group_matcher_statement` (text, status, sort order, proposing group,
  timestamps, `reworded_at`), `group_matcher_stance` (group, statement, stance, importance,
  `seen_at` for the changed flag), `group_admission_age_band` (group, band), plus a nullable
  `group.group_matcher_joined_at`. Each table is mapped in `ChangedTables` and gets
  `NotifyChangesOf` ([ADR-0037](../adr/0037-clients-learn-about-other-accounts-changes-through-a-live-change-feed.md)),
  with a new `group-matcher` domain change in the club app's `DOMAIN_CHANGES`.
- Permission `group_matcher.manage` (`FurriaPermissions`, role editor, club-app `PERMISSION_KEYS`).
- Group endpoints (group admins + `groups.manage`, same gate as the group profile):
  `GET /groups/{id}/group-matcher` (approved statements with the group's stance + open/new/changed
  state, admission ages, the group's own proposals, taking-part state);
  `PUT …/stances/{statementId}`; `PUT …/admission-ages`; `POST …/proposals`;
  `DELETE …/proposals/{statementId}` (open ones only). The group hub read gains a Jeck-Check
  status (`taking part` / `n open` / `not taking part`) for the settings row.
- Management endpoints (`group_matcher.manage`): list pool + proposals + coverage grid; approve
  (refused at 10); reject; reword; reorder; delete.
- Public `GET /public/group-matcher`: taking-part, non-archived groups (same DTO shape as public
  groups), approved statements in order with each group's stance, the age question with each
  group's admission ages. It returns *absent* when fewer than 2 groups or no statements, so the
  website can leave the section and route out.

### Club app
- **Group page** `/groups/$groupId/group-matcher`, reached by a "Jeck-Check" `KkHubRow` with a
  status in `HubSettingsPanel` (admins only). One dense list: *Aufnahmealter* chips; *Aussagen*
  rows with a segmented Ja/Neutral/Nein control and an importance control
  (nebensächlich · wichtig · besonders wichtig), autosaved per tap, with open/new/changed rows
  sorted first and marked; *Vorschlagen* field plus the group's proposals with their state
  (offen / abgelehnt; approved ones simply appear in the list).
- **Management** under *Verein verwalten → Jeck-Check* (`group_matcher.manage`) as a pro hub:
  proposal queue (approve / reword-and-approve / reject), approved pool with drag order and an
  `n / 10` counter, coverage grid group × statement (answered / open / changed, taking-part
  column). Child routes for panes, never query-param panes.
- Both to-do kinds on Start.

### Website
- `features/group-matcher/api.ts` reads `/api/public/group-matcher` through the public resource
  layer instead of the seed. `lib/seed/group-matcher.ts` and its seed groups go. Absent response →
  no section, no nav entry, no page head/sitemap entry for the Jeck-Check.
- Intro counts the real questions (statements + age): at exactly 11 it keeps "Elf Fragen —
  weniger wären im Karneval unpassend."; otherwise "<Zahl> Fragen." without the carnival line.
- Scoring, reasons and result views stay; only group ids become numeric API ids.

## Phases
Each phase leaves the system intact (builds, tests pass, no half-done migrations) and fits a
~120k-token session.

### Phase 1 — Backend: model, group side, public read
Goal: statements, stances, admission ages and taking part exist with the seed carried over; groups
can maintain their part; the public read serves the website shape.
- [x] 1.1 Entities + EF config + migration (incl. seed-statement data migration, `joined_at`), `ChangedTables` + triggers
- [x] 1.2 `group_matcher.manage` permission key
- [x] 1.3 Group endpoints: read page, put stance, put admission ages, propose, withdraw proposal (taking-part stamp on completion, changed flag cleared on stance touch)
- [x] 1.4 Jeck-Check status on the group hub read
- [x] 1.5 `GET /public/group-matcher` incl. the absent rule (<2 groups / no statements, archived out)
- [x] 1.6 Integration tests for the business rules (taking part never revoked by a new approval, archived drop-out, absent rule, gate)

Built 2026-11-11. As built: the changed flag compares `group_matcher_statement.reworded_at` with
`group_matcher_stance.taken_at` (set on every stance write; no separate `seen_at`); admission ages
live in `group_admission_age`. A statement is *new* for a group when it was approved after the
group's taking-part stamp and is unanswered, otherwise *open*. The stamp is written by one guarded
`UPDATE` after the stance commits, so two parallel last answers cannot both miss it. The hub read
carries `groupMatcher { isTakingPart, openStatements }` for viewers who may manage the group (open =
unanswered + changed). The public read answers 404 when absent.

### Phase 2 — Backend: club review and to-dos
Goal: the pool can be managed end to end and both to-dos appear.
- [x] 2.1 Management endpoints: overview (pool, proposals, coverage), approve (cap 10), reject, reword (changed flag), reorder, delete (stances cascade)
- [x] 2.2 To-do kinds: group statements open/changed (group admins), proposals waiting (`group_matcher.manage`)
- [x] 2.3 Integration tests (cap, reword keeps stances + flags, delete cascades, to-do audiences)

Notes from phase 1 review: make the cap and order a database guarantee (partial unique
`sort_order` for approved rows, or a lock around approve/reorder); deleting or rejecting a
statement can complete a group, so it re-runs the guarded taking-part stamp for all groups.

Built 2026-11-11. As built: routes under `manage/group-matcher` (`GET` pool with coverage,
`POST …/statements/{id}/approval` with optional reworded text, `POST …/rejection`,
`PUT …/text`, `PUT …/statement-order`, `DELETE …/statements/{id}`). Cap and order are database
guarantees: `sort_order BETWEEN 1 AND 10` plus `UNIQUE (sort_order) DEFERRABLE` (non-approved rows
are NULL); every pool write (approve, reject, reword, reorder, delete, withdraw) runs in one
transaction under a shared advisory lock, so slots stay gapless — approve takes the next slot,
delete closes the gap, reorder is one statement. Only
proposals can be approved or rejected; only deleting an approved statement can complete a group,
so only delete re-runs the stamp (never when the pool becomes empty). To-dos:
`groupMatcherStatementsOpen` once per administered, non-archived group with a `group` ref;
`groupMatcherProposalWaiting` for `group_matcher.manage`. The manage hub read gains
`groupMatcher { approvedCount, waitingProposalCount }` for phase 4.1.

### Phase 3 — Club app: the group's Jeck-Check page
Goal: group admins maintain admission ages, stances and proposals from the group hub.
- [x] 3.1 API client schemas/queries/mutations + `group-matcher` domain change
- [x] 3.2 Settings row with status in `HubSettingsPanel` + route `/groups/$groupId/group-matcher`
- [x] 3.3 Page: admission-age chips, statement rows (stance + importance, autosave, open/new/changed first), propose field + own proposals
- [x] 3.4 Group to-do on Start links to the page
- [x] 3.5 Logic tests + phone/desktop shots, light/dark

Built 2026-11-11. As built: `features/group-matcher` (page read, stance/admission-age writes with
optimistic patches, propose, withdraw). The page runs *Aufnahmealter* (new `KkToggleChips`), then
*Aussagen* (a "Auf der Website" standing line, then rows on the new `KkStatementList` kit with
`KkAnswerChoice` Ja/Neutral/Nein and importance chips), then the proposal form and *Eure Vorschläge*.
The first answer to a statement saves importance *wichtig* (2); importance stays disabled until a
position is set. Open/new/changed rows sort first once per visit and keep their place while the
group answers, so rows never jump under a tap. The hub row shows `n offen` / `dabei` /
`nicht dabei`. The Start to-do reads "Jeck-Check · <group>" and links to the group's page; Start
to-dos now carry the optional `group` ref.

### Phase 4 — Club app: Jeck-Check management
Goal: `group_matcher.manage` holders run the pool from *Verein verwalten*.
- [x] 4.1 Permission in the role editor + manage-hub entry
- [x] 4.2 Proposal queue (approve, reword-and-approve, reject)
- [x] 4.3 Approved pool: drag order, reword, delete, `n / 10` counter
- [x] 4.4 Coverage grid group × statement with taking-part column
- [x] 4.5 Proposals-waiting to-do on Start; logic tests + shots

Built 2026-11-11. As built: `/manage/group-matcher` is a pro hub in *Vereinsdaten* (row shows
`n / 10 Aussagen` and waiting proposals); panes are the child routes `proposals/$statementId` and
`statements/$statementId` (bottom drawer on phones). Master: *Vorschläge* as a work queue with a
quick *Aufnehmen* (hidden at 10), *Aussagen · n / 10* as a dnd-kit sortable list (new
`KkStatementList.SortRow` + `PressRow`), *Abdeckung* on the new `KkCoverageGrid` kit (group ×
statement marks plus a *Dabei* column, legend). The proposal pane rewords-and-approves (text sent
only when changed) or rejects; the statement pane rewords, lists answered / changed / open groups
and deletes after a confirm. All writes run through one operations hook in the hub context and are
optimistic (approve appends the statement). `group_matcher.manage` sits in the role editor's
*Verein* group; the `groupMatcherProposalWaiting` Start to-do links to the hub. The pool limit is
one constant (`APPROVED_STATEMENT_LIMIT`) and the kept-pane hook is shared (`lib/use-shown-pane`).

### Phase 5 — Website on the API
Goal: the public Jeck-Check runs on real data; the seed is gone.
- [x] 5.1 `groupMatcher` reads `/api/public/group-matcher`; numeric group ids through scoring/reasons (a statement approved after a group joined may carry no stance from that group — scoring skips it for that group; age bands arrive as `underTwelve … eighteenPlus`)
- [x] 5.2 Absent response hides section, nav entry, page head and sitemap entry
- [x] 5.3 Intro counts the real questions (joke line only at 11)
- [x] 5.4 Remove `lib/seed/group-matcher.ts` and unused seed groups; adapt tests
- [x] 5.5 Shots empty/filled (phone + desktop), update `plan/launch.md` (Jeck-Check no longer absent once groups answer)

Built 2026-11-11. As built: `features/group-matcher/api.ts` reads `/api/public/group-matcher` and
maps it (`group-matcher-model.ts`) onto the unchanged matcher model — age question first (all five
bands; only groups that ticked bands can be knocked out), then the statements in pool order as
`statement-<id>`; a group without a stance on a statement is skipped for it. A 404 reads as
*absent* (`null`). The Jeck-Check has no route, nav entry, head or sitemap entry of its own — it is
the `/join` section — so absent hides the section, the hero's "Wo passe ich hin?" button and the
Jeck-Check sentence in the first join step; the join route preloads the read so nothing flashes.
The intro counts statements + age in words ("Sieben Fragen."), the carnival line only at eleven.
`lib/seed/` is gone. Shots: `/join` absent and filled, phone + desktop, light + dark.

## Risks & alternatives
- **Too few groups answer by launch** → the section simply stays out. That is acceptable, because
  the absent rule is the intended behaviour.
- **Changed-flag noise:** rewording flags every group. That is intended so stances stay honest;
  touching the stance clears it.
- Rejected alternatives (questions per group, club-only list, free-for-all pool, opt-in switch,
  strict completeness): see ADR-0039.

## Out of scope
- Filter questions other than age.
- Reasons on rejected proposals, comment threads on statements.
- Statistics on visitors' answers. Answers stay in the visitor's browser tab, as today.
