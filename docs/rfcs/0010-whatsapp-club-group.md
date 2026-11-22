---
rfc: 0010
title: The club group on WhatsApp
status: in-progress
github_issue: 100
branch: feat/rfc-100-whatsapp-club-group
created: 2026-11-20
---

# RFC 0010: The club group on WhatsApp

## Summary
Almost every member is in the club's WhatsApp group; far fewer use the club app. A **bot** — a
dedicated club number driven through a self-hosted **WAHA** container (GOWS engine) — joins that
group as an admin. **Notifying** (*Benachrichtigen*) an Aushang or a calendar entry for the club
now also posts it into the group as a **WhatsApp post**, its answerable add-ons as native
WhatsApp polls and events, and answers given there flow back into the app's add-ons by **WhatsApp
match** on the contact phone. With **Group keeping** (*Vereinsgruppe verwalten*) switched on, the
bot also adds active members who gave their **Group consent**. Grilled 2026-11-20; decisions:
[ADR-0042](../adr/0042-the-club-reaches-whatsapp-through-a-self-hosted-waha-bot.md); terms:
`CONTEXT.md` → *Linked WhatsApp group*, *WhatsApp post*, *WhatsApp match*, *Group keeping*,
*Group consent*, *Notifying*.

## Motivation
Push only reaches members who installed the app. Everything the board writes in the app —
notices, events, polls, sign-up lists — stays invisible to most of the club unless someone
copies it into WhatsApp by hand, and answers given there never reach the app. One write in the
app should reach everyone where they already are, and their answers should land in one place.

## Proposal

### The bot and its connection
- WAHA (free image, GOWS engine) runs beside the API with no public port; the API calls it
  internally with an API key, WAHA posts webhooks back internally, HMAC-signed. Its session
  storage is a persistent volume (a lost session cannot decrypt votes on polls already posted).
- **System → WhatsApp** (admins only): link the bot by QR or pairing code, see the session state
  (*verbunden / getrennt*), pick the **club group** from the bot's groups, switch **Group keeping**,
  see the WhatsApp outbox with failed operations and the list *Hinzufügen blockiert*.
- When the session drops, admins get a push; operations wait in the outbox until it is back.

### Linked WhatsApp groups
A linked group stands for one **audience**: the club group for the club, later one per app group.
The model carries the link from the start (`LinkedWhatsAppGroup`: chat id, audience = club or a
group id); v1 offers only the club group. Audience *Ausgewählte Personen* never reaches WhatsApp.

### Outbox, post record, inbox (ADR-0042)
- **WhatsApp outbox** (`outbox_whatsapp`) on the shared `OutboxSignal` / `OutboxWakeUp` machinery:
  one row per operation (post text, post image, send poll, send event, reply, edit, delete,
  add participant). A dispatcher sends **strictly one operation at a time per chat** with a
  jittered gap and its own retry schedule; WhatsApp rate signals (463/475) back off, never re-pair.
- **Post record** (`WhatsAppMessage`): ties a host (announcement / calendar entry) and each of its
  add-ons to the WhatsApp message id, and a poll to its posted option texts. Edits, replies,
  deletes and vote mapping read it. It outlives the outbox row.
- **Inbox** (`inbox_whatsapp`): the webhook endpoint verifies `X-Webhook-Hmac`, stores the raw
  event de-duplicated by `X-Webhook-Request-Id`, answers 200; a worker applies it idempotently and
  order-tolerantly (latest timestamp per voter wins; a vote carries the whole current selection).

### What notifying posts
Notifying an Aushang, or a calendar entry with audience *Verein*, enqueues besides the push:
1. **The post** — an image with caption when the host has a picture, else text: bold title, the
   date line for entries (*Sa 12.6. · 15:00 Uhr · Vereinsheim*), the body translated from the news
   text subset to WhatsApp formatting, a small author hint, the app deep link. A mentioned person
   becomes a real @mention when her phone matches, otherwise her name; other mentions become names.
