# An upload link is a bearer secret with its own inbox

Florian, 2026-11-01: the photographer posts a link into the club's WhatsApp group; for 7 days
everyone with it can upload their photos and videos of the evening, and the photographer sorts
what arrives like the normal inbox. The people in that group are members, family and friends —
most have no club-app login, and the link travels further than intended (forwarded, screenshotted).
So the link is the only credential, and everything about it is shaped by "assume it leaks".

## The decision

**An upload link is a bearer secret that can do exactly one thing — add photos and videos to that
link's own inbox — for at most 7 days, and nothing it adds is visible to anyone but gallery
managers until one of them sorts it.**

- **Who makes it:** anyone holding `gallery.manage`. Listing, ending and sorting a link's inbox
  need the same permission; any gallery manager may act on any link (the photographer's
  colleagues can end a leaked link while she is on stage).
- **The secret:** 32 bytes (`HMAC-SHA256(Media:SigningKey, "upload-link/" + seed)`, Base64Url,
  43 characters); the database keeps a random per-link seed and the SHA-256 of the token
  (unique index) and looks the token up by that hash. A database copy alone yields no working
  token, while managers can still copy an open link again later (the API re-derives it, only for
  open links). Rotating `Media:SigningKey` therefore ends every open link at once — the kill switch.
- **Where it travels:** the club app URL carries it in the fragment —
  `https://app.<club-domain>/photos#<token>` — so it never reaches any server log; the page sends
  it in the `Upload-Link-Token` header (tus) and a POST body (lookup), never in a URL.
- **Lifetime:** open until `created_at + 7 days`, or until a manager **ends** it (revocation,
  immediate and final). After expiry nothing new starts, but an upload created while it was open
  may finish its remaining chunks (a phone video on a slow uplink must not die at the deadline);
  an ended link refuses every request, even a half-finished upload. Abandoned partial uploads are
  swept after 24 h like every tus upload.
- **Ownership quarantine:** uploads are media items owned by the link (`upload-link:{id}`,
  `owner_upload_link_id`), never by the gallery or a person (`uploaded_by_person_id` stays null; the
  optional name the guest typed is kept as plain text, `uploader_name`). Every gallery read,
  public face, pick for news/events/website, album, ZIP and the normal inboxes filter on the
  gallery owner, so a stranger's file reaches no member and no website until a manager sorts it.
  Placing an item in an album **hands it to the gallery** (owner becomes the gallery; its signed
  URLs change because the owner is part of the signature, ADR-0025); deleting it from the link's
  inbox is final. The sorting desk is the normal inbox desk with the link as the chosen inbox.
- **Same pipeline, same limits:** a separate tus mount `/api/media/link-uploads` (same staging,
  same chunking and resume, same sniffing of the first bytes, same per-kind limits — photos
  100 MB, videos 20 GB, only JPEG/HEIC/PNG/WebP/MP4/MOV, no audio) then the same adoption and
  rendition job (ADR-0024). Upload ids are `l{linkId}-{guid}`: the member mount refuses them
  and a link only reaches its own uploads.
- **Abuse limits:** at most **100 GiB per link** in total (counted on adoption, checked on
  creation — a leaked link cannot fill the media disk), and at most **3000 lookups and new uploads
  per IP per hour** together (`RateLimits:LinkUploads`, configurable, defaults in code). The
  general signed-out limit (30 per 15 minutes) is deliberately not used: at an evening, a whole
  hall uploads over one Wi-Fi address. Guessing is no concern — the token has 256 bits.
- **No reading back:** the guest's page shows only the files of its own visit, from the device
  (local previews and tus progress). There is no endpoint that lists, counts or shows anything
  of a link to its holder beyond its title, state and end — not even "37 photos received".

## Considered options

- **Gallery-owned items tagged with the link** — would reuse every gallery query, but every one of
  them (inboxes, Start, hub counts, picks, ZIP, public face) would need a new filter to keep
  strangers' files out, and one forgotten filter leaks. Ownership makes the safe state the
  default.
- **Upload page on the website** — the website is the public face and is statically rendered; it
  has no upload machinery and no reason to carry tus. The club app has the resumable queue,
  HEIC/EXIF handling and the Kk upload tiles already; `/photos` is exempt from the install gate
  like the mail-link flows (ADR-0031).
- **A guest account or a sign-in code per person** — too much friction for a WhatsApp group on a
  Saturday night; the link is the whole point.
- **Storing the token** (plain or encrypted) — plain leaks with a backup; the HMAC derivation gives
  the same "copy again" convenience without a reversible secret in the database.

## Consequences

- No new required configuration; `RateLimits:LinkUploads:PermitsPerIp` / `:Window` are optional.
- The club-app nginx streams `/api/media/link-uploads` exactly like `/api/media/uploads`
  (`client_max_body_size 20m`, no request buffering); the edge's `app.` location already allows
  it.
- Upload links are kept after they end (the list shows them with their counts); there is no
  delete. Their unsorted items stay until a manager sorts them.
