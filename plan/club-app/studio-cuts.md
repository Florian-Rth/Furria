# Studio cuts — music and video trimmed and split at the playhead

2026-11-03, branch `feat/rfc-57-studio-package`. Owner rulings (Florian):

- Music **and** video get **trim + split**, applied at the playhead (the centre line).
- A cut lands **exactly** at the playhead, no snapping to counts. Fine nudges ±0,01 s / ±0,1 s per edge.
- The edge drag handles on the music wave go away; cropping happens only at the playhead.

## Model decisions (technical, decided)

### Music: a song is one file cut into pieces

- `ActSong` loses `StartSeconds`/`EndSeconds` and gets **`Pieces`**: an ordered list of
  `{ StartSeconds, EndSeconds }` in *source* (file) seconds. Pieces are sorted ascending, never
  overlap (`next.Start >= prev.End`), gaps between them are music that was cut out. 1..50 pieces,
  each at least 0,5 s long, end within the file duration when known. Stored as a jsonb owned list
  (replaced wholesale on every write). Migration: every song → one piece `[Start, End ?? duration]`;
  a song whose duration is still unknown (processing) keeps an empty list, which means "whole file".
- One file stays in one song (anchors `sourceMediaItemId + seconds` stay unambiguous because
  pieces never overlap). A piece cannot be moved to another place in the order — only the song
  order exists, as today.
- `ActMusic` makes one `MusicCut` per piece. `Locate(anchor)`: the piece of that source with
  `Start <= s < End`, falling back to `Start <= s <= End` (the end of the last matching piece);
  source present but no piece holds it → `CutAway`; source absent → `MusicMissing`. Steps,
  keyframes and video anchors inside a cut-out gap become `cutAway` like a trimmed song edge today.
- `PUT acts/{actId}/songs/{songId}` body: `{ pieces: [{ startSeconds, endSeconds }], firstBeatSeconds, tempoBpm }`.
- Studio song DTO: `pieces: [{ startSeconds, endSeconds }]` (always ≥ 1; the empty list is sent as
  `[{ 0, duration ?? 0 }]`) replaces `startSeconds`/`endSeconds`.
- The song's beat grid (`firstBeatSeconds`, `tempoBpm`) is in source seconds and holds for all pieces.

### Final track alignments follow pieces

- A final-track alignment is keyed by `(FinalTrackId, SourceMediaItemId, FromSeconds)` instead of
  `(FinalTrackId, SourceMediaItemId)`. `FromSeconds` is a source second. Migration: existing rows get `FromSeconds = 0`.
- **Which alignment a piece uses:** the entry of its source with the greatest `FromSeconds < piece.End`;
  if none, the entry with the smallest `FromSeconds`. (So the pieces of one file can sit at
  different places in the final track; a fresh split inherits the alignment of the piece it came from.)
