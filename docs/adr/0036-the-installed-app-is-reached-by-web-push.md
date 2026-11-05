# The installed app is reached by Web Push

The beer list (RFC 0004, ADR-0035) must remind people of open tabs and warn the operators before
the beer runs out, without anyone sending reminders by hand. Live direction's "you're up next"
will need the same channel. The platform had no way to reach a phone while the app is closed.
The club app ships as an installed PWA, not a store app (ADR-0031), so the channel is standard
Web Push. Decided 2026-11-04 with the beer list; built in its phase 7.

## The decision

**The API pushes to installed club apps over standard Web Push (RFC 8030): payloads encrypted
with `aes128gcm` (RFC 8291), the server identified by VAPID (RFC 8292). There is no third-party
push provider, no Firebase SDK and no push library.**

- **Server identity:** one P-256 key pair in config: `Push:VapidPublicKey` and
  `Push:VapidPrivateKey` (raw base64url, 65 and 32 bytes), plus `Push:Subject`, the contact that
  push services see (`mailto:` or an `https` URL; production uses the club app's URL). Apple's push service refuses (403) a subject on a
  non-public domain such as `mailto:…@furria.local`, so even development uses a real `https` URL
  (found on an iPhone, 2026-11-05). **All three
  are required.** The API refuses to start unless the two keys are one pair and the subject is a
  contact, the same as every other secret (`Media:SigningKey`, `Altcha:HmacKey`). A platform that
  starts without them would silently lose every reminder. A start that fails is visible at once
  and is fixed with one edit of `.env`. The key pair is **permanent**. Rotating it orphans every
  subscribed device: push services refuse a push signed by another key. The app re-subscribes a
  device on its next start when the key changed, so members do nothing.
- **A device is a push subscription:** `push_subscription` holds one row per browser endpoint
  (unique) with its `p256dh` key and auth secret, and belongs to one **account**, not to a
  person. Signing in on a device moves its subscription to the new account. The managing login
  can subscribe too. The row cascades with the account. Everything that ends all of an
  account's sessions also deletes all of its devices: signing out everywhere, a password change
  or reset, an access recovery or claim, and disabling the account. A device that a stolen
  session subscribed stops receiving pushes then. The member's own app announces its device
  again the next time it comes to the foreground. Signing out on one device removes that device
  on the server and always unsubscribes it in the browser, even when the server cannot be
  reached. An account keeps at most **10 devices**; subscribing an 11th forgets the earliest one.
- **Endpoints:**
  - `GET push/key` hands out the public key. The client never builds it in, so a key change
    reaches every installed app.
  - `PUT push/subscription` takes the browser's `PushSubscription.toJSON()` and upserts it by
    endpoint.
  - `POST push/subscription/remove` forgets one of the caller's own devices.
  - All three are open to any signed-in account.
- **Only real push services:** the API sends an HTTPS POST to whatever endpoint a client
  registered, so a free endpoint would be a server-side request forgery. A subscription is
  accepted only for `https` on the default port at a known push service: `fcm.googleapis.com`
  (Chrome, Edge on Android, Samsung Internet), `*.push.apple.com` (Safari, iOS),
  `*.push.services.mozilla.com` (Firefox) and `*.notify.windows.com` (Edge on Windows). A new
  browser vendor means adding its host. The endpoint must be plain ASCII. The push client
  follows no redirects, so an allowed host cannot point the API at an internal address.
- **Sending (`PushSender`):**
  - It sends to every device of one account at once (at most 10), through the named
    `HttpClient` `web-push` (10 s timeout, no redirects).
  - Each push has a fresh ephemeral key and salt and a VAPID JWT (ES256, `aud` = the push
    service's origin, 12 h).
  - The payload is JSON: `title`, `body`, `url` (an app path) and `tag`. The same tag replaces
    an older notification of the same kind instead of stacking it.
  - Every push carries a `TTL`.
  - A `404` or `410` from the push service means the device is gone, and its row is deleted at
    once, unless it was re-subscribed with new keys in the meantime.
  - Any other refusal or failure is logged at Warning, naming the subscription id (and the push
    service host for a refusal), never the endpoint. The device is kept. One broken device never
    stops the others.
  - The caller gets `delivered / forgotten / failed` counts.
  - Who receives what is the caller's business. The reminder workers (RFC 0004 phase 8) pick
    accounts; the sender knows only accounts.
- **Proof on devices:** `POST system/test-push` (`system.view`) pushes a test notification to the
  caller's own devices and reports the counts. It is on the System page as *Testnachricht senden*.
- **In the app:**
  - *Mein Profil → Benachrichtigungen* holds one switch per device, *Auf diesem Gerät
    benachrichtigen*. It is a setting in the sense of ADR-0016.
  - Turning it on is the user gesture that asks for the browser permission. Then the app
    subscribes with the server key and announces the device.
  - Turning it off removes the device on the server and unsubscribes the browser.
  - The panel explains, instead of offering a switch, when:
    - the browser cannot push;
    - an iPhone runs the app in a tab: iOS pushes only to home-screen apps, 16.4+, which
      ADR-0031 already enforces;
    - the permission was refused, with a pointer to the device settings.
  - The app never asks for the permission on its own or on start.
  - On every sign-in, and whenever the app comes to the foreground, it re-announces an existing
    subscription. This picks up a rotated endpoint or key, an account switch, and a device the
    server forgot when all sessions ended. The server writes only when something changed.
- **Service worker:** the generated worker (ADR-0031) imports `push-worker.js`
  (`workbox.importScripts`). It:
  - shows the notification;
  - on a click, focuses the running app and routes it in place, by a `furria:push-open` message
    to the client, or opens the app at the path when none runs. Paths are app paths only, never
    another origin;
  - re-subscribes on `pushsubscriptionchange`; the new endpoint reaches the server on the next
    start.

  nginx serves `push-worker.js` with `no-cache` like `sw.js`, so a changed handler reaches
  devices with the next update check.

## Considered options

- **Firebase Cloud Messaging SDK / a push provider (OneSignal …):** it would bring a third party
  and its data processing into a club app for something the browsers' own standard covers. iOS
  web push is not FCM anyway.
- **A push library (`WebPush`, `Lib.Net.Http.WebPush`):** RFC 8291/8292 are about 100 lines on
  .NET's own `ECDiffieHellman`, `HKDF` and `AesGcm`. The RFC 8291 worked example pins the
  encryption byte for byte (`WebPushPayloadTests`), and the integration tests decrypt every push
  and verify its VAPID signature like a push service would. A library would add a dependency for
  no less testing.
- **Optional VAPID config, push silently off without it:** this would spare the live compose an
  edit. It was rejected because reminders that never arrive and never fail are worse than a start
  that refuses. The edit is made once, before the release that needs it.
- **Subscriptions per person:** a person without an account cannot be signed in on a device. The
  managing login has no person. A device belongs to whoever is signed in on it.
- **Asking for the permission at first start:** browsers punish prompts without a gesture, and
  iOS refuses them. A refused prompt can only be undone in the device settings. The prompt comes
  only from the member's own switch.

## Consequences

- The live host needs `PUSH_VAPID_PUBLIC_KEY` and `PUSH_VAPID_PRIVATE_KEY` in `.env` and the
  three `Push__*` lines in the compose **before** an API with this change starts. Watchtower would
  otherwise restart it into a refused start. See `docs/ops/PRODUCTION.md`, *Configuration*.
- A member who declines notifications still gets every reminder as a Start task (RFC 0004). Push
  is an extra, never the only path.
- Device checks are owed by hand on an iPhone (installed app) and a Pixel, because no CI browser
  receives real pushes.
