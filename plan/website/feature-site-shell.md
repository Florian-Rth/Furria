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

**Shared `CtaBand` (added P4):**

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
