---
title: Mitglied werden
slug: membership-funnel
type: capability
status: idea
mock: docs/design/fcc-ds-landing.jsx
adrs: []
---

## What & Why

The "Mitglied werden" funnel: turns an interested visitor into a prospective member. The
destination of the home [Mitmachen-Band](feature-mitmachen-band.md). Explains what membership
means (Mitgliedschaftsart tiers, Beitrag ≈ 30 € / 15 € Jugend, the Gruppen you can join) and
captures an application/contact.

## Scope / Slices

- Info page: why join, the Gruppen, Mitgliedschaftsarten + Beitrag, what to expect.
- Application/contact form → submitted to the club (backend or email).
- Confirmation + what-happens-next.

## Decisions

- Uses glossary terms precisely: **Mitgliedschaft** / **Mitgliedschaftsart** (Aktiv / Passiv /
  Jugend / Ehren), **Beitrag** — never "subscription".
- **Mitglied ≠ Account:** joining the club is *not* creating a login. Onboarding to the app is
  a separate, **invite-only** step (Einladung) handled in the Club-App — the website funnel is
  about becoming a Person/Mitglied, not getting an app account.

## Open Questions

- Does the form create a provisional **Person** record via the backend, or just send a
  notification/email to the Geschäftsführer for manual entry?
- Which fields are collected (name, contact, interest in a Gruppe, Mitgliedschaftsart)?
- Any data-protection / consent copy required at submission (DSGVO).

## Done When

- A visitor understands membership and can submit an application that reaches the club, with a
  clear confirmation.

## References

- `CONTEXT.md` (Mitgliedschaft, Mitgliedschaftsart, Account, Einladung, Beitrag).
- Design README §6 (Mitglied ≠ Account; invite-only onboarding). Mock: `MitmachenBand`.
