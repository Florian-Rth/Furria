---
status: shaped 2026-10-07
phase: L6 — Events, public face (plan/launch.md)
shaped_with: Florian, 2026-10-07 (grill-with-docs)
base: main with L5b merged
---

# L6 — Events, public face

The website stops inventing the season. The club enters its **events** in a new **events
workbench** in the club app; `/events`, the event pages, the hero card and the landing teaser read
them. Guests cannot buy online yet — an event **without online sales** takes **ticket requests**
from the website, which the club answers outside the app. `CONTEXT.md` carries the terms:
**Event** (always public), **Events workbench**, **Online sales**, **Ticket request**, **Ticket
availability**.

Read first: `CONTEXT.md` → **Event**, **Calendar entry**, **Events workbench**, **Online sales**,
**Ticket request**, **Ticket availability**, **To-do**; ADR-0003, ADR-0004, ADR-0010;
`plan/launch/l4-membership-applications.md` (the public-write pipeline this phase reuses).

---

## What was ruled on 2026-10-07

1. **An event is a calendar entry of the new kind `CalendarEntryKind.Event`** — the glossary's
   narrow event, a ticketed hall evening. It is **always `Public`**, owned by the club, and the
   website lists exactly the entries of this kind. A public entry of another kind (the Rose Monday
   parade) stays off the website. There is no "public event" term.
2. **The events workbench is the final hub, built with only the launch panels** (ADR-0010's
   *Events* workbench). It grows later — running order, seats, presale, live direction join the
   event's page — and is never replaced. Not an interim management page.
3. **`events.manage` is a key of its own** — *Veranstaltungen pflegen* — *Veranstaltungen anlegen,
   ihre Eckdaten für die Website pflegen, die Kartenlage setzen und absagen.* It joins
   `FurriaPermissions.All`. **An event is edited only in the workbench, and wholly there** — date
   and venue included. The calendar editor neither offers the kind nor edits, nor deletes, an
   event; `calendar.manage_club` sees events in the calendar like everyone else.
4. **No participating groups and no attendance response on an event** until the full event
   feature. An event is in every member's club calendar (it is public and club-owned, so it
   concerns every member) and in no group hub.
5. **No draft.** Creating an event needs the guaranteed facts and puts it on the website at once,
   as *Vorverkauf wird noch angekündigt* — the early state of the final model.
