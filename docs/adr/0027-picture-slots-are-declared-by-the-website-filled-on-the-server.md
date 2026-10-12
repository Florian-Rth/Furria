# Picture slots are declared by the website, filled on the server

The website's fixed photos — hero, club story, share image — are **picture slots**, filled in the
club app instead of hardcoded. Decided with Florian on 2026-10-12 while shaping L7c.

## The decision

**Which slots exist is code in the web package `@furria/website-pictures`; which picture fills
which slot is data on the server, under keys the server does not interpret.**

- **The catalogue** — key, page, description, positions with their formats — is a typed constant
  the website reads pictures from and the club app lists slots from. Adding a slot is a web-only
  change; it appears empty in the club app on the next deploy.
- **The server stores assignments** `(slot key, position) → media item`, with the format the
  picture was cut to and its alt text, under any well-formed key. It never knows which slots exist,
  so it cannot tell an empty slot from an unknown one, and it refuses only malformed keys. A stored
  key the catalogue no longer declares is shown in the club app to remove or move, never dropped
  silently.
- **Each position has a stable public URL** `/api/public/website-pictures/{slot}/{position}/{rendition}`
  serving whatever fills it, revalidated by ETag, 404 while empty — so static HTML can reference
  and preload a slot (the landing hero, `og:image`) without waiting for the API. This adds a
  key-addressed form beside ADR-0025's item-addressed public URLs.

## Considered options

- **The catalogue on the server too**, as a C# copy checked against the web one in CI — would
  refuse unknown keys and let Start raise a *pictures missing* to-do. Rejected: every new slot
  would need a backend change and deploy, and the server image builds from `server/` alone, so it
  cannot share the web file. Empty slots are a fill-once task, not a recurring one.
- **A real `Album` holding the slots** — rejected: an album is one occasion with a session, a bin,
  a selection and a publish act, and each rule would need an exception.
- **Item URLs only**, known from the JSON — the landing hero would start loading only after the
  bundle, React and an API round-trip.
