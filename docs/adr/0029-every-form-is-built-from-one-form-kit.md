# Every form is built from one form kit

The redesigned event form (titled sections on raised panels, purpose-built inputs, hints that say
where a text appears) became the template for every create/edit screen of the club app. Florian,
2026-10-13: "introduce it everywhere and don't allow drift from its design — one shared design
system."

## The decision

**Every field of a create/edit screen sits in a `KkFormSection`; side-by-side fields sit in a
`KkFormPair`. Nothing else lays out a form field. A lint rule enforces it.**

- `KkFormSection` (`@furria/ui`): a titled section (optional one-line description) with a raised
  block panel; field gap `kkTokens.form.fieldGap`.
- `KkFormPair`: two fields in one row — `balance` `even` (6/6), `leading` (8/4, e.g. day + time),
  `trailing` (4/8, e.g. postcode + city); `phone` `stack` (default) or `side` (short pairs such as
  two times).
- The screen (`KkWriteScreen.Fields`) spaces sections by `kkTokens.form.sectionGap`; no `mt`/`sx`
  on sections.
- Purpose-built inputs before generic ones: `KkTimeField` (quick-time chips) for times,
  `KkDateField` (quick choices) for days, `KkPriceField` for money, `KkNumberField` (stepper) for
  whole numbers such as years and orders, `KkChipField` for free text with suggestions,
  `KkSelectField presentation="choices"` for short fixed lists, `KkTextArea` with a `hint` for
  longer text. Every text that reaches the website says where it appears in its `hint`.
- A picture belongs in the form as its own section (picture desk), not on a separate screen.
- **Enforcement:** `web/biome-plugins/noFreeFormFields.grit` fails when a form field is a direct
  child of `WriteScreen`, `Grid`, `Stack`, `Box`, `KkPanel` or `KkPanelSection` in the club app's
  form files (`components/*Editor.tsx`, `*Fields.tsx`, `*Section.tsx`). A screen's form lives in
  an `*Editor.tsx`.

## Considered options

- **Guidelines only.** Rejected: the old forms drifted exactly that way (flat lists, times as
  selects, ad-hoc grids).
- **One generic schema-driven form renderer.** Rejected: forms differ in behaviour (dependent
  validation, staged pictures, ceremonies); a renderer would grow a prop per exception. The kit
  fixes the look and leaves the behaviour to each feature.

## Consequences

- Auth flows (login, password reset, redeem) and inline sheets keep their own design; the rule
  does not cover them.
- The lint rule sees direct children only: a field hoisted into a variable and rendered bare is
  not caught. Review keeps that honest.
