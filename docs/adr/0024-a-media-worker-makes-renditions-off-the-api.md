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

## Addendum 2026-10-29: audio and media of an act (RFC 0001, phase 3)

The dance studio needs the group's music and trainer videos, so an **act** becomes a media owner
(`act:{id}`, `OwnerActId`). Each owner kind now declares the media kinds it accepts: an act takes
**audio and videos** (photos later), the gallery photos and videos, every other owner photos only.
An item still has exactly one owner.

- **Audio** is a third media kind: MP3, WAV, AIFF, FLAC and M4A (sniffed from the first bytes, up
  to 1 GiB). It belongs to acts only and is never public; who may hear it is decided where its
  signed URLs are issued (cast and group admins of the act, later its co-editors). Group admins of
  the act's group upload it.
- The worker has an **audio lane** beside photos and videos. From the original it measures the
  loudness (ffmpeg `loudnorm`, first pass) and writes **`Normalised`** (two-pass loudness to
  −16 LUFS / −1.5 dBTP, AAC 256 kbit/s, 44.1 or 48 kHz) and **`Preview`** (the same at 96 kbit/s),
  both M4A that every phone browser decodes. It decodes the sound once to 16 kHz mono and derives
  **`Peaks`** (JSON, 100 per second, 0–255) for waveforms, the leading silence, a **beat grid**
  (first beat + tempo) and a **sound profile**; at most the first hour is analysed. Sample rate,
  loudness, true peak, leading silence and the beat grid are stored on the item; the profile is a
  file beside the renditions (`sound-profile.bin`) and never served. A sound whose loudness cannot
  be measured fails; digital silence is stored at −70 LUFS and left unnormalised.
- An act's **video** also gets a sound profile of its soundtrack, so a trainer video can be matched
  to the music.
- The **sound profile** holds, per band (8 log-spaced bands, 100–7000 Hz), the rise in loudness
  every 10 ms, standardised. Comparing two profiles (`SoundComparison`, pure, in Core)
  cross-correlates them and returns the offset of one inside the other plus a confidence (the
  correlation at that offset). It finds a trimmed cut exactly and a noisy hall recording within a
  few hundredths of a second; every automatic result stays correctable by hand.
- Like every rendition, all of it is cache: regenerating an item rebuilds renditions, facts and
  profile from the original.
