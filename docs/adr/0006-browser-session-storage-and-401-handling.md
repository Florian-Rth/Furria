# Browser session: the refresh token is persisted, and a 401 is terminal

[ADR-0005](0005-auth-aspnet-identity-bearer-tokens.md) settled that sessions are carried as
bearer access tokens with refresh tokens rather than cookies. It did not settle how a browser
client actually holds and renews them. Decided 2026-09-04, shaping the Club-App's first phase
([CA-P0](../../plan/club-app/p0-shell-and-session.md)) — the first real client of B1.

## The decisions

**The access token lives in memory; the refresh token is persisted in `localStorage` behind a
port.** ADR-0005 says "tokens live in memory with the refresh flow recovering the session",
which cannot hold for both tokens: a reload would destroy the very token the recovery depends
on, and every page refresh would land on the login screen. The Club-App is opened many times a
day by the same people, so that is not a viable session. Persistence goes through a small
storage interface with one implementation today; the Capacitor shell swaps it for native secure
storage, exactly as ADR-0005 anticipated.

**A 401 is terminal. It never triggers a refresh and is never retried.** The client clears both
tokens and goes to the login screen. The common alternative — refresh on 401, then replay the
request — hides two very different situations behind one code path: an ordinary expiry and a
genuinely revoked session (account disabled, refresh-token family revoked). Treating 401 as
final keeps one meaning for one status code.

**Because a 401 is terminal, the client must prevent expiry rather than discover it.** A stored
refresh token triggers one refresh at boot before the app renders, and any request whose access
token is inside the expiry margin refreshes first. There is no timer: laptop sleep, tab
throttling and Capacitor backgrounding all fire timers late, so a timer would need the very
fallback it was meant to replace.

**Token lifetime is counted locally, never compared against the device clock.** The server sends
an absolute `accessTokenExpiresAt`. Comparing it to `Date.now()` on a phone whose clock runs two
minutes slow would make the client believe a dead token is still valid — and under a terminal
401 that is an instant, unexplainable logout rather than a silent refresh. The remaining
lifetime is captured at the moment of receipt (`expiresAt − Date.now()`) and counted down
locally, so a constant skew cancels out on both sides of the subtraction.

**Refreshes are serialised with `navigator.locks`, and the token is re-read from storage inside
the lock.** B1 rotates refresh tokens with family-based reuse detection: presenting an
already-rotated token within `Auth:RefreshToken:ReuseGraceWindow` (30 s) is a plain 401, but
after that window it revokes **every** session for that Account, on every device. Simultaneous
refreshes in two tabs are absorbed by the grace window; the real hazard is a stale tab waking up
later and presenting a token another tab rotated hours ago. Reading the token from storage
inside the lock — never from a variable captured before it — removes that: the losing tab finds
the current token and skips its own refresh entirely.

## Consequences

- **An XSS on the Club-App can read a 30-day refresh token.** This is the accepted cost of a
  session that survives a reload. It is bounded by exactly the machinery B1 already ships:
  rotation means a stolen token dies the moment the real client next refreshes, and reuse
  detection then revokes the whole family. Cookies would remove this specific vector, but
  ADR-0005 rejected them for reasons that have not changed.
- **There is no "stay logged in" toggle.** One storage behaviour means one auth path to build,
  test and reason about. Logout is the explicit exit and revokes server-side.
- **`navigator.locks` is now a hard runtime dependency** of the session layer. It is available in
  every browser the platform targets and in both Capacitor webviews.