6. **No event type.** The title says *Prunksitzung*; the website's type tag and type tint go.
7. **The facts an event carries:**

   | Fact | Required | Shape |
   |---|---|---|
   | Title | ✓ | text, ≤ 80 |
   | Date + start | ✓ | local date-time (the entry's `StartsAt`) |
   | End | | the entry's `EndsAt` — may run past midnight |
   | Doors open (*Einlass*) | | local time, before the start |
   | Venue | ✓ | one of the club's venues; the website shows its address |
   | Teaser | ✓ | one sentence, ≤ 160 |
   | Description | | plain paragraphs, no markup (the entry's `Description`) |
   | Age hint | | text, ≤ 40 |
   | Price | | cents, one price per evening |
   | Presale start | | date-time |
   | Ticket availability | | `available` · `fewLeft` · `soldOut` (ruling 9) |
   | Cancelled | | the *Absagen* act (ruling 11) |

   **No capacity, no free count** — counted figures belong to online sales and seat allocation.
8. **Online sales is a per-event channel — absent at launch.** Every event is without online
   sales; the switch, the order flow and the counted states arrive with the presale phase, and the
   website's ticket faces are rebuilt onto whatever that phase models. No switch locked to *off*
   (`plan/launch.md`: absent, never stubbed).
9. **The sales status is derived and set by hand, never both for one thing:**
   - no presale start → `announced` (*Vorverkauf wird noch angekündigt*);
   - presale start ahead → `presaleScheduled` (countdown, *Vorverkauf startet am …*);
   - presale start reached → the **ticket availability** the club sets: `available` (default) ·
     `fewLeft` · `soldOut` (*Karten verfügbar* · *Nur noch wenige Karten* · *Ausverkauft*);
   - cancelled → `cancelled` (*Abgesagt*), over everything.

   The date decides *when*, the person decides *how much*; availability cannot be set before the
   presale start.
10. **`events.manage` sets the availability.** `ticket_requests.handle` only works incoming
    requests.
11. **Absagen vs Löschen.** *Absagen* keeps the event on the website as *Abgesagt* (shared links
    and flyers stay honest), closes the request form, and is undone by *Absage zurücknehmen*.
    *Löschen* is for a mistaken event: its page is gone; it is **refused while open ticket
    requests exist**, naming how many.
12. **A ticket request** (*Kartenanfrage*) is sent from the event's page while the request window
    is open: presale running, not sold out, not cancelled, not yet begun. It carries the event,
    a count (1–10), name, **phone** and email (all required), an optional message and the privacy
    consent. **No inbox confirmation** (unlike ADR-0004's applications — a fake request costs one
    unanswered message, not a stranger in the registry): Altcha, the honeypot, the per-IP and
    per-address limits from L4 guard it.
13. **A receipt mail** through the outbox — *Deine Kartenanfrage für die 1. Prunksitzung am
    17. Januar — 4 Karten — ist beim Verein. Wir melden uns bei dir.* — no link, no action. The
    club's answer is never sent by the app.
14. **A request lives only until it is handled.** One act, *Erledigt*, behind a confirmation,
    deletes it — the guest gets her physical tickets outside the app, and the club keeps no list.
    Requests survive *Absagen* (the handler must still tell those guests); one still open when
    its evening is over is deleted the next day.
15. **`ticket_requests.handle` is a key of its own** — *Kartenanfragen bearbeiten* —
    *Kartenanfragen von der Website sehen und erledigen.* It joins `FurriaPermissions.All`.
    Alone it opens the workbench with only its panels.
16. **The arrival notice** goes to every person holding `ticket_requests.handle` with a contact
    email, as `MembershipApplicationArrivalNotifier` picks them (the managing login is no person
    and gets none): the guest's name, the event, the count and a link into the app — **no phone or
    email in any inbox** (L4 ruling 8).
17. **A to-do**: `ToDoKind.TicketRequestWaiting` (wire `ticketRequestWaiting`) — the open requests,
    for the key's holders, on Start and in the **workbench's** *Zu erledigen*, not `/manage`'s.
    A mark covers request ids.
18. **The workbench:**

    ```
    Mehr → Verwaltung → Veranstaltungen               (either key)

    /events — Veranstaltungen
      ZU ERLEDIGEN     Kartenanfragen offen · 3                       (handle)
      KARTENANFRAGEN   per event: name · 4 Karten · tel · mail · note
                       [Erledigt]                                     (handle)
      VERANSTALTUNGEN  the relevant session, upcoming first           (manage)
                       17. Jan · 1. Prunksitzung · Nur noch wenige
                       past evenings folded: „Vorbei · 2"
                       [+ Veranstaltung]

    /events/$eventId — 1. Prunksitzung
      header: title · date · venue · status
      ECKDATEN   the facts of ruling 7 → edit                         (manage)
      KARTEN     presale start · availability switch                  (manage)
      ANFRAGEN   this event's open requests                           (handle)
      quiet lines: Absagen / Absage zurücknehmen · Löschen            (manage)
    ```

    Panels are gated by key (ADR-0010). Earlier sessions' evenings stay in the club calendar,
    not in the workbench. A member opening an event in the calendar sees its facts read-only.
19. **The website's address of an event is `/events/{id}-{title-slug}`.** Only the id resolves;
    a stale or missing title part redirects to the current one, which is canonical. No date in it.
20. **The website reads the API, the seed goes.** `GET /api/public/events` (the current session's
    upcoming events — no archive, as the event-list plan ruled) and `GET /api/public/events/{id}`.
    The model drops `type`, `performers`, `capacity`, `freeCount` and the type tint; the status is
    `announced · presaleScheduled · available · fewLeft · soldOut · cancelled`. The online-sales
    faces go: *Platz wählen*, *Vorverkauf beendet*, the exchange link on sold out. The ticket panel
    shows status and price and, while the window is open, **Karten anfragen →** (the mobile sticky
    bar carries it). The form is its own route, `/events/{id}-{slug}/anfrage` — `/join/apply`'s
    sibling: the event's title, date and price on top, the fields of ruling 12, Altcha, a
    confirmation in place. The hero card (*Nächster Abend mit Karten*: the earliest `available` /
    `fewLeft` evening, else the earliest upcoming) and the landing teaser read the same endpoint.
21. **No migration of existing entries** — production holds test data only.

---

## Slices

| # | Slice | Note |
|---|---|---|
| S1 | **Events, backend** — `CalendarEntryKind.Event`; the event's own facts (doors open, teaser, age hint, price, presale start, availability, cancelled) in a 1:1 table keyed by the calendar entry, so the later event hub grows its own aggregate; `events.manage` in `FurriaPermissions` + `All`; the workbench endpoints — list (relevant session), read, create, edit facts, set availability (refused before the presale start), cancel / take back, delete; `PostCalendarEntry`, `PutCalendarEntry` and `DeleteCalendarEntryById` refuse the kind and its entries; `GetCalendar` shows events to everyone (rulings 1, 3–7, 9–11) | One test file per endpoint; the calendar endpoints each gain an "event refused" case |
| S2 | **The workbench, web** — `/events` and `/events/$eventId`; `Mehr → Verwaltung → Veranstaltungen`; *Veranstaltungen* panel, *Eckdaten* edit, *Karten* panel, the quiet lines; the web's `PERMISSION_KEYS`, `MANAGE_KEYS` and rights-matrix copy; the calendar's kind label *Veranstaltung* and the read-only event facts on a calendar entry (rulings 2, 3, 9–11, 18) | |
| S3 | **The public read and the website** — `GET /api/public/events`, `GET /api/public/events/{id}`; the website model rebuilt onto them, `lib/seed/events.ts` and `lib/event-tint.ts` deleted; list, detail, hero card, landing teaser on the API; `/events/{id}-{slug}` with the redirect; the online-sales faces removed (rulings 6, 7, 9, 19, 20) | Needs S1 |
| S4 | **Ticket requests, backend** — `TicketRequest` + migration; the anonymous `POST` (Altcha, honeypot, per-IP + per-address limits, the request window); the receipt mail and the arrival notice through the outbox; `ticket_requests.handle` in `FurriaPermissions` + `All`; the open requests read and *Erledigt*; the next-day purge of requests whose evening is over; *Löschen* refused while requests are open; `ToDoKind.TicketRequestWaiting` with its gated branch in `ToDoService.ForAsync` and its row in `StartWireNamesTests` (rulings 11–17) | Reuses L4's Altcha, rate-limit scopes, outbox and purge |
| S5 | **Ticket requests, web** — the website's *Karten anfragen →* and `/events/{id}-{slug}/anfrage` with Altcha and the confirmation in place; the workbench's *Zu erledigen* and *Kartenanfragen* panels and the event page's *Anfragen*, *Erledigt* behind a confirmation; `TO_DO_KINDS`, `todo-links`; the key's rights-matrix copy (rulings 12, 14, 15, 17, 18, 20) | Needs S3, S4 |

**L6 is done when** S1–S5 are merged on a green `main`, the website shows only what the club
entered in the workbench, and a guest's ticket request reaches the key's holders as a to-do and is
gone once handled.

---

## For later phases

- **L8** — share previews for event pages (ADR-0003's OG injection: events are the first
  backend-driven detail page); removing the seat, order and exchange routes; the privacy policy
  names ticket requests, what they hold and that they are deleted once handled or the day after
  their evening.
- **Online ticket presale** (early December) — the per-event *online sales* switch (every
  existing event starts without), capacity, the order flow, the counted states
  (`onSale` / `almostSoldOut` / `salesClosed`), and the website's ticket panel rebuilt onto them.
  An event with online sales takes no ticket requests.
- **The full event feature** — participating groups and attendance responses on events, the
  running order and its public face on the website.
- **Gallery** — an album links to an event directly; there is no event type to match on.
- **L9** — the board enters the session's real events in the workbench.
