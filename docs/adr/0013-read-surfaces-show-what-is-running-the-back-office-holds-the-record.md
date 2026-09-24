# Read surfaces show what is running; the back office holds the record

CA-P4 shipped a club hub that reads six domains nobody can write, and CA-P5 had to decide where
the writing happens. There was a live precedent pointing the other way: `/announcements` carries
posting, editing and withdrawing itself, gated on `announcements.post`, so the announcement's write
sits on its own read surface. Applied generally, that would put a pencil on the club hub's
key-holding tiles and board band, and *club management* would shrink to the domains with no read
surface at all. Decided while shaping CA-P5 on 2026-09-20.

## The decision

**A read surface shows what is *running*. The back office holds the *record*, including what is
over — and every write to a dated club record happens there.**

The club hub shows the board that sits today; `/manage/board` shows every seat ever held, ends
one and opens the next. The hub shows who can unlock the storeroom; `/manage/keys` shows that Maik
handed his back in 2024.

The deciding argument is CA-P4's ruling 13: **the club hub is identical for every viewer and is
one query.** That is what lets it cache as a single entry and paint without reflow. An affordance
that appears only for `key_holdings.manage` makes the hub per-viewer on the day it ships, and every
later phase inherits the cost.

**The announcement fits this rule rather than breaking it.** An announcement is not a dated
period. It has no history anyone curates: it is posted, it expires, it is gone. There is nothing
to record, so there is no back office for it — which is why CA-P4 correctly built none.

## The one exception: the calendar

**The calendar is an app, not a read surface, and calendar entries are authored there.** Ruled by
Florian on 2026-09-20:

> This is a thing that's independent from the club management thing. Every user can access the
> calendar page. It just differs what events they can see, and who can create events. But it
> should behave just like any other calendar app on the phone — that everybody is able to work
> with it.

A calendar whose entries are made somewhere else is not a calendar. The exception is safe because
the calendar was never bound by ruling 13 — it is not the one-query, identical-for-everyone hub, so
per-viewer affordances cost it nothing.

Consequences of the carve-out:

- **There is no club dates panel** in *club management*, and `calendar.manage_club` is not a
  back-office key.
- **The group hub gets no create button either.** This supersedes `p4-club-hub.md`'s *"Creating
  a group's calendar entry … belongs to the group hub, not here"*, which reasoned from the
  back-office model this ADR replaces. A group hub's dates panel stays a filter over the one
  calendar.
- **The owner follows the viewer's capability, not the surface she used.** One `+`, one form:
  the picker offers *FCC* when she holds `calendar.manage_club`, plus every group she is
  group admin of. A single option is filled in without a picker.

## Considered and rejected

**One authoring place per domain, wherever that place is** — generalise the announcement precedent
and put pencils on the read surfaces. Rejected because it spends ruling 13 on the first phase that
asks for it, and because it leaves the *ended* half of every dated period — the half `CONTEXT.md`
insists is never deleted — with no home anywhere in the app.

**Back office for everything, including the calendar** — consistent, and it would have kept the
collision warning next to a list of the season's entries. Rejected on the ruling above: consistency
is not worth a calendar that cannot be used like a calendar.

## Consequences

- Two surfaces touch the same data, and which act goes where must stay deliberate. The rule of
  thumb: opening and ending periods, and browsing what is over, is record-keeping.
- The read surfaces of CA-P4 need no changes in CA-P5. The phase adds routes and touches `Mehr`.
- Every later admin hub inherits the shape — Finance, Drinks till, Wardrobe and Events
  hold their records; the member-facing surfaces that show their running state stay read-only.
