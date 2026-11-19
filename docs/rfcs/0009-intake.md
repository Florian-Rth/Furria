---
rfc: 0009
title: Intake — a new person fills in her own record from a QR
status: in-progress
github_issue: 97
branch: feat/rfc-97-intake
created: 2026-11-19
---

# RFC 0009: Intake — a new person fills in her own record from a QR

## Summary

A **Neuzugang** (`Intake`) lets someone who manages persons — or a group admin for her own
groups — bring a new person into the registry in seconds: she decides only what the club decides
(member yes/no and from when, which groups, an optional *Für wen?* label), shows a QR or shares a
link, and the newcomer types her own details on her phone without installing anything. On submit
the person, membership and group memberships are created, the invitation goes out when she gave an
email and is eligible, and the starter is told by push. An overview at `/manage/intakes` lists every
intake and its state. Grilled 2026-11-19; the domain rules are the **Intake** entry in `CONTEXT.md`
and [ADR-0041](../adr/0041-an-intake-invites-on-its-starters-decision.md).

## Motivation

Today a board member adds a person by hand, types her data from a paper form or dictation, then
opens a membership, adds group memberships and invites her — four screens, someone else's typos,
and trainers can't do it at all. Group-only dancers (children's guard, non-member dancers) are the
largest group missing from the registry, and their trainers are the ones who meet them. The
newcomer is standing next to the manager with her phone; she should type her own record.

## Proposal

### Domain (see `CONTEXT.md` › Intake for the binding wording)

- **Starter's decision:** `MemberFrom: DateOnly?` (null = no membership; default today, past or
  future allowed), `GroupIds` (0..n), `Label` (*Für wen?*, optional, max 80). At least one
  affiliation: a membership or a group.
- **Who:** `persons.manage` — any intake. A **group admin** — only groups she runs, never
  `MemberFrom`. Visibility follows the same scope (`persons.manage` all; group admin those that
  touch one of her groups). Edit/renew/discard/show-link: the starter or `persons.manage`.
- **States** (derived where possible): *offen* (link live), *abgelaufen* (past 7 days, undecided),
  *zu prüfen* (submitted, match found), *abgeschlossen* (person made / chosen), *verworfen*.
- **Intake link** — bearer secret exactly like the upload link
  ([ADR-0034](../adr/0034-an-upload-link-is-a-bearer-secret-with-its-own-inbox.md)): seed + token
  hash, token re-derived for showing again, carried in the URL fragment
  `https://app.<club-domain>/intake#<token>`, sent to the API in a header/body, never in a URL.
  Open 7 days, used once; **renew** issues a new seed (old link void, decision kept).
- **Newcomer's form:** first/last name and birth date always; street/zip/city when `MemberFrom`
  is set; phone, email (*für die App*), contact visible to members (default off), portrait —
  optional. No age or guardian questions.
- **Completion:** if no person shares her email (normalized) or her name + birth date → create
  person, membership from `MemberFrom` (recording *came from intake, started by X*), group
  memberships from today, contact change stamped as her own. Otherwise → *zu prüfen*; a decider
  picks *Das ist sie* (fill only empty fields, open membership unless one runs, add missing group
  memberships; *Mitglied seit* untouched) or *Neue Person*. The newcomer never learns of a match.
- **Invitation** (ADR-0041): on completion, when she gave an email and `AccountEligibilityQuery`
  says eligible (age of consent from `ClubRecord`, nothing hard-coded), issue a mail invitation with
  the **starter** as issuer — also for a group admin's intake. The submit response on the
  auto-created path carries the in-person redemption code so the *Fertig* screen can offer
  **App jetzt einrichten** straight into the existing invitation redemption.
- **Push** to the starter on *abgeschlossen* and *zu prüfen*.
- **Data:** her details live on the intake only until decided; afterwards the intake keeps starter,
  times, decision and the resulting person id. Expired/discarded intakes drop any submitted data.
  The submitted portrait is a media item owned by the intake until completion, then handed to the
  person; dropped with the intake otherwise.

### Surfaces

- Club app, manager: *Neuzugang anlegen* from Verein verwalten, the person register
  (`/manage/persons`) and the group hub (pre-set to that group) → form → QR + copy + share
  (Web Share API) screen. Overview `/manage/intakes`, detail `/manage/intakes/$intakeId` (QR again,
  edit, renew, discard, review with candidates).
