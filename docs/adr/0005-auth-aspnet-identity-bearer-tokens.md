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
