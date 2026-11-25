# The club assistant reads club data through an outside LLM, answering only

Members want to ask the bot plain questions ("Hat heute jemand Training?", "Ist der Vereinsraum
Samstag um 14 Uhr frei?"), so the **club assistant** hands each private message to a hosted LLM
that answers by calling read-only tools over the club's data, each run with the asker's own
visibility. We chose a mid-tier model from an EU provider (Mistral on its EU platform — Small 4 without
thinking since 2026-11-25, Large 4 the step up — under a data processing agreement) over a self-hosted model, which a small club cannot run at that
quality, and over a decision-only model such as Jev, which cannot extract dates, times or names
from a free sentence nor write a reply. The code talks to the model only through
`Microsoft.Extensions.AI`'s `IChatClient`, so the provider is configuration, not code.

## Consequences

- The tools only read and never change anything. A model that can act would need confirmation
  turns and makes a prompt injection able to change data, not just reveal it. Where acting is the
  next step, the answer links to the app screen.
- The tools never return other persons — no names, contact details, birthdays or who answered
  what — so what leaves for the provider is club matters, counts and the asker's own data. This
  keeps the privacy statement simple and limits any leak to what the asker could see anyway.
- Cost is bounded by the club's monthly budget, which is checked before every model call, and by a
  daily number of questions per person. There is no per-question cap.
- The API key is optional configuration: without it the club switch is greyed out, so a deploy
  never breaks a host whose compose file has not been edited yet.
- Text only: voice messages and pictures are not sent to the provider.