- Club app, public: `/intake` (fragment token), exempt from the install gate; form, portrait,
  *Fertig* screen (with *App jetzt einrichten* when an invitation was issued on the spot).

## Phases

Each phase leaves the system intact and fits a ~120k-token session.

### Phase 1 — Backend: intake core
Goal: managers can start, list, view, edit, renew and discard intakes via the API; nothing public yet.
- [x] `Intake` entity + EF configuration + migration (starter, decision, label, seed, token hash, created/expires/decided/discarded, resulting person, submitted-data columns, `IntakeGroup` join)
- [x] Intake link token: seed + HMAC derivation + hash lookup, reusing the upload-link pattern
- [x] Scope rules: `persons.manage` any; group admin own groups only and no membership; visibility filter
- [x] Endpoints: start, list (state, label/name, decision, starter), detail (incl. re-derived link while open), edit decision, renew, discard
- [x] Integration tests for scope, validation (≥1 affiliation), renew voiding the old token, state derivation

Done 2026-11-19: `intake` + `intake_group` tables (row-version token, lifecycle checks), endpoints
`GET/POST /intakes`, `GET/PUT /intakes/{id}`, `POST /intakes/{id}/renew|discard`. Rulings: only an
account with a person may start one (the starter is the invitation's issuer); edit/renew only while
*offen*/*abgelaufen*; discard is idempotent and drops her details and the link seed.

### Phase 2 — Backend: completion, review, invitation
Goal: a newcomer can complete an intake through the public API end to end.
- [ ] Public lookup by token (club name, whether address is required, state) + rate limit
- [ ] Portrait upload by intake token (owned by the intake until completion)
- [ ] Submit: validation, match check (normalized email, name + birth date; indexes on `person` for both), re-check the groups are still live, auto-create person + membership (intake provenance) + group memberships, or park as *zu prüfen*; race-free against renew/discard via the intake's `Version` token
- [ ] Review endpoints: candidates, *Das ist sie* (fill gaps, membership unless running, missing groups), *Neue Person*
- [ ] Invitation on completion with the starter as issuer when email + eligible (ClubRecord age of consent); in-person code returned for *App jetzt einrichten*
- [ ] Push to the starter on completed / needs review (starter may be null after her erasure — then nobody is told)
- [ ] Purge: submitted data, token seed and portrait dropped on decide/discard/expiry
- [ ] Integration tests for each path (auto, match → both decisions, invitation eligible/ineligible, group-admin intake invites, expired/used token refused)

### Phase 3 — Club app: manager side
Goal: managers and group admins run intakes end to end from the app (newcomer side still pending).
- [ ] API client + query/mutation hooks for intakes
- [ ] *Neuzugang anlegen* form (member toggle + date, group picker scoped to rights, *Für wen?*) with entries in Verein verwalten, `/manage/persons` and the group hub (pre-set group)
- [ ] QR + copy + share screen
- [ ] `/manage/intakes` overview (dense rows, state chips: gold for *zu prüfen*) and `/manage/intakes/$intakeId` detail with edit, renew, discard, show link
- [ ] Review UI: candidates, *Das ist sie* / *Neue Person*
- [ ] Tests for business logic (state → actions, scope), lint/typecheck, phone screenshots

### Phase 4 — Club app: newcomer side
Goal: the full flow works from a phone without the app installed.
- [ ] Public route `/intake` reading the fragment token, exempt from the install gate
- [ ] Form via the form kit (address required only for members), portrait pick + crop
- [ ] States: expired / used / discarded link screens
- [ ] *Fertig* screen; *App jetzt einrichten* hands over into the existing invitation redemption
- [ ] Tests for business logic, lint/typecheck, phone screenshots of the whole flow; device check owed

## Risks & alternatives

- **Leaked link** — anyone holding it creates one person with the decided affiliation. Bounded by
  single use, 7 days, discard/renew, the starter's push, and the match check for existing persons.
- **Typos in the email** — the invitation goes to the wrong inbox; harmless (login email is
  confirmed by code on redemption) and the person can be re-invited.
- **Rejected:** folding into admission (an intake is no admission and may carry no membership);
  no invitation from a group admin's intake (ADR-0041); auto-matching existing persons.

## Out of scope

- Guardian consent or age questions in the form.
- Bank/SEPA data — the platform holds none.
- Bulk intakes (one link for many newcomers).
