# Website rendering: static-first, no SSR server

The public website (`web/apps/website`) is built **static-first**: a React + Vite SPA that
build-time **prerenders** the stable marketing routes (SSG), fetches live data (events, news,
ticket scarcity) client-side, and injects Open Graph / `<title>` meta for the share-critical
dynamic detail pages (event, news) via a bot-targeted edge middleware or a meta endpoint on the
.NET API. We deliberately ship **no SSR runtime** (no Next.js/Remix Node server).

Why not SSR, which is the SEO-strongest option:

- **One backend only.** We already run a single .NET API for all three apps. SSR would add a
  second live runtime (Node) to deploy, scale and keep alive. For a village Karnevalsverein's
  mostly-static marketing + ticketing site, that is operational overkill; static assets on a CDN
  plus the one API is far simpler and cheaper.
- **Stack + shared-theme coherence.** The website is React 19 + Vite + MUI, and `@furria/ui` is
  a source-consumed MUI theme shared across all apps. A plain React + Vite SPA keeps that sharing
  trivial. SSR (emotion/MUI server rendering) or a switch to Astro (awkward with MUI's runtime
  CSS) adds friction for no real payoff here.
- **The SEO gap is closable without SSR.** Modern Googlebot renders JS acceptably; the real hole
  is social scrapers (WhatsApp/Facebook/Twitter), which do not run JS and would otherwise get
  blank share previews. Prerendering the static pages plus injecting OG tags for dynamic detail
  pages closes exactly that hole.

Accepted cost: dynamic pages' **body text** is not in the initial HTML for search engines — only
their metadata is. For a local club whose discovery happens through shared links and the events
themselves, not deep per-event SEO, this is the right trade. This is not a hard one-way door: if
full dynamic-content SEO ever becomes a genuine priority, or the site grows content-heavy enough
that per-request rendering pays off, we can migrate to SSR/ISR then.

Note: this applies to the **public website only**. The Club-App and Event-App are wrapped in
**Capacitor** (a static web bundle in a webview) and were never SSR candidates; the website is
**not** Capacitor-wrapped, which is why SSR was on the table for it at all.

The specific prerender mechanism (e.g. React Router v7 framework-mode prerendering vs.
`vite-react-ssg`) is a build-time implementation detail, decided when the shell is built — not by
this ADR.
