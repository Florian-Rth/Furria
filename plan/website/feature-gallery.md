---
title: Galerie
slug: gallery
type: capability
status: ready
mock: docs/design/gallery-page/
adrs: []
---

## What & Why

The club's celebratory face: visitors relive an evening, and prospective members get the atmosphere
no amount of prose delivers. **Galerie** (public, curated, view-only) is deliberately *not* the
Club-App's **Bildergalerie** (member upload + browse) — see [`CONTEXT.md`](../../CONTEXT.md); the nav
label has always said "Galerie".

Its scope is small on purpose: **one Album per occasion, roughly a dozen hand-picked photos each.**
Not a dump of everything that was shot. That restraint is the feature, not a limitation to fix later
— it is why the page stays worth looking at, and why it needs no search, filters or pagination.

## Scope / Slices

- `/gallery` — Album index: hero, newest Album featured, current Session's Albums, older Sessions.
- `/gallery/:albumSlug` — one Album: header + photo grid + next Album.
- Full-screen photo viewer, addressed by `?photo=<n>` on the Album route.
- Public, view-only: no upload, no download, no videos.

## Decisions

**Routing & viewer state** *(P5)*

- **Three levels, two routes.** `/gallery` (index) + `/gallery/:albumSlug` (Album). The viewer is
  **not** a third route — it is `?photo=<n>` on the Album route.
- **The viewer lives in the URL, not in component state.** Consequences that motivated it: the
  browser Back button closes the viewer (the reflex on a phone), and a single photo is linkable.
  Opening **pushes** a history entry; stepping ← → **replaces** it, or arrowing through 12 photos
  would bury the album page 12 entries deep.
- Route file is **`gallery_.$albumSlug.tsx`** (trailing underscore) and links use
  `to={buildAlbumHref(slug)}` **plain strings** — both are P4's hard-won lessons
  ([Aktuelles](feature-news.md)): the dotted name nests the child under a parent that renders no
  `<Outlet/>`, and MUI's polymorphic `component={Link}` collapses TanStack's `to`-driven param
  generics to `string`.
- `?photo` is **validated with Zod via `validateSearch`**. Out-of-range or garbage → the viewer
  renders **closed**, never a 404: a bad query param is not a missing page. An unknown *album slug*
  **is** a missing page → `notFound()` → the branded 404 (which must be registered on this route
  too; it does not bubble).

**The Album model** *(P5)*

- **An Album is exactly one occasion** (Prunksitzung, Umzug, Sessionseröffnung) — the same kind of
  occasion the **Programm** lists. Not one Album per Session, and not a flat feed.
- **Session is derived, never stored.** An Album carries its date; its Session comes from the
  existing `sessionAt()` helper in `lib/club.ts`. Same rule P4 applied to the news archive. A stored
  session field would be a second truth that can disagree with the date printed next to it.
- **The index groups by derived Session.** Current Session → full Album cards. Older Sessions →
  slim rows that expand **in place** to a compact Album list. The whole older block **renders only
  if older Albums exist** — no invented past. Unlike P4's archive button, every target here is real,
  so this ships no dead links.
- The future backend seam is an **`eventId`** pointing at the Club-App's Veranstaltung; until then
  the Album carries its own title/date/venue.

**Images** *(P5)*

- **New `KkPhoto` primitive in `@furria/ui`.** Takes a typed source; renders a real `<img>`
  (`loading="lazy"`, `decoding="async"`, intrinsic width/height so there is no layout shift) when
  there is one, and falls back to `KkPhotoPlaceholder` when there is not. This is the first feature
  where **images are the content** rather than decoration, so the swap to real files must be a
  data-source change — the same rule P2 set for event data.
- **`alt` is required and never empty.** The photo caption is the alt text; a decorative frame in
  the hero stack is `aria-hidden` instead. There is no third option.
- **No build-time image pipeline yet.** AVIF/WebP srcset generation, blur-up placeholders and a
  transform step are a spike worth doing *when there are input files* — deferred, not forgotten.
- **Every photo declares its orientation** (`landscape | portrait`). It drives the grid, and it is
  the same field that prevents layout shift once real files land.

**Layout & design** *(P5)*

- **Hard offset-shadows stay rejected as the system.** The mock leads with `12px 12px 0 red` on the
  newest Album; `shadow.posterOffset` is reserved for hero headlines (P1/P3/P4). The featured Album
  earns emphasis through **scale + layout + `shadow.raised`**, exactly like the news Aufmacher.
- **Hero gesture: a fanned Fotostapel** — 3–4 overlapping, slightly rotated photo frames, distilling
  to a single tilted frame at `xs`. It is **decoration only**: `aria-hidden`, not a link, generic
  frames. Every other hero aside on the site (`/club`'s photo, `/news`'s broom) is decorative too,
  and making this one interactive would (a) duplicate the featured Album's cover 200px above it and
  (b) turn a rotated frame into a tap target.
