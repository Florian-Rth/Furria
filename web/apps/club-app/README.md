# @furria/club-app

The internal member app of the Furrscher Carnevals Club e.V.: member master data, roles (Ämter),
groups, fees and payments, event planning, live show control, drinks kitty, shop, gallery and key
registry. React 19 (Compiler on) + TypeScript + Vite + TanStack Router/Query, themed exclusively
via [`@furria/ui`](../../packages/ui), later wrapped in **Capacitor** for native push, iOS live
activities and home-screen widgets.

```bash
cd web
pnpm install
pnpm dev:club-app     # club-app on http://localhost:3001 (proxies /api → :5100)
```

Start the API first (`cd server && docker compose up -d && dotnet run --project src/Furria.Api`);
nothing renders here without a session. In production the app is served by its own nginx on
`app.furria.de`, which proxies `/api/` to the `api` service, so client and API are always
same-origin and no CORS exists.

Every visible component comes from `@furria/ui` as a `Kk*` part, never from MUI directly
([ADR-0007](../../../docs/adr/0007-furria-ui-owns-every-visible-component.md)); the boundary is
lint-enforced by `apps/club-app/**` overrides in [`web/biome.json`](../../biome.json). The session
model (bearer tokens, refresh token in `localStorage` behind a port, a 401 as terminal) is
[ADR-0006](../../../docs/adr/0006-browser-session-storage-and-401-handling.md).

## Native shell (Android)

The same bundle, wrapped by Capacitor. `android/` is committed source — manifest, icons, signing
— not build output. Nothing here is a second app: `pnpm build:native` differs from `pnpm build`
only in the API origin it bakes in ([`.env.native`](.env.native)).

### Prerequisites

Android Studio, for the SDK **and** its bundled JDK. Neither lands on `PATH`, so every Gradle
invocation needs both pointed at explicitly:

```bash
export JAVA_HOME="$HOME/.local/share/android-studio/jbr"   # JDK 21, ships with Android Studio
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"           # adb
```

On the phone: Settings → About phone → tap *Build number* 7×, then Developer options → **USB
debugging**. Plug in and accept *Allow USB debugging?*. `adb devices` must show `device`, not
`unauthorized`.

### The bundled build

```bash
cd web && pnpm build:native                    # dist/ against https://furria.florianrth.com
cd apps/club-app && npx cap sync android       # copies dist/ into the app package
npx cap run android                            # or: android/gradlew assembleDebug && adb install -r …
```

The WebView serves the app from `https://localhost`, which is a genuinely foreign origin to the
API — so this path needs the CORS policy from `Furria.Api/Cors/NativeShellCors.cs` to be
**deployed**. `cd.yml` only deploys from `main`; against an older deployment every request fails
as a CORS error, not a network error.

### The device loop (live reload)

Faster, and it sidesteps CORS entirely — the page is served by Vite, so `/api` is same-origin and
goes through Vite's proxy to the local API. `adb reverse` tunnels the phone's `localhost:3001` to
this machine, so no shared Wi-Fi and no LAN IP that changes when you move desks:

```bash
cd server && docker compose up -d && dotnet run --project src/Furria.Api   # API on :5100
cd web && pnpm dev:club-app                                                # Vite on :3001

adb reverse tcp:3001 tcp:3001
cd apps/club-app
CAP_DEV_SERVER_URL=http://localhost:3001 npx cap sync android
(cd android && ./gradlew assembleDebug) && adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Edits now reload on the phone. `CAP_DEV_SERVER_URL` is read in
[`capacitor.config.ts`](capacitor.config.ts) and never committed: no variable, no `server` block,
so a release build cannot accidentally point at a dev machine. To go back to the bundled build,
re-run `npx cap sync android` **without** the variable and reinstall.

Over Wi-Fi instead of USB: `pnpm dev:club-app --host` and `CAP_DEV_SERVER_URL=http://<lan-ip>:3001`.

### Looking inside the running app

`chrome://inspect/#devices` in desktop Chrome lists the WebView. For scripted inspection:

```bash
adb forward tcp:9222 localabstract:webview_devtools_remote_$(adb shell pidof de.furria.club)
curl -s http://localhost:9222/json/list          # then attach any CDP client to the page
adb exec-out screencap -p -d <display-id> > shot.png   # -d only needed on multi-display devices
```

The refresh token is **not** in `localStorage` on native — it is AES-256-GCM ciphertext in the
Android KeyStore, visible as `furria.club-app.refresh-token` in
`adb shell run-as de.furria.club cat shared_prefs/WSSecureStorageSharedPreferences.xml`
([ADR-0005](../../../docs/adr/0005-auth-aspnet-identity-bearer-tokens.md)).

## Scope

CA-P0 builds the deployable, branded, authenticated shell and no domain feature: login, boot
state, route guard, the `/auth/me` overview, logout, plus the deploy chain. See
[`plan/club-app/p0-shell-and-session.md`](../../../plan/club-app/p0-shell-and-session.md). Test
rules are [`docs/web/TESTING.md`](../../../docs/web/TESTING.md): pure functions only.
