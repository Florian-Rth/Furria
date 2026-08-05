---
title: Jeck-Check (Gruppenfinder)
slug: group-matcher
type: capability
status: shipped
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
- **Name: «JECK-CHECK»** (eyebrow), headline **WO PASSE ICH HIN?**. Code name stays
  `group-matcher`. **Deliberately not an "-O-Mat"**: the Bundeszentrale für politische Bildung
  holds the *Wahl-O-Mat* word mark and has objected to derivative names — so the mock's "Findomat"
  is out on legal exposure, not taste. Two tests guard the rule (`matcher-content.test.ts`,
  `GroupMatcherSection.test.tsx`): kicker plus headline may never contain `-mat`.
- **«Konfetti-Kompass» was the shipped name until it was replaced by «Jeck-Check».** The Kompass
  said nothing about what the section does; visitors read it as decoration, not as a tool. «Check»
  states the mechanic — a short, non-binding test — and «Jeck» keeps the carnival register.
  `-O-Mat` candidates were weighed again and dropped again, for the word-mark reason above.
- **German brand names never enter the code.** The section is `GroupMatcherSection`, its parts are
  `Matcher*`, its copy lives in `matcher-content.ts`, the anchor is `#group-matcher`. The display
  name exists exactly once, as the value of `matcherKicker` — renaming it again is a one-line change.

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

## What shipped (P6, 2026-07-30)

`features/group-matcher/` with the `GroupMatcherSection` section on `/join`: stepper → result, both inside
one `MatcherPanel`. The model, the scoring scale, the recruiting rule and every edge case shipped
exactly as decided above. What differs from this file, and why:

- **The payload embeds the Gruppen.** `SEEDED_GROUP_MATCHER` is `{ groups, questions }`, so the whole
  feature reads **one** query with one loading/error path instead of a matcher query plus a groups
  query. This changes the deferred contract — `GET /api/group-matcher` must return the Gruppen too, and
  the master plan's Deferred section records it.
- **Zod placement follows the dependency rule.** The payload schemas live in `lib/seed/group-matcher.ts`
  (where the payload shape lives; `lib` may not import `features`), and the feature's `schemas.ts`
  holds only `MatcherAnswersSchema` — the answer map the stepper persists.
- **The eleven are 1 `filter` + 10 `weighted`.** The age band is the filter. Elferrat is the one seeded
  Gruppe with `isRecruiting: false`, so the badge has two real states. The **content rules are
  unit-tested as properties of the authored seed**, not just of the algorithm: every thesis splits the
  roster, no age band comes back empty, no adult ever matches Kindergarde, a child matches only
  Kindergarde, and an all-yes/all-no run spreads the ranking by ≥ 20 points.
- **The ten theses are deliberate nonsense** (*"Ich erkenne Konfetti mit verbundenen Augen am
  Geräusch."*, *"Eine Uniform sitzt richtig, wenn sie beim Gehen leise Marschmusik macht."*), and the
  section's intro **says outright that they are Platzhalter** — asserted by a test. Changed on the
  user's call after the first cut shipped plausible-sounding theses: a matcher that reads like the real
  thing while the club never answered a single question is a lie in exactly the register P5 banned for
  photo credits and P4 banned for the "Vorstand" byline. The mechanism is real, the content is
  unmistakably fake. **The `filter` question stays honest** — the age band is load-bearing (it is what
  guarantees no adult matches Kindergarde) and its answer is printed back as an exclusion reason, so it
  is the one question a visitor must be able to answer truthfully.
- **The stances were left untouched when the prompts were swapped**, so every scoring, roster-split and
  spread property still holds and the ranking still separates a performing profile from a hands-on one.
  Two behaviour tests had to be rekeyed to the new question ids, and one lost its persona name (it now
  says what it actually pins: two opposing answer profiles put a different Gruppe on top).
- **A skip is persisted as the marker `"skipped"`** in `sessionStorage` (`furria.kompass.answers`,
  Zod-parsed on read), which is what makes returning from the Antrag land on the *result* rather than
  question 1 — scoring already treats an unreadable stance as skipped and filters ignore unknown option
  ids. The result itself is still only ever derived.
- **Exclusions are returned structured** (`questionId`, `questionPrompt`, `answerLabel`) so the German
  sentence is written in the UI layer, not baked into the pure function.
- **The «warum» derives from weighted stances only**, sorted by importance × agreement and stable by
  question order. Filter questions contribute exclusions, never reasons.
- **An early-finish control was needed and added:** a disabled-until-one-answer *"Ergebnis ansehen →"*
  in the question footer, plus a `finished` flag on the progress part so *"Antworten ändern"* returns to
  the question the visitor left rather than to question 11. The separate done-panel from the first cut
  is deleted — the result replaces it.
- **`KkSectionRoot` gained an optional `id`** in `@furria/ui` so this section owns the
  `#konfetti-kompass` anchor the hero's secondary CTA jumps to. The anchor id lives in the membership
  feature's `join-content.ts` and is deliberately **not** barrel-exported (features never import each
  other; the route wires it).
- **The step animation fades only the prompt** (keyed remount) while the answer buttons stay mounted
  inside an `aria-live` region, so keyboard focus survives most steps; reduced motion collapses it to 0s.
- **The all-excluded state is verified through the pure selector** with a synthetic matcher, because the
  content rule above means the real seed can never produce it. The result CTA keeps a **plain href**
  (not a typed `Link`) — see [Mitglied werden](feature-membership-funnel.md) → What shipped.
- **The stepper's own review fix:** the step machine was first derived inline inside a presentational
  part; it moved into `use-kompass-progress`, with the derivation extracted as pure selectors
  (`selectQuestionIds`, `selectMatcherStepView`) and tested directly.
- **Not verified in a browser:** the stepper and result rest on token reuse and CSS reasoning — no
  layout engine in happy-dom and no automation was run for this section. 360px and the dark scheme are
  still owed.

## Open Questions

- **The eleven questions and the 66 positions are placeholders and say so on the page.** The ten theses
  are deliberate nonsense and the 66 stances behind them are invented; only the age filter is real.
  Authoring the real ones means asking the six Gruppen the questions — content work that has to happen
  before the gate comes down, and the binding content rules for it are in **Content rules** above.
- Whether the matcher also earns a place on `/club` next to the Gruppen grid (not P6).

## Done When

- A visitor answers eleven questions on a phone or a desktop, in light or dark, and gets a ranked,
  explainable list of Gruppen that never contains an age-impossible match — then lands on the
  Antrag with their interests already ticked.

## References

- `CONTEXT.md` (**Gruppe** — Layer B, many-to-many, independent of **Mitgliedschaftsart**).
- Mock: `docs/design/join-page/` (`Findomat` — the idea, not the implementation).
- Sibling feature: [Mitglied werden](feature-membership-funnel.md).
