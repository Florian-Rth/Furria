import type { Choreography, Keyframe } from '@/features/acts/schemas';
import type { MusicSegment } from './music-timeline';
import { timelineSecondsOf } from './music-timeline';

const FULL_TURN_DEGREES = 360;
const HALF_TURN_DEGREES = 180;
const BEND_WEIGHT = 2;
const HALF = 0.5;
const EASE_IN_OUT_WEIGHT = 2;

export interface StagePoint {
  rightMetres: number;
  backMetres: number;
}

export type KeyframeEasing = Keyframe['easing'];

export interface TimedKeyframe {
  seconds: number;
  position: StagePoint;
  bend: StagePoint | null;
  easing: KeyframeEasing;
  facingDegrees: number | null;
}

export interface SpotPath {
  spotId: number;
  keyframes: readonly TimedKeyframe[];
}

export interface SpotPose {
  spotId: number;
  position: StagePoint;
  facingDegrees: number | null;
  moving: boolean;
}

const timedKeyframeOf = (
  segments: readonly MusicSegment[],
  keyframe: Keyframe,
): TimedKeyframe | null => {
  const seconds = timelineSecondsOf(segments, {
    sourceMediaItemId: keyframe.sourceMediaItemId,
    seconds: keyframe.seconds,
  });

  return seconds === null
    ? null
    : {
        seconds,
        position: keyframe.position,
        bend: keyframe.bend,
        easing: keyframe.easing,
        facingDegrees: keyframe.facingDegrees,
      };
};

export const spotPathsOf = (
  choreography: Choreography | null,
  segments: readonly MusicSegment[],
): SpotPath[] =>
  (choreography?.tracks ?? []).map((track) => ({
    spotId: track.spotId,
    keyframes: track.keyframes
      .map((keyframe) => timedKeyframeOf(segments, keyframe))
      .filter((keyframe) => keyframe !== null)
      .sort((left, right) => left.seconds - right.seconds),
  }));

export const easedProgress = (easing: KeyframeEasing, progress: number): number => {
  const clamped = Math.min(1, Math.max(0, progress));

  switch (easing) {
    case 'linear':
      return clamped;
    case 'easeIn':
      return clamped * clamped;
    case 'easeOut':
      return 1 - (1 - clamped) * (1 - clamped);
    case 'easeInOut':
      return clamped < HALF
        ? EASE_IN_OUT_WEIGHT * clamped * clamped
        : 1 - EASE_IN_OUT_WEIGHT * (1 - clamped) * (1 - clamped);
  }
};

const lerp = (from: number, to: number, progress: number): number => from + (to - from) * progress;

const controlThrough = (from: StagePoint, bend: StagePoint, to: StagePoint): StagePoint => ({
  rightMetres: BEND_WEIGHT * bend.rightMetres - HALF * (from.rightMetres + to.rightMetres),
  backMetres: BEND_WEIGHT * bend.backMetres - HALF * (from.backMetres + to.backMetres),
});

const quadratic = (from: number, control: number, to: number, progress: number): number =>
  (1 - progress) * (1 - progress) * from +
  BEND_WEIGHT * (1 - progress) * progress * control +
  progress * progress * to;

export const pointOnMove = (
  from: StagePoint,
  to: StagePoint,
  bend: StagePoint | null,
  progress: number,
): StagePoint => {
  if (bend === null) {
    return {
      rightMetres: lerp(from.rightMetres, to.rightMetres, progress),
      backMetres: lerp(from.backMetres, to.backMetres, progress),
    };
  }

  const control = controlThrough(from, bend, to);

  return {
    rightMetres: quadratic(from.rightMetres, control.rightMetres, to.rightMetres, progress),
    backMetres: quadratic(from.backMetres, control.backMetres, to.backMetres, progress),
  };
};

const normalisedDegrees = (degrees: number): number =>
  ((degrees % FULL_TURN_DEGREES) + FULL_TURN_DEGREES) % FULL_TURN_DEGREES;

export const facingOnMove = (
  from: number | null,
  to: number | null,
  progress: number,
): number | null => {
  if (from === null || to === null) {
    return progress < 1 ? from : to;
  }

  const turn = normalisedDegrees(to - from + HALF_TURN_DEGREES) - HALF_TURN_DEGREES;

  return normalisedDegrees(from + turn * progress);
};

const isSamePlace = (left: StagePoint, right: StagePoint): boolean =>
  left.rightMetres === right.rightMetres && left.backMetres === right.backMetres;

const holdAt = (spotId: number, keyframe: TimedKeyframe): SpotPose => ({
  spotId,
  position: keyframe.position,
  facingDegrees: keyframe.facingDegrees,
  moving: false,
});

export const poseAt = (path: SpotPath, seconds: number): SpotPose | null => {
  const first = path.keyframes[0];
  const last = path.keyframes.at(-1);

  if (first === undefined || last === undefined) {
    return null;
  }

  if (seconds <= first.seconds) {
    return holdAt(path.spotId, first);
  }

  if (seconds >= last.seconds) {
    return holdAt(path.spotId, last);
  }

  const nextIndex = path.keyframes.findIndex((keyframe) => keyframe.seconds > seconds);
  const from = path.keyframes[nextIndex - 1] ?? first;
  const to = path.keyframes[nextIndex] ?? last;
  const progress = easedProgress(to.easing, (seconds - from.seconds) / (to.seconds - from.seconds));

  return {
    spotId: path.spotId,
    position: pointOnMove(from.position, to.position, to.bend, progress),
    facingDegrees: facingOnMove(from.facingDegrees, to.facingDegrees, progress),
    moving: to.bend !== null || !isSamePlace(from.position, to.position),
  };
};

export const posesAt = (paths: readonly SpotPath[], seconds: number): SpotPose[] =>
  paths.map((path) => poseAt(path, seconds)).filter((pose) => pose !== null);
