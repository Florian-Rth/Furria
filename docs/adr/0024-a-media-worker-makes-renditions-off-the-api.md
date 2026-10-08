# A media worker makes renditions, off the API

Browsers cannot show every original the club uploads (HEIC photos, HEVC or 4K video), and a full
original is too heavy for a grid or a stream over the homelab uplink. Every media item therefore
gets **renditions**, made from its original. The homelab VM that runs the API has no GPU; another
VM on the same host has an Intel iGPU. Decided with Florian on 2026-10-08 while shaping L7a.

## The decision

**A separate media worker container makes every rendition; the API never processes media.** The
API stores originals and enqueues a job in Postgres; the worker claims jobs (`FOR UPDATE SKIP
LOCKED`), reads the original from the media path (ADR-0023) and writes renditions beside it.

- **Photos** (libvips): WebP at ~400, ~1600 and ~2560 px, EXIF orientation applied, GPS stripped.
  No AVIF — too slow to encode on a homelab CPU for the size it saves.
- **Videos** (ffmpeg): **remux before transcode** — an original that is already H.264 + AAC at
  ≤ 1080p is copied into a `faststart` MP4 in seconds; anything else is transcoded to one 1080p
  H.264/AAC MP4. Plus a poster frame and the duration. No adaptive streaming; the original stays
  the download.
- **Hardware acceleration is configuration** (`none | vaapi | qsv` plus the device mapping): the
  worker runs CPU-only beside the API by default, or on the iGPU VM with the media path mounted
  there. Several workers may share the queue. One video transcodes at a time per worker.
- **Renditions are cache**: deletable and regenerable from the original at any time. Only
  originals need a backup.
- A media item is *processing*, *ready* or *failed*. A stopped worker never blocks uploads — items
  wait in *processing*.

## Considered options

- **Processing inside the API** — one container fewer, but a transcode competes with requests on
  the same CPU, and the iGPU on another VM is out of reach.
- **Converting on the user's device** (canvas, WebCodecs) — the original must be uploaded anyway
  (it is the library's copy and the download), so it adds uplink rather than saving it; the server
  still needs its own pipeline for devices that cannot and for regenerating renditions; video in
  the browser is slow, battery-hungry and killed in the background on iOS; and the server cannot
  trust what a client produced.
