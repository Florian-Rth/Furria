import type { MusicSegment } from '@/features/act-player/music-timeline';
import { timelineSecondsOf } from '@/features/act-player/music-timeline';
import type { Studio, StudioSong } from '@/features/acts/schemas';

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

export interface SongSettingsInput {
  songId: number;
  settings: SongSettings;
}

export type SongShift = 'earlier' | 'later';

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

export interface HoldsStudio {
  studio: Studio | null;
}

export const withStudio = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  change: (studio: Studio) => Studio,
): TResponse | undefined =>
  response === undefined || response.studio === null
    ? response
    : { ...response, studio: change(response.studio) };

export const withSongSettings = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  { songId, settings }: SongSettingsInput,
): TResponse | undefined =>
  withStudio(response, (studio) => ({
    ...studio,
    songs: studio.songs.map((song) => (song.songId === songId ? { ...song, ...settings } : song)),
  }));

export const withSongOrder = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  songIds: readonly number[],
): TResponse | undefined =>
  withStudio(response, (studio) => ({
    ...studio,
    songs: studio.songs.map((song) => {
      const position = songIds.indexOf(song.songId);

      return position < 0 ? song : { ...song, position };
    }),
  }));

export const withoutSong = <TResponse extends HoldsStudio>(
  response: TResponse | undefined,
  songId: number,
): TResponse | undefined =>
  withStudio(response, (studio) => ({
    ...studio,
    songs: studio.songs.filter((song) => song.songId !== songId),
  }));

export const shiftedOrderOf = (
  songs: readonly StudioSong[],
  songId: number,
  shift: SongShift,
): number[] | null => {
  const ids = orderedSongsOf(songs).map((song) => song.songId);
  const index = ids.indexOf(songId);
  const target = shift === 'earlier' ? index - 1 : index + 1;
  const neighbour = ids[target];

  if (index < 0 || neighbour === undefined) {
    return null;
  }

  ids[target] = songId;
  ids[index] = neighbour;

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