- **Photo grid: orientation-aware tiles at uniform height**, width 1 or 2 MUI Grid columns
  (portrait 3 / landscape 6 of 12 on desktop). Rows pack tidily, landscapes are shown wide instead
  of centre-cropped, and **DOM order equals visual order**.
- **The mock's `columnCount: 3` masonry is rejected on a defect, not on taste.** CSS multi-column
  fills top-to-bottom *per column*, so photo 2 lands below photo 1 while photo 5 sits beside it —
  tab order and screen-reader order stop matching the chronology of an evening. The mock's mobile
  version compounds it by splitting into even/odd arrays. Native CSS masonry is not baseline, and a
  JS layout pass for ~12 pictures is not worth a dependency.
- **The Album page has its own lighter header**, not `KkHeroSection`: back link → eyebrow
  (date · venue) → H1 → derived photo count → intro → hairline row with the Foto credit and the
  "antippen" hint. The hero carries site identity (confetti, the stack); six Album pages must not
  each restage it. Same reasoning as `/news`'s article page.
- **Closing blocks:** index ends on the rights note + an accent `KkBandSection` → `/program`. The
  Album page ends on **Nächstes Album** with **no band** — P4's ruling that a closing CTA should not
  repeat on every sub-page.

**Viewer behaviour** *(P5)*

- **MUI `Dialog`, `fullScreen` at every breakpoint** — photos want the room, and the dark surface
  *is* the backdrop. Dialog owns focus-trap, Esc and scroll-lock; hand-rolling that is how galleries
  become keyboard traps. Same base pattern as `/club`'s `GruppenModal`.
- **Clamped at both ends, buttons disable.** The mock wraps around with modulo *and* prints
  "Letztes Bild" in its footer — self-contradictory, and wrapping means a visitor never learns they
  have seen everything.
- Keyboard ← → Esc; on-screen ‹ › flanking on desktop, thumb-reachable bottom row on mobile; swipe
  via `motion`'s drag with a distance threshold (`motion` is already a dependency).
- The counter is **`aria-live`** so a screen reader hears "6 von 12". `useReducedMotion` respected.

**Content & copy** *(P5)*

- **Album titles stay honest** (Prunksitzung, Rosenmontagsumzug, Kindersitzung,
  Sessionseröffnung) — those are real event types the site already advertises. **Everything else is
  obviously fake**, in the `/news` voice, per the P4 correction (`8f5a643`).
- **Photographer credits must be unmistakably fake.** The mock credits *"Foto: Anja Weber"* /
  *"Uwe Krämer"* — plausible-sounding real people in what is effectively the **Fotograf** Amt. P4
  banned exactly this when it refused to invent a "Vorstand" byline.
- **Großbesenstadt and the broom mark are established brand furniture, not a joke well.** The town
  name ships in the masthead, footer, ticker, hero and Chronik and stays. But captions must **not**
  be built on broom gags — humour comes from the situations, as in `/news`.
- **The takedown promise gets a working address.** *"Du bist auf einem Foto und möchtest es hier
  nicht sehen?"* is the page's only real-world remedy, so it is a live `mailto:` — not prose naming
  no one. The address becomes **`CLUB_CONTACT_EMAIL` in `lib/club.ts`**; today it is a hardcoded
  string inside `imprint-content.ts` prose, and two features must not each carry a copy.
- **No Instagram band in P5.** All social hrefs are `#` until P7. A headline band whose entire
  purpose is a dead link is worse than the footer's icon row, which degrades gracefully.

**Scope trims (YAGNI)** *(P5)*

- **No landing teaser.** The landing is static-final and P4 already spent its one node slot on news.
- **No per-photo share button.** The `?photo` URL *is* the share mechanism; P4 dropped
  `navigator.share` for reasons that all still hold.
- No download, no videos, no pagination, no "mehr laden", no filters, no per-photo pages.

## Open Questions

- **Who decides a photo is public** — genuinely unresolved, and it may never be built. Flagged in
  [`CONTEXT.md`](../../CONTEXT.md) → *Flagged ambiguities*. **P5 needs none of it:** the website has
  no notion of consent; it renders the Albums the club put into it, and the takedown contact is the
  remedy. Deliberately **no ADR** — an ADR records a decision, and there is none.
- **Real photos.** Which occasions, how many, who curates, what resolution — an asset task, not a
  code task. `KkPhoto` is the seam.
- **Image delivery** once files exist: repo-committed static assets vs. object storage/CDN, and the
  transform pipeline. Likely worth an ADR *then*.

## Done When

- A visitor browses Albums on `/gallery`, opens one, and views photos full-screen with keyboard,
  swipe and Back all behaving.
- Every level is responsive phone → desktop and correct in light **and** dark.
- Session grouping, older-Session collapsing, photo counts and the next-Album link are all
  **derived** — no hand-maintained duplicates.
- Swapping in real photo files is a content change: no component touched.

## Implementation plan (phases)

