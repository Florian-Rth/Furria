---
rfc: 0011
title: The club assistant on WhatsApp
status: in-progress
github_issue: 104
branch: feat/rfc-104-club-assistant
created: 2026-11-24
---

# RFC 0011: The club assistant on WhatsApp

## Summary
Members write the club's WhatsApp bot a private message — *„Hat heute jemand Training?"*, *„Ist
der Vereinsraum Samstag um 14 Uhr frei?"*, *„Wann beginnt die Herbstwanderung?"* — and the **club
assistant** (*Vereinsassistent*) answers from the club's data. A hosted LLM (Mistral Large 4, EU)
answers by calling **read-only tools** that run with the asker's own visibility; managers get the
extra knowledge their **permissions** grant. It never changes anything, never names other persons,
and stays within a monthly euro budget. Grilled 2026-11-24; decisions:
[ADR-0043](../adr/0043-the-club-assistant-reads-club-data-through-an-outside-llm.md), the
2026-11-24 amendment of [ADR-0042](../adr/0042-the-club-reaches-whatsapp-through-a-self-hosted-waha-bot.md);
terms: `CONTEXT.md` → *Club assistant*.

## Motivation
Most members live in WhatsApp, not in the app. Simple questions about trainings, venues and events
end up in the club group or with the board by phone. The answers are all in Furria; the assistant
makes them reachable where people already are — cheaply (a few euros a month) and without
exposing anyone's personal data.

## Proposal

### Who is answered (rulings 2026-11-24)
- Only **private chats**; mentions in a group are ignored. The bot still never starts a chat.
- A sender is answered only when the **WhatsApp match** finds one **affiliated** person; she gets
  exactly what she may see in the app (without an account: what her memberships and groups show).
- Any other sender gets one line at most once a day per number: *„Ich kann nur Vereinsmitgliedern
  antworten, deren Handynummer in Furria hinterlegt ist."*
- Text only: voice messages, pictures and stickers get a humorous „please type it" line, nothing is
  sent to the provider.

### The switch and the money
- **System → WhatsApp → Vereinsassistent** (admins): switch, off by default; **monthly budget** in
  euros (default 10 €) with the amount used this month; **questions per person and day** (default
  30). Without a configured API key the switch is disabled with a note — the key is optional config,
  so a deploy never breaks a host whose compose file has not been edited.
- The budget is checked **before every model call** (there is no per-question cap). Cost is metered
  from the token usage each call reports, priced by configured per-model rates. Used up → a humorous
  „this month I am done" line until the 1st. Daily limit reached → „morgen gern wieder".

### A conversation
- Messages arriving within a few seconds of each other are read together as one question.
- A message within **30 minutes** of the previous one continues the conversation (at most the last
  ~10 messages go to the model); after that it starts fresh.
- Questions and answers are kept **7 days**, then purged; nobody reads them in the app.
- While the model works the bot shows *schreibt…*; the answer goes out right away (1–2 s jitter),
  not behind the group posts' spacing.
- The first answer to a person says once that it is the club's AI assistant.

### The model
- `Microsoft.Extensions.AI` `IChatClient`; Mistral Large 4 on Mistral's EU platform first. Provider,
  endpoint, model id and prices are configuration.
- System prompt: German, *du*, short (1–4 lines), plenty of carnival humour, **facts exact and
  first**, WhatsApp formatting (`*fett*` for dates and times), app links to entries and events;
  what Furria does not hold it says it does not know — no general knowledge, no guessing.
- Provider failure → a short humorous apology; nothing is retried into the budget.

### The tools (read-only, run as the asker)
Every tool reuses the app's own visibility rules for the asker and returns **no other persons** —
counts instead of names. Where acting is the next step the answer links to the existing app screen.

