---
status: shaped — ready for implementation
phase: CA-N
pulls: CA-P0 (shell & session), one backend slice (CORS for native origins)
shaped: 2026-09-11
---

> **Start here (fresh implementation context).** Read `plan/club-app/p0-shell-and-session.md`
> (session, deploy chain), `docs/adr/0005-auth-aspnet-identity-bearer-tokens.md` and
> `docs/adr/0006-browser-session-storage-and-401-handling.md` (both already anticipate this
> phase), then invoke `/frontend-work` — and `/backend-work` for slice A3 only.
> **Phase A (Android) is fully machine-executable. Phase B (iOS) is not** — it needs a Mac,
> Xcode, an Apple ID and hands on a device, so it is a separate phase with its own gate.

# CA-N — Native Shell (Capacitor)

The Club-App becomes a native Android and iOS app **without becoming a second app**. Capacitor
wraps the existing `web/apps/club-app` bundle in a native project whose WebView loads the same
`dist/` from inside the app package, plus a JS↔native bridge for platform APIs. One codebase,
one build, three targets: `app.furria.de`, Play-installable APK, App Store build.

Capacitor lives **inside `web/apps/club-app`** (`android/`, `ios/`, `capacitor.config.ts`
next to `vite.config.ts`). There is no `club-app-native` package: the shell is the same app.

---

## Why now

Not for a release — nothing ships publicly before the platform is done. The reason is
**feedback under real conditions**: a debug build on a phone is the only way to see whether
the CA-P1 surfaces work in a hand, whether the session survives OS backgrounding, and whether
the safe-area and keyboard behaviour the mocks assume actually holds. Deferring the shell also
defers the discovery of everything below, all of which touches shipped CA-P0 code.

The native shell is also the moment two CA-P0 promises come due: ADR-0005's *"in the Capacitor
shell, the refresh token sits in native secure storage"* and CA-P0's storage port that was
built for exactly this swap.

---

## Decisions pinned (2026-09-11)

### Versions and identity

