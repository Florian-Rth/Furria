---
status: built 2026-10-09 — S1–S8
phase: L7a — Media store and gallery (plan/launch.md; L7 split: L7a media, L7b news)
shaped_with: Florian, 2026-10-08 (grill-with-docs)
base: main with L6 merged
---

# L7a — Media store and gallery

The club gets one **media store** for photos and videos. **Portraits**, **group pictures** and the
**gallery** own their media items in it. The photographer uploads a whole evening into her
**inbox**, sorts it into **albums**, and a hand-picked **public selection** of a published album
becomes the website's `/gallery`. `CONTEXT.md` carries the terms: **Media store**, **Media item**,
**Gallery**, **Inbox**, **Bin**, **Album**, **Public selection**, **Portrait**.

Read first: `CONTEXT.md` → the terms above, **Session**, **Calendar entry**, **Permission**;
ADR-0005, ADR-0006, ADR-0010, ADR-0021, **ADR-0023, ADR-0024, ADR-0025**;
`plan/website/feature-gallery.md` (the public face's existing design);
`plan/launch/l6-public-events.md` (public addresses, deleting seeds); `docs/ops/PRODUCTION.md`.

---

## What was ruled on 2026-10-08

1. **Launch scope:** the core store, portraits, group pictures, the gallery in the club app (photos
   and videos, inbox, albums) and **album publishing to the website**. Event-app pictures follow
   after launch. If time runs short, drop order: videos → gallery → (core + portraits + group
   pictures stay).
2. **What makes a photo public** (resolves the 2026-07-28 open question): a photo is public only
   while it is in the **public selection of a published album**. No public flag on a photo, no
   per-person consent. Remedy: the takedown contact on `/gallery`, answered by removing the photo
   from its public selection or deleting it — no separate takedown act, no lasting mark.
3. **One owner per media item** — a person, a group or the gallery. Reuse across owners **copies**
   into a new media item; a takedown or deletion never breaks another use.
4. **One gallery.** The club-app collection *is* the gallery; the website page is its public face.
   *Member photo library* is retired.
5. **An album holds everything of one occasion or theme**; its **public selection** (~a dozen
   photos) is what publishing releases. **Videos are never public** at launch.
6. **Per-uploader inbox.** Uploads land in the uploader's inbox (or straight into an album). Inbox
   items are invisible to members; deleting from the inbox is final; placing in an album removes
   from the inbox. An item is in at most one album. `gallery.manage` sees and sorts every inbox.
7. **Permissions:** `gallery.upload` (upload, sort own inbox, create albums), `gallery.manage`
   (all inboxes, edit/merge/delete albums, move/delete items in albums, the bin),
   `gallery.publish` (public selection, publish/unpublish). Every member (`club.read`) sees every
   album and may download originals; restricted albums come later without a model change.
   Portrait: the person herself, or `persons.manage`. Group picture: its group admin or
   `groups.manage`.
8. **Bytes live under one mounted path** ([ADR-0023](../../docs/adr/0023-media-lives-under-one-mounted-path.md)).
   The operator decides what backs it (volume, NAS, mounted S3); the code knows only the path.
9. **Uploads travel by tus** (resumable, ~16 MB chunks, parallel files): `tusdotnet` behind the
   permission gate, staging under the media path so finishing is a rename; abandoned uploads
   cleaned after 24 h; originals uploaded untouched. Edge contract gains `client_max_body_size ≥
   20m` and `proxy_request_buffering off` on the upload route.
10. **Accepted:** photos JPEG, HEIC/HEIF, PNG, WebP (≤ 100 MB); videos MP4, MOV, any codec ffmpeg
    decodes (≤ 20 GB). **No RAW**, no documents, no GIF. Type sniffed from content. EXIF capture
    time and camera kept; **GPS stripped from every rendition** — only the original (member
    download) keeps it. Portraits and group pictures: photos only.
11. **A separate media worker makes all renditions** ([ADR-0024](../../docs/adr/0024-a-media-worker-makes-renditions-off-the-api.md)):
    Postgres job queue, libvips WebP at 400/1600/2560 px, video remux-before-transcode to 1080p
    H.264 MP4 + poster, hardware acceleration by configuration (CPU default, iGPU VM optional).
    Items are *processing / ready / failed*; renditions are rebuildable cache. Client-side
    conversion rejected.
12. **Media is fetched by signed URLs** ([ADR-0025](../../docs/adr/0025-media-is-fetched-by-signed-urls.md)):
    24 h windows valid 48 h, served by the API with range support, existence checked on every
    fetch; the public face (board portraits, group pictures, the public selection) has unsigned
    stable URLs the edge must not cache.
13. **An album has no date of its own.** Title, optional description, cover (chosen; else first
    of the public selection; else first item). Linked to a **calendar entry** (date + session
    from it) **or a session** (a season, record or not) **or neither** (free album). Only albums
    with a session can be published; the club app lists by session (newest first, then entry
    date), free albums in their own section. Items order by capture time (EXIF, else upload
    time); the public selection has a manual order. No camera clock correction.
14. **Lifecycle.** Deleting from an album, or a whole album, goes to a **bin** (30 days, then
    gone; `gallery.manage` restores). The inbox has no bin. No takedown mark. **Erasure**
    (ADR-0021): her portrait goes with her; gallery items she uploaded stay with the uploader
    cleared; her inbox becomes an **ownerless inbox** `gallery.manage` sorts. Deleting a group
    deletes its group picture.
15. **Portrait 4:5, group picture 3:2**, cropped in the app at upload (shared crop frame in
    `@furria/ui`), **non-destructive**: the media item keeps a crop rectangle, renditions come from
    it, re-crop without re-upload. The avatar is the centred circle of the 4:5 crop.
    `Person.PortraitUrl` is replaced by a media item reference. Fallbacks: initials / group tone.
16. **Gallery features at launch:** bulk actions (multi-select move/delete/selection), folder
    drag-and-drop upload with a live resumable queue, full-screen viewer (swipe/keys, video, EXIF,
    download), **inbox culling** (one key rejects or files a photo), **album ZIP download**
    (streamed), filters (photo/video, uploader), **"Neu in der Galerie" on Start**. Not: likes,
    comments, people tagging, cross-album search, photo editing.
17. **Website:** `/gallery/{id}-{title-slug}` (only the id resolves, canonical redirect — L6's
    mechanism). Publishing needs a session and ≥ 1 photo in the public selection; unpublish any
    time (404 at once). An album shows title, description, the linked entry's date if any, the
    session, the public selection in its order with orientation and dimensions. **Optional caption
    per photo**; alt falls back to *„{Albumtitel}, Foto {n}"*. Seeds deleted; no new landing teaser.
18. **The gallery is its own member hub** (*Galerie*), its tools gated per panel inside it
    (ADR-0010: *Eingang* with `gallery.upload`, *Papierkorb* with `gallery.manage`, selection and
    publishing with `gallery.publish`) — no gallery workbench under Verwaltung. Reached from a
    *Galerie* panel on the Verein hub (newest albums), Mehr (Profil · Galerie · Verwaltung ·
    Abmelden) and "Neu in der Galerie" on Start. Five destinations stay.
19. **The gallery hub is the club app's visual highlight — a creative space, not a file browser.**
    Images are the content: density is measured in pictures per pixel, chrome recedes. Its concept
    comes from an orchestrated design exploration (specialist pitches → one distilled, built
    prototype) before its slice is built.

---

## Slices

Each slice ends with the validation in `CLAUDE.md` ("End of a slice/task") and its row updated here.

| # | Slice | Content | Status |
|---|---|---|---|
| S1 | **Core store (backend)** | `MediaItem` (owner, kind photo/video, state *processing/ready/failed*, original + rendition paths, dimensions, duration, capture time, camera, crop rectangle, uploader); the media root path from configuration; tus uploads via `tusdotnet` behind the permission gate, staging under the media path, 24 h cleanup, content sniffing and size limits (rulings 9, 10); the Postgres job queue the worker claims; signed URLs (HMAC, 24 h windows valid 48 h) and serving with range + `?download`, existence and ownership checked per fetch (ruling 12); the three `gallery.*` keys in `FurriaPermissions` | built 2026-10-08 — upload owner declared in tus metadata (`gallery`, `person:{id}`, `group:{id}`), first chunk sniffed (415/413 before the bytes travel), the item created on the last chunk and named in `Media-Item-Id`; rendition paths derived from a storage key (`MediaPaths`), not stored; renditions `original/small/medium/large` (photo) and `original/small/poster/video` (video); compose gains `MEDIA_SIGNING_KEY` + the `media` volume |
| S2 | **Media worker** | New container (.NET + libvips + ffmpeg) claiming jobs with `FOR UPDATE SKIP LOCKED`; photo renditions WebP 400/1600/2560, orientation applied, GPS stripped, crop honoured; video probe → remux or transcode to 1080p H.264/AAC `faststart` MP4, poster, duration; one video per worker at a time; `MEDIA_WORKER_HWACCEL=none\|vaapi\|qsv`; *failed* with a reason and retry; regeneration of an item's renditions; compose, `.env.example`, CD image gated like the others (ruling 11, ADR-0024) | built 2026-10-08 — `Furria.MediaWorker` (own image `server/src/Furria.MediaWorker/Dockerfile`: aspnet + libvips/HEIC + ffmpeg + Intel VA-API/oneVPL) runs a photo lane and a video lane, so one video per worker and photos never wait behind it; jobs are leased (5 min, renewed while working; a dead worker's job is taken over) and handed back on shutdown; failures retried after 1 and 10 min, then *failed* with the reason; photos via NetVips: orientation applied, crop rectangle = fractions of the upright original, sRGB, all metadata stripped, EXIF capture time (no offset → club time) and camera onto the item, dimensions = the upright original; videos: ffprobe → an H.264 8-bit SDR ≤ 1080p stream is kept, else transcoded (HLG/PQ tone-mapped), AAC copied or encoded, all metadata (GPS) dropped, `faststart`; poster + small from the rendered MP4; the iGPU only encodes (decode, scale, tone map stay on the CPU); retry and regeneration via `regenerate all\|failed\|<ids>` (no endpoint until S3/S6 need one); logging moved to Infrastructure for both hosts; tests render real files (CI installs libvips + ffmpeg) |
| S3 | **Portraits and group pictures** | Crop frame in `@furria/ui` (4:5 / 3:2, drag + zoom); portrait set by the person or `persons.manage`, group picture by its group admin or `groups.manage`; re-crop without re-upload; `Person.PortraitUrl` replaced by a media item reference (migration); avatars (centred circle), register, group hub opener, public board and website group cards on real pictures with initials / group-tone fallbacks; erasure and group deletion remove them (rulings 3, 14, 15) | built 2026-10-08 — migration `PortraitsAndGroupPictures`: `person.portrait_id` / `group.picture_id` (unique, SetNull) + `media_item.rendered_at`; the upload makes the picture its owner's at once and deletes the former item with its files; the crop travels as tus metadata `crop` (`l,t,w,h` fractions, refused for the gallery) — a photo the browser can't show (HEIC in Chrome) goes up uncropped and the worker centres the largest 4:5 / 3:2 cut, every chosen cut is held to the owner's aspect, and the worker writes an `uncropped` rendition (1600) the re-crop frame works on; `PUT …/portrait/crop`, `PUT …/picture/crop` (crop + regenerate) and `DELETE …/portrait`, `DELETE …/picture`; picture URLs carry `v={renderedAt}` so a re-crop busts the cache, and appear only once rendered (initials / tone until then); the public face is unsigned (ADR-0025): the website's board portraits and group pictures are `/api/public/board/portraits/{mediaItemId}/{small|medium|large}?v=…` and `/api/public/groups/pictures/{mediaItemId}/{small|medium|large}?v=…`, served (range, `Cache-Control: private, no-cache`) only while the person holds a public office / the group is shown publicly, 404 the moment that ends (`PublicMediaService`, where S7 adds the gallery selection); every read surface with a face (Start, Verein, Aushänge, register, members, groups, hub, keys, website board + group cards) gets `portrait`/`picture` `{small,medium,large}Url`; editor = one write screen (`/profile/portrait`, `/manage/persons/$id/portrait`, `/groups/$id/picture`) uploading with `tus-js-client`, polling while *processing*; erasure deletes her media files after commit; groups are only archived, so the cascade covers a group deletion when one comes |
| S4 | **Gallery backend** | Albums (title, description, cover, link to a calendar entry **or** a session **or** neither); per-uploader inbox and the ownerless inbox after erasure; place / move / delete (bulk); bin with 30-day expiry and restore; public selection with manual order and optional captions; publish / unpublish (needs a session and ≥ 1 selected photo); album ZIP streamed without a temp file; filters (kind, uploader); "Neu in der Galerie" on Start; erasure keeps uploaded items with the uploader cleared (rulings 4–7, 13, 14, 16) | built 2026-10-08 — `Album` (migration `GalleryAlbums`) links an entry **or** a session start year (a season, record or not; no FK to the record); placement lives on the gallery media item (`album_id`, `placed_at`, `binned_at`, `selection_position`, `caption`, check-constrained), so the inbox is "gallery item without album" per uploader and erasure needs no code (uploader FK already `SET NULL` → ownerless inbox); deleting a linked calendar entry or event re-links its albums to the entry's session; publication is withdrawn whenever a precondition goes (album binned, session unlinked, selection emptied by edit, move or bin) — takedown never refused; selection = ready photos of the album, replaced wholesale in order (no cap), cleared on move/bin; cover = chosen (if still live in the album) → first selected → first in capture order; `gallery.upload` sorts only her own inbox, moving/deleting in albums and the bin are `gallery.manage`; viewing = `club.read` or any `gallery.*` key; bulk place/delete/restore all-or-nothing; inbox deletion removes rows and files at once, the hourly `GalleryBinPurge` drops rows + files after 30 days; tus metadata `album` uploads straight into a live album; hub = sections by session (newest first, then entry date, free albums last) with counts, cover and 8 capture-order samples; album ZIP is a signed URL in the album response (ADR-0025 windows), streamed with `NoCompression`, duplicate names suffixed; Start gets a `gallery` panel (albums created in the last 14 days with ≥ 1 live item, newest first, cap 3 — placing items never makes an older album new); merge = bulk move + delete, no endpoint |
| S5 | **Gallery hub design exploration** | Orchestrated specialist team (UX, UI, motion, IA, a11y, photography workflow) → judges → critics → **one distilled, built prototype** of hub, album, viewer, upload queue and inbox culling, pitched to Florian. Independent of S1–S4 — **start right after this plan is committed** (ruling 19) | built 2026-10-08 — lab prototype "Der Kontaktbogen" at `/lab/gallery` (hub, album, Lupe, upload, inbox culling); awaiting Florian's verdict |
| S6 | **Gallery hub (club app)** | Built per the S5 verdict: the *Galerie* hub, album, full-screen viewer (swipe/keys, video, EXIF, download), folder drag-and-drop with the resumable queue (`tus-js-client`), inbox culling (one key rejects or files), bulk actions, bin, selection and publishing, ZIP download, filters; the *Galerie* panel on Verein, the Mehr entry, Start's "Neu in der Galerie"; key copy in the rights matrix (rulings 16, 18, 19) | built 2026-10-09 on "Der Kontaktbogen" (S5) — `features/gallery` replaces the lab: hub of contact strips by session (Eingang rolls per inbox, gold *Neu* for albums < 14 days, flap-count session numerals, exposure sweep every visit) and the upload thread following across screens; album = scene-sectioned frame grid (90 s gaps) with time rail, Foto/Video + uploader filters, ZIP, long-press/drag-stroke bulk select → move / bin / in-out of the selection; Lupe (`KkLoupe`) with inline video on tap, facts, caption, original download; **Schaukasten** `/gallery/$id/selection` (`KkShowcase`: drag/keyboard reorder, captions, picker, publish with confetti every time); album new/edit (entry **or** session **or** neither, cover pick, delete → bin); **Papierkorb** with purge countdown and bulk restore; **Entwicklerbad** `/gallery/upload` — module-level tus queue (4 streams, photos first, offline pause/resume, folder drop, client JPEG EXIF time + local previews assemble scenes before the bytes arrive); **Leuchttisch** `/gallery/inbox` — verdicts client-held and undoable until *Abschließen* (placements per album, then final deletions), three Körbe chosen in a sheet, inbox switch for `gallery.manage`; Start panel *Neu in der Galerie* and Verein *Galerie* panel on `KkAlbumShelf`; Mehr gains *Galerie*; hub media carry `capturedAt`, hub albums `createdAt` |
| S7 | **Website gallery** | `GET /api/public/gallery` (published albums with a session, grouped by it) and `GET /api/public/gallery/{id}`; unsigned stable rendition URLs that 404 once a photo leaves the selection; `/gallery` and `/gallery/{id}-{slug}` with canonical redirect and 404 on unknown/unpublished; alt from caption, else *„{Albumtitel}, Foto {n}"*; seeds deleted (rulings 2, 5, 17) | built 2026-10-09 — `GET /api/public/gallery` (published live albums in sections by session start year, newest first, entry-dated albums by date then entry-less; per album title, entry date, photo count and a cover from the selection: the chosen cover if it is selected, else selection #1), `GET /api/public/gallery/{id}` (title, description, entry date, session year + number, the selection in its order with caption and dimensions; 404 when unpublished, binned or without a public photo) and `GET /api/public/gallery/photos/{mediaItemId}/{small\|medium\|large}` (`PublicMediaService`, served only while the photo is a ready photo in the selection of a published live album, `Cache-Control: private, no-cache`; unversioned — gallery photos are never re-cropped); `PublicGallery` holds both predicates. Website: `lib/public-gallery` (schemas derive orientation/aspect from the dimensions and hand every album its session), `/gallery` via loader + `GalleryScreen` (loading / unavailable / empty states), `/gallery/{id}-{slug}` with canonical redirect keeping `?photo`, 404 on unknown/unpublished, `og:image` from the first photo; cards and banner carry the real cover with `srcset`, the album header shows *date · {n}. Session yyyy/yy*, the description as paragraphs, no credit row (no photographer field), the viewer shows the real aspect and the caption only when there is one; *Nächstes Album* walks the API order; `ALBUMS` seeds deleted; `event-slug` → `lib/id-slug`, `event-read-retry` → `lib/api/public-read-retry`, `toParagraphs` → `lib/paragraphs` shared by events and gallery |
| S8 | **Ops** | Edge contract in `docs/ops/PRODUCTION.md`: `client_max_body_size ≥ 20m` and `proxy_request_buffering off` on the upload route, no edge caching of `/api/public/gallery` media; the media path and worker placement (CPU beside the API, or the iGPU VM with the path mounted); backup and restore of database **and** media path from the same point, renditions excluded (ADR-0023, ADR-0024) | built 2026-10-09 — edge contract (OPNsense nginx plugin): the `/` location of `app.` gets *Maximum Body Size* `20m`, request and proxy buffering off, no caching of `/api/media/…` or `/api/public/…`, `Range` passed; the club-app nginx gained the same two locations (its 1 MB default would have refused every 16 MB chunk); `docs/ops/PRODUCTION.md` *Media*: the path's three directories (only `originals/` backed up), uid 1654, moving off the named volume, worker beside the API (CPU) or on the iGPU VM (shared path, Postgres published on the LAN address only, `MEDIA_WORKER_REPLICAS=0` on the host, a worker-only compose); `backup.example.sh` — snapshot = `pg_dump -Fc` + `originals/` hard-linked into the previous one, `api` stopped only for the dump and the last originals pass, `BACKUP_KEEP` (14); restore runbook (drop/create + `pg_restore`, `rsync --delete` originals, renditions + staging dropped, `regenerate all`), tried on a scratch stack; still open: a dump before each migration, the off-host copy, alerting |

**Drop order if behind** (ruling 1): videos (the video half of S2 and S6) → the gallery (S4–S7) →
core, portraits and group pictures (S1–S3, S8) stay.

## Out of scope

- Event-app pictures — a later owner of media items, no model change.
- Per-person consent and people tagging; likes and comments; cross-album search; photo editing.
- Restricted albums (some members only) — later, without a model change.
- Videos on the public face; AVIF; adaptive streaming (HLS).
- The per-group file drive (documents) — not media.
- News (L7b).
