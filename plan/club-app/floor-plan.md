---
status: shaped 2026-09-17, not yet implemented
scope: the club app's information architecture — every phase after CA-P2
supersedes: the route tree and page set implied by docs/design/README.md §8/§9
---

# The club app floor plan

Shaped with Florian on 2026-09-17, after CA-P2 closed the mobile shell.

**This is structure, not an implementation plan.** It records what the app is made of and why.
Every phase built on it is still shaped from the ground up, with its own plan file.

---

## The problem it solves

CA-P2 gave the app correct chrome around CA-P1's content: a registry of members, groups and
management screens, and an overview that renders a watermark and nothing else. That content is
a master-data tool, not a member app — the screens a member opens most are the ones that do not
exist, and the screens that exist are the ones the club looked up twice a season.

The handoff's answer (`docs/design/README.md` §9) is a page per feature, reached through a menu.
That produces a menu tree a member has to learn. The floor plan replaces it.

---

## The system: scope hubs

The app is a small set of **hubs**. A hub is a place, not a page: it owns one scope and answers
everything about it. Detail pages hang off a hub for the rare case where somebody genuinely
needs the long form.

Every hub has the same anatomy, so it is one component kit and not N layouts:

- a scope identity at the top (the Overview screen type's opener),
- a vertical stack of **panels**, each panel one concern, each showing a live summary and a way in,
- deeper work reached from a panel as a sheet, a detail page, or a working view.

**Panel** is the word, in prose and in code — `KkPanelSection` in `@furria/ui` is already it, and
`KkBandSection` is the *website's* full-bleed marketing band, an unrelated component (ruled
2026-09-17).

### Member hubs

| Hub | Scope |
|---|---|
| **Start** | me, now — my queue, my pinned things, what is running |
| **Club** | the club |
| **Groups** | my groups, and one group as a hub of its own |

### Admin hubs

The rule that decides whether something gets a hub:

> **Scoped rights → tools inside the scope's hub. Global rights → their own admin hub.**

*Club management* was shaped in full on 2026-09-20 — see [`p5-club-management.md`](p5-club-management.md).
Two changes to the table below came out of it: **invitations left** (no server model, and it pulls in
the open duplicates question — it belongs to account onboarding), and **Session grew into
session records, venues, key holdings and board**, the master data CA-P4 deliberately shipped with no
write surface. **Club calendar entries never became a panel**: the calendar authors its own entries
([ADR-0013](../../docs/adr/0013-read-surfaces-show-what-is-running-the-back-office-holds-the-record.md)).

**Group admin is the only scoped resource in the model** (`CONTEXT.md`: it is not a role, it
is a group-scoped resource), so a group admin's tools live inside her group hub. Everything
rights-bearing beyond that is a role with global reach and gets a workbench:

| Hub | Panels |
|---|---|
| **Finance** | To do · Fees open/paid · Expenses for approval · Cash report |
| **Events** | Upcoming events · open tasks per evening · Presale · Running order & live direction |
| **Club management** | Persons & memberships · Groups · Roles & permissions · Session records · Venues · Key holdings · Board |
| **Drinks till** | Open payments · Stock & pallet reconciliation · Tally list · Participants |
| **Wardrobe** | Bulk order · Supplier list · Issuing · Range |

An admin hub is the same component kit as a member hub. One system, two audiences.

**An event is not a member hub.** Planning an evening is administration: the
Events hub lists the evenings and one of them opens as a working view — the handoff's
task board, tackled in any order. Members meet an event in the calendar and in the Notice, never
in the planner.

---

## Binding rules

**No dead scope.** A panel with nothing in it does not render, and a member never sees a scope
they are not part of. This is what stops a hub decaying back into a menu.

**Permission gates panels, not only hubs.** The rights matrix already grants keys to roles.
Someone holding only *approve expenses* gets the Finance hub with exactly one panel — an
honest small hub instead of a wall of disabled tools. The hub set needs no configuration of its
own; it falls out of the matrix.

