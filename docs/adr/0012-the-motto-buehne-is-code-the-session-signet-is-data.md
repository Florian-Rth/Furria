# The Motto-Bühne is code, the Session-Signet is data

The floor plan ruled that the Verein hub's opener is data — *"the motto and its artwork are data,
not a committed asset, otherwise every November needs a deploy"* — and CA-P3 built for it:
`Session.ArtworkSvg` (A4) and `SvgSanitizer` (A5). Shaping the hub on 2026-09-19 asked the opener
for something that ruling cannot deliver: an animated, interactive, theme-aware scene. **A
sanitised SVG string in a column is a picture; the opener was asked to be a performance.** The two
were one concept and are now two. Decided while shaping CA-P4.

## The decision

**The Motto-Bühne is code.** One component per Session, keyed by its start year, written fresh
each season to suit that season's Motto. It may use motion, interaction, and separate light and
dark treatments — none of which survive serialisation into a column. **Only the current Session
has one**, and building next season's is a deliberate yearly act, aligned with the club's own
Motto-Verkündung at the Sommerfest rather than with a sprint.

**The Session-Signet is data.** `Session.ArtworkSvg` keeps its job under a name that says what it
is: the small still mark the club *has* for a season — the emblem on the Orden, the banner, the
Festschrift. It is evidence, exactly as the Session Nº is: recorded when the club has one, absent
when it does not, never invented, never animated.

**Which one a surface uses follows from what it is showing.** The current season, staged, on the
Verein hub: the Bühne. A season merely *named* — a past season, a list row, the public website:
the Signet, or nothing at all.

**A season with no Bühne is a normal season, not a broken one.** The opener falls back to the
Motto set as type. No surface waits for art that does not exist.

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
parameter space, produces a house style every season must fit, and the first Motto that does not
fit it gets a deploy anyway — at which point the parameter space is dead weight.

## Consequences

- **The floor plan's "the artwork is data" is amended, not deleted.** It stays true of the Signet
  and is false of the Bühne.
- **November carries a deploy, knowingly.** It is a ritual, not an incident: the Bühne for the
  coming season is built after the Sommerfest vote and lands before 11.11.
- The Motto itself stays **data** in both worlds — the Bühne renders the Motto it is given and
  does not hard-code it, so a corrected typo is an edit and not a release.
- The opener's states are **date-derived** and need no data: teaser before 11.11., running through
  the Session, at rest after Aschermittwoch. In the Zwischenzeit the opener looks **forward** to
  the coming Session, which is the one place a surface deliberately does not name the Session the
  date implies.
- **What the club may edit is unchanged**: Motto, Nº and Signet, in *Verein verwalten*. The club
  never edits a Bühne, and no UI pretends otherwise.
- `SvgSanitizer` remains correct and necessary — it guards the Signet, which is club-uploaded. It
  was never going to guard the Bühne, which is source.