2. **One message per answerable own add-on**, in the author's order:

| Add-on | In the group | Answers flow back |
|---|---|---|
| Zu-/Absage of a calendar entry | WhatsApp event (title, start/end, place) | Going / Not going / Maybe |
| Zu-/Absage of an Aushang | poll *Ja / Nein / Vielleicht*, single choice | yes |
| Named poll | poll with the same answers, single/multiple choice | yes |
| Anonymous poll | line *Anonym abstimmen: link* | app only |
| Sign-up list | line *Eintragen: link* | app only |
| Day schedule | text lines in the post | — |
| Participating groups | one line in the post | — |

A deadline (votes until, answers until, sign up until) is named in the message: after the poll question as *(bis Fr 4.12. · 18:00 Uhr)*, in a link line as its own line *Bis …*.

Taken-over add-ons are not posted again; the Aushang post names them with the app link. The
editor's reach line names the group: *Push an 42 · WhatsApp-Gruppe*. Reminders stay push-only.

### Answers coming back
- The sender's number (resolving a LID through WAHA) is normalised to E.164 (German default) and
  matched against the contact **phone**; exactly one person must carry it.
- A matched answer becomes her own answer, marked as given through WhatsApp; the latest answer
  wins across app and WhatsApp, as everywhere. If she may not answer the add-on (paused, outside
  the audience) it counts for nothing.
- An **unassigned** sender's answer counts for nobody; the add-on's organiser sees it by WhatsApp
  name in the result view. Nothing is applied later when a number appears.
- Answers after the add-on closed count for nothing; `poll.vote.failed` is logged only. The
  sender gets one private message per add-on (*Die Abstimmung „…“ ist schon beendet. Deine
  Antwort wurde nicht übernommen.* + app link) — never a reply in the group (ADR-0042 amended
  2026-11-22).
- The phone field says it is the number WhatsApp is matched with.

### Keeping the post in step
| In the app | In the group |
|---|---|
| Text edited | edit the post within ~15 min, else nothing |
| Entry moved in time or place | reply *Verschoben: …* |
| Entry deleted | delete for everyone within ~2 days, else reply *Abgesagt* |
| Aushang withdrawn | delete for everyone within ~2 days, else nothing (no reply) |
| Poll / Zu-/Absage closes | reply with the result (counts) |
| A poll's answers change (added, or an unchosen one changed/removed) | delete the old poll, post a new one; app votes stay |

### Group keeping and consent
- Club switch **Group keeping**, off by default, in System → WhatsApp. Off: post and read only.
- **Group consent** per person, no by default: she sets it in her profile, in Welcome and in the
  Neuzugang wizard; for a person without an account a manager sets it on her word.
- While on, the bot adds every active member with consent and a phone who is not in the group, one
  at a time, spaced. It only ever adds; withdrawing consent removes nobody.
- When her WhatsApp refuses the add, the bot never writes to her: the app shows her a Start card
  with the invite link; managers see her in *Hinzufügen blockiert* to hand it over personally.
- Group membership is read from WAHA (participants, `group.v2.participants` events).

## Phases
Each phase leaves the system intact (builds, tests green, no half-done migration) and fits a
~120k-token session.

### Phase 1 — WAHA beside the API, the inbox and the session
Goal: the API talks to a linked WAHA session and stores its webhooks; nothing is posted yet.
- [x] Dev compose: WAHA (GOWS) service with persistent session volume, API key and webhook HMAC key; `WhatsAppOptions` (base URL, API key, HMAC key, session) — API starts without it configured (feature off)
- [x] `WahaClient` (typed HTTP client): session start/status/QR/pairing code, groups list, send text/image/poll/event, reply, edit, delete, participants add/list, LID lookup
- [x] Webhook endpoint: HMAC check, `inbox_whatsapp` row de-duplicated by request id, 200 — tests first
- [x] Inbox worker on the background-job registry; `session.status` tracked; admins pushed when the session drops
- [x] `LinkedWhatsAppGroup` (chat id, audience club / group id) with a unique club link; service to pick the club group
- [x] ADR-0042 and CONTEXT terms committed with the phase