**Every admin hub opens with "To do", and the same items appear on Start.** The hub is
where the work is done; Start is where it is discovered. Nobody has to visit a hub to learn that
something is waiting.

**Most detail is a sheet.** A route exists only for something worth linking to or returning to.
A member row, a role, a key holder open as sheets. The routes that earn existence: the
hubs, one group, one person, the members list, the groups list, the calendar, and search.

**Prefer club-created data over a code constant** whenever the two cost the same. Roles,
board offices, venues, groups and Session records are club data, edited in the app — the club
composes its own structure instead of waiting for a deploy. The line this stops at is the set of
**permission keys**: the code must know what it enforces, so a club composes roles and grants
freely but never invents a key (rule added 2026-09-19).

> **North star, not a constraint: the platform should eventually fit clubs that are not the FCC —
> not even carnival clubs.** Generalising `Session` (11 November → Ash Wednesday), the carnival
> vocabulary and ADR-0002's German-only UI is a *product* decision with its own ADR, taken when a
> second club exists. It is deliberately **not** shaping any current phase: designing for an
> unmet customer would make every surface vaguer and slower to build. The rule above is how the
> goal is served today — genericity earned by configurability, not by abstraction.

**There is no "Management" navigation.** `More → Management` is an index of the admin hubs the
viewer may open — the same role More plays for member surfaces. Admin hubs are pinnable like
anything else.

---

## Navigation: a pinnable destination set

The bottom navigation starts with a default set and becomes **customisable by pinning**.

Anything with an identity is pinnable: a hub, a panel, a group, an admin hub, a detail page.
Pinned items fill the navigation (four plus the overflow entry); the rest become a pinned strip
at the top of Start. The "default set" is simply what a new account starts with.

Why pinning rather than a navigation-settings screen: the gesture is already known from every
phone home screen, there is no configuration UI to design or explain, and it is seasonal by
nature — the drinks warden pins her hub in November and unpins it in March without anyone
shipping a feature for that.

This amends ADR-0009 and the mobile-shell handoff §3.3, which require a *global and constant*
destination set. The constraint that matters — the set never changes while navigating — is kept.
See [ADR-0010](../../docs/adr/0010-club-app-is-a-set-of-scope-hubs.md).

---

## The club hub

Shaped in full on 2026-09-19 — see [`p4-club-hub.md`](p4-club-hub.md) for the slices. The
order below is what that session settled and supersedes the five-panel list this file first
carried.

- **Motto stage** — the opener, and the one place the app is allowed to be art. **The stage is
  code and the session logo is data** ([ADR-0012](../../docs/adr/0012-the-motto-stage-is-code-the-session-logo-is-data.md)),
  which amends this file's earlier "the motto and its artwork are data": true of the session
  logo, false of the stage. Its four states are date-derived, and in the interim it looks
  **forward** to the coming Session.
- **Club data** — promoted out of a panel into a stat strip under the opener: members,
  groups, new this session. Board offices and key holdings are not stats; anniversaries and
  birthdays are deferred with a privacy question of their own.
1. **Announcement** — club announcements, the newest two in full. **Explicitly not a chat**: no
   replies, no threads, no reactions — and, settled 2026-09-19, no category, no pinning, no
   read receipt either. Whether one is new to you is a single last-seen moment on the account.
2. **Calendar** — the next three **club-owned** entries, and the way into the full calendar. A
   running entry is a **state of this panel**, not a live component: the hub never changes state,
   the Notice carries "now".
3. **Who does what** — the **board** band with portraits, then the remaining roles with their
   holders. The board is recorded as a body and implies roles; it is still not a right
   ([ADR-0011](../../docs/adr/0011-permissions-come-from-roles-and-running-relationships.md),
   amended 2026-09-19).
4. **Key holdings** — one tile per **venue**, each an avatar stack of who can unlock it. Split out
   of *Who does what*: it answers "who unlocks", not "who decides".

