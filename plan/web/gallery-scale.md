---
title: Gallery at scale — thousands of items without load spikes
slug: gallery-scale
type: cross-cutting
status: planned
scope: server, web/apps/club-app, web/apps/website, web/packages/ui
base: refactor/deep-modules (after image-toolkit)
depends-on: [image-toolkit]
adrs: [0025 (amended in S4)]
---

# Gallery at scale

This plan makes the gallery handle about 4000 items, spread over many albums plus the inboxes,
without heavy server load, large downloads or slow client rendering. Club size stays small (tens
of concurrent users); the load that matters comes from per-request work multiplied by item
count, and from polling.

Shaped on 2026-10-11 from a code audit. Decided with Florian:
- **Big lists:** one fetch, made small (compression, versioned stable URLs), and the client mounts
  only what is on screen. No server paging.
- **Signed URLs:** the window grows from 24 h to 7 days (valid 14 days), served `immutable`.

Read first: `docs/adr/0025-media-is-fetched-by-signed-urls.md`, `plan/launch/l7a-media-store.md`,
`plan/web/image-toolkit.md`, `CONTEXT.md` → **Media item**, **Album**, **Inbox**.

## Problem (audit, 2026-10-11)

1. **Full-list polling.**
   - Album and inbox queries refetch **every 3 s** while any item in them is `processing`
     (`gallery/api.ts`, `lib/media/developing.ts`).
   - The worker renders one photo at a time, so a bulk upload keeps lists "processing" for
     minutes. Each poll re-sends every item and re-signs 4 URLs per item.
   - The hub's `GalleryInboxRoll` fetches every inbox **in full** just to show 9 frames, and polls
     too.
2. **No compression.** Neither the API nor nginx compresses JSON. A 4000-item album is several
   MB of JSON.
3. **Every tile is mounted.**
   - The album renders all frames (`AlbumView` → `AlbumScene` → `KkFrame`), and so do the
     selection view and the photo picker.
   - `content-visibility: auto` on the scene grid skips paint, but not React or DOM cost.
4. **The browser cache resets daily.**
   - Signed URLs rotate every 24 h, so each device re-downloads every thumbnail it sees once a
     day.
   - Gallery URLs carry no version, so a re-render shows stale bytes until rotation.
   - Each media request loads the whole `MediaItem` entity.
5. **The light table is heavy.**
   - The main frame loads the 2560 px rendition with no srcset, and the next frame is not
     preloaded.
   - Strip images are not lazy.
   - Every state change re-runs several full passes. `commitPlanOf` copies each basket's id
     array once per filed frame, which is O(k²) (`inbox-desk.ts`).
   - A swipe slides the frame into empty darkness, because there is no neighbour track.
6. **Missing indexes and wasteful queries.**
   - Missing indexes: capture order (`coalesce(captured_at, uploaded_at), id`), `(album_id,
     binned_at)`, the inbox filter, `selection_position`.
   - `GET /api/public/gallery` loads every selected photo row only to count them and pick a
     cover.
7. **Website tiles over-fetch.** Website grid tiles use `sizes="(min-width: 900px) 50vw, 100vw"`
   and so resolve to the 1600 px rendition.

## Slices

Each slice ships on its own. Validation follows CLAUDE.md. Backend slices are test-first with the
tdd skill.

### S1 — Light table: right-sized, preloaded, neighbour track
- `KkLightTableFrame` carries `image: KkImageSource` (srcset small/medium/large, `sizes="100vw"`)
  instead of `source`. The club-app builds it with `toImageSource`.
- `KkLightTable` takes `previous` and `next` frames instead of `hasPrevious`/`hasNext`.
  - It renders a prev/current/next track keyed by frame id, like `KkViewerStage`. The neighbour
    follows the finger, and a swipe ends on the already-loaded neighbour, with no empty slide and
    no fade.
  - A calm step (key, strip, undo) keeps today's enter.
- Neighbours ±2 are preloaded through the shared `usePreloadImages`, moved from `KkViewer` to
  `internal/`.
- Strip thumbnails: `loading="lazy"`, small rendition.
- `inbox-desk`/`light-table`:
  - `commitPlanOf` appends instead of copying;
  - frame numbers come from one id→index map per state, instead of `findIndex` per strip frame;
  - `verdictCount` totals are computed in one pass.
- Tests: `inbox-desk` (commit plan at many frames per basket), `light-table` (counts).
- Browser check: swipe shows the neighbour peeking, no flash; quick culling stays smooth on a
  200-frame inbox.

### S2 — Response compression
- `AddResponseCompression` (Brotli, then Gzip) for `application/json` only.
  - It never applies to `/api/media/…` or `/api/public/…/pictures/…`: those are already
    compressed WebP/MP4 files, and range requests must stay byte-exact.
  - It is enabled for HTTPS. The BREACH risk is negligible: auth is a bearer header, never a
    cookie, so no secret rides along automatically.
- `docs/ops/PRODUCTION.md`: nginx passes `Accept-Encoding` through and does not recompress.
- Test: a gallery list request with `Accept-Encoding: br` answers `Content-Encoding: br`; a media
  request does not.

