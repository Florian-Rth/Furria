# The motto stage is code, the session logo is data

The floor plan ruled that the club hub's opener is data — *"the motto and its artwork are data,
not a committed asset, otherwise every November needs a deploy"* — and CA-P3 built for it:
`Session.ArtworkSvg` (A4) and `SvgSanitizer` (A5). Shaping the hub on 2026-09-19 asked the opener
for something that ruling cannot deliver: an animated, interactive, theme-aware scene. **A
sanitised SVG string in a column is a picture; the opener was asked to be a performance.** The two
were one concept and are now two. Decided while shaping CA-P4.

## The decision

**The motto stage is code.** One component per session, keyed by its start year, written fresh
each season to suit that season's motto. It may use motion, interaction, and separate light and
dark treatments — none of which survive serialisation into a column. **Only the current session
has one**, and building next season's is a deliberate yearly act, aligned with the club's own
motto proclamation at the summer event rather than with a sprint.

**The session signet is data.** `Session.ArtworkSvg` keeps its job under a name that says what it
is: the small still mark the club *has* for a season — the emblem on the session medal, the
banner, the anniversary booklet. It is evidence, exactly as the session Nº is: recorded when the
club has one, absent when it does not, never invented, never animated.

**Which one a surface uses follows from what it is showing.** The current season, staged, on the
club hub: the stage. A season merely *named* — a past season, a list row, the public website:
the signet, or nothing at all.

**A season with no stage is a normal season, not a broken one.** The opener falls back to the
motto set as type. No surface waits for art that does not exist.

## Considered options

**All data — keep the single ruling and store the artwork.** Rejected: it makes the thing that was
asked for unbuildable. Interactivity needs React; motion needs a library; light and dark need the
theme's tokens; and the sanitiser correctly strips exactly the attributes that would be needed to
fake any of it. The honest version of this option is "the opener is a static picture forever",
which is a different product decision than the one the floor plan thought it was making.

**All code — a component per season, no column.** Rejected: the club has ~40 past seasons and will
never have a hand-written component for any of them. A chronicle that can only show seasons
somebody wrote code for is not a chronicle. It also puts the *club's own* artwork behind a
developer, which is the dependency the floor plan was right to avoid.

**One component, parameterised by stored theme values** (colours, a shape set, a motion preset).
Rejected as the worst of both: it needs the full deploy cost of the code option to build the
parameter space, produces a house style every season must fit, and the first motto that does not
fit it gets a deploy anyway — at which point the parameter space is dead weight.

## Consequences

- **The floor plan's "the artwork is data" is amended, not deleted.** It stays true of the signet
  and is false of the stage.
- **November carries a deploy, knowingly.** It is a ritual, not an incident: the stage for the
  coming season is built after the summer-festival vote and lands before 11.11.
- The motto itself stays **data** in both worlds — the stage renders the motto it is given and
  does not hard-code it, so a corrected typo is an edit and not a release.
- The opener's states are **date-derived** and need no data: teaser before 11.11., running through
  the session, at rest after Ash Wednesday. In the interim the opener looks **forward** to
  the coming session, which is the one place a surface deliberately does not name the session the
  date implies.
- **What the club may edit is unchanged**: motto, Nº and signet, in *club management*. The club
  never edits a stage, and no UI pretends otherwise.
- `SvgSanitizer` remains correct and necessary — it guards the signet, which is club-uploaded. It
  was never going to guard the stage, which is source.

## Amendment, 2026-09-20 — teaser and rest are told apart by data

Shaping CA-P4 found the one state boundary the dates cannot carry. *Running* is bounded by two
dates the club already computes — 11.11. at 11:11 and the day after Ash Wednesday. *Teaser* and
*resting* are separated by the **motto proclamation at the summer event**, and the summer event
has no date anywhere in this system: not in the schema, not in a setting, not in a constant.

So the boundary is drawn on the fact the proclamation produces rather than on the day it happens:

**Outside the running session, the opener is *teaser* when the coming session has a motto
recorded, and *resting* when it does not.** Recording the motto *is* the proclamation, as far as the
app can tell, and the club records it when it is public.

This amends the consequence above: the opener's states are date-derived **except** for the
teaser/rest boundary, which reads one datum — `Session.Motto` for the relevant start year. The
motto was already data in both worlds, so nothing new is stored and no state flag is introduced.

*Rest* therefore shows the still glow, the session label and the countdown to the next 11.11.,
and **no scene** — a scene is written for one session and sealed until that session opens, so
there is nothing to show in the interim before the motto is known.

**This is reversible.** Once the club names a summer-festival date, the boundary becomes a date
like the other two and this amendment is withdrawn.

## Terminology note 2026-09-20 — the session signet is now the **session logo**

Renamed while shaping CA-P5. *Signet* is a design word nobody outside design knows; the
`Session-` prefix already keeps it clear of the club's own logo, which is all the old name was
protecting. The decision above is unchanged — the motto stage is code, the **session logo** is
data — and this ADR keeps its filename so the documents linking here still resolve.

Renamed with it: `Session.SignetSvg` → `Session.LogoSvg`, `signetSourceOf` → `logoSourceOf`,
`KkMottoStageSignet` → `KkMottoStageLogo`. The record the logo hangs on is a **session record**;
see `CONTEXT.md`.
