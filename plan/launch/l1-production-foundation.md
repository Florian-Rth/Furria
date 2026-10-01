---
status: agreed 2026-10-01 — S1 next
phase: L1 — Production foundation (plan/launch.md)
shaped_with: Florian, grilling session 2026-10-01
binding: docs/adr/0020
---

# L1 — Production foundation

Make the production stack on the homelab safe to run the club on: the club domain, honest client
addresses behind the edge, CI-gated deploys with rollback, durable mail, a health check that
means something and rate-limited sign-in.

---

## What was ruled on 2026-10-01

1. **Production stays on the homelab** (`~/furria` on `10.10.20.12`), under a new club domain.
2. **The TLS edge stays Florian's Hetzner nginx, outside the repo.** L1 owns everything from the
   app nginx inward. A docs page states the edge contract: TLS for both hostnames, forward
   `X-Forwarded-For` / `X-Forwarded-Proto`, proxy to the website and club-app ports.
3. **Domain layout**: website on the `<club-domain>` apex (`www` redirects at the edge), club app
   on `app.<club-domain>`, each serving `/api` same-origin through its own nginx.
   **Production CORS leaves L1** — same-origin needs none, and the native-shell origins are
   already in `NativeShellCors`.
4. **One variable sets the domain**: `CLUB_DOMAIN` in `.env`; the compose derives
   `ClubApp__BaseUrl` and the passkey relying-party ID from it. The API keeps explicit, validated
   options. A website base URL arrives with its first caller (website sign-in), not in L1.
   An optional `CLUB_APP_HOST` overrides the derived host
   (`${CLUB_APP_HOST:-app.${CLUB_DOMAIN}}`); the API refuses to start unless the relying-party ID
   is a suffix of the club app's host. Interim: `CLUB_DOMAIN=florianrth.com`,
   `CLUB_APP_HOST=furria-app.florianrth.com`; passkeys made then die at the cutover (ADR-0020).
5. **Passkeys belong to the club domain** (the apex), not the club app's host
   ([ADR-0020](../../docs/adr/0020-passkeys-belong-to-the-club-domain.md)). The website serves
   `/.well-known/assetlinks.json` at the apex; the club app keeps serving it for App Links.
6. **Deploys stay pull-based on Watchtower**, gated by CI:
   - image builds move into `ci.yml` as jobs `needs: [backend, web]`, on push to `main` only;
     `cd.yml` goes away;
   - every image is pushed as immutable `sha-<short>` — the only immutable tag (a `v<semver>`
     tag would be repointed by every push until the next bump); `:latest` stays the tag
     Watchtower follows and only a green `main` moves it;
   - CI passes the commit as `SourceRevisionId`, so `/api/health` reports `<semver>+<sha>` —
     the running `sha` is readable before a rollback;
   - third-party images are pinned to an exact minor (`postgres:18.<x>-alpine`);
   - **Rollback** is a `workflow_dispatch` that repoints `:latest` per app to a given `sha-…`
     (`imagetools create`, no rebuild); the next green `main` moves it forward again;
   - accepted cost: a release that fails to start is down until rolled back.
7. **Mail goes through a transactional outbox**:
   - the rendered mail is a row written in the **same transaction** as the write that causes
     it; the post-commit `MailQueue.Enqueue` goes away;
   - the dispatcher claims due rows with `FOR UPDATE SKIP LOCKED`, woken after each commit and
     polling every few seconds; `Attempt` and `NextAttemptAt` live on the row;
   - retries 5 s, 30 s, 2 min, 10 min, 1 h, 6 h, then abandoned (logged);
   - **the row is deleted once sent or abandoned** — its body carries the plaintext token link
     the `Invitations` table only keeps hashed; the logs (ADR-0017) are the trail;
   - the **signed-out request queue stays in memory**: a lost request costs a retry, a durable
     one would store addresses typed by anonymous callers. Its mails go through the outbox.
8. **`GET /api/health` becomes DB-aware**, same route and shape: `CanConnectAsync` (2 s timeout)
   and no pending migrations → 200 `{status:"ok", version}`, else 503
   `{status:"unavailable", version}` — never which part failed. SMTP is not checked (the outbox
   absorbs outages). The compose gains an `api` `healthcheck` (`curl` in the runtime image);
   `website` and `club-app` wait on `service_healthy`.
