---
status: built 2026-10-12 — S1–S4 done
phase: L7c — Website pictures (plan/launch.md; after L7b, before L8)
shaped_with: Florian, 2026-10-12 (grill-with-docs)
base: main with the architecture deepening merged (PR #36)
---

# L7c — Website pictures

The website still shows striped dev placeholders where photos belong: the landing hero, the
`/club` header and story, the `/join` hero, the `/gallery` photo stack and the `/events`
filmstrip. Instead of hardcoding photos, **the website declares its picture slots in code, and the
board fills them in the gallery**. A typed slot catalogue in a shared package is the one source:
the website asks it for a picture by key, the club app reads it to show every slot with what it is
for. A new slot is one catalogue entry plus one `useWebsitePicture('…')` call — it appears in the
club app on the next deploy, empty, waiting to be filled. Changing a website photo never needs a
deploy again. `CONTEXT.md` carries the terms: **Picture slot**, **Website picture**.

Read first: `CONTEXT.md` → the terms above, **Media item**, **Gallery**, **Album**, **Public
selection**, **Group picture**; ADR-0011, ADR-0023, ADR-0024, ADR-0025, **ADR-0027**;
`plan/launch/l7a-media-store.md` (owners, crop, public face), `plan/launch/l7b-news.md` S2 (owner
kind added to a running store, pick-from-gallery copy), `plan/web/image-toolkit.md` (`KK_ASPECT`,
`toImageSource`, `KkCropFrame`).

---

## What was ruled on 2026-10-12

1. **Looks like an album, is not an `Album`.** The gallery hub shows a pinned **Website** entry,
   always there, never deletable, binnable or publishable. Underneath it is its own model: an
   album's occasion, session, bin, selection and publish act would each need an exception.
2. **The catalogue is code, the assignments are data** ([ADR-0027](../../docs/adr/0027-picture-slots-are-declared-by-the-website-filled-on-the-server.md)).
   `@furria/website-pictures` (source-consumed) holds `WEBSITE_PICTURE_SLOTS` `as const`, the key
   union `PictureSlotKey`, per slot `{ page, title, description, positions: KkAspect[],
   decorative }` (German copy — the club app shows it) and the pure helpers both apps share. The
   server stores `(slot key, position) → media item` under any well-formed key
   (`^[a-z][a-zA-Z]*(\.[a-z][a-zA-Z]*)+$`, ≤ 80 chars, position 1–24) and never knows which slots
   exist. No Start to-do for empty slots; the *Website* entry shows the fill count.
3. **A slot with several positions** covers series: the `/gallery` photo stack is one slot with
   positions `[landscape, portrait, landscape]`, the `/events` filmstrip one slot of 8 landscape
   positions. A multi-position slot shows its filled positions in order.
4. **One owner per media item holds.** A website picture is a media item of the new owner kind
   **website** (token `website:{slotKey}:{position}`, photos only). Filling uploads (tus) or
   **picks from the gallery** — any ready photo in a live album, inbox and bin refused — which
   **copies** it server-side (L7b S2's `CopyOf`). **No provenance link** (Florian): the copy does
   not remember its source; an album takedown never reaches a slot.
5. **The format travels with the picture.** Upload and pick carry the position's aspect; the row
   stores it, the worker's default centred cut and the re-crop use it. When the catalogue later
   changes a position's aspect, the club app marks the picture *Zuschnitt passt nicht mehr* and
   offers the re-crop — computed client-side from stored vs. declared aspect.
6. **Changes are live at once** — no draft, no publish step (like a group picture). Replacing a
   picture deletes the old item with its files; clearing a position is final, no bin.
7. **Permission `gallery.publish`** — filling a slot releases a photo to the public, the act that
   key names (L7a ruling 7). No new key. Only its holders see the *Website* entry.
8. **Alt text per picture**, required unless the slot is `decorative` (filmstrip, `/join` hero).
   The catalogue describes *where* the picture sits; the alt text says *what* it shows. The share
   image's alt is `og:image:alt`.
9. **Two public forms** (ADR-0027, ADR-0025 amended):
   - `GET /api/public/website-pictures` — every filled position `{ slot, position, width, height,
     alt, smallUrl, mediumUrl, largeUrl }`, one fetch for the whole site; the URLs are the stable
     per-slot ones below.
   - `GET /api/public/website-pictures/{slot}/{position}/{small|medium|large}` — whatever fills
     that position, `private, no-cache` with an ETag (the media item id + `renderedAt`), **404
     while empty**. `index.html` preloads the landing hero by these URLs
     (`<link rel="preload" as="image" imagesrcset>`, desktop and phone by media query) and points
     `og:image` at `site.shareImage`'s `medium`; layout needs no JSON, the aspect comes from the
     catalogue.
10. **Empty slot = designed fallback.** The `KkPhotoPlaceholder` dev labels
    (`garde-auf-der-buehne`, `vereinsfoto`, …) are removed; an empty position keeps its place's
    composition with the branded surface (group-tone field + broom mark), a series shows only its
    filled positions, the filmstrip disappears when empty. No bundled default photos, no collapsing
    layouts.
11. **Orphans.** A stored key the catalogue no longer declares shows under *Nicht mehr auf der
    Website* with *Entfernen* or *Auf Bildplatz übertragen* (an empty position of the same aspect).
12. **Share image is a slot.** `site.shareImage` (1.91:1) replaces `public/og-default.png`, which is
    deleted. Empty → 404 → text-only preview; filling it joins the **L9 rollout checklist**. L8
    verifies the crawlers (WhatsApp, Facebook, Signal, Telegram) render WebP and adds a JPEG share
    rendition only if one does not.
13. **The event photo is not a slot.** Event cards and the event page get an **event picture**
    owned by the event, set in the events workbench by `events.manage` — its own plan, **L7d**. No
    `events.cardDefault` slot: an event without a picture shows the branded fallback.
14. **The *Website* screen is designed while it is built**, in the gallery hub's contact-sheet
    language (UX, UI, a11y specialists inside S3) — no lab prototype, no verdict slice; Florian
    reviews the built screen. Slots grouped by website page in page order, each card with a
    schematic of its page with the slot lit, the picture in its real cut, description, alt text
    and *Hochladen · Aus der Galerie · Zuschneiden · Entfernen*; the hub entry shows *11 von 15
    belegt*; *Gleiches Foto wie …* fills one slot from another's original with a new cut.

### Initial catalogue (aspects confirmed against the components in S2)

| Key | Page / place | Positions |
|---|---|---|
| `landing.hero` | Startseite, hero right column (desktop), *Eröffnung* seal on top | landscape 7:5 |
| `landing.heroPhone` | Startseite, full-bleed hero behind the masthead (phone) | portrait 4:5 |
| `club.hero` | Verein, header (desktop) | landscape 7:5 |
| `club.story` | Verein, club story section | landscape 7:5 |
| `join.hero` | Mitmachen, hero (desktop), decorative | landscape 7:5 |
| `gallery.stack` | Galerie, fanned photo stack in the header | 7:5 · 4:5 · 7:5 |
| `events.filmstrip` | Veranstaltungen, header filmstrip, decorative | 8 × landscape 7:5 |
| `site.shareImage` | Link previews of every page without its own picture | 1.91:1 |

`landing.hero` and `landing.heroPhone` are separate slots because they are separate cuts.

---

## Slices

Each slice ends with the validation in `CLAUDE.md` ("End of a slice/task") and its row updated here.
Each slice is built by a fresh session. S1 and S2 are independent; S3 needs both, S4 needs S2 and
S1's public endpoints.

| # | Slice | Content | Status |
|---|---|---|---|
| S1 | **Website pictures backend** | `website_picture` (`slot_key`, `position`, `media_item_id` unique cascade, `aspect`, `alt`, `updated_at`, `updated_by_person_id` SetNull) PK `(slot_key, position)`; `MediaOwnerKind.Website` + owner token, check constraints, `MediaOwnerAccess` → `gallery.publish`; tus upload with aspect metadata; `PUT website-pictures/{slot}/{position}/crop`, `PUT …/alt`, `DELETE …`, `POST …/from-gallery`, `POST website-pictures/transfer`; `GET website-pictures` (every stored position with signed URLs, uncropped URL, crop, aspect, alt, updated by/at); the two public forms with ETag and 404-while-empty, `PublicFace` gains the website member; ADR-0025 amended; erasure clears `updated_by` and the uploader (`ReferencesToPerson`) (rulings 1, 2, 4–7, 9, 11) | built 2026-10-12 (uncommitted): also `POST …/from-slot` for *Gleiches Foto wie …* (copies the source's original and alt text, new cut + aspect); aspect is a ratio 0.25–4 (tus metadata `aspect`, body `aspect` on crop/pick/copy — a re-crop stores the declared aspect); public JSON URLs carry no `v=` so they equal the preload URLs |
| S2 | **`@furria/website-pictures`** | Package in the workspace; `WEBSITE_PICTURE_SLOTS` with the initial catalogue, `PictureSlotKey`, pages in website order; pure helpers with tests: `slotsByPage`, `fillOf` (filled / empty / aspect mismatch per position), `orphansOf`, `transferTargetsOf`, `slotPictureUrlOf` (stable per-slot URL); the public response schema on `createMediaSchemas` (rulings 2, 3, 5, 9, 11) | built 2026-10-12 (uncommitted): pages are an ordered `WEBSITE_PAGES` (Startseite · Verein · Veranstaltungen · Galerie · Mitglied werden · Alle Seiten); helpers take the catalogue as a parameter, plus `fillCountOf` for the hub's *x von y belegt*; `KK_ASPECT.shareImage` (1.91) and a `@furria/ui/image-aspect` export so the package stays React-free; aspects confirmed (phone hero root is 4:5, stack lead 7:5 · 4:5 · 7:5, filmstrip 8 frames); `slotPictureUrlOf` untested (no logic); apps depend on the package from S3/S4 |
| S3 | **Club app** | Pinned *Website* entry in the gallery hub for `gallery.publish` with the fill count; `/gallery/website` gated by `gallery.publish`, designed in the build (ruling 14); upload via the picture desk with owner `{ kind: 'website', slot, position, aspect }`, gallery pick (the news sheet's album browser moved to a shared place), crop with `KkCropFrame` at the position's aspect, *Gleiches Foto wie …*, alt text, clear, aspect-mismatch re-crop, orphans; `'websitePicture'` in `DOMAIN_CHANGES`, reads in `READ_SHOWS`, mutations via `useApiMutation` (rulings 1, 5–8, 11, 14) | built 2026-10-12 (uncommitted): UX/UI/a11y pitches distilled into dense slot rows per website page (page sketch with the slot lit, frames at their real cut, empty = `KkVacancyField` in `vacancyToneOf` tone, gold crop mark on a stale cut, one flag per slot) and a position desk — sticky pane from `lg`, sheet on phone — with crop-before-commit for upload, gallery pick and *Gleiches Foto wie …*, alt text saved explicitly (decorative slots ask none), removal behind a confirm; orphans are desk positions with *Übertragen*/*Entfernen*; hub strip leads with filled positions; new `@furria/ui`: `KkPageSketch`, `KkSlotRow`, `KkVacancyField`, `KkFrame` `aspect`/`vacancy`/`recut`; `@furria/website-pictures` gains `vacancyToneOf` (S4 uses it for the fallback tone); album browser moved to `features/gallery-pick` with its own album list read; browser-checked end to end against a branch API (upload → develop → alt → copy) |
| S4 | **Website** | `lib/website-pictures` public resource (one fetch) + `useWebsitePicture(key, position?)` → `KkImageSource \| null` at the slot's aspect with the caller's `sizes`; the seven places wired; empty fallbacks per ruling 10; placeholder labels and their `*-content.ts` constants deleted; `index.html` preloads the hero and points `og:image` / `og:image:alt` at `site.shareImage`, `og-default.png` deleted; `pnpm build` + `pnpm shot` of the touched pages, empty and filled (rulings 3, 8–10, 12) | built 2026-10-12 (uncommitted): `useWebsitePicture(key, sizes, position?)` returns a state (`pending` blank · `empty` `KkVacancyField` in `vacancyToneOf` tone · `filled` image + alt, decorative → `''`) rendered by one `WebsitePicture`; series show filled positions only, each at its own frame/tilt — the stack falls back to all three vacancy frames when nothing is filled, the filmstrip disappears; preload + `og:image` are generated into `index.html` by a Vite plugin (`runnerImport` of `lib/website-pictures/website-picture-head.ts`) from the catalogue and the hero `sizes`, so they cannot drift from the `<img>`; `og:image:alt` is a React-hoisted `<meta>` (needs JS); `KkCoverPicture` gains `priority`, `@furria/ui/image-source` export; preload is site-wide (one SPA shell), so deep links fetch the hero too — 404 while empty; browser-checked empty + filled against a branch API |

## Out of scope

- Event pictures (L7d, ruling 13).
- Provenance of picked photos (ruling 4).
- Scheduling a picture change, per-season variants, art direction inside one slot (separate slots
  instead), videos in slots.
- A Start to-do for empty slots (ruling 2).
