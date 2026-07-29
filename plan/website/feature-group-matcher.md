---
title: Konfetti-Kompass (Gruppenfinder)
slug: group-matcher
type: capability
status: shaping
mock: docs/design/join-page/src/fcc-ds-join.jsx
adrs: []
---

## What & Why

A **Wahl-O-Mat-style Gruppen matcher** on `/join`: the visitor answers eleven questions, every
**Gruppe** has answered the same questions in advance, and the page ranks the Gruppen by how well
they agree. It exists because the one thing that keeps people out of a Karnevalsverein is not the
Beitrag — it is not knowing where they would fit. The matcher answers that without asking for a
name or an e-mail address.

It is deliberately **not** the mock's "Findomat" (a hardcoded if/else over eight invented Gruppen
that prints one winner). The positions are **authored content per Gruppe**, the scoring is a pure,
tested function, and the result is a ranking the visitor can interrogate.

## Decisions

### Model

- **Two question roles**, one mechanism, no special cases:
  - **`weighted`** — a thesis the visitor answers **Ja / Neutral / Nein** (or skips). Each Gruppe
    holds a stance on it plus an **importance 1–3**. Scored.
  - **`filter`** — a factual question (age band first of all) where each Gruppe declares which
    answers it **accepts**. Not scored: a non-accepted answer **excludes** that Gruppe from the
    ranking. This is how "a 45-year-old must never match Kindergarde" is guaranteed, and it
    generalises — any question can be made a deal-breaker without a second mechanic.
- **Scoring** (Wahl-O-Mat's proven scale), normalised per Gruppe so percentages are comparable:
  - agreement: same stance = **2**, one side neutral = **1**, opposite = **0**
  - `score(g) = Σ w(g,q) · agreement(answer_q, stance(g,q)) / Σ w(g,q) · 2`
  - a **skipped** question leaves both sums — it never counts as disagreement
- **Importance is Gruppe-owned, not visitor-owned.** The real Wahl-O-Mat lets the *user*
  double-weight theses; we do the opposite on purpose, so a Gruppe can say "this one really
  matters to us" and a visitor cannot distort the match.
- **Eleven questions**, because eleven is the club's number (Elferrat, 11.11., 11:11) — the count
  is on-brand rather than arbitrary. Filter questions count toward the eleven.

### Recruiting status

- A **Gruppe decides for itself whether it is currently looking for new members** — its own setting,
  backend-managed later, seeded now as `isRecruiting`. The website shows it.
- **A Gruppe that is not recruiting is still ranked normally**, with a badge and the honest line
  that an Anfrage is welcome anyway. It is never demoted or hidden: the match is the match, and
  re-sorting would make the ranking lie about the percentage it just printed.
- **There are no open, drop-in trainings** and no per-Gruppe training slots — so the result card
  carries **no times, no location and no free-spot count**. The mock's *"nächster offener Termin ·
  4 Plätze frei"* is invented scarcity on a page whose entire currency is honesty, and its
  *"Ansprechpartnerin Katrin Roth"* names a plausible real person in an Amt, which P5 banned.
  The only next step the result offers is the Antrag or an Anfrage.

### Content rules (binding on whoever authors the questions)

- **Every question must split the roster.** A thesis all six Gruppen agree on adds nothing but
  clusters every score near the same number — and a matcher whose results all read "82 %" is worse
  than no matcher.
- The questions are **funny and concrete**, in the humour register of `/news`: situations, not
  broom gags (P5 copy rule).
- **No age band may come back empty.** If a band excludes every Gruppe, the result must still say
  something useful — see the empty state below. Authoring has to keep the ranges covering.
- The **«warum»** panel is **derived** from stances (your answer vs. theirs), never a second body
  of authored copy — 6 Gruppen × 11 questions of quips would rot immediately.

### Edge cases the pure function must handle (all unit-tested)

- **Nothing answered / everything skipped** → denominator is 0. No ranking, no `NaN`: the result
  asks for at least one answer.
- **Every Gruppe filtered out** → an honest empty state ("keine Gruppe passt aufs Alter") with the
  human contact, never a blank list.
- **Ties** → stable order, by roster order.
- **Excluded Gruppen are named with their reason**, never silently dropped.

### Shape & UX

- **One question per step**, progress bar, `← zurück` and `überspringen`; answering advances
  immediately. Best on a phone, keeps the card height stable, and mirrors the Wahl-O-Mat the
  mechanic is borrowed from.
- **The matcher is its own section, not the hero.** `KkHeroSection`'s `Aside` slot lays *behind*
  the main column at `xs`, so the mock's "Findomat inside the hero" is not available to us — it
  would be unusable on a phone. The hero CTA points down at it instead.
- **Result = full ranking**: every eligible Gruppe with a percentage bar, #1 emphasised, each
  expandable for the derived «warum», each carrying its recruiting badge. Filtered-out Gruppen
  listed with their reason. Two CTAs: Antrag (with the interest chips prefilled) and the human
  contact.
- **Gruppe data the matcher needs** (all part of the same seed/future `GET /api/groups` payload):
  `id`, `name`, `ageRange`, `isRecruiting`, plus a short line for the result card. Deliberately
  **not** `trainingSlot`/`location` — see Recruiting status above.
- **Name: «KONFETTI-KOMPASS»** (eyebrow), headline **WO PASSE ICH HIN?**. Code name stays
  `group-matcher`. **Deliberately not an "-O-Mat"**: the Bundeszentrale für politische Bildung
  holds the *Wahl-O-Mat* word mark and has objected to derivative names — so the mock's "Findomat"
  is out on legal exposure, not taste.

### Architecture

- **Its own feature** (`features/group-matcher/`) with its own plan file, separate from
  [Mitglied werden](feature-membership-funnel.md): distinct capability, own future backend
  resource, and a plausible second home on `/club` later. The `/join` **route** composes both —
  routes compose features, features never import each other.
- **Built as if the data already came from the backend.** Questions, Gruppe positions and the
  Gruppen themselves are destined for the DB, so the feature reads them through **React Query
  hooks in its `api.ts`**, Zod-parsed at the boundary. Until the endpoint exists the `queryFn`
  resolves from a **deletable seed module** (see [Mitglied werden](feature-membership-funnel.md)
  → Seed data) instead of `apiFetch`. Loading and error states are therefore **real code paths
  from day one**, and the swap is one line.
- **Answers live in `sessionStorage`** (tab-scoped; precedent `preview-access/session-storage.ts`),
  so Back from the Antrag returns to the result instead of question 1, and a mid-quiz refresh does
  not punish the visitor. The **result is always derived, never stored.**
- **Handoff to the Antrag is a URL search param** — `/join/apply?groups=a,b`, `validateSearch` +
  Zod, unknown ids dropped rather than 404. This is what keeps the two features decoupled with no
  shared context.

## Open Questions

- The eleven questions themselves, and all 6 × 11 Gruppe positions — content authoring, not yet
  written.
- Whether the matcher also earns a place on `/club` next to the Gruppen grid (not P6).

## Done When

- A visitor answers eleven questions on a phone or a desktop, in light or dark, and gets a ranked,
  explainable list of Gruppen that never contains an age-impossible match — then lands on the
  Antrag with their interests already ticked.

## References

- `CONTEXT.md` (**Gruppe** — Layer B, many-to-many, independent of **Mitgliedschaftsart**).
- Mock: `docs/design/join-page/` (`Findomat` — the idea, not the implementation).
- Sibling feature: [Mitglied werden](feature-membership-funnel.md).