9. **Sign-in limits count failures, never successes**, per client IP (`RateLimits:SignIn`,
   env-configurable, built like `AddressRateLimiter`):
   - failed password logins: 20 per 15 min per IP, then 429 for password attempts from it; the
     per-account lockout stays;
   - passkey login moves off `signed-out-per-ip` onto the same failure counter;
   - rejected refresh tokens (unknown, expired, reused): 20 per 15 min per IP; valid refreshes
     never count.
   - **For L8**: invitation lookup/redeem stay on `signed-out-per-ip` (30 per 15 min); one club
     Wi-Fi on the onboarding evening would exhaust it — raise to ~100 by config in the L8
     rehearsal (the per-token limiters stay).
10. **Trusted proxies are configured, and production refuses to start without them**:
    - `ForwardedHeaders:TrustedProxies` (IPs and CIDRs); `X-Forwarded-For` / `-Proto` are read
      right to left and stop at the first untrusted address, so a client-sent value never wins;
      no fixed hop count;
    - the compose declares the Furria network's subnet; `.env` gains
      `EDGE_PROXY_ADDRESS=10.10.20.1` (the gateway the edge's traffic arrives through); the
      compose passes both;
    - the app nginx passes the edge's `X-Forwarded-Proto` through, `$scheme` only when absent;
    - accepted: anything reaching the homelab through the gateway could claim an address.
11. **Security headers live in the app nginx templates** (website and club app, same set, also
    on locations with their own `add_header`):
    - `Strict-Transport-Security: max-age=31536000; includeSubDomains` — no `preload`;
    - `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'
      'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self';
      frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'` — the
      theme bootstrap moves from inline into `/theme-boot.js` (synchronous in `<head>`);
      Emotion needs `'unsafe-inline'` for styles;
    - `X-Content-Type-Options: nosniff`, `Referrer-Policy: same-origin`,
      `Cross-Origin-Opener-Policy: same-origin`,
      `Permissions-Policy: camera=(), microphone=(), geolocation=()`;
    - verified by `pnpm shot` on both apps with no CSP violation in the console.

---

## Slices

| # | Slice | Note |
|---|---|---|
| S1 | **CI-gated images** — builds into `ci.yml`, `sha-` tags, `SourceRevisionId`, Rollback workflow, pinned postgres, `cd.yml` removed (ruling 6) | First: every later slice ships through the gate |
| S2 | **Trusted proxies** — API `ForwardedHeaders` failing closed, nginx `X-Forwarded-Proto` pass-through, declared compose subnet, `EDGE_PROXY_ADDRESS` (ruling 10) | Gives every per-IP limit real addresses |
| S3 | **Sign-in failure limits** — password login, passkey login, rejected refresh (ruling 9) | |
| S4 | **DB-aware health** and the `api` compose healthcheck (ruling 8) | |
| S5 | **Mail outbox** — table, same-transaction writes, dispatcher, retry schedule (ruling 7) | Largest; one migration |
| S6 | **Club domain** — `CLUB_DOMAIN` / `CLUB_APP_HOST`, relying party on the domain with the suffix check, website `assetlinks.json` (rulings 4, 5) | Existing test passkeys die on deploy |
| S7 | **Security headers** and `/theme-boot.js` (ruling 11) | Screenshot check on both apps |
| S8 | **Ops docs and the live host** — edge contract, rollback runbook, the live `~/furria` compose brought onto the example (it lacks log rotation, among others) | With Florian on the host |

**L1 is done when** S1–S8 are merged on a green `main` and production runs the example compose.
The cutover to the club domain is **not** an L1 exit: it is one `.env` change plus the edge
config, whenever the domain exists.

---

## Deferred out of L1

- **Backups — the whole topic** (ruled 2026-10-01): pre-migration dump, nightly backups,
  off-site target, restore drill. Until it lands, migrations run on start with no dump before
  them and a rollback across a migration has nothing to restore from.
- **Production CORS** — nothing to do: both web apps are same-origin, and the native-shell
  origins are already in `NativeShellCors` (ruling 3).
- **External uptime monitoring** (ruled 2026-10-01): nothing alerts when `/api/health` fails.
  With Watchtower deploys (ruling 6) a release that fails to start is noticed by hand.