| Item | Value |
|---|---|
| Capacitor | 8.x — all `@capacitor/*` versions in the `web/pnpm-workspace.yaml` catalog |
| `appId` | `de.furria.club` |
| `appName` | `FURRIA Club` |
| `webDir` | `dist` |
| Android floor | `minSdk 24`, `compileSdk`/`targetSdk 36`, Android Studio 2025.2.1+ |
| Android origin | `https://localhost` (Capacitor's default `androidScheme: 'https'`) |
| iOS origin | `capacitor://localhost` |

**Do not change `androidScheme`.** Verified against `@capacitor/cli` 8.5.2 on 2026-09-16:
the default is `https`, not `http`. An earlier draft of the table above claimed `http` and
would have produced a CORS allowlist the app never matches. A custom scheme breaks history routing in recent WebViews;
TanStack Router's browser history depends on the local server serving `index.html` for unknown
paths, which the default scheme does.

### There is no nginx in the native app

The web deploy serves the SPA from nginx and proxies `/api/` to the API service. Inside the
native app the WebView is served by Capacitor's local static server, so a relative
`/api/auth/login` resolves to `http://localhost/api/auth/login` **inside the app bundle** and
404s. The consequence:

**The native build needs an absolute API origin.** `apiFetch` already prefixes every path with
`/api/...`, so `API_BASE_URL` stays origin-only. Delivered as a build-time Vite env via a
committed `.env.native` plus `vite build --mode native`, never baked into a source file.

**One profile, decided 2026-09-16.** `.env.native` → `https://furria.florianrth.com`, the
deployed test backend: that host serves the website container, whose nginx proxies `/api` to the
API service. It is the only native API origin, and it is HTTPS.

The earlier two-profile decision assumed a plain-HTTP LAN API baked into the bundle. With an
HTTPS API that profile is unnecessary, and three consequences it carried turn out never to have
been real:

- the API does **not** need to bind beyond loopback. In the A7 device loop the phone talks only
  to the Vite dev server, and Vite's existing `/api` proxy reaches Kestrel over loopback from
  the dev machine;
- the CORS policy needs **no** Development-only LAN origin — a live-reload page calls `/api`
  relative, so that path is same-origin and never preflights;
- `android.allowMixedContent` is not needed either. An HTTP page calling an HTTPS API is not
  mixed content; only the reverse is. `server.cleartext` stays gated on `CAP_DEV_SERVER_URL`,
  for the live-reload page itself.

Verified while pinning this: `server.cleartext` reaches the app through the Cordova-plugins
manifest (`@capacitor/cli` `dist/cordova.js:757` writes `usesCleartextTraffic`), which merges
into the app manifest. It applies only when a `server` block exists — so never in a release
build, exactly as intended.

**The runtime-config chain already works in native, verified 2026-09-11 — do not "fix" it.**
`web/apps/club-app/public/config.js` has existed since CA-P0 slice 1 and contains exactly
`window.__RUNTIME_CONFIG__ = {};`. So: native ships that stub, `API_BASE_URL` is `undefined`,
and `resolveApiBaseUrl` falls through to the build-time value — correct. On web the nginx
entrypoint overwrites the file with `API_BASE_URL: ""` — the runtime value wins and same-origin
is preserved — also correct. No stub to add, no `''`-as-absent change to make; an earlier draft
of this plan called for both after reading the entrypoint without reading `public/`.

### The API must allow the native origins (backend slice)

CA-P0 deliberately chose same-origin per app and therefore configured **no CORS at all**. The
native WebView is a genuinely different origin, so the API gains a CORS policy allowing
`https://localhost` and `capacitor://localhost`, the `Authorization` header, and every method
the client actually uses — `GET`, `POST`, `PUT` and `DELETE`, not just `GET`/`POST`: the profile
screen already calls `PUT /api/auth/me/contact-visibility`.
**No credentials** — bearer tokens only, per ADR-0005. Localhost-with-no-port is a fixed
Capacitor constant, not a wildcard: the policy stays an explicit allowlist.

*Rejected:* enabling Capacitor's core `CapacitorHttp` plugin, which patches `fetch`/`XHR` to
route requests through native and thereby sidesteps CORS entirely. It would spare the backend
change but replaces the fetch implementation the whole client, its Zod boundary and its
timeout/abort handling are built on, and it diverges native from web on the one path that must
behave identically. We own the API; a five-line CORS policy is the cheaper truth. (If CORS
ever proves insufficient, verify the plugin's Cap 8 config shape before reaching for it.)

### The dev server URL never ships

Live reload works by pointing the shell at the Vite dev server instead of the bundle. A
committed `server.url` would produce a release app that only works on one LAN, so
`capacitor.config.ts` reads it from the environment:

```ts
const devServerUrl = process.env.CAP_DEV_SERVER_URL;
// server: devServerUrl ? { url: devServerUrl, cleartext: true } : undefined
```

A release build sets no variable and gets no `server` block. `cleartext` is dev-only and
appears nowhere else.

### The storage port goes async — and that changes the web too

`SessionStoragePort` is synchronous (`readRefreshToken(): string | null`) and `session-store`
reads it **at module load** to decide the initial snapshot. Every native storage API is
asynchronous, so the port becomes `Promise`-returning and:

- the initial snapshot is **`'restoring'`, not `'anonymous'`** — the store no longer knows at
  module load whether a token exists;
- `restoreSession()` publishes `'anonymous'` itself when hydration finds nothing;
- `main.tsx` keeps calling `void restoreSession()`; the route guard already renders the
  restoring state, so no new boot gate is needed.

Web gains one extra frame of "restoring" before the login screen. That is the correct price:
the alternative — a sync port with a native cache hydrated behind the scenes — hides an async
truth behind a lying signature and re-appears as an empty token on a cold start.

The port interface becomes:

```ts
export interface SessionStoragePort {
  readRefreshToken(): Promise<string | null>;
  writeRefreshToken(token: string): Promise<boolean>;
  clearRefreshToken(): Promise<void>;
}
```

**The implementation is chosen at runtime, not at build time.** Web and native ship the *same
bundle* — `build:native` differs only in its API origin — so there is no native entry point to
select a port in. `main.tsx` decides, before `restoreSession()`:

```ts
const port = Capacitor.isNativePlatform()
  ? await createSecureStorageSessionStoragePort()  // dynamic import() inside
  : createLocalStorageSessionStoragePort();
```

The `import()` inside the native factory keeps the storage plugin out of the web chunk;
`@capacitor/core` itself is a few KB and is needed for the platform check regardless.

The native port keeps `runGuarded`'s swallow-everything discipline: **any** storage failure
reads as "no token" and lands on the login screen, never as a thrown error into React.

### Secure storage: `@aparajita/capacitor-secure-storage` (native only)

`@capacitor/preferences` is ruled out — `SharedPreferences`/`UserDefaults` are durable but
**unencrypted**, which does not satisfy ADR-0005's "native secure storage".

Pinned: **`@aparajita/capacitor-secure-storage` 8.0.0** (Capacitor 8+, exact version in the
catalog). The deciding property: on Android it drives the **Android KeyStore directly** — a
system-generated AES-256-GCM key, hardware-backed where available, ciphertext in
SharedPreferences — instead of `androidx.security:security-crypto`, the deprecated
`EncryptedSharedPreferences` library most alternatives are built on. iOS is the Keychain.

- `setKeyPrefix('furria.club-app.')` at boot; iCloud **sync off** — a refresh token is
  device-bound.
- iOS default `KeychainAccess.whenUnlocked`.
- **Its web implementation is not used.** That implementation is plain `localStorage` and its
  own docs call it development-only; web keeps the existing tested port *and its existing key*,
  so the migration logs nobody out and the web bundle gains nothing.
- It throws `StorageError` instead of returning null, and the OS can invalidate the KeyStore
  key (lock-screen removal, restore onto a new device). A decrypt failure is treated exactly
  like a missing token: clear and go to login.
- Single-maintainer dependency. If it ever stalls on a Capacitor major, the fallback is
  `@capacitor/preferences` **plus** an ADR-0005 amendment recording the deviation — never a
  silent downgrade.

### Native chrome is part of the phase, not a polish pass

Capacitor 8 on `targetSdk 36` means **Android 16 enforces edge-to-edge**: `StatusBar`'s
`overlaysWebView` and `backgroundColor` no longer work, and `android.adjustMarginsForEdgeToEdge`
was removed in Cap 8. Insets are handled the web way — `env(safe-area-inset-*)` with the
`@capacitor/system-bars` CSS-variable fallback for older WebViews — which means the
`@furria/ui` app shell owns it, not the native project: `KkAppShell` is the single element
that knows where the app's edges are, and all three apps will need the same treatment. Insets
are layout, so this is not an ADR-0007 question — it is a "one owner" question.

Pinned, concretely:

- `KkAppShell`'s root carries the insets —
  `padding-top: var(--safe-area-inset-top, env(safe-area-inset-top, 0px))` and the same at the
  bottom, in the `var()`-first order `@capacitor/system-bars` documents (the plugin only
  supplies those variables as a fallback for older WebViews). The bottom inset is not optional:
  the mocks' sticky bottom navigation would otherwise sit under the gesture bar.
- **The status bar gets a style, not a background.** With edge-to-edge enforced, the app
  background already paints behind it; only icon contrast remains, via `StatusBar.setStyle`
  mirrored to the MUI colour scheme. The pre-hydration script in `index.html` already computes
  that scheme for `<meta name="theme-color">` — reuse its result instead of deriving it twice.
- `@capacitor/keyboard` with `resize: 'body'`.
- `@capacitor/app`'s `backButton` listener wired to router history with `App.exitApp()` at the
  root route — adding the listener disables the default behaviour, so it must handle both cases.
- `@capacitor/splash-screen` hidden explicitly once the session boot decision is known, so the
  app never flashes a blank WebView.

### The app mark — decided 2026-09-16

The icon is the **crossed-brooms tile** from `docs/design/fcc-logos.jsx` (`AppTile`): two white
brooms crossed on a red squircle, the club's coat of arms reduced to one glyph. It is not the
`favicon.svg` monogram the web app ships today; the web favicon is expected to follow the mark,
not the other way round.

One deviation from the mock: the tile gradient uses the shipped `@furria/ui` red tokens
(`#E11D2A` → `#B3101C`) rather than the mock's own `#C8102E`, so the icon matches the red of the
app it opens. The binding band keeps the mock's `#9C0B22` — it sits on white bristles, where a
token red would be too light to read.

**The mark is drawn, not stored.** `web/tools/app-icons` holds the brooms as SVG geometry in
`brand-mark.ts` and rasterises the five `@capacitor/assets` sources
(`icon-only`, `icon-background`, `icon-foreground`, `splash`, `splash-dark`) into
`apps/club-app/assets/`, then fans them out into the Android project. `pnpm icons` runs both
steps. Sources and generated resources are both committed, so a plain checkout builds without
the tool.

It is a `tools/` package and **not** a club-app dependency on purpose: `@capacitor/assets` drags
in `sharp`, and the club-app Dockerfile runs `pnpm install` against club-app's manifest. As a
club-app devDependency it would make every web image build download libvips to generate icons
no web build ever uses.

`icon-foreground` is drawn at 0.86 of the tile scale. `@capacitor/assets` insets both adaptive
layers by a further 16.7%, so a foreground that fills its own canvas lands outside the Android
adaptive-icon safe zone and gets clipped by round masks.

### Repo hygiene

- `android/` and `ios/` are **committed** — they are editable source (manifest, icons,
  signing), not generated output. The `.gitignore` files `cap add` writes keep the build
  directories and the synced `assets/public` bundle out.
- `web/.dockerignore` gains `**/android` and `**/ios`: the web image build context must not
  carry a native project.
- The `cd.yml` `club-app` paths filter currently matches `web/apps/club-app/**`, so an
  Android-only commit would rebuild and redeploy the shipped web image. It gains
  `- '!web/apps/club-app/android/**'` and `- '!web/apps/club-app/ios/**'`.
- **Both lists also exclude `apps/club-app/assets`** (added A4). That directory holds the
  `@capacitor/assets` icon and splash sources, which only the native projects consume.
- **Biome excludes `**/android` and `**/ios`** (added A4). `cap sync` copies the built web
  bundle into `android/app/src/main/assets/public`, and `biome check .` does not read
  `.gitignore` — without the exclusion it lints the minified bundle and reports tens of
  thousands of errors.
- No native build runs in CI in this phase. Building an APK on CI is a release concern.

---

## Phase A — Android (machine-executable, no Mac needed)

| # | Slice | Contents |
|---|---|---|
| A1 | Capacitor in the workspace | `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` into the catalog and `club-app`; `npx cap init` → `capacitor.config.ts` (`de.furria.club`, `webDir: 'dist'`, env-driven dev server); `cap:sync` / `cap:run:android` package scripts |
| A2 | The native API origin | `.env.native` (`https://furria.florianrth.com`) and the `build:native` script. No source change, and no Kestrel or Vite change — the runtime-config chain already behaves correctly in native |
| A3 | API CORS (**backend — `/backend-work`, TDD**) | Explicit policy for `https://localhost` and `capacitor://localhost`, `Authorization` header, `GET`/`POST`/`PUT`/`DELETE`, no credentials; integration test asserting the preflight and a rejected foreign origin |
| A4 | The Android project | `pnpm build:native` → `npx cap add android`; app name and icons/splash from the crossed-brooms mark (see *The app mark*); `.gitignore`, `.dockerignore`, `cd.yml` and Biome exclusions |
| A5 | Native chrome | `@capacitor/system-bars`, `@capacitor/keyboard`, `@capacitor/app` back button, `@capacitor/splash-screen`; safe-area insets in the `@furria/ui` app shell |
| A6 | Secure refresh-token storage | async `SessionStoragePort`; `'restoring'` initial snapshot; `@aparajita/capacitor-secure-storage` port behind a dynamic import, selected in `main.tsx` via `Capacitor.isNativePlatform()`; localStorage port kept for web |
| A7 | Device loop, documented | `README.md` section: `CAP_DEV_SERVER_URL` live reload against `vite --host` (the phone reaches the API through Vite's proxy, never directly), `npx cap run android` onto a USB device; a debug APK actually installed and logged in |

Slice order matters: A2 and A3 before A4, because an `android/` project that cannot reach the
API teaches nothing. A6 last, because it touches shipped session code and wants a working app
around it to verify against.

## Phase B — iOS (needs a Mac and a human)

Gated behind Phase A and behind Florian being on macOS. Everything here either requires Xcode
or a decision only an Apple account holder can make.

| # | Slice | Contents | Who |
|---|---|---|---|
| B1 | Prerequisites | Xcode + command line tools, CocoaPods, an Apple ID added to Xcode for free provisioning | Florian |
| B2 | The iOS project | `pnpm add @capacitor/ios` (catalog), `npx cap add ios`, bundle id `de.furria.club`, display name, icons/splash from the same source asset | agent |
| B3 | Signing and device trust | Development team selection, automatic signing, trusting the developer certificate on the phone | Florian |
| B4 | iOS chrome and storage | Status bar style per colour scheme, `capacitor://localhost` in the API CORS allowlist verified end-to-end, Keychain-backed storage port verified on device | agent |
| B5 | Run on device | `npx cap run ios`, login, session survives backgrounding and a cold start | both |

Not in Phase B: TestFlight, provisioning profiles for other testers, App Store Connect. That
is a release phase, not a "see it on my phone" phase.

---

## Done when

- `pnpm build:native && npx cap sync && npx cap run android` installs the Club-App on a USB
  device, it logs in against the deployed API, and the session survives a cold start.
- The same commit still builds, deploys and serves the web app unchanged — `pnpm build`,
  `pnpm test`, `pnpm lint`, `pnpm typecheck`, the club-app image, and a website commit that
  does not redeploy the club-app.
- No `server.url`, no `cleartext`, no LAN IP and no dev-only branch exists in a release build.
- The refresh token is in native secure storage on Android; the web implementation is
  untouched in behaviour beyond the one `'restoring'` frame.
- `docs/adr/0005` and `docs/adr/0006` record what was actually built (amendment, not rewrite),
  and the club-app `README.md` documents the native loop.

---

## Out of scope, deliberately

Push notifications, deep links / universal links, biometric unlock, offline caching or a
service worker, over-the-air web-bundle updates, the Play Store and App Store listings,
release signing and keystore custody, and the Event-App. Each is a phase of its own; none
blocks a test build on a phone.

---

## Open

One item needs Florian before A5 can be built. Everything else is decided.

**The `@furria/ui` blast radius of A5.** Safe-area insets land in `KkAppShell`, which the
website may also mount. The slice must confirm that adding `env(safe-area-inset-*)` padding
changes nothing on desktop web before it ships.

Two assumptions to **verify on first run**, neither of which changes a decision:

- `navigator.locks` (the refresh lock from CA-P0) in the Android WebView and in WKWebView.
  Expected present; if absent on a target, the store's existing no-lock path must be checked
  rather than a lock polyfilled in.
- Whether `pnpm`'s symlinked `node_modules` upsets the paths Capacitor writes into
  `capacitor.settings.gradle`. If it does, the fix is a `node-linker` setting for the app, not
  a change to the workspace layout.
