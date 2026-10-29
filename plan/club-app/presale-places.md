---
status: built 2026-10-22 — S1–S6 done; mobile places block added 2026-10-27
scope: remove ticket requests (Kartenanfrage) everywhere; an event names its presale places, a
  venue carries its opening hours
shaped_with: Florian, 2026-10-22
branch: feature/ticket-presale-place
supersedes: plan/launch/l6-public-events.md rulings 10–17 (ticket requests) and the *Karten* step's
  request clause in plan/club-app/event-planner-v2.md
---

# Presale places instead of ticket requests

The club does not want ticket requests from the website. They go — whole, with their key, to-do,
mails, purge job and table. Instead the club names, per event, **where tickets can be bought**
(*Vorverkaufsstellen*): one or more **venues**, each showing its own **opening hours**. Nothing is
bought, requested or counted in the app; the website tells the guest where to go and when.

## Rulings (2026-10-22)

1. **Ticket requests are removed, not hidden.** Endpoints, service, mails, notifier, purge job,
   `ticket_requests.handle`, `ToDoKind.TicketRequestWaiting`, the website's `/anfrage` route and
   form, the workbench's Kartenanfragen panels — all deleted. The `ticket_request` table is dropped
   by a migration. The term leaves `CONTEXT.md`.
2. **A presale place is a venue.** The venue list widens from *the club's own places* to *every
   place the club names* — the hall, the clubroom, and outside shops that sell its tickets
   (Bäckerei, Sparkasse). No kind flag on a venue: the list stays small, and a shop never shows
   up anywhere it is not picked.
3. **An event names zero or more presale places**, ordered as picked (`EventPresalePlace`:
   event, venue, sort order). Optional — an event without places is valid.
4. **Opening hours belong to the venue**, written once on it and shown for every event sold there.
   Structured slots (`VenueOpeningSlot`: weekday, opens, closes; `closes > opens`, no overnight,
   several per weekday allowed — split hours like 9–12 and 14–18). Optional: a venue without slots
   shows only its address and note.
5. **The website shows the places while tickets can be bought**: status `presaleScheduled`
   (*„Ab {Datum} bei …“*), `available`, `fewLeft`. Hidden on `announced`, `soldOut`, `cancelled`
   and once the evening has begun. Only running venues are shown; archiving a venue removes it from
   every event's public list (restoring brings it back) — the link is kept.
6. **Sales status is untouched.** `announced → presaleScheduled → availability` and *Absagen* stay
   as ruled in L6; the availability switch stays with `events.manage`.
7. **Deleting an event is no longer refused** — its only refusal (open requests) goes.

## Rulings A–C — agreed 2026-10-22

- **A.** *Karten* step (event planner) done = price + presale start **+ at least one presale
  place**? (Recommended: yes — without a place the guest has nowhere to go.)
- **B.** Mobile sticky bar on the event page (today: price + *Karten anfragen*): keep it as
  price + **„Wo gibt's Karten?“** jumping to the places block? (Recommended: yes.)
- **C.** Opening hours on the website compressed by identical days (*Mo–Fr 9–18 · Sa 9–13*)?
  (Recommended: yes.)

---

## S1 — Backend: ticket requests out

Delete (whole files): `Core/Events/TicketRequest.cs`, `TicketRequestWindow.cs`;
`Application/Events/{EventTicketRequestTally,SubmitTicketRequestCommand,TicketRequestSummary}.cs`;
`Infrastructure/Events/{TicketRequestService,TicketRequestArrivalNotifier,PastTicketRequestPurge}.cs`;
`Infrastructure/Mail/TicketRequest{Arrival,Receipt}Mail{,Content}.cs`;
`Persistence/Configurations/TicketRequestConfiguration.cs`; `Api/Endpoints/TicketRequests/*`;
`Api/Endpoints/Events/EventTicketRequestsDto.cs`; `tests/Furria.Api.Tests/TicketRequests/*`;
`Tests.Common/Expectations/TicketRequestSetExpectations.cs`.

Edit: `EventSteps` (drop `LongestRequestWait` clause), `EventReadinessFacts.OldestOpenRequestAt`,
`EventPlanning.TicketRequests`, `FurriaPermissions`, `ToDoKind`/`ToDoKeys`/`ToDoSurfaces`,
`BackgroundJob`/`BackgroundJobSchedule`, `MailTemplate`, `MailRecipientKind`/`MailRecipient`,
`EventService` (delete refusal, tally, request query), `ToDoService`, `AppDbContext`,
`ServiceCollectionExtensions`, `AddressRateLimitScope`, `GetEventById`/`GetEvents` responses;
Tests.Common builders (`AddTicketRequest`, materializer, `SeededClub`, `TestClub`, `Expected`);
tests (`AltchaSolver` overload, `EnumWireNamesTests`, `DeleteEventByIdTests`, `GetEventById/GetEvents`,
`EventStepsTests`, `GetManageHubTests`, `GetStartToDosTests`).

Keep: Altcha, honeypot and rate limiting — membership applications use them.

