# The Club-App runs installed on phones

The Club-App launches 2026-11-11 as a web app, not a store app (no native build this year).
Florian, 2026-10-21: make it an enforced PWA — a phone that opens it in a browser tab gets a
setup page that installs it, with a secret way to keep using the tab for testing.

## The decision

**On a phone or tablet, the Club-App only runs as the installed home-screen app. A browser tab
there shows the install page (`features/app-install`) instead of the app.**

- **Gated:** iOS and Android devices (iPadOS posing as a Mac included) in a normal tab.
  **Not gated:** desktop browsers, the installed app (`display-mode` standalone/fullscreen/
  minimal-ui or `navigator.standalone`), the Capacitor shell, and the mail-link flows
  `/reset-password` and `/invitation/*` — iOS opens mail links in Safari and cannot hand them to
  the installed app, so those one-shot flows finish in the tab and the gate takes over after.
- **The install page picks the steps for the browser in hand** (`install-guide.ts`): one tap via
  `beforeinstallprompt` where the browser offers it (captured before React mounts by
  `public/install-boot.js`), else the menu steps of iPhone Safari (≤18 share bar, 26 "•••"
  menu, 27+ "Seitenmenü" left of the address), iPad Safari, iOS Chrome/Firefox, Android Chrome, Samsung Internet and Firefox, each step
  naming the real browser control. In-app browsers (Instagram, Facebook, Android web views …)
  are sent to Safari (`x-safari-https:`) or Chrome (`intent:`) plus a copy-link fallback; other
  Android browsers to Chrome.
- **Install is remembered, not assumed:** Android reports `appinstalled` and, through
  `related_applications`, `getInstalledRelatedApps()`; iOS has neither, so the member confirms
  ("Erledigt") and the phone remembers it. Either way the tab then says "open it from the home
  screen" — the installed app keeps its own storage, so signing in happens there.
- **Browser mode for testing:** `?pwa=false` (also `off`/`0`) or tapping the app tile on the
  install page 11 times quickly stores `furria.browser-mode` in `localStorage`; a gold corner tag
  marks it and ends it, as does `?pwa=true`. The param is stripped from the URL on boot.
- **Service worker (`vite-plugin-pwa`, generateSW):** precaches the built shell only; `/api/` and
  `/.well-known/` stay network-only. A new build raises the "Neue Version da" system notice with a
  reload action; the app checks for one hourly. nginx serves `sw.js`, `workbox-*.js`,
  `manifest.webmanifest` and `index.html` with `no-cache`. The native build (`--mode native`)
  disables the plugin.

## Consequences

- Phone screenshots and phone browser checks need `?pwa=false` once per device (or a desktop
  user agent); `pnpm shot` uses a desktop user agent and is unaffected.
- Labels of browser menus change with browser releases; `install-copy.ts` is the one place to
  follow them.
- No branded iOS launch images (`apple-touch-startup-image`) yet; iOS shows a plain launch screen.
