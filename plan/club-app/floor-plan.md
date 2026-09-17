---
status: shaped 2026-09-17, not yet implemented
scope: the Club-App's information architecture — every phase after CA-P2
supersedes: the route tree and page set implied by docs/design/README.md §8/§9
---

# The Club-App floor plan

Shaped with Florian on 2026-09-17, after CA-P2 closed the mobile shell.

**This is structure, not an implementation plan.** It records what the app is made of and why.
Every phase built on it is still shaped from the ground up, with its own plan file.

---

## The problem it solves

CA-P2 gave the app correct chrome around CA-P1's content: a registry of Mitglieder, Gruppen and
Verwaltung screens, and an Übersicht that renders a watermark and nothing else. That content is
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
- a vertical stack of **bands**, each band one concern, each showing a live summary and a way in,
- deeper work reached from a band as a sheet, a detail page, or a working view.

### Member hubs

| Hub | Scope |
|---|---|
| **Start** | me, now — my queue, my pinned things, what is running |
| **Verein** | the club |
| **Gruppen** | my Gruppen, and one Gruppe as a hub of its own |

### Admin hubs

The rule that decides whether something gets a hub:

> **Scoped rights → tools inside the scope's hub. Global rights → their own admin hub.**

**Gruppen-Admin is the only scoped resource in the model** (`CONTEXT.md`: it is not a Rolle, it
is a Gruppe-scoped resource), so a Gruppen-Admin's tools live inside her Gruppe hub. Everything
rights-bearing beyond that is a Rolle with global reach and gets a workbench:

| Hub | Bands |
|---|---|
| **Finanzen** | Zu erledigen · Beiträge offen/bezahlt · Auslagen zur Genehmigung · Kassenbericht |
| **Veranstaltungen** | Kommende Veranstaltungen · offene Aufgaben je Abend · Vorverkauf · Ablauf & Live-Regie |
| **Verein verwalten** | Personen & Mitgliedschaften · Gruppen · Rollen & Rechte · Einladungen · Session |
| **Getränkekasse** | Offene Zahlungen · Bestand & Palettenabgleich · Strichliste · Teilnehmer |
| **Kleidung** | Sammelbestellung · Lieferantenliste · Ausgabe · Sortiment |

An admin hub is the same component kit as a member hub. One system, two audiences.

**A Veranstaltung is not a member hub.** Planning an evening is administration: the
Veranstaltungen hub lists the evenings and one of them opens as a working view — the handoff's
task board, tackled in any order. Members meet an event in the Kalender and in the Notice, never
in the planner.

---

## Binding rules

**No dead scope.** A band with nothing in it does not render, and a member never sees a scope
they are not part of. This is what stops a hub decaying back into a menu.

**Berechtigung gates bands, not only hubs.** The rights matrix already grants keys to Rollen.
Someone holding only *Auslagen genehmigen* gets the Finanzen hub with exactly one band — an
honest small hub instead of a wall of disabled tools. The hub set needs no configuration of its
own; it falls out of the matrix.

**Every admin hub opens with "Zu erledigen", and the same items appear on Start.** The hub is
where the work is done; Start is where it is discovered. Nobody has to visit a hub to learn that
something is waiting.

**Most detail is a sheet.** A route exists only for something worth linking to or returning to.
A member row, a Rolle, a Schlüssel-holder open as sheets. The routes that earn existence: the
hubs, one Gruppe, one Person, the Mitglieder list, the Gruppen list, the Kalender, and search.

**There is no "Verwaltung" navigation.** `Mehr → Verwaltung` is an index of the admin hubs the
viewer may open — the same role Mehr plays for member surfaces. Admin hubs are pinnable like
anything else.

---

## Navigation: a pinnable destination set

The bottom navigation starts with a default set and becomes **customisable by pinning**.

Anything with an identity is pinnable: a hub, a band, a Gruppe, an admin hub, a detail page.
Pinned items fill the navigation (four plus the overflow entry); the rest become a pinned strip
at the top of Start. The "default set" is simply what a new Account starts with.

Why pinning rather than a navigation-settings screen: the gesture is already known from every
phone home screen, there is no configuration UI to design or explain, and it is seasonal by
nature — the Getränkewart pins her hub in November and unpins it in March without anyone
shipping a feature for that.

This amends ADR-0009 and the mobile-shell handoff §3.3, which require a *global and constant*
destination set. The constraint that matters — the set never changes while navigating — is kept.
See [ADR-0010](../../docs/adr/0010-club-app-is-a-set-of-scope-hubs.md).

---

## The Verein hub

Bands, in order. Each renders only with content.

1. **Das Motto** — the opener. Eyebrow `Session 2026/27`, the motto as the display title, a
   custom SVG per Session as the leading visual. Overview is the only screen type the shell
   allows brand identity in, and the opener already hands its title to the bar on scroll, so
   this costs nothing structurally.

   **The motto and its artwork are data, not a committed asset** — otherwise every November
   needs a deploy. A Session carries its motto, its artwork and its span, edited in the
   *Verein verwalten* hub.

2. **Aushang** — club announcements. **Explicitly not a chat**: no replies, no threads, no
   reactions. Unread ones surface on Start; the Aushang itself lives here because it is club
   scope. Posting is a Berechtigung (see open questions).
3. **Kalender** — the next club dates inline, and the way into the full calendar.
4. **Wer macht was** — the Rollen with their current Inhaber, and the Schlüssel with their
   holders. The band that answers "wen frage ich" without anyone having to remember.
