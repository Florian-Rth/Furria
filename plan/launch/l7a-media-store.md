---
status: shaped 2026-10-08 — not built; each slice is built by a fresh session
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
    fetch; the public selection has unsigned stable URLs the edge must not cache.
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
| S1 | **Core store (backend)** | `MediaItem` (owner, kind photo/video, state *processing/ready/failed*, original + rendition paths, dimensions, duration, capture time, camera, crop rectangle, uploader); the media root path from configuration; tus uploads via `tusdotnet` behind the permission gate, staging under the media path, 24 h cleanup, content sniffing and size limits (rulings 9, 10); the Postgres job queue the worker claims; signed URLs (HMAC, 24 h windows valid 48 h) and serving with range + `?download`, existence and ownership checked per fetch (ruling 12); the three `gallery.*` keys in `FurriaPermissions` | open |
| S2 | **Media worker** | New container (.NET + libvips + ffmpeg) claiming jobs with `FOR UPDATE SKIP LOCKED`; photo renditions WebP 400/1600/2560, orientation applied, GPS stripped, crop honoured; video probe → remux or transcode to 1080p H.264/AAC `faststart` MP4, poster, duration; one video per worker at a time; `MEDIA_WORKER_HWACCEL=none\|vaapi\|qsv`; *failed* with a reason and retry; regeneration of an item's renditions; compose, `.env.example`, CD image gated like the others (ruling 11, ADR-0024) | open |
| S3 | **Portraits and group pictures** | Crop frame in `@furria/ui` (4:5 / 3:2, drag + zoom); portrait set by the person or `persons.manage`, group picture by its group admin or `groups.manage`; re-crop without re-upload; `Person.PortraitUrl` replaced by a media item reference (migration); avatars (centred circle), register, group hub opener, public board and website group cards on real pictures with initials / group-tone fallbacks; erasure and group deletion remove them (rulings 3, 14, 15) | open |
| S4 | **Gallery backend** | Albums (title, description, cover, link to a calendar entry **or** a session **or** neither); per-uploader inbox and the ownerless inbox after erasure; place / move / delete (bulk); bin with 30-day expiry and restore; public selection with manual order and optional captions; publish / unpublish (needs a session and ≥ 1 selected photo); album ZIP streamed without a temp file; filters (kind, uploader); "Neu in der Galerie" on Start; erasure keeps uploaded items with the uploader cleared (rulings 4–7, 13, 14, 16) | open |
| S5 | **Gallery hub design exploration** | Orchestrated specialist team (UX, UI, motion, IA, a11y, photography workflow) → judges → critics → **one distilled, built prototype** of hub, album, viewer, upload queue and inbox culling, pitched to Florian. Independent of S1–S4 — **start right after this plan is committed** (ruling 19) | open |
| S6 | **Gallery hub (club app)** | Built per the S5 verdict: the *Galerie* hub, album, full-screen viewer (swipe/keys, video, EXIF, download), folder drag-and-drop with the resumable queue (`tus-js-client`), inbox culling (one key rejects or files), bulk actions, bin, selection and publishing, ZIP download, filters; the *Galerie* panel on Verein, the Mehr entry, Start's "Neu in der Galerie"; key copy in the rights matrix (rulings 16, 18, 19) | open |
| S7 | **Website gallery** | `GET /api/public/gallery` (published albums with a session, grouped by it) and `GET /api/public/gallery/{id}`; unsigned stable rendition URLs that 404 once a photo leaves the selection; `/gallery` and `/gallery/{id}-{slug}` with canonical redirect and 404 on unknown/unpublished; alt from caption, else *„{Albumtitel}, Foto {n}"*; seeds deleted (rulings 2, 5, 17) | open |
| S8 | **Ops** | Edge contract in `docs/ops/PRODUCTION.md`: `client_max_body_size ≥ 20m` and `proxy_request_buffering off` on the upload route, no edge caching of `/api/public/gallery` media; the media path and worker placement (CPU beside the API, or the iGPU VM with the path mounted); backup and restore of database **and** media path from the same point, renditions excluded (ADR-0023, ADR-0024) | open |

**Drop order if behind** (ruling 1): videos (the video half of S2 and S6) → the gallery (S4–S7) →
core, portraits and group pictures (S1–S3, S8) stay.

## Out of scope

- Event-app pictures — a later owner of media items, no model change.
- Per-person consent and people tagging; likes and comments; cross-album search; photo editing.
- Restricted albums (some members only) — later, without a model change.
- Videos on the public face; AVIF; adaptive streaming (HLS).
- The per-group file drive (documents) — not media.
- News (L7b).
