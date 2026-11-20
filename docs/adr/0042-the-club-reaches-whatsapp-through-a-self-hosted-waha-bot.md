# The club reaches WhatsApp through a self-hosted WAHA bot

Almost every member is in the club's WhatsApp group, far fewer use the club app, so notifying an
entry or announcement must also reach that group — and answers given there must flow back into
the app's add-ons. We drive a dedicated club number as a linked device through a self-hosted WAHA
container (GOWS engine, the only one that sends WhatsApp event messages), not through Meta's
official Business/Cloud API: the group already exists as an ordinary group the club's admins run,
polls and their votes must work inside it, and the bot must be able to add consenting members as
a group admin — none of which the official API offers a small club. We accept that this uses the
unofficial linked-device protocol: a ban would cost the bot's number, never a person's, which is
why the number is dedicated and the bot only posts into the one existing group, spaced out, and
never writes to anyone directly.

## Consequences

- Each channel keeps its own outbox on the shared wake-up and retry machinery (mail, push, now
  WhatsApp); they are not merged into one table, because payload, retry rules and fan-out differ.
  The WhatsApp outbox sends strictly one operation at a time per group with a jittered gap.
- What was posted is kept apart from the outbox: a lasting record ties each host and add-on to its
  WhatsApp message (and poll options), which edits, replies, deletes and vote mapping need.
- WAHA's webhooks land in an inbox first (HMAC-checked, de-duplicated by request id) and are
  applied idempotently and order-tolerantly; a vote carries the voter's whole current selection.
- WhatsApp's own limits shape the behaviour: an edit only within ~15 minutes, a delete only within
  ~2 days, no editable polls, no hidden voters — so anonymous polls and sign-up lists stay in the
  app, and changes after the fact are told as replies.
- The session must persist across restarts; a lost session loses the keys to decrypt votes on
  polls already posted.
