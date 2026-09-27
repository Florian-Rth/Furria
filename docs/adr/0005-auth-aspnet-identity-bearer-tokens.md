# Authentication uses ASP.NET Core Identity with bearer + refresh tokens

The platform authenticates Accounts with **ASP.NET Core Identity** as the credential store, and
sessions are carried as **bearer access tokens with refresh tokens**, not cookies. Decided
2026-09-03 (backend kickoff shaping), before the first line of identity code exists.

## The decisions

**ASP.NET Identity is the user store — and nothing more.** It owns what should never be
hand-rolled: password hashing, lockout, email confirmation, reset tokens, and (later) 2FA.
It does **authentication only**. Authorization lives entirely in the domain rights matrix
(`role`, `permission`, `role_permission`, `role_assignment` — the roles/permissions model in
`CONTEXT.md`), because Identity's flat role strings cannot express "Trainer, scoped to exactly
one group". `AddRoles<>()` is never wired up; Identity claims never carry permissions.

**The Identity user entity *is* the Account.** A custom user class (extending `IdentityUser`)
with a required, unique `PersonId` replaces the hand-designed `account` table in
`docs/design/FCC-Schema.txt` — Identity brings its own password hash, lockout and security-stamp
columns, and maintaining a parallel table would duplicate them. The domain rule is unchanged:
Account is optional and 1:1 to Person, master data stays on `person`, **Member ≠ Account**.

**Email is the login identifier. There are no usernames.** Self-registering ticket buyers
(decided 2026-08-18) will not invent usernames, and two identifiers mean two recovery flows.
The DBML's `account.username` column is dropped; `person.email` stays contact data, the
Account's email is the credential — they may differ, and the Account email is the one that is
verified.

**Tokens, not cookies.** Three first-party SPAs on their own (sub)domains plus the Club-App
inside a Capacitor native shell make cookie auth the fragile path (cross-origin cookie rules,
webview quirks). Access tokens are short-lived JWTs; refresh tokens are long-lived, stored
server-side and rotated on use. In the browser, tokens live in memory with the refresh flow
recovering the session; in the Capacitor shell, the refresh token sits in native secure storage.

**No OIDC server.** OpenIddict/Keycloak would earn their complexity only with third-party
clients or true SSO federation. All clients are first-party against one API — plain token
endpoints on our own API suffice. If a genuine external client ever appears, an OIDC layer can
be put in front of the same Identity store; nothing in this decision blocks that.

## Consequences

- **Endpoint style stays REPR:** login/refresh are our own FastEndpoints endpoints wrapping
  `UserManager`/`SignInManager`. The built-in `MapIdentityApi` endpoint bundle is not used — it
  bypasses our endpoint conventions, validators and response shapes.
- **Refresh tokens are persisted and rotated** — a stolen refresh token dies on first reuse.
  Logout revokes server-side, so "log out everywhere" is possible from day one.
- **Once the Club-App ships as a native app, the API loses the right to break clients.** Store
  review lag means old app versions live for months; API changes become additive-only (or
  versioned) from that point. Until then the constraint does not apply.
- **Bootstrapping:** with invite-only onboarding, the first Account cannot invite itself. The
  API seeds one configured bootstrap admin when no Account exists.
- The DBML `account` table and its `account_status` enum in `docs/design/FCC-Schema.txt` are
  **superseded** by the Identity schema; a manual "disabled by the club" switch is a domain flag
  on the Account entity, distinct from Identity's automatic lockout.
- Both Account entry paths — invitation (members and non-member group people) and public
  self-registration (ticket buyers) — create users through the same Identity store; the open
  **guest registration & duplicates** question (`CONTEXT.md`) is unaffected by this ADR and
  must be decided before self-registration ships.

## Amendment (2026-09-04, CA-P0 shaping)

The decision above stands unchanged: bearer tokens, not cookies. One **consequence** was stated
too narrowly. "In the browser, tokens live in memory with the refresh flow recovering the
session" cannot hold for both tokens — if the refresh token is also in memory, a reload destroys
the token the recovery depends on, and every page refresh becomes a login. The access token
lives in memory; the refresh token is persisted behind a storage port whose Capacitor
implementation is the native secure storage this ADR already anticipated. See
[ADR-0006](0006-browser-session-storage-and-401-handling.md) for the full browser session model,
including why a 401 is terminal and how cross-tab refreshes avoid tripping this ADR's own reuse
detection.

## Amendment (2026-09-16, CA-N slice A6)

