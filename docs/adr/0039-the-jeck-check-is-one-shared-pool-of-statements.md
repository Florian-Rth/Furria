# The Jeck-Check is one shared pool of statements, not questions per group

The website's **Jeck-Check** (`GroupMatcher`) used a seeded question list and seeded groups. It now
runs on the app's real groups, and each group maintains its part from its own group page. Decided
2026-11-11 (grilling with Florian).

## The decision

- **One club-wide pool of statements.** Group admins *propose* statements. Whoever holds
  `group_matcher.manage` approves, rewords, orders, rejects or deletes them, and keeps at most
  **ten** approved. Only approved statements reach the website, and every group takes a stance on
  every one (yes / neutral / no, plus importance 1–3). Rewording keeps the stances already taken
  and flags the statement as changed for each group. A rejected proposal carries no reason.
- **Age is a fixed knock-out question, not a statement.** The club-wide age bands are fixed in
  code. Each group ticks the *admission ages* it takes people from, and a group that ticked none is
  never knocked out. Admission ages belong to the Jeck-Check only and never appear on the group
  profile. This is not the *age group* ruled out on 2026-09-21: they describe who a group takes in,
  not how old its people are.
- **Taking part is automatic.** A group is in once it has answered every approved statement, and a
  statement approved later never pushes it out (it just does not count until answered). There is
  no switch, so a group that does not want to appear never answers. The website leaves the
  Jeck-Check out while fewer than two groups take part or no statement is approved. Archived groups
  drop out and keep their stances.

## Considered and rejected

- **Questions per group** (each group writes and owns its own questions): the visitor would answer
  every group's questions (8 groups × 5 = 40), and no two groups would ever answer the same one, so
  the result could not compare them.
- **A club-only list that groups merely answer**: works, but takes the authoring away from the
  groups, which was the point of the request.
- **Free-for-all or group-owned statements in the shared pool**: every statement is public copy that
  every group must answer, so one group could create work for all and publish unreviewed jokes, and
  the first groups to act would fill the cap.
- **Opt-in switch / strict completeness**: an opt-in switch was rejected in favour of automatic
  taking part. Strict completeness would make one newly approved statement empty the website's
  Jeck-Check overnight.
