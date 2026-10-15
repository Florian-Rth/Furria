---
status: pinned — binding contract for the person ring („Ordensring“)
derived from: prototype https://claude.ai/artifact/9PGWejeKRJTxW4AwHn4DAf (v5) · CONTEXT.md · .claude/skills/{backend-work,frontend-work}
pinned: 2026-10-14
---

# Person ring — implementation contract

Every person's avatar carries the club's honour: a metal ring that counts her sessions, a
black-and-gold sash for a board seat and coins for every other function. Managers additionally
see a hairline status ring. The internal name „Ordensring" never appears in UI copy.

## 0. Rulings (Florian, 2026-10-14)

- Everyone sees the metal ring and the functions — that is the point.
- The count is sessions with a running, **unpaused** membership — the same rule as the Start
  greeting's session ordinal.
- Metal gets its own theme tokens; status gold is never metal.
- Historic join dates are entered by the club; creating a person asks for the real start date.
  No ring is better than a wrong one: a person without memberships has no metal.
- Ring + functions live in the shared `KkAvatar` so every place gets them.
- Function display: one **sash** (first public board seat; black, gold edges, office icon +
  short name) and up to three **coins** for all other functions. Chosen over pins, ribbon bar.
- Each role, board office and group carries a club-chosen **icon** from a fixed set.
- (2026-10-15) A role shows a coin **only when the club configured one** for it: a switch in the
  role editor turns the coin on, then a colour (group tone set) and an icon are picked. Roles
  without a coin never appear in honours.

## 1. Domain rules

### 1.1 Laps

| Lap | Pieces | Metal | Closes at session |
|---|---|---|---|
| 1 | 5 | bronze | 5 |
| 2 | 6 | silver | 11 |
| 3 | 11 | gold | 22 |
| 4 | 11 | garnet (gold + red enamel centre line) | 33 |
| 5 | 11 | onyx (gold + black enamel centre line) | 44 |
| 6 | 11 | brilliant | 55 |

More than 55 sessions render as a closed brilliant lap. A lap whose last piece is struck is
**closed**: it renders as one solid band without gaps. While a lap is open, its unstruck pieces
show the previous lap's metal at low opacity (lap 1: faint ink track). Pauses strike nothing and
take nothing away. Zero sessions → no metal (functions still render on a faint track).

### 1.2 Session count (server, pure, `Furria.Core/Club/SessionCount.cs`)

`SessionCount.Of(periods, pauses, sessionYear) : int` — number of session years from the first
period's session year up to and including `sessionYear` in which a membership period overlaps the
session and no pause contains it. Same overlap/pause rule as `SessionOrdinal.Of` (reuse its
private predicate; `SessionOrdinal.Of` becomes `count if current counts else null`). Evaluated for
`ClubSession.RelevantYearOf(today)`. Unit-tested in Core.

### 1.3 Functions

| Kind | Source | Name | Icon | Tone | Order |
|---|---|---|---|---|---|
| `boardSeat` | open board seat of a **public**, non-archived office | office name | office icon | — | board display order |
| `groupAdmin` | open group-admin tenure in a non-archived group | group name | group icon | group tone | since asc |
| `role` | open role holding of a non-archived role **with a coin** | role name | coin icon | coin tone | since asc |

Non-public board offices never appear in honours. Keys and plain group memberships are not
functions.

### 1.4 Club icons

Closed set, server enum `ClubIcon` (`Furria.Core/Club/ClubIcon.cs`, values start at 1),
serialized camelCase like every enum. Web union `KkClubIcon` with the identical camelCase values:

`crown, euro, bolt, shield, camera, sparkle, mic, musicNote, drum, mask, megaphone, star,
trophy, flag, key, shirt, pen, wrench, palette, heart, mug, calendar, whistle, broom`