Migration `RemoveTicketRequests`: drop `ticket_request`; delete `role_permission` rows
`ticket_requests.handle`; delete `to_do_mark` rows of kind `TicketRequestWaiting`; delete unsent
`outbox_mail` rows of the two request templates / recipient kind (enum values vanish, rows would
not deserialize). Removed enum numbers are not reused.

Tests: existing event/to-do/manage-hub tests stay green minus the deleted cases; no new behaviour.

## S2 — Backend: venue opening hours

- Core: `VenueOpeningSlot` (`VenueId`, `DayOfWeek Weekday`, `TimeOnly Opens`, `TimeOnly Closes`),
  `Venue.OpeningSlots`. Check constraint `closes > opens`; weekday 0–6.
- Venue write (`PostVenue`/`PutVenue`) carries `openingHours: [{ weekday, opens, closes }]` —
  replaced as a whole on save, like group training slots. Validator: `closes > opens`, no
  overlapping slots on one weekday, ≤ 14 slots.
- Venue reads (`GetVenues`, venue by id) return the slots ordered by weekday (Mon first), opens.
- TDD: `PutVenueTests` — saves/replaces/clears slots, rejects overlap and reversed times;
  `GetVenue…Tests` — order.

## S3 — Backend: presale places on the event

- Core: `EventPresalePlace` (`EventId`, `VenueId`, `SortOrder`), PK (event, venue);
  `Event.PresalePlaces`.
- `PostEvent`/`PutEvent` (`EventFactsCommand`) carry `presaleVenueIds: int[]` (ordered, distinct,
  ≤ 10, each a running venue — unknown/archived → validation, the venue service's messages).
- `GetEventById` returns the places (id, name, archived flag) for the editor and pane.
- Public: `PublicEventDetails.PresalePlaces` — running venues only, each name, address, note,
  opening slots; empty unless status ∈ {presaleScheduled, available, fewLeft} and the evening has
  not begun (pure `EventSales.ShowsPresalePlaces(status, startsAt, now)`, tested in Core).
- If ruling A: `AreTicketsSet` gains `presale place ≥ 1`; `EventStepsTests` case.
- TDD: `PutEventTests`/`PostEventTests` (ordered save, replace, archived refusal),
  `GetPublicEventByIdTests` (status gating, archived venue dropped, slot order).

## S4 — Club app

Remove: every `TicketRequest*` component, `EventRequestsPanel`, `EventPaneRequests`,
`use-ticket-request-handling`, `ticket-requests-labels(+test)`; the `requests` pane key, board
column/filter, copy, `handlesRequests`; `ticketRequestWaiting` in to-dos; the permission key in
`lib/api/schemas`, `app-sections`, `permission-denials`, role copy; `pastTicketRequestPurge` system
label; `ticketRequest(s)` in `lib/query/reads`; the cancellation text's request sentence. Fix test
fixtures.

Add:
- **Venue editor → Öffnungszeiten**: a slot list (weekday · von · bis, add/remove) in the form kit
  (ADR-0029), modelled on `GroupSlotEditor`; the venue record shows the compressed hours.
- **Event editor → Karten section**: *Vorverkaufsstellen* — multi-pick from running venues,
  reorderable, with a „Ort anlegen" hop to the venue editor for a new shop.
- **Event pane *Karten***: lists the places with their hours under price/presale/availability.
- Pure helper `formatOpeningHours(slots)` (shared with the website → lives in `@furria/api-client`
  or a small shared module; tested: grouping, split hours, empty).

## S5 — Website

Remove: route `events_.$eventSlug_.anfrage.tsx`, `TicketRequestFormKit/`, every `TicketRequest*`
component, hook, api, content, display, fallback, failure, payload, window module + tests;
request schemas; `buildTicketRequestHref`; `TicketRequestCta` in `EventDetailPage`.

Add:
- `EventTicketPanel` gets a **places block** (*Karten gibt es bei*): per place name, address,
  note, opening hours; in `presaleScheduled` headed *Ab {Datum} bei*. Status gating comes from the
  server (empty list → no block).
- Sticky mobile bar per ruling B.
- Schema: `presalePlaces` on the public event (Zod).
- `pnpm shot` of an event page in presaleScheduled / available / soldOut, phone + desktop.

## S6 — Docs

`CONTEXT.md`: drop **Ticket request** and the glossary row; *Online sales* — an event without
online sales sells at its **presale places**; new **Presale place** (*Vorverkaufsstelle*) and
**Opening hours** (*Öffnungszeiten*) entries; widen **Venue**; *Karten* step text.
`docs/ops/PRODUCTION.md` ticket-requests section out. Mark superseded rulings in
`plan/launch/l6-public-events.md`, `plan/club-app/event-planner-v2.md`,
`plan/club-app/system-status.md`; `plan/launch.md` line.

## Order and validation

S1 → S2 → S3 (backend, TDD per backend-work) → S4 ∥ S5 → S6. Each slice ends with its stack's
validation per CLAUDE.md; full suites once before the PR (S1 touches test fixtures and enums).
