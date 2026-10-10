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
- **The public face is unsigned**: the website's pictures have stable URLs under `/api/public/…`
  that are served only while the picture is on the public face and answer 404 the moment it
  leaves it — board portraits (`/api/public/board/portraits/…`, while the person holds a public
  office), group pictures (`/api/public/groups/pictures/…`, while the group is shown publicly)
  the renditions in a published album's public selection (`/api/public/gallery/…`, while the
  photo is in the selection) and news pictures (`/api/public/news/pictures/…`, while the picture
  is the live picture of a published news post — never a pending one). Only the small/medium/large renditions are served, never the
  original or the uncropped one. Existence is checked on every fetch; the edge must not cache
  them (`Cache-Control: private, no-cache`); `v={renderedAt}` busts the browser cache after a
  re-crop. Amended 2026-10-09 with Florian: board portraits and group pictures joined the
  unsigned public face instead of carrying signed URLs that outlive the office by up to 48 h. Amended
  again 2026-10-09 (L7b S2): news pictures joined it as its fourth member.

## Considered options

- **A media cookie beside the bearer token** — perfect caching and instant revocation on logout,
  but in the Capacitor shell (`capacitor://localhost`) the API is a third party and iOS WKWebView
  blocks the cookie; and it is a second session mechanism to issue, renew and clear in step with
  the refresh flow, plus CSRF. Rejected.
