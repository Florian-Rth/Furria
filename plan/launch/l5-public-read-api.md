---
status: shaped 2026-10-02 — S1 next
phase: L5 — Public read API + website wiring (plan/launch.md; L4 before the 2026-10-02 split)
shaped_with: Florian, 2026-10-02 — built in a worktree parallel to L2
---

# L5 — Public read API + website wiring

The website stops inventing the club. Founded year, member and group counts, contact, socials, the
board and the session it advertises come from what the club app records; `FOUNDING_YEAR`,
`MEMBER_COUNT_PLACEHOLDER`, `GROUP_COUNT_PLACEHOLDER` and `CLUB_CONTACT_EMAIL` are deleted.

---

## What was ruled on 2026-10-02

1. **Two new anonymous reads, beside `GET /api/public/groups`**, each carrying only what a website
   surface reads:
   - `GET /api/public/club` — `name`, `foundedYear`, `email`, `phone`, `instagramUrl`,
     `facebookUrl`, `memberCount`, `groupCount`, `session { startYear, label, motto }`. Absent
     facts are `null`. No address, short name, website URL, session Nº or session logo — no
     website surface reads them (the imprint's address arrives with L8's real legal texts).
   - `GET /api/public/board` — the running seats of **public board offices** (ruling 4):
     `officeName`, `firstName`, `lastName`, `portraitUrl`, in the board's display order.
   - No caching and no rate limit, like `public/groups`: the reads are cheap and React Query
     holds them for five minutes.
2. **Counts mean what the club hub means.** `memberCount` = people with a membership running today
   (paused included); `groupCount` = non-archived groups — the same predicate `public/groups`
   lists, so the hero, `/join` and `/club` can no longer disagree. The website shows the member
   count **rounded down to ten with a `+`** (`183` → `180+`; below ten exact); the group count
   exact.
3. **The website advertises the relevant session**: the running one, and from the day after Ash
   Wednesday the coming one — `ClubSession.RelevantYearOf`, as the club hub. The label comes from
   the API; the website's `currentSession` is deleted (`sessionAt` stays — it dates events and
   news, where the 11.11 boundary is right). The ticker reads
   `GROSS FURRIA ✶ GROSSFURRA ✶ SESSION 2026/27 ✶ <MOTTO>` — the motto only once it is recorded
   (recording it is the proclamation, ADR-0012). No Nº.
4. **A board office may be public** (`BoardOffice.IsPublic`, a setting on `/manage/board`, off by
   default): whoever holds a running seat in it appears on the website with name, office and
   portrait. **`Person.PortraitIsPublic` is dropped** — a public office publishes its holders'
   portraits; there is no per-person switch (reverses the 2026-09-19 portrait ruling). Without a
   portrait (none exists before L7) the tile shows the tinted placeholder with initials.
   **The website's people chapter is absent when no public office has a running seat.**
5. **Socials are exactly what the club record holds**: Instagram and Facebook, each only when
   recorded. YouTube leaves the footer; no new record fields.
6. **Every "reach the club" place reads the record's email**, and shows the phone when one is
   recorded (the "Eine Telefonnummer … gibt es nicht" line only when none is). Imprint and privacy
   keep the operator until L8 rewrites them. The footer's legal line takes the record's `name`;
   brand prose ("DER FURRSCHE CARNEVALS CLUB") stays copy.
7. **Groups on the website**: `/club` groups its grid **by group kind** (sections in German name
   order, groups without a kind last), shows the **founded year** in the detail, and tints a tile
   by its **group tone** — the tone is the fallback for the group picture the media phase brings.
   `public/groups` gains `foundedYear`. No training rhythm.
8. **`/join/apply` interest chips read `public/groups`** — `groupInterests` become numeric
   `groupId`s, which L4's `POST /api/membership-applications` takes.
9. **The Jeck-Check stays out of L5.** It keeps its seed roster until it is shaped with real
   questions. Known break meanwhile: its `?groups=` handoff carries seed slugs the API-fed chips no
   longer match, so it preselects nothing.

---

## Slices

| # | Slice | Note |
|---|---|---|
| S1 | **Public club, the club's numbers** — `GET /api/public/club` with `name`, `foundedYear`, counts, `session`; website footer, masthead, hero stats, `/join` stats, `/club` story stats, ticker with motto; `currentSession`, `FOUNDING_YEAR` and both count placeholders deleted (rulings 1–3) | Fixes the hero/`/club` mismatch |
| S2 | **Reach the club** — `email`, `phone`, `instagramUrl`, `facebookUrl` on `public/club`; footer socials, every contact place, `CLUB_CONTACT_EMAIL` deleted except imprint/privacy (rulings 5, 6) | |
| S3 | **Public board offices** — `BoardOffice.IsPublic` + migration dropping `Person.PortraitIsPublic`, the setting endpoint, the switch on `/manage/board` (ruling 4) | Club app |
| S4 | **The board on the website** — `GET /api/public/board`, people chapter from it, absent when empty (ruling 4) | |
| S5 | **Groups on the website** — `foundedYear` on `public/groups`, kind sections, tone tint, founded year in the detail, apply chips on the API (rulings 7–9) | |

**L5 is done when** S1–S5 are merged on a green `main` and no website surface reads a club fact
from a constant.

---

## For later phases

- **L4** — `groupInterests` arrive as numeric `groupId`s (ruling 8).
- **L7** — the media store fills `PortraitUrl`; a public office's tile shows it without further
  work. The group picture replaces the tone tint (ruling 7).
- **L8** — prerendered pages ship without these facts in their HTML; they load client-side
  (ADR-0003's live-data path). The imprint takes the club's address and becomes the club's own.
