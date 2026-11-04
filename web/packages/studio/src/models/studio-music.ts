import type { MusicSegment } from '@furria/studio/music-timeline';
import { timelineSecondsOf } from '@furria/studio/music-timeline';
import type { SongPiece, Studio, StudioSong } from '@furria/studio/studio-schemas';

const MIN_TEMPO_BPM = 40;
const MAX_TEMPO_BPM = 300;
const TEMPO_GRAIN = 10;
const BEAT_GRAIN = 1000;

export interface SongSettings {
  pieces: SongPiece[];
  firstBeatSeconds: number | null;
  tempoBpm: number | null;
}

export interface OutsideMusic {
  steps: number;
  videos: number;
  keyframes: number;
}

export const songSettingsOf = (song: StudioSong): SongSettings => ({
  pieces: song.pieces.map((piece) => ({ ...piece })),
  firstBeatSeconds: song.firstBeatSeconds,
  tempoBpm: song.tempoBpm,
});

const orderedSongsOf = (songs: readonly StudioSong[]): StudioSong[] =>
  [...songs].sort((left, right) => left.position - right.position);

export const movedOrderOf = (
  songs: readonly StudioSong[],
  from: number,
  to: number,
): number[] | null => {
  const ids = orderedSongsOf(songs).map((song) => song.songId);
  const [moving] = ids.splice(from, 1);

  if (moving === undefined || from < 0 || from === to || to < 0 || to > ids.length) {
    return null;
  }

  ids.splice(to, 0, moving);

  return ids;
};

export const keptLengthOf = (pieces: readonly SongPiece[]): number =>
  pieces.reduce((sum, piece) => sum + Math.max(0, piece.endSeconds - piece.startSeconds), 0);

export const songOfSegment = (
  songs: readonly StudioSong[],
  segment: MusicSegment,
): StudioSong | null => songs.find((song) => song.mediaItemId === segment.mediaItemId) ?? null;

export const deskSegmentIndexOf = (
  segments: readonly MusicSegment[],
  mediaItemId: number,
  seconds: number,
  heldStart: number | null,
): number => {
  const reaches = (segment: MusicSegment): boolean =>
    segment.mediaItemId === mediaItemId &&
    seconds >= segment.timelineStart &&
    seconds <= segment.timelineEnd;
  const held = segments.findIndex(
    (segment) => segment.sourceStart === heldStart && reaches(segment),
  );
  const playing = segments.findIndex(
    (segment) => reaches(segment) && seconds < segment.timelineEnd,
  );
  const ending = segments.findLastIndex(reaches);
  const first = segments.findIndex((segment) => segment.mediaItemId === mediaItemId);

  return [held, playing, ending].find((index) => index >= 0) ?? first;
};

const keptBeforeOf = (song: StudioSong, segment: MusicSegment): number =>
  keptLengthOf(song.pieces.filter((piece) => piece.endSeconds <= segment.sourceStart));

export const startInOrderOf = (
  songs: readonly StudioSong[],
  order: readonly number[],
  songId: number,
): number => {
  let start = 0;

  for (const id of order) {
    if (id === songId) {
      return start;
    }
    const song = songs.find((candidate) => candidate.songId === id);
    start += song === undefined ? 0 : keptLengthOf(song.pieces);
  }

  return start;
};

export const keptPositionOf = (
  songs: readonly StudioSong[],
  segments: readonly MusicSegment[],
  order: readonly number[],
  position: number,
): number | null => {
  const segment = segments.find(
    (candidate) => position >= candidate.timelineStart && position < candidate.timelineEnd,
  );
  const playing = segment === undefined ? null : songOfSegment(songs, segment);

  return playing === null || segment === undefined
    ? null
    : startInOrderOf(songs, order, playing.songId) +
        keptBeforeOf(playing, segment) +
        position -
        segment.timelineStart;
};

export const steppedTempoOf = (tempo: number, delta: number): number => {
  const stepped = Math.round((tempo + delta) * TEMPO_GRAIN) / TEMPO_GRAIN;

  return Math.min(MAX_TEMPO_BPM, Math.max(MIN_TEMPO_BPM, stepped));
};

const roundedBeatOf = (seconds: number): number => Math.round(seconds * BEAT_GRAIN) / BEAT_GRAIN;

export const songLimitOf = (song: StudioSong): number =>
  song.durationSeconds ?? song.pieces.at(-1)?.endSeconds ?? 0;

export const firstBeatAtOf = (song: StudioSong, segment: MusicSegment, seconds: number): number => {
  const source = segment.sourceStart + (seconds - segment.timelineStart);

  return roundedBeatOf(Math.min(songLimitOf(song), Math.max(0, source)));
};

export const nudgedFirstBeatOf = (song: StudioSong, delta: number): number | null => {
  if (song.firstBeatSeconds === null) {
    return null;
  }

  return roundedBeatOf(Math.min(songLimitOf(song), Math.max(0, song.firstBeatSeconds + delta)));
};

export const outsideMusicOf = (
  studio: Studio,
  segments: readonly MusicSegment[],
): OutsideMusic => ({
  steps: studio.steps.filter((step) => step.placement !== 'onTimeline').length,
  videos: studio.videos.filter(
    (video) => video.placement === 'cutAway' || video.placement === 'musicMissing',
  ).length,
  keyframes: (studio.choreography?.tracks ?? [])
    .flatMap((track) => track.keyframes)
    .filter((keyframe) => timelineSecondsOf(segments, keyframe) === null).length,
});
