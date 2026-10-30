import type { SpotPath, TimedKeyframe } from '@/features/act-player/choreography-motion';

export const KEY_MATCH_SECONDS = 0.05;
const KEY_GAP_SECONDS = 0.05;
const SAME_SECONDS = 1e-3;

export type DeskTracks = Record<number, readonly TimedKeyframe[]>;

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

const isAt = (keyframe: TimedKeyframe, seconds: number): boolean =>
  Math.abs(keyframe.seconds - seconds) <= KEY_MATCH_SECONDS;

export const keyedSpotsAt = (paths: readonly SpotPath[], seconds: number): number =>
  paths.filter((path) => path.keyframes.some((keyframe) => isAt(keyframe, seconds))).length;

export const keyedTracksOf = (paths: readonly SpotPath[], seconds: number): DeskTracks =>
  Object.fromEntries(
    paths
      .filter((path) => path.keyframes.some((keyframe) => isAt(keyframe, seconds)))
      .map((path) => [path.spotId, path.keyframes]),
  );

export const keyTimesOf = (paths: readonly SpotPath[]): number[] =>
  paths
    .flatMap((path) => path.keyframes.map((keyframe) => keyframe.seconds))
    .sort((left, right) => left - right)
    .filter(
      (time, index, sorted) => index === 0 || time - (sorted[index - 1] ?? 0) > KEY_MATCH_SECONDS,
    );

export const keyShiftedTracksOf = (
  paths: readonly SpotPath[],
  from: number,
  to: number,
): DeskTracks => {
  const tracks: DeskTracks = {};

  for (const path of paths) {
    const index = path.keyframes.findIndex((keyframe) => isAt(keyframe, from));
    const keyframe = path.keyframes[index];
    if (keyframe === undefined) {
      continue;
    }
    const before = path.keyframes[index - 1];
    const after = path.keyframes[index + 1];
    const low = before === undefined ? 0 : before.seconds + KEY_GAP_SECONDS;
    const high = after === undefined ? Number.POSITIVE_INFINITY : after.seconds - KEY_GAP_SECONDS;
    if (low > high) {
      continue;
    }
    const seconds = clamp(to, low, high);
    if (Math.abs(seconds - keyframe.seconds) < SAME_SECONDS) {
      continue;
    }
    tracks[path.spotId] = path.keyframes.map((candidate, at) =>
      at === index ? { ...candidate, seconds } : candidate,
    );
  }

  return tracks;
};
