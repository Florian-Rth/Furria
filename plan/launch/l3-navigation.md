---
status: built 2026-10-06 — S1–S4 on worktree/quiet-valley-977d, not yet merged
phase: L3 — Navigation (plan/launch.md)
shaped_with: Florian, 2026-10-06
binding: docs/adr/0010, CONTEXT.md (Start, To-do)
---

# L3 — Navigation

The club app gets its final **default** destination set, club management opens with its To-do
panel, and Mehr loses its "bald" teaser. A to-do can be marked **seen**: it folds away where the
work is done, goes quiet on Start, and says so when something new joins it.

Read first: `CONTEXT.md` → **Start**, **To-do**; ADR-0009, ADR-0010; `plan/club-app/floor-plan.md`
(*Every admin hub opens with "To do"*, *Navigation: a pinnable destination set*).

---

## What was ruled on 2026-10-06

1. **The default destination set is Start · Verein · Kalender · Gruppen · Mehr.** "Übersicht"
   is renamed **Start** everywhere — bar, screen title, copy. Kalender and Gruppen become root
   screens (they carry the bar; their nested screens back to them).
2. **Verein keeps all four links** — Mitglieder · Gruppen · Kalender · Aushänge. The bar becomes
   per-account by pinning later, so the hub stays a complete index of the club.
3. **Mehr is Profil · Verwaltung · Abmelden.** The "Kommt später" panel is removed — absent,
   never teased.
4. **`/manage` opens with *Zu erledigen*** — one hub row per to-do kind (icon, label, gold count,
   chevron to where the work is done), the same labels and landings as Start's cells. Absent when
   there is nothing to do.
5. **A to-do can be marked seen** (a toggle on its row). Seen rows fold into a collapsible
   *Gesehen · n* line at the panel's foot — always openable, nothing becomes unreachable.
6. **Something new joining a seen to-do raises a chip, not the row.** A seen to-do with an item
   she has not seen stays in the fold and carries *n neu* — on its row and on the fold line, so it
   shows while folded.
7. **The mark quiets Start too.** Start leaves out a to-do whose items she has all seen; something
   new brings it back to Start (full count). Start still has no gesture of its own — it honours
   the mark set where the work is done. The mark is per account, server-side, on every device.
8. **A mark covers the items it saw.** "New" is an item behind the to-do that the mark did not
   cover; items resolving never bring it back. A mark none of whose items remain is spent — the
   to-do is unmarked again (it returns to the top when it next appears).
9. **Marking is exact.** The client sends the version of the to-do it showed; when items joined in
   between, the server refuses (`409`) and the panel reloads — nothing is marked seen unseen.

### The toggle

`aria-pressed` = *seen with nothing new*. Pressing an unpressed toggle marks every current item
seen (top row → fold; fold row with *neu* → chip gone). Pressing a pressed toggle removes the mark
(the row returns to the top).

### Subjects — what a mark covers, per kind

| Kind | Subject |
|---|---|
| `neverInvited` | person id |
| `reminderDue` | invitation id (a reminder issues a new invitation, so a due-again reminder is new) |
| `inPersonOnly` | person id |
| `birthDateUnknown` | person id |
| `keyToTakeBack` | key holding id |
| `clubRecordGap` | the missing fact (`name`, `foundedYear`, `address`, `email`) |
| `applicationWaiting` | membership application id |

---

## The wire

- `GET /api/manage/hub` gains `toDos: [{ kind, count, isSeen, newCount, version }]` — every
  to-do of the viewer with `count > 0`, in `ToDoKind` order. `isSeen`: a live mark covers at least
  one current item; `newCount`: current items the mark did not cover (`0` when unseen);
  `version`: an opaque fingerprint of the current items.
- `PUT /api/to-dos/{kind}/seen` `{ version }` → `204`; `404` when the kind is not one of her
  to-dos right now; `409` when `version` is stale.
- `DELETE /api/to-dos/{kind}/seen` → `204` (idempotent).
- `GET /api/start` — the to-dos panel leaves out to-dos that are seen with nothing new; its wire is
  unchanged (`{ kind, count }`).

---

## Slices

| # | Slice |
|---|---|
| S1 | **Destinations** — `APP_DESTINATIONS` = Start · Verein · Kalender · Gruppen · Mehr (`calendarFilled`, `groupFilled` icons), Übersicht → Start, Kalender and Gruppen as root screens, Mehr without "Kommt später", `AppSection` without the `bald` shape |
| S2 | **Seen marks (server)** — `ToDoMark` + migration, subjects per kind, `ToDoService` summaries with `isSeen` / `newCount` / `version`, the mark endpoints, Start leaving out quiet to-dos, `toDos` on the manage hub |
| S3 | **Zu erledigen (club app)** — the to-do contract moves to `features/to-dos`; the `/manage` panel with rows, toggle, fold and *neu* chip; optimistic marks; Start and the hub refetch after a mark |
| S4 | **Docs** — CONTEXT (Start nav copy, To-do *seen*), `plan/launch.md` |

**L3 is done when** S1–S4 are merged on a green `main`.

---

## As built (2026-10-06)

- **Marking refuses any change, not only an addition.** The server only receives the fingerprint
  the panel showed, so it cannot tell an item joining from one resolving: either answers `409` and
  the panel reloads (*Inzwischen hat sich etwas geändert – schau es dir noch einmal an.*). Two marks
  landing at once also answer `409`.
- **The mark endpoints are gated** on any of `persons.manage`, `key_holdings.manage`, `club.manage`,
  `membership_applications.decide` (`403` otherwise) — the keys behind every launch kind.
- **`to_do_mark`** — one row per account and kind (`seen_subjects text[]`, `seen_at`), deleted with
  the account; migration `ToDoMarks`.
- **The to-do vocabulary left Start**: `features/to-dos` holds the kinds, labels, icons and
  landings that Start's cells and `/manage`'s rows share.
- **`/manage` lays *Zu erledigen* out as its first bank** (first column on desktop, first panel on
  the phone), rows start as a sentence (*Nie eingeladen*).
- **Five destinations keep their labels on the phone**: below 5.25 rem a nav item sets its label in
  normal case with tight tracking (uppercase *KALENDER* does not fit 70 px at the theme's smallest
  size); labels hide only below 3.5 rem.
- **New in `@furria/ui`**: `KkPanelFold`; `KkHubRow` `flag` (gold chip) and `action` (a control
  beside the link, never inside it); `KkIconButton` `pressed`; icons `calendarFilled`,
  `groupFilled`, `checkCircle`, `checkCircleFilled`, `send`, `reminder`, `handshake`, `birthday`.
- **Non-affiliated viewers** keep the bar on Gruppen: `RequireAffiliation` takes the screen's frame
  (root section or nested origin), so `/groups` left the `_affiliated` layout.