Nullable on `Role.Icon` (paired with `Role.Tone`, both set or both null — `ck_role_coin`), `BoardOffice.Icon`, `Group.Icon`, stored exactly like `Group.Tone`
(string conversion, max length, check constraint from `Enum.GetNames`). Fallback when null
(applied on the **web** by the mapper, never stored): board seat → `crown`, group admin →
`sparkle`; a role function always carries its coin icon.

## 2. API

### 2.1 Icon fields (writable)

- Role create/edit (`POST /api/manage/roles`, `PUT /api/manage/roles/{id}` — existing routes):
  optional `coin: { icon: ClubIcon, tone: GroupTone } | null`; returned by role details + role
  list/overview items.
- Board office create/edit (existing `PostBoardOffice`/`PutBoardOffice`): optional `icon`;
  returned by `GET /api/manage/board` offices.
- Group: `icon` on group create (manage-groups) and `PUT groups/{id}/info` beside `tone`;
  returned wherever `tone` of a group is returned.

### 2.2 Honours (read)

```
PersonHonoursDto { int Sessions; IReadOnlyList<PersonFunctionDto> Functions }
PersonFunctionDto { PersonFunctionKind Kind; string Name; ClubIcon? Icon; GroupTone? Tone }
PersonFunctionKind { BoardSeat = 1, GroupAdmin = 2, Role = 3 }   // json: boardSeat|groupAdmin|role
```
Functions are pre-sorted: board seats, then group admins, then roles, each in the §1.3 order.
Field name everywhere: `honours`. Computed by one Infrastructure query service
(`PersonHonoursQuery`) that loads honours for a set of person ids in **one round trip per
source** (no N+1), so lists stay cheap.

Added to these responses (person-level item that already renders an avatar):

| Endpoint | Where |
|---|---|
| `GET /api/manage/persons/{id}` | details root |
| `GET /api/members`, `GET /api/members/{id}` | each member item / details root |
| `GET /api/groups/{id}` | each roster person |
| `GET /api/manage/board` | each seat holder |
| `GET /api/roles` (overview), `GET /api/manage/roles/{id}` | each holder |
| `GET /api/auth/me` | `me.honours` |

### 2.3 Manager facts (persons list only)

`PersonSummaryDto.feeReduced : bool` — a fee reduction runs today. Membership and app state are
already on the summary (`membershipState`, `accessState`). Person details already carry fee
reductions.

## 3. `@furria/ui`

### 3.1 Tokens

`kkTokens.color.{light,dark}.metal.{bronze,silver,gold,brilliant}.{shadow,mid,highlight}` with the
prototype values (light / dark):

| metal | light shadow/mid/highlight | dark shadow/mid/highlight |
|---|---|---|
| bronze | #6E4320 #A0622D #D49A63 | #8A5A2B #C48450 #E8B184 |
| silver | #4E5661 #7D8794 #D5DBE2 | #6F7884 #A7B0BB #EEF1F4 |
| gold | #7E5C00 #B78300 #F4D060 | #B8860B #FFC42E #FFE38A |
| brilliant | #8A6A1E #E0BC55 #FFF6D8 | #B8962E #F6DE8C #FFFBEA |

`kkTokens.color.{light,dark}.onyx` = `#1A1411` / `#0E0B09`. Garnet/onyx laps use the gold gradient
plus a centre line in `red` / `onyx`.

### 3.2 `KkAvatar` props (additive; existing calls keep working)

```ts
type KkClubIcon = 'crown' | … (§1.4);
type KkAvatarFunctionKind = 'board' | 'admin' | 'role';
interface KkAvatarFunction { kind: KkAvatarFunctionKind; label: string; short: string;
  icon: KkClubIcon; tone?: KkGroupTone }
interface KkHonours { sessions: number; functions: readonly KkAvatarFunction[] }
type KkStandingMembership = 'running' | 'paused' | 'none';
type KkStandingApp = 'none' | 'invited' | 'active' | 'attention';
interface KkStanding { membership: KkStandingMembership; app: KkStandingApp; feeReduced: boolean }

KkAvatar props += { honours?: KkHonours; standing?: KkStanding; arrival?: boolean }
KkAvatar size  += 'header' (4.5rem) and 'portrait' (6rem)
```

