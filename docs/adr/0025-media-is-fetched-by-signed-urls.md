# Media is fetched by signed URLs, not a cookie

Sessions are bearer tokens (ADR-0005, ADR-0006), and `<img>` / `<video>` cannot send an
`Authorization` header. Fetching media through JavaScript into blob URLs breaks video seeking and
the browser's image cache. Decided with Florian on 2026-10-08 while shaping L7a.

## The decision

**Every media URL the API hands out carries its own authorisation: an HMAC over item, rendition
and expiry.** Wherever a response contains a media item, it contains ready-made URLs per rendition
(`/api/media/{id}/{rendition}?exp=…&sig=…`; `?download` adds `Content-Disposition` with the
original's file name).

- **Expiry is rounded to 24-hour windows and valid for 48 hours**, so a URL stays the same for a
  day and the browser cache works across reloads.
- **The API serves the files itself** (range requests, `sendfile`); no nginx needs the media mount.
- **The API checks the item still exists and still belongs where the URL says before serving**,
  so deletion and takedown take effect at once; a leaked URL to a living item works at most 48 h.
- **The public face is unsigned**: renditions in a published album's public selection have stable
  URLs under `/api/public/gallery/…` that answer 404 the moment the photo leaves the selection.
  The edge must not cache them.

## Considered options

- **A media cookie beside the bearer token** — perfect caching and instant revocation on logout,
  but in the Capacitor shell (`capacitor://localhost`) the API is a third party and iOS WKWebView
  blocks the cookie; and it is a second session mechanism to issue, renew and clear in step with
  the refresh flow, plus CSRF. Rejected.
