# The Club-App is a set of scope hubs behind a pinnable destination set

CA-P1 gave the Club-App a page per feature and CA-P2 wrapped those pages in one declarative
mobile shell ([ADR-0009](0009-club-app-runs-on-one-declarative-mobile-shell.md)). The chrome is
right; the page set is not. It is a master-data tool reached through a menu, and the design
handoff's route tree (`docs/design/README.md` §8/§9) would grow that menu one entry per feature
until a member has to learn it. Decided 2026-09-17 while shaping the floor plan
([`plan/club-app/floor-plan.md`](../../plan/club-app/floor-plan.md)).

## The decision

**The app is a small set of hubs, not a set of pages.** A hub owns one scope and answers
everything about it: identity at the top, then a stack of panels, each panel one concern with a
live summary and a way in. Detail pages hang off a hub for the long form nobody needs often.
Member hubs are **Start**, **Club** and **Groups**; the remaining hubs are administrative.

**Scoped rights live in the scope's hub; global rights get their own admin hub.** Group admin
is the model's only scoped resource, so a group admin's tools sit inside her group hub.
Every other rights-bearing role gets a workbench — Finance, Events, Club management,
Drinks till, Wardrobe — built from the same component kit as a member hub. There is no
"Verwaltung" navigation; `Mehr → Verwaltung` indexes the hubs the viewer may open.

**Permission gates panels, not only hubs.** A holder of one key sees a hub with one panel. The
hub set is therefore not configured anywhere — it falls out of the rights matrix, and a panel
with nothing in it does not render.

**The destination set becomes the viewer's own, by pinning.** A new Account starts with a default
set; anything with an identity can be pinned into the four navigation slots, and the rest becomes
a pinned strip on Start. There is no navigation-settings screen — pinning is the whole mechanism.

**Most detail is a sheet.** A route exists only for something worth linking to or returning to.

## Why this amends ADR-0009

ADR-0009 and the handoff's §3.3 require a destination set that is **global and constant**. Pinning
keeps the constraint that produced that rule — the set never changes while navigating, never
re-orders under the thumb, and is identical on every screen of a session — and drops the part
that assumed one set for every member. That assumption was affordable while the app had four
screens. With role-bearing hubs it is not: either every member stares at destinations they cannot
open, or responsibility has to be expressed somewhere other than navigation. Pinning expresses it
without a second navigation system, and the shell's layer contract is untouched.

The alternative considered and rejected was a permission-filtered destination set. It produces a
navigation bar whose shape depends on data the member cannot see or change, which is worse on
every count: unpredictable between two members standing next to each other, impossible to
document, and it still cannot express "I want the members list in reach".

## Consequences

- `KkShell`'s `destinations` become per-Account state, read from the session rather than a module
  constant. The shell keeps rendering one set; only its source changes.
- Hubs and panels need a stable identity so they can be pinned, searched and deep-linked.
- Global search becomes load-bearing: it is the fallback for anything not pinned, which is what
  makes an imperfect default set harmless.
- The handoff's §8 route tree is superseded. It was already marked non-final there.
- Desktop stays out of scope, as ADR-0009 left it.