The hub stays **identical for every viewer** and is one query, so anything per-viewer rides on the
session payload instead.

**Groups are not a panel.** There are too many to fit one, and they get their own page —
today's `/groups` reworked. Members likewise: the existing list page survives as the long
form for the rare case somebody wants it.

Cut from the handoff's club page: the club-history block (founding, carnival call, bylaws,
contact). It is website content; a member does not open the app for it.

---

## The calendar is one calendar

**One store holds every club-related date**: events, unticketed club occasions, the
members-only summer event, a group's training, a group's performance. Not several calendars that
have to be merged for display.

Everything else is a **filter over that one store**:

- the calendar page shows all of it, filterable,
- the club hub's panel shows the next club-wide entries,
- a group hub's dates panel is the same calendar filtered to that group.

Consequence: the group hub gets its dates for free, and a member never has to ask which
calendar a date was in.

**The entry is a calendar entry** (settled 2026-09-18) and it carries **three independent axes**
(settled 2026-09-19), never collapsed into one:

- **Owner** — the club, or one group. Decides who may edit it, and **who a running entry
  summons through the Notice**: a club-owned entry lights it for everyone, a group's only for
  that group.
- **Visibility** — `Group` / `Club` / `Public`, chosen when the entry is created. A
  group's training defaults to `Club`, so the club can see what the hall is doing. **Visible is
  not the same as summoned.**
- **Venue** — one of the club's few places, from a club-managed list. Two entries at one venue at
  one time is the real collision behind "the club should see all trainings", and the venue is what
  makes it findable instead of leaving it to whoever scrolls the calendar. The same list carries the
  **key holdings**.

---

## Global search

One search over the whole app, using the search mode the shell already ships.

- **It searches things**: persons, groups, roles, calendar entries, key holdings, announcements —
  later photos and wardrobe.
- **It searches actions too.** `beitrag` reaches the viewer's open fee, `kasse` the
  drinks till hub if she may open it. That makes search the universal fallback for navigation,
  which takes the pressure off getting the default pinned set exactly right.
- **It is useful before anything is typed**: recents and the viewer's own scopes — her groups,
  her next date, the people she contacted last.
- Results group by type; a row opens a **sheet**. Only groups, events and the calendar route out
  of search.

Open: server-side search versus a cached client index. Contact details visibility argues for
server-side, instant feel for the client. It shapes the endpoint, so it is decided before it is
built, not after.

---

## The live evening

There is no app-wide "evening mode". **The Notice carries it**, always — and expanding the
Notice opens a **full-screen** view (the shell type that strips to bar plus content). Live
direction for a performer is that view. The rest of the app never changes state.

---

## Deliberately cut

Removed from the handoff's feature set because no member's club life improves:

- **Seating plan editor** — a large build for one person twice a year, and coupled to the
  undecided seat allocation. It belongs to ticketing, after that decision.
- **Marketing material / auto-generated Instagram and flyer material** — a marketing tool for one person.
- **Beer list scoreboard (Top-3, own rank)** — gamification with no job behind it. The balance
  and the drinks warden's "Geld erhalten" reconcile stay; those are the real pain.
- **A personal finance dashboard** — an "offen" item on Start and a one-tap pay flow, nothing more.
- **Helper needs**, **carpooling**, **what to bring** — the last is a line in an event's
  description, not a feature.
- The club-history panel (see club hub).

## Shelved, not cut

- **Session strip** — a horizontal timeline of the Session as orientation and brand.
- **Polls** — date choices, Motto vote. Real club culture, fastest way to grow an
  unplanned scope.
- **Member photo library** — blocked on the photo-consent question, open since 2026-07-28.

---

## Settled 2026-09-18

1. **The calendar entry is a `CalendarEntry`** — the plain translation, ruled by Florian.
   Unblocks the calendar, the club hub's calendar panel and the group hub's dates panel.
   See `CONTEXT.md`.
