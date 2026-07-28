# Handoff: FURRIA — Galerie (öffentliche Website)

Design direction for the public **Galerie** of the Furrscher Carnevals Club e.V. ("FURRIA").
This bundle arrived **without a README** — this file was written by the team while shaping
**P5**, so it records both what the mock proposes *and how we ruled on it*.

> **Read `docs/design/README.md` → "READ FIRST" first.** It governs every mock in this repo:
> the design *language* (tokens, Anton/Archivo, radius 14, soft elevation) is binding; layouts,
> flows, features and copy are **inspiration, not spec**, and improving them is actively wanted.

## What the mock contains

`src/fcc-ds-gallery.jsx` exports `GalleryPage({ mode, device, view })` and the `ALBEN` sample
content. Open `preview.html` in a browser (needs internet for CDN React + Google Fonts).

Three screens, faked with `useState` because the prototype has no router:

| `view` | Screen |
|---|---|
| `null` / `'index'` | Übersicht — hero album, current-session albums, older-session accordion |
| `'<albumId>'` | Album — header + masonry photo grid + next album |
| `'<albumId>:<n>'` | Lightbox — full-bleed single photo with ‹ › and a counter |

The other `src/` files are the shared brand layer (`fcc-theme.jsx`, `fcc-logos.jsx`) and the
mock-only phone frame (`fcc-shared.jsx` — **do not port**).

## Adopted

The mock's editorial **structure** is good and is what P5 builds:

- **Curated, not an archive** — one album per occasion, ~a dozen hand-picked photos. The comment at
  the top of the source says it best: *"No videos, no download, no infinite feed."* This restraint
  became a load-bearing decision, not a simplification.
- **Three levels** — index → album → full-screen viewer.
- **The newest album is featured** above the rest.
- **Older sessions collapse** instead of stretching the page forever.
- **Album header carries context** — date, venue, photo count, photographer credit, intro.
- **The rights + takedown note.** *"Du bist auf einem Foto und möchtest es hier nicht sehen? Eine
  kurze Mail genügt"* is the single most important piece of copy in the bundle.
- **Viewer chrome** — album name, caption, `n / total` counter, credit and venue in the footer.

## Rejected, and why

Recorded so the deviations are explained rather than silent (the READ FIRST asks for exactly this).
Full reasoning lives in [`plan/website/feature-gallery.md`](../../../plan/website/feature-gallery.md).

- **Hard "Plakat" offset-shadows** (`12px 12px 0 red`, 2px ink contours, square corners). Rejected as
  the system for the third phase running — our shipped **Destillat** language wins:
  `radius.base` 14, hairline borders, soft elevation. `shadow.posterOffset` stays reserved for hero
  headlines, so the featured album earns emphasis through **scale + layout + `shadow.raised`**.
- **`columnCount: 3` masonry.** Rejected on a **defect, not taste**: CSS multi-column fills
  top-to-bottom *per column*, so photo 2 sits below photo 1 while photo 5 sits beside it — tab order
  and screen-reader order stop matching the chronology of an evening. The mobile variant compounds it
  by splitting the array into even/odd halves. Replaced by orientation-aware tiles at uniform height,
  where **DOM order equals visual order**.
- **Wrap-around in the viewer.** The mock steps with modulo *and* prints "Letztes Bild" in the
  footer — self-contradictory. We clamp at both ends and disable the buttons.
- **Plausible-real photographer names** (*"Anja Weber"*, *"Uwe Krämer"*). These name invented people
  in what is effectively the **Fotograf** Amt; P4 already refused to invent a "Vorstand" byline.
  Placeholder credits must be unmistakably fake.
- **Invented past.** `ARCHIV` hardcodes 2024/25, 2023/24 and "Vereinsarchiv 1971–2023" with album
  names we do not have. Older sessions are **derived** from content and appear the day they become
  true.
- **The Instagram band.** Good idea, wrong phase — every social URL on the site is still `#`.
  Deferred to **P7** with the real links.
- **Baked-in chrome** — `GMobBar`, `StatusBar`, `HomeIndicator`, `PhoneFrame`, the mock's own
  masthead. The real shipped `Masthead`/`SiteFooter` stay untouched, as in every prior phase.
- **`gPanel()`'s inverted dark panel and `gTint()`'s three-way tint.** Both hand-roll what the
  theme already gives us; colours must come from the palette so they switch with the colour scheme.

## Not in the mock, added by us

- **Fanned Fotostapel** as the hero gesture (the mock has no hero aside at all).
- **`?photo=<n>`** — viewer state in the URL, so Back closes it and a photo is linkable.
- **A working `mailto:`** behind the takedown promise; the mock names no address.
- **Orientation on every photo** — drives the grid and kills layout shift once real files land.
- **`alt` on every photo**; the mock's placeholders carry only debug labels.