| Tool | For | Returns |
|---|---|---|
| Club basics | everyone | name, founding year, current session, now (date, time, weekday) |
| Calendar entries | everyone | entries in a range the asker sees: title, kind, time, venue, audience, link |
| Usual training times | everyone | per group: weekday, time, duration, venue |
| Venue occupancy | everyone | is venue X free from–to; if not, what is there |
| Venues | everyone | address, note, opening hours |
| Events | everyone | published events: date, doors open, venue, teaser, presale places, link |
| Running order | everyone | an event's placed acts as positions (*Nr. 5*), never times; „can still change" while planned |
| Add-ons | everyone | of an entry or announcement, in full: Zu-/Absage and polls as counts per option + deadline + open/closed + the asker's own answer; sign-up lists as line texts without names + the asker's line; day schedule complete |
| Groups and counts | everyone | groups with sizes, number of members |
| Announcements | everyone | current announcements (title, text, valid until) |
| News | everyone | current club news |
| Beer list | everyone | stock per drink, the asker's own balance |
| My things | everyone | the asker's groups, open answers, own Zu-/Absagen |
| Event preparation | events workbench | events in preparation, **event steps** and their state, current step, published or not |
| Running order planning | running-order planners | unplaced acts, number of conflicts and hints, confirmed or not |
| Table plan | hall planners | table plan present, tables and chairs |
| My to-dos | any permission | the asker's **to-dos** as counts per kind |

## Phases
Each phase leaves the system intact (builds, tests pass) and fits a ~120k-token session.

### Phase 1 — Settings, budget and the model connection
Goal: the club can switch the assistant on and set its budget; the API can talk to the model.
- [x] `ClubAssistantSettings` (enabled, monthly budget €, questions per person/day) + migration
- [x] Optional config `ClubAssistant` (provider endpoint, API key, model id, € per 1M input/cached/output tokens); `IChatClient` registered only when a key is set
- [x] Budget ledger: per-call usage rows (tokens, €) and the month's sum; check-before-call service
- [x] Endpoints: read/update the settings incl. used-this-month and „key configured" (admins)
- [x] Club app: System → WhatsApp → *Vereinsassistent* section (switch, budget, used, daily limit; disabled without key)
- [x] Tests: budget arithmetic and month rollover, settings permissions

### Phase 2 — Private messages in, gate replies out
Goal: the bot receives private text messages and answers every case that needs no model.
- [x] WAHA `message` webhook subscribed; inbox applies only private-chat messages not sent by the bot
- [x] Sender → person via **WhatsApp match**, affiliation check
- [x] Gate replies: unknown/unaffiliated (once a day per number), switched off, non-text, daily limit reached, budget used up
- [x] Outbox: private reply operation sent right away with 1–2 s jitter, outside the group spacing; *schreibt…* indicator
- [x] Conversation store: messages per person, quick successive messages merged, 30-minute continuation, 7-day purge
- [x] Tests: gating decisions, merging and continuation rules, daily limit, purge
- Built 2026-11-24: `message` added to `WHATSAPP_HOOK_EVENTS` (live compose edit owed, needs approval); group/own/empty messages are dropped before the inbox. Gate notices go out at most once per club day per number and kind (non-text: once per 30 min); the switched-off line goes to any sender. Merge window 8 s; private replies run in their own outbox lane and job (*Private WhatsApp-Antworten senden*) with best-effort typing, sharing only the rate back-off with the group lane.

