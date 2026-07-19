---
title: Verein
slug: about-verein
type: capability
status: idea
mock: -
adrs: []
---

## What & Why

Presents who the FCC is to the public: the story (Furrscher Carnevals Club e.V.,
Großbesenstadt, est. 1971), the people (Ämter / Vorstand), and the **Gruppen showcase**
(Tanzgarde, Männerballett, Elferrat, Spielmannszug, …). This is how a visitor — especially a
prospective member — understands and trusts the club.

## Scope / Slices

- Verein story / history section.
- Ämter presentation (public-facing, e.g. Präsident, Geschäftsführer) — read-only.
- Gruppen showcase: each group with title, photo, short description.

## Decisions

- Uses the identity glossary: **Amt** = office (fixed set), **Gruppe** = performing unit.
  No "Vorstand super-role" framing.
- Public, read-only — no member/personal data.

## Open Questions

- Is Gruppen/Ämter content **static** copy or pulled live from the backend (the Club-App
  already manages groups & roles)?
- One long page vs. sub-routes (`/verein`, `/verein/gruppen`)?
- Which Ämter are shown publicly, and with names/photos or roles only (consent)?

## Done When

- `/verein` tells the club's story and showcases its Gruppen, responsive, light + dark.

## References

- `CONTEXT.md` (Amt, Gruppe, Mitgliedschaftsart). Design README §6 (identity model).
