# An add-on has one host and may be shown elsewhere

Aushänge gained the calendar's add-ons (grilled 2026-11-12): their own Zu-/Absage, polls and
sign-up lists, and a calendar entry's add-ons taken over so members answer them on the Aushang.
**Every add-on row has exactly one host — a calendar entry or an announcement (two nullable
foreign keys, a check constraint that exactly one is set) — in the same tables for both hosts.
Taking an entry's add-on over is a link row (announcement → add-on, position), never a copy.**
The host alone decides who the add-on concerns, who manages it and when it closes; calendar-only
rules (the cast, answers recorded on behalf, the owed horizon) apply only when the host is an
entry. The classes drop their `Calendar` prefix (`Poll`, `SignUpList`); an announcement's
Zu-/Absage answers sit beside the entry's attendance responses under the same one-host rule.

## Considered options

- **Copy on take-over** — rejected: two result sets for one question, and a Zu-/Absage only means
  something on its entry (Start, open spots and cast marks read it there).
- **Separate tables per host** (`announcement_poll` …) — rejected: every rule (closing, reopen,
  anonymity, reminders, Start's open answers) would be built twice and drift.
- **A host-neutral add-on set both point to** — rejected: one more indirection for two hosts, and
  the host's rules still have to be looked up per add-on.

## Consequences

- An entry's add-on shown on an Aushang can be answered by a member who sees the Aushang only if
  the entry lets her; others see results. Only entries every member can see may lend add-ons, so
  nothing private leaks onto the club-wide board.
- Withdrawing an Aushang deletes its own add-ons and their answers; taken-over ones stay on their entry.