"In the Capacitor shell, the refresh token sits in native secure storage" is now built, on
Android. Pinning that sentence to a concrete store ruled out the obvious candidate:
`@capacitor/preferences` wraps `SharedPreferences`/`UserDefaults`, which are durable but
**unencrypted** — persistence, not secure storage.

The refresh token is held by `@aparajita/capacitor-secure-storage` 8, which on Android drives
the **Android KeyStore** directly (a system-generated AES-256-GCM key, hardware-backed where
available, ciphertext in SharedPreferences) instead of the deprecated `EncryptedSharedPreferences`
library most alternatives are built on. On iOS it is the Keychain, with iCloud sync off, because
a refresh token is device-bound.

Two consequences belong to this ADR:

- **A decrypt failure is a logout, not an error.** The OS can invalidate the KeyStore key — the
  lock screen is removed, or a backup is restored onto a different device. Any storage failure
  reads as "no token": the entry is cleared and the app lands on the login screen. It never
  reaches the UI as an exception, and it never falls back to an unencrypted store.
- **The plugin is a single-maintainer dependency.** If it ever stalls on a Capacitor major, the
  fallback is `@capacitor/preferences` **plus** an amendment here recording that the refresh
  token is no longer encrypted at rest — never a silent downgrade.

The browser is unchanged: `localStorage` behind the same port and under the same key, per
[ADR-0006](0006-browser-session-storage-and-401-handling.md).

## Amendment (2026-09-26, CA-P8 slice S7)

Passkeys join the password as a second way in — **password always, passkey optional** (CA-P8
ruling 10). Nothing above changes: a passkey sign-in ends in the same bearer access token and
rotated refresh token a password sign-in does, through the same session issuing and the same
refusal of a disabled account. **The password lockout does not apply to a passkey**: the lockout
defends against guessing, a user-verified passkey cannot be guessed, and someone spamming wrong
passwords must not lock her out of her passkey.

**Identity does the WebAuthn work; our endpoints carry its state.** The Identity store moves to
schema version 3 (`account_passkey`), and the ceremonies run through the handler-level
`IPasskeyHandler<Account>` — `MakeCreationOptionsAsync` / `PerformAttestationAsync` to add a
passkey, `MakeRequestOptionsAsync` / `PerformAssertionAsync` to sign in with one. The
`SignInManager` passkey methods are not used: they keep the ceremony state (the challenge, and for
a creation the user it is for) in an authentication cookie between the two calls, and this API has
no cookie.

**The ceremony state lives server-side, in `passkey_challenge`.** The options call stores
Identity's state JSON under an opaque random id (32 bytes, base64url; only its SHA-256 is stored)
and returns the id beside the WebAuthn options; the client echoes the id back with the
credential. A challenge

- lives **5 minutes**;
- is **single use**: the first call that presents it deletes it, whether the ceremony then
  succeeds or fails, so a replayed or retried credential always meets a dead challenge;
- carries its **purpose** (creation or request) and, for a creation, **the account** it was issued
  to — a creation challenge presented by another account, or a request challenge presented to the
  creation endpoint, is refused;
- is cleaned up **on write**: issuing a challenge first deletes every expired row.

Not a cookie, because there is none to put it in and a second, cookie-carried state would bring
back the cross-origin and WebView fragility this ADR rejected. Not memory, because a challenge
issued by one API instance must be redeemable on another — the database is the state every
instance already shares. Not a signed or encrypted blob handed to the client either, because a
blob cannot be made single use without a server-side record of its use.

**The relying party is the club app's host.** `IdentityPasskeyOptions.ServerDomain` is the host of
`ClubApp:BaseUrl` (the same value the mail links are built from), resident keys are required so
sign-in is discoverable (no email typed), and user verification is required. The accepted
origins, checked by the options' `ValidateOrigin` hook, are exactly:

- the origin of `ClubApp:BaseUrl`, and
- `android:apk-key-hash:<base64url SHA-256 of the signing certificate>` for every entry of
  `ClubApp:AndroidCertFingerprints` — the origin Android's Credential Manager reports when the
  Capacitor WebView runs WebAuthn for the app. A list, because the debug and release keys differ;
  the fingerprints are configuration, never committed, and the app's `assetlinks.json` declares
  `get_login_creds` for the same fingerprints.

A cross-origin (iframe) ceremony is refused. Re-authentication (deleting the account) accepts a
passkey assertion in place of the password; it must assert a passkey of the signed-in account.
Claim-in (ADR-0019) accepts one in place of the claimed account's password; it must assert a
passkey of that account.