2. **Who may post an announcement** — a permission, granted on the rights matrix to whichever
   roles the club counts as board. Nothing to decide in code beyond the key.
3. **Attendance response is built** — optional, per calendar entry, switched on by whoever
   schedules it, available for every kind including a group's training.
4. **Search is server-side.** Contact details visibility decides it.
5. **A panel is a Panel** — `KkPanelSection` is the component; the website's `KkBandSection` is
   an unrelated full-bleed marketing band.
6. **Hubs elide, records state.** An empty panel does not render on a hub; on a detail page an
   empty panel shows a `KkEmptyState`, as it does today.
   **Amended 2026-09-20 (CA-P5 shaping): this is a rule about *member* hubs.** There, presence is
   decided by **scope**, so an empty panel means "this doesn't concern you" and elides. On an
   **admin** hub presence is decided by the **permission**, which already answered that — so
   emptiness never hides a panel, and the empty state is the summary line itself
   (`Noch keine Schlüssel vergeben`). Without the amendment the rule eats its own hub: a club with
   no venue gets no venues panel and therefore no way to record the first one.
7. **A hub is one query.** One request per hub, so the hub knows its full shape before it paints
   and reflows once.
8. **Payload shape follows viewer variance.** The club hub is identical for every viewer, so
   it is a typed `ClubHubSummary` and caches as one entry. Start varies per viewer, so it is a
   server-shaped list. Not two house styles — one rule applied twice.
9. **The club hub is gated on `club.read`**, which a running membership supplies. Every
   gate in the app is `has(key)`; nothing is gated on "is a member" at a call site.
   See [ADR-0011](../../docs/adr/0011-permissions-come-from-roles-and-running-relationships.md).
10. **No auto-assigned roles.** Keys come from roles *and* from running relationships, and the
    derived half is never stored. ADR-0011 records the alternative and why it was rejected.

## Open questions

Ordered by how much they block.

1. **Who holds a child's account** — **resolved 2026-09-21 (CA-P6 shaping): the MVP has no child
   accounts.** Nobody under the club's age of consent gets a login and no account is held on
   another person's behalf, so the calendar and every attendance surface answer for their own
   reader only. A child in the children's guard is a person with a group membership and no
   account. The consequence to carry: a group whose dancers cannot log in is reached through its
   group admin, so no surface may assume the dancer is the one reading it.
2. **Photo consent** — blocks the member photo library.
3. **Non-member group people still have no word** — affects roster copy.

---

## Order of work

Areas, not slices. Each gets its own plan, shaped from the ground up when it is reached.

1. **The data the hubs stand on** — Session (motto, artwork, span), the one calendar, announcement.
   Backend first; nothing above it can be built in its final form otherwise.
2. **The club hub and the calendar page.**
3. **Global search.**
4. **The Start hub and pinning.**
5. **Groups** — **shipped as CA-P6 on 2026-09-21**, see [`p6-groups.md`](p6-groups.md). It
   turned out to be a model rebuild before a surface one: `Group` was three fields, and the group
   hub's right to write its own record needed
   [ADR-0014](../../docs/adr/0014-the-group-hub-writes-its-own-record.md). `/my-groups` is
   retired — one hub at `/groups/$groupId` whose panel set varies by relationship — and a
   calendar entry now carries **participating groups**
   ([ADR-0015](../../docs/adr/0015-a-calendar-entry-carries-participating-groups.md)), which is
   what lets the club-owned gala session appear in the dance guard's own hub.
6. **Club management**, the first admin hub, folding today's `manage/*` routes.
   **Pulled forward to CA-P5 on 2026-09-20**, ahead of search and the Start hub: CA-P4 shipped six
   domains nobody can write, so searching them and queueing work from them are both thinner than
   they look until the club can fill them.
7. **The remaining admin hubs** — Finance, drinks till, wardrobe, and events with
   running order and live direction.
