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

- Masthead nav (desktop) + mobile bar (hamburger drawer, centered FURRIA wordmark, Tickets pill).
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
