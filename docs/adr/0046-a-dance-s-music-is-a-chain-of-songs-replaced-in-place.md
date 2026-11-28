---
status: accepted
---

# A dance's music is a chain of songs, replaced in place

RFC 0001 split a dance's music into a **working mix** (songs, each cut) and a versioned **final
file** that waited beside it until someone adopted it, moving everything on the music once by one
offset per song. The Probenraum grilling of 2026-11-28 replaced that with one chain, because groups
build a dance song by song during the season and swap music versions several times.

## The decision

**The music is one chain of songs; any song can be replaced at any time.** *Ersetzen* takes a new
file, finds where the song lies in it, and — when the file also holds neighbouring songs (the
final mix) — offers to replace them too, merging them into one song. It takes effect immediately;
there is no waiting version, no *Probehören* and no *Endfassung übernehmen*. An undo bar and the
saved versions are the way back.

**Everything on the music re-finds its place step by step.** Each step border is matched locally
in the new file instead of moving the whole song by one offset, keyframes follow their borders, and
videos are re-placed by their own sound. A border that cannot be placed surely is flagged for the
editors, never moved silently.

**Splitting a song makes two songs of one file.** *Teilen* cuts exactly at the now line; each half
is cropped, moved or removed on its own, which is how a middle part is dropped. The halves cannot be
cropped into each other, so an anchor stays a file and a moment in it.

## Considered and rejected

**Keep the final file, matched inside the media step.** Still two concepts of "the music" and a
waiting state the trainer must remember to finish.

**One offset per song (as adoption did).** A DJ edit that shortens one chorus shifts every later
border in that song; trainers would re-tap dozens of borders per version.

## Consequences

The final-file tables and endpoints go; an adopted final file becomes the act's one song. Matching
stays synchronous in the API request, now per border, so its cost grows with the number of steps.
