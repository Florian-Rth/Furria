# Media is fetched by signed URLs, not a cookie

Sessions are bearer tokens (ADR-0005, ADR-0006), and `<img>` / `<video>` cannot send an
`Authorization` header. Fetching media through JavaScript into blob URLs breaks video seeking and
the browser's image cache. Decided with Florian on 2026-10-08 while shaping L7a.

## The decision

**Every media URL the API hands out carries its own authorisation: an HMAC over item, rendition
and expiry.** Wherever a response contains a media item, it contains ready-made URLs per rendition
(`/api/media/{id}/{rendition}?exp=…&sig=…`; `?download` adds `Content-Disposition` with the
original's file name).

- **Expiry is rounded to 7-day windows and valid for 14 days**, so a URL stays the same for a
  week. The API serves the file `Cache-Control: private, max-age=<until expiry>, immutable`, so
  a device downloads each thumbnail once a week, not once a day, and never revalidates it.
- **`v={renderedAt}` rides on every rendition URL**, signed or public, so a re-render or re-crop
  hands out a new URL at once instead of stale cached bytes. It is not part of the signature.
- **The API serves the files itself** (range requests, `sendfile`); no nginx needs the media mount.
- **The API checks the item still exists and still belongs where the URL says before serving**,
  so deletion and takedown take effect at once; a leaked URL to a living item works at most 14 days.
  The signature is checked before anything else happens: only a signed request for a rendition
  that went missing on disk queues its regeneration, so unsigned requests cannot queue work
  (RFC 0002 phase 20).
- **The public face is unsigned**: the website's pictures have stable URLs under `/api/public/…`
  of one shape, `/api/public/{kind}/pictures/{id}/{rendition}`, that are served only while the
  picture is on the public face and answer 404 the moment it leaves it — board portraits
  (`board`, while the person holds a public office), group pictures (`groups`, while the group is
  shown publicly), the renditions in a published album's public selection (`gallery`, while the
  photo is in the selection) and news pictures (`news`, while the picture is the live picture of a published news post — never a pending one). Only the small/medium/large renditions are served, never the
  original or the uncropped one. Existence is checked on every fetch; the edge must not cache
  them (`Cache-Control: private, no-cache`); `v={renderedAt}` busts the browser cache after a
  re-crop. Amended 2026-10-09 with Florian: board portraits and group pictures joined the
  unsigned public face instead of carrying signed URLs that outlive the office by up to 48 h. Amended
  again 2026-10-09 (L7b S2): news pictures joined it as its fourth member.

**Amended 2026-10-12 with Florian (L7c website pictures):** website pictures joined the public
face as its fifth member, but **key-addressed** instead of item-addressed:
`/api/public/website-pictures/{slot}/{position}/{small|medium|large}` serves whatever fills that
position of a **picture slot** and answers 404 while it is empty or not yet rendered
([ADR-0027](0027-picture-slots-are-declared-by-the-website-filled-on-the-server.md)). The URL stays
the same when the picture is replaced or re-cut, so static HTML can preload the landing hero and
name the share image; it carries no `v=` and is revalidated instead, `Cache-Control: private,
no-cache` with an `ETag` of the media item id and its `renderedAt` (a matching `If-None-Match`
answers 304). The signed URLs the club app gets for a website picture name its slot and position
in the owner part of the signature, so moving the picture to another position retires them.

**Amended 2026-10-12 with Florian (L7d event pictures):** event pictures joined the public face
as its sixth member, item-addressed like the first four: `/api/public/events/pictures/{id}/{small|medium|large}`
serves an **event picture** exactly while its event is shown on the website (the rule the public
events list uses: a venue is set and the event is not over). A cancelled event is still shown, so
its picture stays served; deleting the event deletes the picture and the URL answers 404. The
public event list, the event page and a news article's event carry the picture's three URLs with
the width and height of its 2:1 cut. The club app gets signed URLs whose owner part names the
event (`event:{id}`).

**Amended 2026-10-11 with Florian (gallery at scale):** the window grew from 24 h / valid 48 h to
7 days / valid 14 days, renditions are served `immutable`, and every gallery URL carries
`v={renderedAt}`. With a few thousand gallery items, a daily rotation made every device fetch
every thumbnail it saw again each day. Deletion and takedown still act at once, because existence
is checked on every fetch; the longer life only affects a leaked URL to an item that still lives.

## Considered options

- **A media cookie beside the bearer token** — perfect caching and instant revocation on logout,
  but in the Capacitor shell (`capacitor://localhost`) the API is a third party and iOS WKWebView
  blocks the cookie; and it is a second session mechanism to issue, renew and clear in step with
  the refresh flow, plus CSRF. Rejected.
