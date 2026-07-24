---
title: Verein
slug: about-verein
type: capability
status: shipped
mock: docs/design/verein-page/
adrs: []
---

## What & Why

The public **Verein** page (`/club`, nav label **Verein**): who the FCC is, for a visitor —
especially a prospective member. A single scrolling editorial page in the "Konfetti Kinetik"
brand that tells the club's story, teaches the Session, showcases the **Gruppen**, and puts faces
to the **Ämter** — ending on a "Mitglied werden" call. It is the trust-building page the hero and
the Mitmachen-Band point at.

**Static-final for Website v1** — no backend (see the master-plan scope banner). Every block is
fed by hand-curated, editable content constants behind typed interfaces, so the later swap to live
Club-App data is a data-source change, not a rewrite.

## Scope / Slices

One scrolling page, sections top → bottom:

1. **Hero** — giant derived session numeral + ribbon (desktop) + two-tone headline + CTAs + framed
   photo & 11.11 seal.
2. **Kapitel 01 — Story + stat strip** ("Ein Verein mit Herz").
3. **Narrenruf band** — the single mid-page red strip ("GROSS FURRIA!").
4. **Kapitel 02 — Chronik** — vertical-spine timeline (placeholder milestones).
5. **Kapitel 03 — Eine Session** — the 11.11.→Aschermittwoch season arc (real content).
6. **Kapitel 04 — Gruppen** — auto-fill tile grid → detail **modal** (the page's one interaction).
7. **Kapitel 05 — Menschen** — portrait wall keyed on **Ämter** (placeholder faces).
8. **Recruit band** — closing full-bleed red CTA → `/join`.

### Frontend requirements

- New `features/club/` feature (barrel `index.ts`, typed `*-content.ts` data + colocated tests,
  `components/<Section>/{Section.tsx, internal/layout, internal/ui}`, a `ClubPage` composer).
- Replace the body of `routes/_site/_gated/club.tsx` (currently `PlaceholderPage`) with `<ClubPage/>`;
  stays gated behind preview access. Page head: `pageTitle('Verein')` + club meta description +
  OG title/description; OG image deferred (same as landing).
- **Single responsive components throughout** (reflow via `sx` breakpoints; grids collapse to 1–2
  cols at `xs`, type scales). **No Desktop/Mobile component forks** — every section is a
  stacked/grid layout that reflows cleanly (matches the `MitmachenBand` precedent; deliberately
  unlike the landing *hero*'s two-tree split).
- Compose from `@furria/ui` primitives + MUI + `kkTokens`; light + dark; tokens only.

### Backend requirements

- **None.** Fully static. Content lives in editable typed constants.
- **Seam (deferred, NOT scaffolded — YAGNI):** later the Club-App backend supplies Gruppen,
  Ämter/people, and a per-Amt "show on public page" flag, plus real member/group counts and photos.
  Do not build the flag or any fetch now; the typed content interfaces are the swap point.

## Decisions

### Route & shape
- **One scrolling page at `/club`**, label **Verein**. No sub-routes — the value is the single
  narrative scroll; the group "detail" need is served by the modal, not a route.

### Design language (Destillat wins; mock is inspiration)
- The mock's **"Plakat-Kapitel"** system (hard offset-shadows as the leading elevation, square
  corners, 2px ink borders everywhere) is **rejected** as the system. We keep our shipped
  **"Destillat"** language: MUI `Card`, `radius.base` (14), hairline `divider` borders, `shadow.rest`
  soft elevation. Red is action/accent only.
- **The hero is the single bold moment.** It keeps two intentional hard-edged gestures — the
  `KkTwoToneHeadline` poster shadow **and** the ribbon banner — plus the giant outlined session
  numeral (outlined type, not a shadow). The framed hero photo stays **soft** (keyline +
  `shadow.raised`) so the hero has exactly two hard gestures, not three.
- **No dark ink-panels.** The mock's alternating cream/ink chapters are dropped; every section sits
  on the normal theme background. **Red appears only as two full-bleed strips** (Narrenruf +
  Recruit). Section rhythm comes from the numbered `ChapterHeader` + spacing + the two red bands.

### Hero
- Club-local hero **assembly** in `features/club/`, composed from shared `@furria/ui` primitives
  (`KkTwoToneHeadline`, `KkPhotoPlaceholder`, `KkSeal`, `KkConfettiScatter`) + the `HeroEyebrow`
  pill idiom — **not** by importing `features/landing` internals. The giant numeral + ribbon are
  club-hero-local (used once → not promoted to `@furria/ui`, YAGNI).
- **Derived, never hardcoded:** the giant numeral renders `currentSession.number` (today 55,
  auto-flips to 56 after 11.11.2026); ribbon = `SEIT {FOUNDING_YEAR} · GROSSBESENSTADT`; eyebrow =
  `FURRSCHER CARNEVALS CLUB e.V. · {currentSession.number}. SESSION`. All from `lib/club.ts`.
- Headline (`KkTwoToneHeadline`, poster shadow **on**): line 1 ink **DIE FÜNFTE JAHRESZEIT**, line 2
  red **HAT EIN ZUHAUSE.** CTAs: primary **Mitglied werden →** → `/join`, secondary **Zum Programm**
  → `/program`. Framed `KkPhotoPlaceholder` (`session-buehne`) + floating `KkSeal`, soft treatment.
- **Mobile is a distilled variant, not a shrunk desktop:** the numeral stays as the single calm
  anchor (large, low-opacity, behind the headline, bled off the top-right); the **ribbon is
  desktop-only** (its fact moves to the eyebrow); confetti reduced/dropped; headline + short intro +
  primary CTA get the space. Calm, spacious, one "wow."

### Story + stats (Kapitel 01)
- Keep the pull-quote (generic-true). Body paragraph ships as **clearly-flagged placeholder** (typed
  content const) — the club replaces real Vereinsgeschichte before launch. Framed photo alongside.
- **Stat strip is self-consistent by construction:** `1971 gegründet` (`FOUNDING_YEAR`), member
  count from `MEMBER_COUNT_PLACEHOLDER` (`180+`, shared with landing), **group count derived from
  the `GROUPS` array length** (never a hardcoded 6 or 12 → matches the grid on the same page),
  `{currentSession.number}. Session`. Content-value mismatches with the landing's rough "12 Garden &
  Gruppen" are accepted (testers-only static site; live data reconciles it later).

### Narrenruf band (the single mid-page red strip)
- Full-bleed red, onRed text, faint `KkBroomMark` watermark. Kicker *"UNSER NARRENRUF — UND NUR
  DIESER"* + sentence *"Kein 'Helau'. Kein 'Alaaf'. Wer bei FURRIA feiert, ruft Groß — und die
  ganze Halle antwortet."* + giant Anton **GROSS / FURRIA!** (2nd line white-outline). Display-only,
  no CTA. Distinct component, modeled on the `MitmachenBand` red-shell idiom.

### Chronik (Kapitel 02)
- Vertical-spine timeline from a typed `MILESTONES` const — **placeholder content** (1971 the one
  real anchor; the rest visibly flagged for the club to replace). MUI `Card` milestones (radius 14,
  soft, hairline — not square/hard-shadow), dots (first red, rest gold), first milestone accented.

### Season arc (Kapitel 03)
- ChapterHeader + intro + 5 MUI `Card`s (11.11. Eröffnung · Advent Proben & Aufbau · Februar
  Prunksitzungen · Rosenmontag Umzug · Aschermittwoch Ausklang), first accented red. Content is
  **real** (generic-accurate carnival structure), not placeholder-flagged. Reinforces the **Session**
  term (see `CONTEXT.md`).

### Gruppen showcase (Kapitel 04) — the centerpiece
- Auto-fill responsive tile grid; tiles are **MUI `Card`** (radius 14, hairline, soft): numbered
  `KkPhotoPlaceholder` topper badge (01, 02…), Anton title, short blurb, meta line + "Mehr →". Tint
  per tile via a position-based **`resolveGroupTint(theme, index)`** (red/gold/ink cycle — same
  idiom as the shipped `resolveEventTint`).
- Typed `Group` interface + editable `GROUPS` const. **Shipped field names are English**
  (`title, blurb, memberMeta, fullText, lead, schedule`) — the plan's `leitung`/`treffen` were
  renamed to `lead`/`schedule` to honour the code-is-English rule; the German visible labels
  ("Leitung"/"Treffen") live in a `groupsModalLabels` const. Seeded with the **P2-locked names**
  (Tanzgarde, Männerballett, Elferrat, **Büttenrede**, Kindergarde, Organisation — *not* the mock's
  Spielmannszug error); count (6) is array-derived and doesn't matter. `lead`/`schedule` are
  public-facing labels only; the domain's Trainer-Amt / Trainingsplaner live in the Club-App.
- **Detail modal (the page's one interaction):** clicking a tile opens a **MUI `Modal`** (base —
  focus trap, Esc, portal, backdrop, `aria-labelledby`, tinted `slotProps.backdrop`) wrapping a
  **`motion.div`** panel with `AnimatePresence` for a **spring scale-fade** enter/exit;
  `useReducedMotion()` (from `motion/react`, already a dep) collapses it to instant. Content: header
  photo, full description, LEITUNG / TREFFEN footer, **Mitglied werden →** button. State = single
  `openGroupId | null`.

### People wall (Kapitel 05) — Ämter, not "Vorstand"
- The section presents the people who hold the club's public **Ämter** ("die Gesichter"). Title
  *"MENSCHEN, DIE FURRIA SIND"* (people-focused; cleanly avoids the forbidden "Vorstand" framing —
  see `CONTEXT.md`). Each portrait's red eyebrow = the person's **Amt**. **No "Vorstand" in code or
  copy; the code field is `amt`.**
- Typed `Person { amt, name, tint }` const, **placeholder** names seeded from the mock's list. Photos
  are `KkPhotoPlaceholder` (portrait `4/5`), **soft** framing (keyline + `shadow.raised`). Real
  photos are consent-gated later (Club-App). Normal background, tint per portrait by index.

### Chapter header
- Club-local `ChapterHeader` (reused by Story/Chronik/Season/Gruppen/People): giant **red Anton
  numeral** (responsive — big desktop, ~half mobile) + tracked kicker eyebrow + Anton title +
  flex-grow **hairline rule to the edge** (2px `text.primary`, the masthead rule idiom). Typography +
  a rule — no hard-shadow, fully in-theme.

### Recruit band (closing red strip)
- Full-bleed red band sharing the red-surface + `KkBroomMark` idiom with `MitmachenBand` (visual CI)
  but **club-local** (own copy + two buttons vs. the landing band's single CTA). Kicker **MITMACHEN ·
  AB 30 € IM JAHR · KINDER 15 €** (real Beitrag tiers), Anton H2 **WERDE TEIL VON FURRIA**, intro.
  Buttons on red: primary **Mitglied werden →** → `/join` (white bg / red text pill), secondary
  **Programm ansehen** → `/program` (ghost-white).

### Identity glossary (unchanged, applied)
- **Amt** = office (fixed set), **Gruppe** = performing unit, **Session** = the season. No "Vorstand
  super-role" framing. Public, read-only — no member/personal data beyond curated placeholder faces.

## Open Questions

- **None blocking.** All three original open questions resolved:
  - *Static vs live?* → **static** behind typed interfaces (scope banner); live data deferred.
  - *One page vs sub-routes?* → **one page** at `/club`.
  - *Which Ämter public, names/photos or roles?* → **placeholder faces keyed on Ämter** for v1;
    real names/photos + per-Amt public-visibility flag come with the Club-App backend (seam noted,
    not scaffolded).
- **Deferred (need real content / Club-App backend):** real Vereinsgeschichte + Chronik milestones,
  real Gruppen/Ämter/photos, real member & group counts, live data.

## Done When

- `/club` renders the full editorial page (hero → story+stats → narrenruf → chronik → season →
  gruppen+modal → people → recruit) as one responsive page, light + dark, tokens only.
- The Gruppen tiles open an accessible, motion-animated detail modal (reduced-motion aware).
- No "Vorstand" in code or copy; the giant numeral + stats + ribbon + eyebrow all derive from
  `lib/club.ts`; the group-count stat matches the grid.

## Implementation plan (phases)

Small, ordered, independently testable **vertical slices** (tracer-bullet: a thin end-to-end slice
first, then widen section by section). Each leaves the app building and working. **Frontend only.
Backend: none** for every slice (static site).

1. **Tracer bullet — route + hero.** Stand up `features/club/` (barrel, `hero-content.ts`) and
   replace the `/club` placeholder with `ClubPage` rendering the **hero** end-to-end: derived
   eyebrow + `KkTwoToneHeadline` (poster shadow) + intro + CTAs (→ `/join`, `/program`) + giant
   derived numeral + desktop ribbon + framed `KkPhotoPlaceholder` + `KkSeal` + reduced confetti;
   single responsive component with the distilled mobile branch. Page head (title/desc/OG).
   *Delivers (FE):* `/club` shows a real branded hero, responsive, light + dark.
   *Verify:* route renders `ClubPage` (not `PlaceholderPage`); numeral/eyebrow/ribbon derive from
   `lib/club.ts`; CTAs navigate; ribbon hidden at `xs`; head meta asserted; `pnpm build`/`typecheck`/
   `test` pass.
2. **Chapter header + Story + stats.** New `ChapterHeader`; Story section (pull-quote + flagged
   placeholder body + framed photo); stat strip (founding/member/session derived, **group count from
   `GROUPS.length`** — introduce `groups-content.ts` data here even though the grid renders in slice
   6).
   *Delivers (FE):* `ChapterHeader` + Story + self-consistent stat strip.
   *Verify:* `ChapterHeader` renders; body is placeholder-flagged; stat counts derive; both
   breakpoints/themes; unit + component tests.
3. **Narrenruf band** (red strip #1). Full-bleed red band, GROSS/FURRIA! treatment, `KkBroomMark`
   watermark.
   *Delivers (FE):* the red narrenruf band in the page.
   *Verify:* copy + narrenruf law, watermark present, tokens only, both themes.
4. **Chronik timeline.** `ChapterHeader` (reused) + vertical-spine timeline from typed `MILESTONES`
   (placeholder), MUI cards + dots, first accented.
   *Delivers (FE):* the Chronik section.
   *Verify:* renders from the array; placeholder-flagged; responsive collapse; themes; content test.
5. **Season arc.** `ChapterHeader` + 5 season cards from typed `SEASON_STEPS` (real), first accented.
   *Delivers (FE):* the Season section.
   *Verify:* cards from array; first accented; responsive; themes; content test.
6. **Gruppen grid (no modal).** `ChapterHeader` + auto-fill tile grid from `GROUPS` + numbered
   badges + `resolveGroupTint`; tiles render as static cards (modal wired next).
   *Delivers (FE):* the groups grid, responsive (1–2 col at `xs`).
   *Verify:* grid maps the array; tint by index; count matches the P3.2 stat; themes; test.
7. **Gruppen detail modal (motion).** Make tiles open the MUI `Modal` + `motion.div` panel
   (`AnimatePresence` spring scale-fade, `useReducedMotion` aware) with full text + Leitung/Treffen +
   CTA; state `openGroupId`.
   *Delivers (FE):* the page's one interaction, accessible + animated.
   *Verify:* click opens the right group; Esc/backdrop close; focus trap; `aria-labelledby`;
   reduced-motion collapses the animation; component test.
8. **People wall (Ämter).** `ChapterHeader` + portrait grid from typed `PEOPLE` (`amt/name/tint`),
   soft framed portraits.
   *Delivers (FE):* the faces section.
   *Verify:* portraits from the array; Amt eyebrow; **no "Vorstand"** in output; responsive; themes.
9. **Recruit band** (red strip #2). Full-bleed red closing band, two buttons (→ `/join`,
   `/program`), `KkBroomMark`.
   *Delivers (FE):* the closing CTA — page complete end-to-end.
   *Verify:* copy + Beitrag tiers, both CTAs navigate, watermark; `ClubPage` test asserts all
   sections present in order at both breakpoints; `pnpm build`/`typecheck` pass.

## References

- Mock: `docs/design/verein-page/` (`src/fcc-ds-club-v2.jsx` → `ClubV2`; README = the handoff).
  **Inspiration for layout/content only — Destillat theme + `@furria/ui` primitives are binding.**
- `CONTEXT.md` (Amt, Gruppe, Session, Beitrag, Narrenruf). `lib/club.ts` (derived facts).
- Reuse map: landing `Hero`/`HeroPhoto` idioms, `MitmachenBand` red-shell, `ProgramTeaser`
  tint/grid pattern, `PreviewAccessDialog` (modal a11y), `program-content.ts` (typed-const pattern).
