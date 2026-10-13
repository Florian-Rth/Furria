---
status: shaped 2026-10-12
phase: L7d — Event pictures (plan/launch.md; after L7c, before L8)
shaped_with: Florian, 2026-10-12 (grill-with-docs)
base: main with L7c merged (PR #37) and the crop fix (PR #38)
---

# L7d — Event pictures

The landing's event cards still show the striped `event-foto` dev placeholder, and no other place
that shows an event has a picture at all. Each **event** gets **one event picture**: a photo that
the event owns, set in the events workbench, shown wherever the event appears as a card or a page,
on the website and in the club app. `CONTEXT.md` carries the term **Event picture**.

Read first: `CONTEXT.md` → **Event picture**, **Event**, **Events workbench**, **Media item**,
**Group picture**, **Gallery**; ADR-0010, ADR-0025; `plan/launch/l6-public-events.md` (the event
model, the workbench, `events.manage`); `plan/launch/l7a-media-store.md` (owners, crop, public
face); `plan/launch/l7b-news.md` S2 (adding an owner kind to a running store, copying a gallery
pick); `plan/launch/l7c-website-pictures.md` rulings 10 and 13 (branded fallback, event photo is no
slot); `plan/web/image-toolkit.md` (`KK_ASPECT`, `toImageSource`, `KkCropFrame`).

---

## What was ruled on 2026-10-12

1. **A photo cut to 2:1, not a poster** (`KK_ASPECT.banner`, the same cut as a news picture).
   One cut serves the 2:1 card media, the news article's event card, the link preview and a wide
   band on the event page. Posters and flyers are advertising material for the workbench's later
   *advertising* panel, which composes them from the event's data. This picture is not one of them.
2. **One per event, owned by the event.** Media owner kind **event** (tus owner `event:{id}`,
   photos only). It is **uploaded** or **picked from the gallery** (any ready photo in a live
   album; inbox and bin are refused). A pick is copied on the server (`CopyOf`) and keeps no link to
   its source. Nothing is offered from earlier events (Florian: no).
3. **Set in the events workbench by `events.manage`**, on the event's own page. No new key.
4. **Live at once.** Events have no draft (L6 ruling 5), so the picture has none either. Upload,
   pick, re-crop and removal take effect immediately, the way a group picture does. Replacing the
   picture deletes the old item and its files. Removing it is final, with no bin.
5. **Re-crop without re-upload.** The cut is non-destructive (`KkCropFrame`, `uncropped`
   rendition), like a portrait or group picture.
6. **Optional.** Without a picture, an event shows the website's **branded surface** (group-tone
   field and broom mark, as in L7c ruling 10), never a stand-in photo. A picture is never needed to
   create an event or to change its availability.
7. **Lifecycle.** A **cancelled** event keeps its picture, with *Abgesagt* over it on every
   surface. **Deleting** an event deletes its picture with it.
