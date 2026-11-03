import type { MusicSegment } from '@furria/studio/music-timeline';
import { timelineSecondsOf } from '@furria/studio/music-timeline';
import type { Studio, StudioSong } from '@furria/studio/studio-schemas';

const MIN_TEMPO_BPM = 40;
const MAX_TEMPO_BPM = 300;
const TEMPO_GRAIN = 10;
const BEAT_GRAIN = 1000;

export interface SongSettings {
  startSeconds: number;
  endSeconds: number;
  firstBeatSeconds: number | null;
  tempoBpm: number | null;
}

export interface OutsideMusic {
  steps: number;
  videos: number;
  keyframes: number;
}

export const songSettingsOf = (song: StudioSong): SongSettings => ({
  startSeconds: song.startSeconds,
  endSeconds: song.endSeconds,
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
    start += song === undefined ? 0 : song.endSeconds - song.startSeconds;
  }

  return start;
};

export const keptPositionOf = (
  songs: readonly StudioSong[],
  segments: readonly MusicSegment[],
  order: readonly number[],
  position: number,
): number | null => {
  const index = segments.findIndex(
    (segment) => position >= segment.timelineStart && position < segment.timelineEnd,
  );
  const playing = orderedSongsOf(songs)[index];
  const segment = segments[index];

  return playing === undefined || segment === undefined
    ? null
    : startInOrderOf(songs, order, playing.songId) + position - segment.timelineStart;
};

export const steppedTempoOf = (tempo: number, delta: number): number => {
  const stepped = Math.round((tempo + delta) * TEMPO_GRAIN) / TEMPO_GRAIN;

  return Math.min(MAX_TEMPO_BPM, Math.max(MIN_TEMPO_BPM, stepped));
};

const roundedBeatOf = (seconds: number): number => Math.round(seconds * BEAT_GRAIN) / BEAT_GRAIN;

export const songLimitOf = (song: StudioSong): number => song.durationSeconds ?? song.endSeconds;

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