### Phase 2 — System → WhatsApp
Goal: an admin links the bot and picks the club group from the club app.
- [x] Endpoints the screen needs: session state, start linking (QR / pairing code), the bot's groups, pick club group
- [x] Club app route `/system/whatsapp` (child of System): link flow, state, club-group picker
- [x] Browser check on phone size against a real WAHA session — linking flow up to the live QR checked 2026-11-20; linked 2026-11-22 (bot on a WhatsApp Business landline account, QR scanned from a second screen), connected state and club-group pick checked

### Phase 3 — The WhatsApp outbox and the post
Goal: notifying a club-audience Aushang or entry posts it into the club group.
- [x] `outbox_whatsapp` + dispatcher: one operation per chat at a time, jittered gap, retry schedule, back-off on rate signals; shown on the System page like the mail outbox (area *WhatsApp-Versand*)
- [x] `WhatsAppMessage` post record per host
- [x] Notifying enqueues the post in the same transaction as the pushes (Aushang; entry with audience club) — tests first
- [x] Post rendering (pure, tested): title, date line, news subset → WhatsApp formatting, day schedule and participating groups lines, author hint, deep link; text post only — no host carries a picture when it is notified (an Aushang has none, an entry's event picture comes later), so the image post waits for a host that has one
- [x] Mentions: matched phone → @mention, else name
- [x] Web: reach line names the WhatsApp group when the club group is linked (`GET whatsapp/reach`)

### Phase 4 — Add-ons in the group
Goal: answerable add-ons follow the post as polls, events and links.
- [x] Per add-on message in the author's order: entry Zu-/Absage → event; Aushang Zu-/Absage → Ja/Nein/Vielleicht poll (question = the Aushang's title); named poll → poll; anonymous poll / sign-up list → link line (*Anonym abstimmen: **Frage*** / *Eintragen: **Titel*** + the host's app link) — tests first
- [x] Post record per add-on (kind, add-on id) with the posted poll option texts and their option ids (phase 5 maps a vote by index, so a renamed answer still matches); a poll beyond WhatsApp's limits (> 12 answers or an answer > 100 characters) goes as an *Abstimmen* link line instead
- [x] Taken-over add-ons named in the Aushang post as lines (*Abstimmen / Anonym abstimmen / Eintragen / Zu-/Absage: **Name*** + the lending entry's app link), not posted

### Phase 5 — Answers flow back
Goal: votes and event responses in the group become app answers.
- [x] Phone normalisation to E.164 (German default) and single-person match among non-archived people; LID → phone through WAHA, resolved before any row lock — tests first
- [x] `poll.vote` → poll votes / Aushang Zu-/Absage; `event.response` → attendance; latest timestamp wins; eligibility and closing respected; answer marked as given through WhatsApp; the answer time is the vote's own, capped at receipt; a vote naming no posted answer counts for nothing (only an emptied selection withdraws, and only a WhatsApp-given answer)
- [x] Unassigned answers stored per add-on with WhatsApp name; organiser's result view shows them
- [x] Web: result view lists *nicht zugeordnet*; answer source shown; phone field hint *wird mit WhatsApp abgeglichen*

### Phase 6 — Keeping the post in step
Goal: changes in the app are told in the group.
- [x] Edit within ~15 min (14 min with margin; a waiting post is rewritten instead); moved → reply *Verschoben: date line*; deleted / withdrawn → delete within ~2 days else reply *Abgesagt* (a withdrawn Aushang gets no reply) — tests first. An entry's edit renders the editor as author hint (entries carry no author); an entry narrowed away from *Verein* is no longer kept in step
- [x] Close (by time or by hand) → result reply with counts (native polls and Zu-/Absage only; anonymous and linked polls stay app only), staged by the dispatcher each round; reopen posts nothing, a later close tells again
- [x] Changed poll answers → delete old poll (else reply *Ersetzt*), post new one, re-point the post record (its WhatsApp answers dropped); a removed add-on's message is deleted within ~2 days, else left without a reply. Add-ons added after the post are not posted
- [x] Undelivered operations of a withdrawn host are dropped like its pushes
- [x] WhatsApp answers (`whatsapp_answer`, incl. unassigned senders' name and phone) go with their host or add-on

### Phase 7 — Group keeping (server)
Goal: with the switch on, the bot adds consenting active members.
- [x] Group consent on the person (migration, default no); she sets it (`PUT auth/me/club-group-consent`, also on the QR-Anmeldung form, taken over on *Das ist sie*), a manager on her word only for a person without an account (`PUT manage/persons/{id}/club-group-consent`, else 409); withdrawing drops a queued add — tests first
- [x] Group keeping switch on the club link (`PUT system/whatsapp/group-keeping`; off drops queued adds; picking a different club group switches it off) and the group's participants read from WAHA (each pass) + `group.v2.participants` joins
- [x] Add pass (dispatcher, every 10 min, at most 3 adds, own outbox lane so adds never hold up posts): active, consent, phone, not in group → add-participant operation; per person and number the bot tries once (`whatsapp_group_add`: requested / in group / refused) — someone who was in the group is never re-added, a refused add waits for her join, a failed-for-good add is not retried; refusal parsed from WAHA's per-participant error code (403 etc., to verify on device)
- [x] Endpoints the club app needs: consent (above), switch, `GET system/whatsapp` carries the switch, invite link and *Hinzufügen blockiert*; `GET start` carries `clubGroupInviteLink` while her add is refused

### Phase 8 — Group keeping (club app) and rollout
Goal: members consent in the app, managers see blocked adds, production runs the bot.
- [x] Consent switch in her profile (*WhatsApp*), a consent question after the Welcome poster (asked only when the poster plays and she has not consented), a switch on the QR-Anmeldung form; manager switch on the person page, editable only for a person without account (*Sie entscheidet das selbst in der App* otherwise)
- [x] Start card *Tritt der Vereinsgruppe bei* with the invite link when her add was refused (also shown when Start has no panels)
- [x] System → WhatsApp: *Vereinsgruppe verwalten* switch with the invite link, and *Hinzufügen blockiert* (name, number, since, links to the person) once a club group is picked
- [x] `docs/ops`: WAHA in production (`waha` in the example compose, no port, pinned image, keys in `.env`; both app nginx answer `/api/whatsapp/webhook` with 404), session linking, backup and restore of the session volume (`backup.example.sh`), what to do on a logout or a ban
- [ ] Production compose edit on the live host (with Florian's approval)
- [ ] Device checks on a test group: post, poll, event, vote back, edit/move/close, add with and without privacy block — all but the add checked 2026-11-22, see *Device checks* below

### Device checks (2026-11-22)
Dev stack (`scripts/dev.sh` now runs WAHA and binds the API to the docker gateway so webhooks
arrive), bot on a WhatsApp Business account, test group *Furria Dev Test Gruppe*, posts made as
Florian's dev account.

| # | Case | Result |
|---|---|---|
| 1 | Club entry, one day, venue → text post | ✅ |
| 2 | Entry over several days (trip) → date line with both ends | ✅ |
| 3 | Aushang with heading, bold, list, link, escapes → WhatsApp formatting | ✅ after the escape fix |
| 4 | Mentions: person with phone → real @mention, without → name, group → name | ✅ |
| 5 | Day schedule and participating groups in the post | ✅ |
| 6 | Post with a picture | — no host carries a picture yet |
| 7 | Aushang taking over an entry's Zu-/Absage and poll → named lines, nothing reposted | ✅ |
| 8 | Entry with Zu-/Absage → WhatsApp event | ✅ (WhatsApp counts the bot as host *Zugesagt*; the app ignores it) |
| 9 | Aushang Zu-/Absage → poll *Ja / Nein / Vielleicht*, single choice | ✅ |
| 10 | Named polls, single and multiple choice | ✅ |
| 11 | Anonymous poll, poll over 12 answers, sign-up list → link messages | ✅ |
| 12 | Votes back: own answer, changed vote, unassigned sender, vote after closing | ✅ |
| 13 | Edit within 15 min → post edited; later → nothing | ✅ |
| 14 | Entry moved → reply *Verschoben* | ✅ |
| 15 | Delete within 2 days → deleted; entry later → *Abgesagt*; Aushang later → nothing | ✅ |
| 16 | Poll and Zu-/Absage closed → result reply with counts | ✅ |
| 17 | Poll answers changed: within 2 days old poll deleted, later reply *Neue Abstimmung*; new poll posted | ✅ |
| 18 | Group keeping: add, add refused by privacy | owed — needs real test numbers |
| 19 | Session stopped → admins pushed, posts wait, sent after reconnect | ✅ (push checked in the log; dev app has no HTTPS push) |
| 20 | Vote after closing (Zu-/Absage and poll) → one private message each, changed vote → none | ✅ (sender came as a LID) |

Changes made from the checks:
- [x] Every text message opens with a header line: icon + grey pill `FCC · KIND` (Termin, Training, Ausflug, Veranstaltung, Aushang, Abstimmung, Eintragsliste, Verschoben, Abgesagt, Neue Abstimmung, Ergebnis, Beendet); links start with ↗; polls and events keep WhatsApp's own look
- [x] Escaped formatting characters stay literal (`∗ ＿ ∼ ˋ` look-alikes WhatsApp never formats)
- [x] A withdrawn Aushang is deleted within ~2 days, else left without a reply; a removed add-on likewise
- [x] Deadlines (votes / answers / sign up until) named in the message: after the poll question, or as a *Bis …* line
- [x] A vote after closing is answered by one private message to the voter (`⌛ FCC · BEENDET`, what closed, *Deine Antwort wurde nicht übernommen.*, app link), once per person and add-on (`whatsapp_late_answer`); ADR-0042 amended
- [ ] Pairing code survives a reload (kept on the server while the session waits), a *Kopieren* button, one code per session; the API rejects `+49 0…` numbers — iOS reloads the page when switching to WhatsApp and the code was lost

## Risks & alternatives
- **Ban of the bot's number** (unofficial linked-device protocol). Mitigated by a dedicated number,
  posting only into the existing group, spaced sends, no direct messages except one answer to a
  person's own late vote. Losing the number loses
  the bot, never a person's account.
- **Linked device logged out** when the bot's phone stays offline too long (~14 days, to verify);
  the session-drop push and the outbox make it visible and lossless.
- **Lost session keys** make votes on earlier polls undecryptable — the session volume must persist
  and be backed up.
- **WhatsApp limits**: edits ~15 min, deletes ~2 days, polls immutable, voters never hidden — the
  design answers each with replies, reposts or app links.
- **Payloads differ per engine** — GOWS is fixed; it is the only engine with event messages.
- Rejected: Meta's official Cloud API (no ordinary group with polls and adding members for a small
  club); one merged outbox table for all channels; a WhatsApp channel/newsletter (one-way, no
  polls); a separate WhatsApp number per person; a manager's quick action to assign a number.

## Out of scope
- Linking app groups' own WhatsApp groups (model ready, UI later).
- Reminders, a weekly digest, read stats in WhatsApp; admin-only writing; a join-request gate.
- Removing anyone from the group, also on archiving.
- Direct messages to anyone, except the one private notice on a late answer; reading or answering
  chat messages.
