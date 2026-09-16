# Authentication uses ASP.NET Core Identity with bearer + refresh tokens

The platform authenticates Accounts with **ASP.NET Core Identity** as the credential store, and
sessions are carried as **bearer access tokens with refresh tokens**, not cookies. Decided
2026-09-03 (backend kickoff shaping), before the first line of identity code exists.

## The decisions

**ASP.NET Identity is the user store — and nothing more.** It owns what should never be
hand-rolled: password hashing, lockout, email confirmation, reset tokens, and (later) 2FA.
It does **authentication only**. Authorization lives entirely in the domain rights matrix
(`role`, `permission`, `role_permission`, `role_assignment` — the Ämter/Berechtigungen model in
`CONTEXT.md`), because Identity's flat role strings cannot express "Trainer, scoped to exactly
one Gruppe". `AddRoles<>()` is never wired up; Identity claims never carry permissions.

**The Identity user entity *is* the Account.** A custom user class (extending `IdentityUser`)
with a required, unique `PersonId` replaces the hand-designed `account` table in
`docs/design/FCC-Schema.txt` — Identity brings its own password hash, lockout and security-stamp
columns, and maintaining a parallel table would duplicate them. The domain rule is unchanged:
Account is optional and 1:1 to Person, master data stays on `person`, **Mitglied ≠ Account**.

**Email is the login identifier. There are no usernames.** Self-registering Karten buyers
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
- Both Account entry paths — Einladung (members and non-member Gruppen people) and public
  self-registration (Karten buyers) — create users through the same Identity store; the open
  **Gast-Registrierung & Dubletten** question (`CONTEXT.md`) is unaffected by this ADR and
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