### S3 — Poll only what develops; inbox rolls without full inboxes
- **New endpoint `GetGalleryItems`** (`GET /api/gallery/items?ids=…`, capped at 200 ids).
  - It returns `ItemSummary` with URLs for the requested items the caller may see. The visibility
    rule is the same as album/inbox reads; unknown or foreign ids are left out.
- **Client polling.**
  - Album and inbox queries no longer poll themselves.
  - One `useDevelopingItems` poller collects the `processing` ids of all cached album and inbox
    lists, polls `GetGalleryItems` every 3 s while any remain, and merges the answers into the
    cached lists with `setQueryData`.
  - A pure `mergeItems(list, updates)` does the merge and is tested.
- **Inbox rolls.**
  - `GetGalleryInboxes` gains up to 9 sample frames per inbox (capture order, small rendition),
    built with the same `row_number()` window as the hub samples.
  - `GalleryInboxRoll` renders those and drops `useInboxQuery`.
  - `useDevelopedItems` (upload screen) reads the poller's merged lists instead of subscribing to
    full lists.
- Tests: `GetGalleryItems` (visibility, cap, unknown ids), `GetGalleryInboxes` (samples, order,
  limit); `mergeItems`.

### S4 — Cache-friendly media URLs (amends ADR-0025)
- **`MediaUrlSigner`:** `WindowSeconds` becomes 7 days and `WindowsValid` stays 2, so a URL is
  stable for a week and valid ≤ 14 days.
- **`GetMediaRendition`:** sends `Cache-Control: private, max-age=<until exp>, immutable`.
- **`v={renderedAt}`** on every signed rendition URL (gallery, inbox, album covers, hub samples)
  and on public gallery URLs. A re-render or re-crop busts the cache at once.
- **The media lookup projects** only what serving needs (storage key, owner, state, kind,
  `renderedAt`), with `AsNoTracking`, instead of loading the whole `MediaItem`.
- **ADR-0025 amended:** 7-day window, valid 14 days, `immutable`. Deletion and takedown still act
  at once, because existence is checked on every fetch. A leaked URL to a living item now works
  at most 14 days.
- Tests:
  - the signer (window rounding, validity at 13 d / 15 d);
  - `GetMediaRendition` headers;
  - a re-render changes the URL.

### S5 — Indexes and lean queries
- **Migration with partial/expression indexes** on `media_item`:
  - album capture order: `(album_id, coalesce(captured_at, uploaded_at), id) WHERE binned_at IS
    NULL`;
  - inbox: `(uploaded_by_person_id, coalesce(captured_at, uploaded_at), id) WHERE owner_kind =
    'Gallery' AND album_id IS NULL AND binned_at IS NULL`;
  - selection: `(album_id, selection_position) WHERE selection_position IS NOT NULL`.
  - Each index matches the exact predicate the queries use (`InCaptureOrder`, the inbox filter).
    Verify with `EXPLAIN ANALYZE` on a 4000-item seed.
- **`GET /api/public/gallery`** counts selected photos and picks the cover in SQL, instead of
  loading every row.
- **Hub samples** read through the new album index.
- Review by `dotnet-efcore-architect` before merge.
- **Built 2026-10-12.** The inbox index leaves out `binned_at IS NULL`. The inbox queries don't
  contain it, and a partial index only matches when the query states the predicate itself
  (`ck_media_item_binned` already rules out binned inbox items). The inbox-samples SQL writes
  `'Gallery'` as a literal, so the predicate still matches under generic plans. Future index
  migrations on `media_item` use `CREATE INDEX CONCURRENTLY` (`suppressTransaction`).
- Tests: public gallery count and cover unchanged (existing tests stay green); no behaviour
  change otherwise.

### S6 — Virtualized frame grids
- **A `KkFrameGrid` virtual mode in `@furria/ui`**, a window virtualizer over rows of a
  scene-grouped grid. Column count comes from the grid tokens (4 / 6 / 10). Only rows near the
  viewport are mounted.
  - Library choice: `@tanstack/react-virtual` (catalog). A hand-rolled version only if it can't
    do scene headers as rows.
  - Pure `frameRowsOf(scenes, columns)` turns scenes into header rows and frame rows; it is
    tested.
- **Callers:** `AlbumView`, `AlbumSelectionView`, `AlbumPhotoPickerSheet`, and the website
  `PhotoGrid`.
- **Behaviour that must survive:**
  - closing the loupe with `?photo=` scrolls to the frame and makes it glow;
  - `use-scene-in-view` keeps tracking the scene in view;
  - the selection stroke works across mounted rows and keeps scrolling;
  - the bulk bar and the scene headers stay correct.
- **Website tiles** get a `sizes` that matches the real column width, so a tile picks the small
  or medium rendition.
- Browser check on a 4000-item seed (phone + desktop):
  - smooth scroll;
  - scene headers;
  - loupe open and close, landing on the right frame;
  - selection stroke across many rows;
  - photo picker.

## Out of scope
- **Server paging.** Rejected for this plan (Florian, 2026-10-11).
- **Media-worker throughput.** It renders one photo at a time per worker. More photo lanes or
  replicas are possible (`SKIP LOCKED`), but that is a separate decision.
- **An edge cache for media.** Still ruled out by ADR-0025 and `PRODUCTION.md`.