- `label` = full name shown in the flag/accessible name ("Kassiererin · Vorstand",
  "Gruppen-Admin Tanzgarde", "Admin"); `short` = sash text ("Kassiererin"). Both composed by the
  app (copy lives in the app).
- The avatar keeps its outer size; the ring is drawn **inside** that box (portrait shrinks).
- `small` never draws rings (stacks, chips). `medium`/`large`: metal ring, sash as band only,
  one iconless coin, standing ring. `header`: sash icon only, up to 3 coins with icons.
  `portrait`: sash icon + short name (auto-fit), 3 coins.
- Coins: from 1 o'clock clockwise; with >3 non-sash functions the third shows „+n" and its flag
  lists the rest. A second board seat becomes a black/gold coin.
- Tap/hover/focus on sash or coin unfolds its flag with `label`. Flags are real buttons only at
  `header`/`portrait`; at smaller sizes nothing inside the avatar is focusable (rows are the tap
  target) and the avatar's accessible name includes the session count and function labels.
- Standing ring (only when `standing` is passed): hairline colour = membership (green running,
  gold paused, dotted faint none), dot at 4:30 on the portrait edge = app (green active, hollow
  gold invited, red attention, none), blue bead lower left = fee reduced. Flat colours only.
- `arrival`: pieces strike clockwise (≤40 ms stagger), one glint, sash slides in, coins pop —
  ≤1.3 s, transform/opacity only, reduced-motion = static. Plays in full on every mount.
- Pure geometry + lap maths in `internal/` with unit tests (lap of n sessions, piece arcs,
  coin overflow).

### 3.3 `KkLapClosing`

The lap-closing moment for Start: the closing piece strikes, gaps forge into a band, ring dips,
≤11 metal confetti chips. A scrubbable profile dial was built and **dropped on 2026-10-14**: the
profile keeps its original header with the ringed avatar.

## 4. Club-app

- **Person management shows only the manager ring** (ruled 2026-10-15): the persons list and the
  person detail header pass `standing` and no `honours`; the list endpoint carries no honours.
  The detail keeps `honours` for the session count in its status rail.

- `lib/honours.ts`: pure mappers DTO → `KkHonours` (labels/shorts, icon fallbacks, kind map),
  summary → `KkStanding` (`accessState` Disabled → attention, Invited → invited, Active →
  active, else none; membershipState Active → running, Paused → paused, else none). Tested.
- Pass `honours` at every surface in §2.2's table; `standing` only on manage-persons list and
  person detail. Person detail header uses `size="header"` + `arrival`, replacing
  `KkIdentityRing` (deleted); the per-season strip moves into the Mitgliedschaft panel.
- Icon picker (new `KkClubIconPicker` in ui, grid like the tone picker) in role editor, board
  office editor, group create + group info editor.
- Profile („Ich"): original header composition, avatar swapped for `KkAvatar size="header"` with honours + arrival.
- Start: lap-closing moment in the session where the person's count reached 5/11/22/33/44/55,
  inside the existing 30-day anniversary window, every visit; copy „{n} Sessionen. Gross - Furria!"

## 5. Slices

| # | Slice | Owner |
|---|---|---|
| S1 | Backend: ClubIcon + icon fields + SessionCount + honours on all endpoints + feeReduced | backend agent |
| S2 | `@furria/ui`: metal tokens, KkAvatar rings/sash/coins/standing, KkLapClosing, KkClubIconPicker | ui agent |
| S3 | Club-app: schemas, `lib/honours.ts`, every avatar site, icon pickers, person header | app agent (after S1+S2) |
| S4 | Club-app: profile avatar + Start lap closing | app agent (after S3) |