5. **Vereinsdaten** — wir sind N, neue Mitglieder, Jubiläen, Geburtstage, and the entry into
   search.

**Gruppen are not a band.** There are too many to fit one, and they get their own page —
today's `/groups` reworked. Mitglieder likewise: the existing list page survives as the long
form for the rare case somebody wants it.

Cut from the handoff's club page: the club-history block (founding, Narrenruf, Satzung,
contact). It is website content; a member does not open the app for it.

---

## The calendar is one calendar

**One store holds every club-related date**: Veranstaltungen, unticketed club occasions, the
members-only summer event, a Gruppe's training, a Gruppe's Auftritt. Not several calendars that
have to be merged for display.

Everything else is a **filter over that one store**:

- the Kalender page shows all of it, filterable,
- the Verein hub's band shows the next club-wide entries,
- a Gruppe hub's dates band is the same calendar filtered to that Gruppe.

Consequence: the Gruppe hub gets its dates for free, and a member never has to ask which
calendar a date was in.

**The entry type still has no club-approved name** — see open questions. Nothing is modelled and
no surface promises a word until the club gives one.

---

## Global search

One search over the whole app, using the search mode the shell already ships.

- **It searches things**: Personen, Gruppen, Rollen, Termine, Schlüssel, Aushänge — later Fotos
  and Klamotten.
- **It searches actions too.** `beitrag` reaches the viewer's open Beitrag, `kasse` the
  Getränkekasse hub if she may open it. That makes search the universal fallback for navigation,
  which takes the pressure off getting the default pinned set exactly right.
- **It is useful before anything is typed**: recents and the viewer's own scopes — her Gruppen,
  her next date, the people she contacted last.
- Results group by type; a row opens a **sheet**. Only Gruppen, events and the Kalender route out
  of search.

Open: server-side search versus a cached client index. Kontaktdaten visibility argues for
server-side, instant feel for the client. It shapes the endpoint, so it is decided before it is
built, not after.

---

## The live evening

There is no app-wide "evening mode". **The Notice carries it**, always — and expanding the
Notice opens a **full-screen** view (the shell type that strips to bar plus content). Live-Regie
for a performer is that view. The rest of the app never changes state.

---

## Deliberately cut

Removed from the handoff's feature set because no member's club life improves:

- **Saalplan-Editor** — a large build for one person twice a year, and coupled to the undecided
  `Sitzplatzvergabe`. It belongs to ticketing, after that decision.
- **Werbung / auto-generated Instagram and flyer material** — a marketing tool for one person.
- **Bierliste scoreboard (Top-3, own rank)** — gamification with no job behind it. The balance
  and the Getränkewart's "Geld erhalten" reconcile stay; those are the real pain.
- **A personal finance dashboard** — an "offen" item on Start and a one-tap pay flow, nothing more.
- **Helfer-Bedarf**, **Mitfahren**, **Was mitbringen** — the last is a line in an event's
  description, not a feature.
- The club-history band (see Verein hub).

## Shelved, not cut

- **Sessionsleiste** — a horizontal timeline of the Session as orientation and brand.
- **Abstimmungen** — date choices, Motto vote. Real club culture, fastest way to grow an
  unplanned scope.
- **Bildergalerie** — blocked on the photo-consent question, open since 2026-07-28.

---

## Open questions

Ordered by how much they block.

1. **The calendar entry has no club-approved word.** `CONTEXT.md` flagged this on 2026-09-10 as
   "Gruppentermin"; the one-calendar ruling reframes it — the club does not need a word for a
   Gruppe's dates, it needs a word for **an entry in the club calendar**, of which a Gruppe's
   training is one kind. `Veranstaltung` stays narrow and cannot be it, and `Termin` is on that
   entry's own avoid-list. **This blocks the Kalender, the Verein hub's calendar band and the
   Gruppe hub's dates band** — the largest single block in the project.
2. **Who may post an Aushang.** Agreed: a Berechtigung, held by "the Vorstand". The model has
   **no Vorstand role** (`CONTEXT.md`: there is no built-in Vorstand super-role), so this becomes
   a key granted to whichever Rollen the club counts as Vorstand. The club names them.
3. **Is Zusage/Absage on a date wanted at all?** Proposed as the highest-value feature in this
   session and never ruled on, while three adjacent ideas were cut. Ask a Trainerin before
   building it.
4. **Who holds a child's Account.** The Kindergarde is 6–11. If parents hold the login, the
   Kalender and anything attendance-shaped are parent surfaces, which changes rosters and copy.
5. **Search: server-side or cached client index.**
6. **Photo consent** — blocks the Bildergalerie.
7. **Non-member Gruppen people still have no word** — affects roster copy.

---

## Order of work

Areas, not slices. Each gets its own plan, shaped from the ground up when it is reached.

1. **The data the hubs stand on** — Session (motto, artwork, span), the one calendar, Aushang.
   Backend first; nothing above it can be built in its final form otherwise.
2. **The Verein hub and the Kalender page.**
3. **Global search.**
4. **The Start hub and pinning.**
5. **Gruppen** — the list page reworked, the Gruppe hub taking its dates from the calendar.
6. **Verein verwalten**, the first admin hub, folding today's `manage/*` routes.
7. **The remaining admin hubs** — Finanzen, Getränkekasse, Kleidung, and Veranstaltungen with
   Ablauf and Live-Regie.