### Phase 3 — The answer loop and the first tools
Goal: matched members get real answers about the calendar and training.
- [x] Assistant loop over `IChatClient` with function tools; budget check before each call, usage booked after
- [x] Answer worker takes a question once its last message is older than the merge window; the answer is written only if `last_message_at` is unchanged (a message merged during the model call re-asks), never holding the row lock across the model call; typing indicator while the model works
- [x] System prompt (German, *du*, humour, facts first, WhatsApp formatting, links, „weiß ich nicht"), one-time AI disclosure per person
- [x] Tool context: the asker's visibility (person, groups, permissions) resolved once per question
- [x] Tools: club basics, calendar entries, usual training times
- [x] Provider errors → apology line, no retry
- [x] Tests: tools return only what the asker may see; budget stop mid-question
- Built 2026-11-24: answer worker *Fragen an den Vereinsassistenten beantworten* (every 2 s, woken on saves); own loop (≤ 6 model calls) instead of automatic function invocation so the budget is checked before and booked after every call; the OpenAI client's retry policy is off. The disclosure line goes before the first reply per person (kept in `club_assistant_acquaintance`, not purged). Visibility is resolved per person (`PermissionAuthorizer.GrantedKeysOfPersonAsync`), so askers without an account get what their memberships and groups show; calendar entries go through the app's own `VisibleTo` + ties rules. *Usual training times* returns the occurrences in a range (weekday, time, duration, venue), skipping days with a planned training. Tool results go to the model as compact JSON with club wall-clock dates and times, never UTC; people audiences read *ausgewählte Personen*.

### Phase 4 — Venues, events, groups, announcements, news
Goal: the everyday club questions are covered.
- [x] Tools: venues, venue occupancy (reusing the venue collision rule), events, running order (positions only)
- [x] Tools: groups and counts, announcements, news
- [x] Tests: occupancy answers, running order never carries times, unpublished events stay hidden
- Built 2026-11-25: *Venue occupancy* takes a venue name (folded match), a day and a from/to wall-clock time (no end = that minute only; a bare hour like „9" reads 09:00; a venue name matching several venues is refused with the list); it applies the collision overlap to **all** entries at the venue, lists those the asker sees and counts the rest as `otherBookings` (busy, no details), and also counts usual trainings at that venue. *Events* = the website's published, not yet over events with presale places shown as on the website; *running order* only for such an event, acts as `Nr.` positions (asker's own marked), `mayStillChange` until confirmed; no placed act yet reads „noch kein Auftritt". *Groups* = the app's group list with member counts plus the club's member count, no names. *Announcements* = unexpired ones; person mentions read *ein Mitglied*. *News* = the 5 newest published posts (title, teaser, rubric, app link).

### Phase 5 — Add-ons, my things, beer list
Goal: everything attached to an entry or announcement is answerable, without names.
- [ ] Add-ons tool: Zu-/Absage, polls (named and anonymous), sign-up list, day schedule — counts and line texts, no names, the asker's own answer
- [ ] My things tool: my groups, open answers, own Zu-/Absagen
- [ ] Beer list tool: stock per drink, own balance
- [ ] Tests: no person name in any add-on output, own answer present

### Phase 6 — Management knowledge
Goal: permission holders get their extra knowledge, still without names.
- [ ] Tools offered only when the asker holds the permission: event preparation (event steps, current step), running order planning, table plan, my to-dos as counts
- [ ] Tests: tools absent without the permission, counts only

### Phase 7 — Rollout
Goal: ready to switch on.
- [ ] Website privacy page: section *Vereinsassistent* (Mistral AI, EU; 7 days; no third-party personal data; legitimate interest)
- [ ] Ops docs: config keys, prices, how to switch on; live compose edit listed as owed (needs approval)
- [ ] Manual eval script with ~30 real German questions and expected facts (run on demand, costs cents)
- [ ] Device check: DM the bot from a member phone and an unknown phone

## Risks & alternatives
- **Wrong answers.** An LLM may misread a date or a tool result. Mitigated by exact tool data, „facts
  first", „say you don't know", and the eval script; no 👎 feedback by ruling.
- **Prompt injection.** Tools only read and only return what the asker may see, so the worst case is
  the asker learning what she could see in the app anyway.
- **Ban risk.** Answering private messages a person started is far below starting chats; still
  spaced and never in groups (ADR-0042 amendment).
- **Cost runaway.** Budget checked before every model call; per-person daily limit.
- **Considered and rejected:** Jev (decision-only, cannot extract dates or write replies);
  self-hosted model (quality and hardware); answering in the group; actions such as booking a venue;
  names for managers; a per-question cap; feedback reactions.

## Out of scope
- Actions (booking, answering add-ons, creating entries) — a later RFC with confirmation turns.
- Questions about other persons (names, contact details, birthdays, who answered what).
- Voice messages (transcription), pictures.
- A conversation history screen.
