# The Jeck-Check is one shared pool of statements, not questions per group

The website's **Jeck-Check** (`GroupMatcher`) used a seeded question list and seeded groups. It now
runs on the app's real groups, and each group maintains its part from its own group page. Decided
2026-11-11 (grilling with Florian). Revised the same day: groups no longer propose statements —
the club writes the pool alone.

## The decision

- **One club-wide pool of statements, written by the club.** Whoever holds
  `group_matcher.manage` adds, rewords, orders and deletes statements, and keeps at most **ten**
  in the pool. Every statement in the pool reaches the website, and every group takes a stance on
  every one (yes / neutral / no, plus importance 1–3). Rewording keeps the stances already taken
  and flags the statement as changed for each group. Groups maintain their stances and admission
  ages, not the statements.
- **Age is a fixed knock-out question, not a statement.** The club-wide age bands are fixed in
  code. Each group ticks the *admission ages* it takes people from, and a group that ticked none is
  never knocked out. Admission ages belong to the Jeck-Check only and never appear on the group
  profile. This is not the *age group* ruled out on 2026-09-21: they describe who a group takes in,
  not how old its people are.
- **Taking part is automatic.** A group is in once it has answered every statement, and a
  statement added later never pushes it out (it just does not count until answered). There is
  no switch, so a group that does not want to appear never answers. The website leaves the
  Jeck-Check out while fewer than two groups take part or the pool is empty. Archived groups
  drop out and keep their stances.

## Considered and rejected

- **Questions per group** (each group writes and owns its own questions): the visitor would answer
  every group's questions (8 groups × 5 = 40), and no two groups would ever answer the same one, so
  the result could not compare them.
- **Groups propose, the club approves or rejects** (the first version of this decision): built,
  then dropped the same day. A proposal queue adds a review workflow and states (proposed,
  rejected) for little gain; the club writes the few statements itself.
- **Free-for-all or group-owned statements in the shared pool**: every statement is public copy that
  every group must answer, so one group could create work for all and publish unreviewed jokes, and
  the first groups to act would fill the cap.
- **Opt-in switch / strict completeness**: an opt-in switch was rejected in favour of automatic
  taking part. Strict completeness would make one newly approved statement empty the website's
  Jeck-Check overnight.