- Writing an alignment for a piece (`PUT` and the automatic match per cut): removes the source's
  entries with `FromSeconds` in `[piece.Start, piece.End)` and writes one with `FromSeconds = piece.Start`.
  The `PUT` body and the alignment DTO gain `fromSeconds`. The match result DTO gains `fromSeconds` (= the cut's start).
- Adoption rewrites an anchor with the alignment of the piece holding it; an anchor in no piece
  uses the entry with the greatest `FromSeconds <= seconds` (else smallest); no entry → unchanged.

### Video: clips

- `ActVideo` gets `ClipStartSeconds` (double, default 0) and `ClipEndSeconds` (double?, null = to the
  end of the file), both in *video* seconds. On the timeline a video shows
  `[startSeconds + clipStart, startSeconds + clipEnd)` (`startSeconds` = where video second 0 sits, unchanged).
- Several `ActVideo` rows may share one `MediaItemId` (the clips of a split). Adding the same file
  twice via `POST acts/{actId}/videos` is still refused. `DELETE` removes the row and the media item
  only when no other row uses it.
- `PUT acts/{actId}/videos/{videoId}/clip` `{ startSeconds, endSeconds }` — video ready, `0 <= start`,
  `end - start >= 0.5`, `end <= duration`.
- `POST acts/{actId}/videos/{videoId}/split` `{ atSeconds }` (video seconds) → `{ videoId }`: the
  original keeps `[clipStart, at]`, a new row (same file, name, anchor) gets `[at, clipEnd]`; both
  sides ≥ 0,5 s; counts toward `MostPerAct`. Parts whose main video was the original keep it.
- Coverage, outdated, main-video handing and placement checks use the clip span instead of the
  whole duration (`BeforeTheMusic`: `start + clipEnd <= 0`).
- Studio video DTO gains `clipStartSeconds` and `clipEndSeconds` (resolved: `ClipEnd ?? duration`, null while unknown).

### Edits in the studio document

- Trims and music splits are document changes (undoable, autosaved): `songSettings` carries
  `pieces`; new `videoClip { videoId, startSeconds, endSeconds }` → save write → `PUT …/clip`.
- A video split is a **direct action** (like align/remove): the server splits atomically and the
  studio reloads; it is not on the undo stack. Pending edits are flushed first (`direct`).
- `finalOffset` carries `fromSeconds`; document final alignments become a list per source.

## Screens

- **Musik bearbeiten (song desk)** acts on the *piece under the playhead*:
  - `Schnitt`: `Anfang hier` · `Teilen` · `Ende hier`; `Stück entfernen` when the song has > 1 piece.
  - `Anfang` / `Ende` lines: `−0,1` `−0,01` value (`m:ss,cc`) `+0,01` `+0,1`.
  - A button is disabled when the result would leave a piece < 0,5 s. After a start trim the
    playhead stays on the same music (keep at the piece's new timeline start); split keeps it.
- **Video bearbeiten (video desk)** acts on the selected video, same `Schnitt` / `Anfang` / `Ende`
  lines in video seconds; `Anfang hier`/`Teilen`/`Ende hier` only when the playhead is inside the clip.
  Existing name, `Start hier`, align, main-for-part and remove stay.
- The music wave keeps song regions and the cut lines between pieces; the crop drag handles and the
  count snapping (`trimmedCutOf`/`nudgedCutOf`/`onSongCountOf`) are removed. The final-preview
  shift handle stays (it aligns, it does not crop).
- Playback: a video plays only inside its clip; lanes, take lists and overlaps use the clip span.

## Slices

1. **Server** — pieces, piece-keyed final alignments, clips, split, delete-last-clip, migration, tests (TDD).
2. **Web** — schemas, timeline/segments per piece, document changes + save plan + save port,
   final mode per piece, video sync/lanes by clip, the two desks, copy; drag handles removed.
3. **Wrap-up** — format/build/lint/typecheck/targeted tests, browser check of both desks.

## Desks beside the timeline (2026-11-04)

- The song, final-track and video desks open in place of the song/video list, not as a sheet:
  no scrim, the wave, video and transport stay live, scrub keys stay on while a desk is open.
- The video desk leads with `Schnitt` / `Anfang` / `Ende`; the name field moves to the end.

## One shared video player (2026-11-04)

- `@furria/ui/KkVideo` is the only video player kit: `Picture` (synced, muted), `Clip` (native
  controls, hub step), `Corner`, `Bar`, `Caption`, `Note`, `Play`, `Mirror`, `Take`, `Fullscreen`.
  Fits: `fill` (inside a layer/area), `band` (edit page), `card` (hub step).
- Fullscreen via `useKkFullscreen`: the Fullscreen API where it exists, else the top layer
  (`popover`, iPhone). In fullscreen every player shows a play/pause key.
- Removed: `KkLaneFilm`, `KkScoreVideo`, the video/mirror/take/corner parts of `KkPracticeScreen`
  and `KkLesson.Video`.
