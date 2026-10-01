# Passkeys belong to the club domain, not to the club app's host

A passkey is bound to its relying-party ID forever: changing that ID later invalidates every
passkey members have made. The club app lives on `app.<club-domain>`, the website on the
`<club-domain>` apex, and the public will self-register accounts on the website to buy and keep
tickets. Decided with Florian on 2026-10-01 while shaping L1 of the launch plan, before the first
real passkey exists.

## The decision

**The relying-party ID is the club domain itself** (`furria.de`), not the club app's host
(`app.furria.de`). One passkey then signs her in on the club app and, once the website gains
sign-in, on the website too. Which origins are accepted stays a separate, explicit list: today
the club app's web origin and its Android signing keys; the website's origin joins it when the
website gets sign-in.

## Considered options

- **Keep the club app's host as relying party.** Rejected: website sign-in would need its own
  passkeys per site, and moving the ID later would break every passkey already made.

## Consequences

- Android verifies passkeys against `/.well-known/assetlinks.json` at the relying-party domain, so
  the **website** must serve it at the apex. The club app keeps serving it for App Links.
- The domain must be decided before the board's first real passkey; passkeys made under any
  earlier domain stop working on the move.