8. **Where it shows (Florian):**
   - **Website:** the landing teaser's event cards (in place of `KkPhotoPlaceholder`), a picture
     band on the event page, the news article's event card (`KkNewsEventCard`), the event page's
     `og:image`, and `image` in the event JSON-LD (Google's event results expect one). The
     `/events` list stays a dense text list, and the next-event hero card stays text.
   - **Club app (new):** the events workbench (the event page carries the picture desk, and the
     hub rows carry a 2:1 thumbnail) and the event's **calendar entry** as the opener of the
     calendar's entry sheet (shared with Start). Tapping an event entry in the calendar opens the
     same entry sheet Start uses, for every member; with `events.manage` it carries *Bearbeiten*
     to the workbench event page (Florian, 2026-10-12). The calendar list and month grid stay
     text, to keep the dense information UI.
9. **No alt text, no caption.** The event's title always sits next to the picture, so the picture
   is decorative (`alt=""`). `og:image:alt` is the title. Photo credit is out of scope here, as it
   is for group pictures.
10. **Public face (ADR-0025 amended):** `PublicPictureKind.EventPicture` (route segment `events`).
    The picture is unsigned and versioned at `/api/public/events/pictures/{mediaItemId}/{size}`,
    and it is served exactly while its event is shown on the website (the same rule the public
    events list uses: venue set, not over). The public event list, the event detail and the news
    article's `event` carry `picture` (`width`, `height`, `smallUrl` / `mediumUrl` / `largeUrl`) or
    `null`.

Defaults taken without a ruling: the club app reuses `features/pictures` (`PictureKind` gains
`eventPicture`) and `features/gallery-pick`. Members see the picture through the calendar's signed
URLs, which needs no extra permission because every member sees every event. The event page's
picture band is designed while it is built (as L7c ruling 14 did): the website's typography and
tokens, with the branded surface when the picture is empty and in the cancelled state, checked
with `pnpm shot` for both empty and filled.

---

## Slices

Each slice ends with the validation in `CLAUDE.md` ("End of a slice/task") and its row updated here.
Each slice is built by a fresh session. S2 and S3 run in parallel after S1; S4 closes the phase.

| # | Slice | Content | Status |
|---|---|---|---|
| S1 | **Event picture (backend)** | `MediaOwnerKind.Event`, `event.picture_id` + owner FK (cascade with the event); tus owner `event:{id}` gated by `events.manage`, photos only, 2:1 held by the worker; `PUT events/{id}/picture/crop`, `DELETE events/{id}/picture`, `POST events/{id}/picture/from-gallery` (`galleryItemId` + crop, live album only); replace deletes the old item; `GET events`/`GET events/{id}` and the calendar read models for event entries carry `picture` (state, signed URLs, uncropped URL, crop); `PublicPictureKind.EventPicture` served while the event is shown; `picture` on the public event list, detail and the news article's `event`; ADR-0025 amended (rulings 1–7, 10) | built 2026-10-12 (uncommitted) |
| S2 | **Club app** | `PictureKind` `eventPicture` (`/api/events/{id}/picture`, owner `event`); picture desk on the workbench event page (upload with progress, *Aus der Galerie*, crop, re-crop, remove with two taps) gated by `events.manage`; 2:1 thumbnails in the hub rows; opener on the calendar's entry sheet (shared with Start) for event entries — tapping an event entry in the calendar opens it for every member, *Bearbeiten* to the workbench with `events.manage`; branded fallback; *Abgesagt* over the picture (rulings 2–8) | built 2026-10-12 (uncommitted) |
| S3 | **Website** | `lib/public-events` schemas gain `picture`; landing `EventCard` shows it (dev placeholder removed); event page picture band (designed while built); `KkNewsEventCard` shows it; event page `og:image` and `og:image:alt`; JSON-LD `image`; empty → branded surface, cancelled → *Abgesagt*; `pnpm shot` empty and filled (rulings 6–10) | built 2026-10-12 (uncommitted): `KkEventPicture` in `@furria/ui` (photo or `KkVacancyField`, tone `eventToneOf(eventId)`; cancelled → greyed photo, scrim and a static red *Abgesagt* stamp, `card`/`band` scale); event page band = the 2:1 picture atop the identity column, above the title; `KkNewsEventCard` takes `image`/`tone`/`cancelledLabel` and lays the picture beside the text from `sm`; `og:image` = `largeUrl`, `og:image:alt` = title, JSON-LD `image: [largeUrl]`; shots via Playwright with mocked public endpoints (no branch API) |
| S4 | **Wrap-up** | `eventToneOf` moved into `@furria/ui` (was duplicated in club-app and website); duplicate `og:image` checked: TanStack Router keeps the deepest route's tag per `property`, so the event page's picture replaces the site share image (no change); full suites; commit + PR | built 2026-10-12 |

**S1 wire shape (for S2/S3):** `GET events` rows carry `picture` (`PictureDto`: signed
`smallUrl`/`mediumUrl`/`largeUrl`, rendered pictures only). `GET events/{id}` carries `picture` as
`PictureEditingDto` (`state`, `picture`, `uncroppedUrl`, `crop`). `GET calendar` event entries carry
`event.picture` (`PictureDto`). Start's calendar entries carry `event` (`isCancelled`, `picture`),
which is `null` for entries that are not events. Writes: tus owner `event:{id}`,
`PUT events/{id}/picture/crop`, `DELETE events/{id}/picture`, `POST events/{id}/picture/from-gallery`
(`galleryItemId`, `left`/`top`/`width`/`height` → `mediaItemId`). Public: `picture` (`width`,
`height`, `smallUrl`/`mediumUrl`/`largeUrl`) or `null` on `public/events`, `public/events/{id}`
and the news article's `event`.

## Out of scope

- Posters, flyers and generated advertising material (the workbench's later advertising panel).
- More than one picture per event, galleries on the event page (the album covers that), videos.
- Reusing an earlier event's picture (ruling 2).
- Thumbnails in the `/events` list, the next-event hero card, the club calendar list and month grid.
- Alt text, captions and photo credit (ruling 9).