Ordered, independently testable **vertical slices**; each leaves the app building. **Frontend only.
Backend: none** for every slice.

1. **Tracer bullet — content model + index skeleton.** `features/gallery/` with
   `gallery-content.ts` (typed `Album`, `Photo`, `PhotoOrientation`; 6 seeded Albums — 4 current
   Session + 2 older, 8–12 photos each), derived session grouping and count helpers. Replace the
   `/gallery` placeholder with `GalleryPage`: `KkHeroSection` (eyebrow, H1 **GALERIE**, description,
   derived stat row) + `KkRule` + **DIESE SESSION** `KkCard` grid. Page head.
   *Delivers:* `/gallery` is a real, readable page, responsive, light + dark.
   *Verify:* route renders `GalleryPage`, not `PlaceholderPage`; grouping/count helpers unit-tested;
   `pnpm build`/`typecheck`/`test`/`lint` pass.
2. **`KkPhoto` primitive.** Add to `@furria/ui` + barrel: typed source, `<img>` with lazy/async/
   intrinsic size, `KkPhotoPlaceholder` fallback, required `alt`, orientation-driven ratio.
   *Delivers:* one photo component the whole feature builds on.
   *Verify:* null source renders the placeholder and a set source renders `<img>` with alt; unit
   tests on the pure ratio/dimension resolution. **`NewsMedia` is deliberately not migrated** — P4
   is finished; the rule-of-three case can be made later.
3. **Hero Fotostapel.** `PhotoStack`: 3–4 rotated frames, `aria-hidden`, single tilted frame at
   `xs`, reduced-motion aware.
   *Delivers:* `/gallery` gets its own identity gesture, distinct from `/club` and `/news`.
   *Verify:* not focusable, not a link, announced by nothing; both themes; no horizontal overflow at
   360px.
4. **Featured Album.** The newest Album as a wide banner under the rule — **NEUESTES ALBUM** flag,
   overlay title + meta, "Album ansehen →". Emphasis via scale + `shadow.raised`.
   *Delivers:* the index's single bold moment and its "start here".
   *Verify:* it is the newest Album by derived sort and is **not** repeated in the grid below.
5. **Older Sessions.** Derived session groups; older ones as collapsible rows expanding in place to
   a compact Album list. Absent entirely when no older Album exists.
   *Delivers:* the index survives every future Session without a redesign.
   *Verify:* renders from the 2 seeded older Albums; disappears when they are removed from the
   array; expand/collapse is keyboard-operable.
6. **Rights note + Programm band.** The © / takedown note with a live `mailto:`; promote
   `CLUB_CONTACT_EMAIL` into `lib/club.ts` and refactor `imprint-content.ts` to read it; accent
   `KkBandSection` → `/program`. **Drive-by while `lib/club.ts` is open:** set
   `GROUP_COUNT_PLACEHOLDER = 6` so the landing hero stops contradicting `/club`'s derived
   `GROUPS.length` (defect recorded in [Landing-Hero](feature-landing-hero.md)).
   *Delivers:* the index is complete end-to-end.
   *Verify:* one source for the address (no second literal anywhere); imprint renders unchanged; the
   hero stat and the Gruppen section both say 6.
7. **Album page.** `gallery_.$albumSlug.tsx` with loader + `notFound()` + the 404 registration; own
   lighter header (back link, date · venue eyebrow, H1, derived count, intro, credit row);
   orientation-aware `PhotoGrid` of `PhotoTile`s. Per-album head.
   *Delivers:* an Album is browsable at its own shareable URL.
   *Verify:* a known slug renders and an unknown slug hits the branded 404; DOM order equals visual
   order; span mapping unit-tested; head asserted.
8. **PhotoViewer.** `Dialog` `fullScreen`; `?photo` with Zod `validateSearch`; open pushes, stepping
   replaces; keyboard ← → Esc; ‹ › controls; `motion` drag swipe; clamped ends with disabled
   buttons; `aria-live` counter; caption + credit + venue footer.
   *Delivers:* the reason the page exists — photos at full size.
   *Verify:* step/clamp and search-param parsing are **pure functions, unit-tested**; out-of-range
   `?photo` renders closed; Back closes; focus returns to the invoking tile; reduced motion honoured.
9. **Nächstes Album + review pass.** Derived next-Album card; `react-code-reviewer` +
   `react-composition-guru` on the compound-heavy parts (viewer, grid, session groups); fix and
   re-verify all gates.
   *Delivers:* the phase is complete.
   *Verify:* next-Album wraps predictably and never points at itself; all gates green.

## References

- Mock: [`docs/design/gallery-page/`](../../docs/design/gallery-page/) — direction only; its README
  records what was adopted and what was rejected.
- [`CONTEXT.md`](../../CONTEXT.md) — **Galerie**, **Bildergalerie**, **Album**; the open photo-gate
  question under *Flagged ambiguities*.
- [Aktuelles](feature-news.md) — the router traps, the derived-archive precedent, the
  obviously-fake-content ruling.
