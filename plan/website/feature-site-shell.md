---
title: Site-Shell
slug: site-shell
type: foundation
status: shipped
mock: docs/design/fcc-ds-landing.jsx
adrs: [docs/adr/0003-website-rendering-strategy.md]
---

## What & Why

The persistent chrome and layout every real page renders inside: the newspaper **masthead nav**
(`nav-links —— FURRIA —— Tickets` pill), the **footer** (Impressum/Datenschutz, social), the
theme (light/dark), the page layout grid, and client-side routing. The frame all capabilities
hang in — built first so everything else has a home.

## Scope / Slices

- Masthead nav (desktop) + mobile bar (menu button, centered FURRIA wordmark, theme toggle).
- Mobile nav (reworked 2026-07-20, replaces the P0 drawer): the menu button opens an **inline
  chip row** under the masthead — animated in (blur→clear, slide from top, reduced-motion aware),
  horizontally scrollable with gradient fade masks on overflowing edges (no backdrop-filter on
  scrolling surfaces), closes on navigation. **Tickets is the first chip, filled red** — its pill left the
  mobile bar as too bulky, and the theme toggle took that slot.
- Footer (`SiteFooter`, already exists) — extend toward the mock (broom lockup, social).
- Light/dark: OS default + persisted manual toggle (masthead + drawer).
- Layout shell + routing skeleton; every nav destination resolves (real page or placeholder).
- `@furria/ui` integration: consume tokens/primitives, no local re-definition.
- **P6 additions to `@furria/ui` (2026-07-30):** **`KkStatRow`** — the rule of three fired on the
  divider-topped value/label row (landing hero, `/club` story, and now `/join`'s hero), promoted as a
  slotted compound (root + `.Item`/`.Value`/`.Label`). Scale and colour stay **at the call site**, so
  there is no size or colour flag — the same refusal P4 made for `NewsSectionRule`, and the lesson P4.1
  drew from five card dialects. Its dev hook is `data-kk-stat-row`; the old `data-kk-story-stats` hook
  was dropped after grepping (nothing referenced it). Also **`KkSectionRoot` gained an optional `id`**
  so a section can own an in-page anchor — one prop, no behaviour change.

## Decisions

**Stack** (already in code — supersedes the earlier "React Router v7 vs. vite-react-ssg" question):

- **Router: TanStack Router** — file-based (`routeTree.gen.ts`), autoCodeSplitting, React Compiler on.
- **Data: TanStack Query** — see [API-Client](feature-api-client.md).
- Chrome is **website-local** (like `SiteFooter`): a `Masthead` component beside it. `@furria/ui`
  stays theme/primitives only — the three apps have different navs, so no shared app chrome.

**Composition — layout routes, no conditional-chrome:**

- A pathless layout route (`_site`) renders `Masthead → Outlet → SiteFooter`; the real marketing
  pages are its children. `__root` drops back to **providers + `<HeadContent/>` + `<Outlet/>`** only.

**Gate zones** (owned by [Preview-Gate](feature-preview-gate.md)):

- **Always-public legal** — `/imprint`, `/privacy` sit outside the gate (legally required reachable).
- **Gated marketing** — `/`, `/program`, `/club`, `/news`, `/gallery`, `/join`, `/tickets` —
  granted-only pre-launch, public at launch.
- **Gated portal** — `/apps`, the tester launcher.
- Real pages live at their **final URLs** from day one; launch is just flipping the gate off.

**URLs & labels:**

- **URLs and code English; visible text German** (CLAUDE.md, as written). P0 fix: rename
  `/impressum` → `/imprint`, `/datenschutz` → `/privacy` (labels stay "Impressum"/"Datenschutz").
- IA: `/program` · `/club` (Verein) · `/news` · `/gallery` · `/join` · `/tickets` (+ `/apps`).
- **No Login** in the public masthead — the website is public-only; member login lives in the
  Club-App (invite-only). A link out to Club-App is the only future option.

**Nav & placeholders:**

- Nav items are **data**, rendered in the desktop bar + mobile drawer; the masthead shows the
  **full IA** from P0 so it never visually churns.
- Unbuilt routes resolve to one shared **`PlaceholderPage`** ("Diese Seite entsteht gerade") in the
  branded shell; each phase swaps its stub for the real page.

**Not-found (added P4 — the site's first 404):**

- **One site-wide 404**, not per-feature: a `notFoundComponent` on `__root` rendering a shared
  `NotFoundPage` wrapped in the existing `SiteChrome`, so masthead + footer stay intact. Unknown
  news slugs bubble up to it rather than getting their own surface.
- It renders **outside `_gated`**, so it stays publicly reachable — which a 404 must be — and it
  leaks no gated content. (A 404 *inside* `_gated` could never render: `beforeLoad` would redirect
  first.)
- Copy is deliberately funny and on-brand rather than a generic error: eyebrow *FEHLER 404*, Anton
  **HIER WAR MAL / EINE SEITE.**, *"Jetzt ist hier nur Konfetti. Passiert den Besten von uns."*,
  exits to `/` and `/program`. Built from shipped primitives only (confetti + `KkBroomMark`),
  reduced-motion aware.
- **`noindex` is deferred to P7 (Launch)** — a not-found is not a route, so it carries the root
  head, and the point is moot while `robots.txt` disallows everything.
- *As built (P4):* **it does not bubble.** TanStack Router raises a not-found on the *matched* route,
  so `notFoundComponent` is registered on `__root`, `_site.tsx` **and** `_gated.tsx` — otherwise
  `/news/<unknown>` rendered the router's generic `<p>Not Found</p>`. Still one shared page, still
  publicly reachable; any future route that throws `notFound()` must register it too. Route-tree
  registration was chosen over a router-level `defaultNotFoundComponent` because the router is created
  twice (`main.tsx` + `test/render.tsx`) and that config would have to be duplicated to stay honest in
  tests.
- *As built (P4):* **two files, not one** — `NotFoundPage` (chrome-less) + `NotFoundScreen`
  (`SiteChrome` + page, what the routes register): one-component-per-file forbids declaring the wrapper
  inside `__root.tsx`, and the page must be chrome-less below a layout that already mounts
  `SiteChrome`. Decoration is **`KkConfettiRain`** — `KkConfettiScatter` no longer exists (dropped in
  `b34da0e`) and `KkConfettiBurst` is a click-fired one-shot, wrong for standing page decoration.

**Shared band — `CtaBand` (P4) → `KkBandSection` (P4.1). Superseded; read the correction first:**

- ⚠️ **`src/components/CtaBand/` no longer exists.** P4 extracted it (`b4aaa64`); the P4.1
  design-system unification (`14c07d3`) **deleted it and promoted the idiom into `@furria/ui` as
  `KkBandSection`** (`tone: 'accent' | 'plain'`, `.Row`/`.Column` slots, a `decoration` node slot,
  `px`/`py` from `kkTokens.layout`). `NarrenrufBand`, `RecruitBand` and `NewsProgramBand` all consume
  it today. The P4 text below is kept because its *reasoning* still governs the API — but its
  location claim was stale for a phase and a half and is corrected here.
- **The "website chrome, not `@furria/ui`" argument was overturned, on purpose.** P4 argued a
  *CTA/recruit band* is website chrome the Club-App will never mount. P4.1 kept that boundary and
  still moved it, because what got promoted is not a CTA band: **`KkBandSection` is a token-pure
  full-bleed band *section*** — tone + slots + rhythm, no CTA semantics, no copy, no targets. The
  bands themselves (`NarrenrufBand`, `RecruitBand`, `NewsProgramBand`) remain website-local. The
  boundary is unchanged; only the thing being classified changed.

*Original P4 reasoning (API rules still binding):*

- The full-bleed red band idiom reached **three** call sites (`NarrenrufBand`, `RecruitBand`, the
  news list's `/program` band), so it is extracted to `src/components/CtaBand/` as a **slotted
  compound**: the root mounts the fixed decoration (red surface, watermark slot, overflow, inner
  container, z-index) and accepts `sx` so the **parent owns padding**; layout variation is a
  **choice of slot** (`Row` vs `Column`), never a variant flag.
- It lives in `src/components/`, **not `@furria/ui`** — a CTA/recruit band is website chrome, not a
  token-pure cross-app primitive (the Club-App will never mount one), and P1 deliberately sharpened
  that boundary. Same reasoning that keeps `Masthead`/`SiteFooter` local.
- **`MitmachenBand` is excluded on purpose.** The code shows it is a rounded (`radius.base`) red
  *card* inside the landing's `Container`, not a full-bleed band; folding it in would require a
  `fullBleed`-style prop, i.e. the boolean-flag API the frontend rules ban.
- *As built (P4):* **the watermark stayed call-site-owned.** The two shipped watermarks genuinely
  differ (Narrenruf: left, −12°, opacity 0.12, size 320; Recruit: centred, −8°, 0.08, 360), so rather
  than reconcile them behind a flag the root exposes a `watermark` **node slot** each band fills with
  its own component. Migration parity was verified by rendering inline copies of the shipped originals
  beside the migrated ones and diffing the emitted Emotion declarations per breakpoint.
- *As built (P4):* band-level dev hooks were **renamed into the compound** —
  `data-kk-narrenruf-band`/`data-kk-recruit-band` → `data-kk-cta-band`, `…-row` →
  `data-kk-cta-band-row`, `…-recruit-row` → `data-kk-cta-band-column`. Preserving per-feature names
  would have required the root to forward arbitrary DOM props, widening the API for no consumer.
  Call-site-owned hooks (`data-kk-narrenruf-watermark`, `…-shout`, `data-kk-recruit-watermark`) are
  untouched.

**Club contact address (added and shipped P5):**

- The club's e-mail address is **`CLUB_CONTACT_EMAIL` in `lib/club.ts`**, beside the other club
  facts. It was a hardcoded literal buried in `imprint-content.ts` **prose** (`'E-Mail: …'`), and the
  [Galerie](feature-gallery.md)'s takedown `mailto:` would have been a second copy — an address that
  can drift between two pages, one of which is legally required to be correct.
- **`privacy-content.ts` held a third copy**, which the P5 slice brief had not spotted — its §1
  *Verantwortlicher* sentence carried the same literal. Both legal documents now interpolate the
  constant and render byte-identical prose; **no second literal of the address exists in `web/`**.
- All three are features importing from `lib`, so the unidirectional dependency rule is respected (no
  feature→feature import).
- The value shipped today is still a **placeholder**; real contact data is a launch task.

**`KK_DARK_SCHEME_ATTRIBUTE` (added P5):**

- `@furria/ui` exports the colour-scheme attribute name (`data-dark`) beside the
  `cssVariables: { colorSchemeSelector: 'data' }` config that defines it. Setting it on a subtree is
  the sanctioned way to **pin a surface to one scheme** while its parts keep reading ordinary palette
  values — which is what the [Galerie](feature-gallery.md)'s photo viewer needs ("the dark surface *is*
  the backdrop"). Do not hand-roll `kkTokens.color.dark.*` reads for this; they bake the mode into
  every leaf, which is exactly what review rejected in P5.
- The attribute is **not inert** because it is an attribute selector, not a root selector: MUI
  generates `[data-dark] &`, so it re-declares the palette vars for any subtree. A P5 cleanup deleted
  it on the assumption that only the root could carry it, and silently turned the viewer cream in the
  light scheme.

**Theme:**

- Consumes the **ONE** shared theme from `@furria/ui` — no website-only colors/fonts/radii/shadows.
  Base radius 14.
- Light/dark via MUI CSS-vars `colorSchemes`; **`useColorScheme()`** toggle, default `system`,
  persisted; **`InitColorSchemeScript`** to prevent first-paint flash; respect
  `prefers-reduced-motion`.
- *As built (P0):* MUI's `InitColorSchemeScript` component only emits during SSR, so its logic is
  **inlined as a script in `index.html`** (same storage keys/attribute contract) and the shared
  theme uses `colorSchemeSelector: 'data'`; the reduced-motion guard lives in the shared theme.
- Ticker is **not** part of the shell — its own foundation ([Ticker](feature-ticker.md)).

**`@furria/ui` additions (P6, 2026-07-29):**

- **`KkStatRow`** — a slotted compound (`KkStatRow` · `.Item` · `.Value` · `.Label`) owning the row,
  the top hairline, the gap and the wrap. The **rule of three** fired: `HeroStatRow` (landing) and
  `ClubStoryStats` (`/club`) were near-identical — same `Stack`, same `borderTop`, same `pt: 3` —
  differing only in type scale and colour, and `/join`'s hero would have been the third dialect.
  Both migrate. **Scale and colour stay at the call site** via `sx` and Typography's own `variant`:
  a `size` prop would be the dual-mode API the frontend rules ban, which is exactly why P4 refused
  to reuse `NewsSectionRule` at `h2` scale. Follows P4.1's five-card-dialects lesson.

**Legal pages (P6 → P7):**

- A third legal page **`/satzung`** is owed. P6's Antrag links it from inside the Einwilligung while
  the route does not exist yet (accepting the branded 404, P4's archive-button precedent), so it
  ships as a **plain anchor** — a typed `Link` cannot compile against a missing route. Because the
  link sits inside a legal consent, shipping the page is a **P7 launch blocker**, not a polish task.

## Open Questions

- Footer build-out — *resolved in P0:* built lean — broom lockup, tagline with the Narrenruf,
  legal links, FB/IG/YT socials as `#` placeholders — on light token-pure chrome instead of the
  mock's fixed dark band. Real social URLs + further build-out are a later polish task.
- Prerender mechanism — deferred out of P0 (see [SEO & Meta](feature-seo-meta.md)); the routing
  skeleton is prerender-ready via the `head` API.

## Done When

- Any real page renders inside a branded masthead + footer, light and dark, phone → desktop.
- Every nav link resolves; unbuilt pages show the branded placeholder.
- Legal pages reachable without the gate; marketing + portal behind it.
- The app builds and deploys. No hard-coded design values — everything comes from `@furria/ui`.

## References

- Mock: `fcc-ds-landing.jsx` (`KKMastheadBar`, `KKFooter`, `BestMobileBar`, `FooterMobile`).
- Design README §5 (design system), §12 (conventions).
