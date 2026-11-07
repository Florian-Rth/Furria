import type { StagePoint, TimedKeyframe } from '@furria/studio/choreography-motion';
import { poseAt } from '@furria/studio/choreography-motion';
import type { StageShare, TimeSpan } from '@furria/studio/studio-edits';
import {
  GRID_METRES,
  holdRunOf,
  KEY_TOLERANCE_SECONDS,
  samePlace,
} from '@furria/studio/studio-edits';
import type { StageSize } from '@furria/studio/studio-formation';
import { onStageOf } from '@furria/studio/studio-formation';

const FULL_TURN_DEGREES = 360;
const HALF = 0.5;
const STRAIGHT_METRES = GRID_METRES / 2;

export const sameTrack = (
  left: readonly TimedKeyframe[],
  right: readonly TimedKeyframe[],
): boolean => left === right || JSON.stringify(left) === JSON.stringify(right);

const isMove = (from: TimedKeyframe, to: TimedKeyframe): boolean =>
  !samePlace(from.position, to.position) || to.bend !== null;

export const moveIndexNear = (
  keyframes: readonly TimedKeyframe[],
  span: TimeSpan,
  seconds: number,
): number | null => {
  const moves: number[] = [];

  for (let index = 0; index < keyframes.length - 1; index += 1) {
    const from = keyframes[index];
    const to = keyframes[index + 1];
    if (
      from !== undefined &&
      to !== undefined &&
      isMove(from, to) &&
      to.seconds > span.start + KEY_TOLERANCE_SECONDS &&
      from.seconds < span.end - KEY_TOLERANCE_SECONDS
    ) {
      moves.push(index);
    }
  }

  return (
    moves.find((index) => (keyframes[index + 1]?.seconds ?? 0) > seconds + KEY_TOLERANCE_SECONDS) ??
    moves.at(-1) ??
    null
  );
};

export const keyIndexAt = (
  keyframes: readonly TimedKeyframe[],
  seconds: number,
  tolerance: number,
): number | null => {
  const index = keyframes.findIndex(
    (keyframe) => Math.abs(keyframe.seconds - seconds) <= tolerance,
  );

  return index < 0 ? null : index;
};

export const keyedTrackOf = (
  keyframes: readonly TimedKeyframe[],
  seconds: number,
  position: StagePoint,
): readonly TimedKeyframe[] => {
  const existing = keyIndexAt(keyframes, seconds, KEY_TOLERANCE_SECONDS);

  if (existing !== null) {
    const run = holdRunOf(keyframes, existing);

    return keyframes.map((keyframe, index) =>
      index >= existing && index <= run.end ? { ...keyframe, position } : keyframe,
    );
  }

  const next = keyframes.findIndex((keyframe) => keyframe.seconds > seconds);
  const following = keyframes[next];
  const inserted: TimedKeyframe = {
    seconds,
    position,
    bend: null,
    easing: following?.easing ?? 'linear',
    facingDegrees: poseAt({ spotId: 0, keyframes }, seconds)?.facingDegrees ?? null,
  };

  return following === undefined
    ? [...keyframes, inserted]
    : [
        ...keyframes.slice(0, next),
        inserted,
        { ...following, bend: null },
        ...keyframes.slice(next + 1),
      ];
};

export const unkeyedTrackOf = (
  keyframes: readonly TimedKeyframe[],
  index: number,
): readonly TimedKeyframe[] => {
  if (keyframes.length < 2 || keyframes[index] === undefined) {
    return keyframes;
  }

  return keyframes
    .filter((_, at) => at !== index)
    .map((keyframe, at) => (at === index ? { ...keyframe, bend: null } : keyframe));
};

const midpointOf = (from: StagePoint, to: StagePoint): StagePoint => ({
  rightMetres: (from.rightMetres + to.rightMetres) * HALF,
  backMetres: (from.backMetres + to.backMetres) * HALF,
});

export const bendHandleOf = (
  keyframes: readonly TimedKeyframe[],
  index: number,
): StagePoint | null => {
  const from = keyframes[index];
  const to = keyframes[index + 1];

  if (from === undefined || to === undefined) {
    return null;
  }

  return to.bend ?? midpointOf(from.position, to.position);
};

const withArrival = (
  keyframes: readonly TimedKeyframe[],
  index: number,
  change: (keyframe: TimedKeyframe) => TimedKeyframe,
): readonly TimedKeyframe[] =>
  keyframes[index] === undefined || keyframes[index + 1] === undefined
    ? keyframes
    : keyframes.map((keyframe, at) => (at === index + 1 ? change(keyframe) : keyframe));

export const bentMoveOf = (
  keyframes: readonly TimedKeyframe[],
  index: number,
  bend: StagePoint,
  stage: StageSize,
): readonly TimedKeyframe[] => {
  const from = keyframes[index];
  const to = keyframes[index + 1];

  if (from === undefined || to === undefined) {
    return keyframes;
  }

  const middle = midpointOf(from.position, to.position);
  const straight =
    Math.hypot(bend.rightMetres - middle.rightMetres, bend.backMetres - middle.backMetres) <
    STRAIGHT_METRES;

  return withArrival(keyframes, index, (keyframe) => ({
    ...keyframe,
    bend: straight ? null : onStageOf(bend, stage),
  }));
};

export const straightenedMoveOf = (
  keyframes: readonly TimedKeyframe[],
  index: number,
): readonly TimedKeyframe[] =>
  withArrival(keyframes, index, (keyframe) => ({ ...keyframe, bend: null }));

export const facedMoveOf = (
  keyframes: readonly TimedKeyframe[],
  index: number,
  facingDegrees: number | null,
): readonly TimedKeyframe[] => {
  if (keyframes[index] === undefined || keyframes[index + 1] === undefined) {
    return keyframes;
  }

  const run = holdRunOf(keyframes, index + 1);

  return keyframes.map((keyframe, at) =>
    at >= index + 1 && at <= run.end ? { ...keyframe, facingDegrees } : keyframe,
  );
};

export const turnedOf = (facingDegrees: number | null, delta: number): number =>
  ((((facingDegrees ?? 0) + delta) % FULL_TURN_DEGREES) + FULL_TURN_DEGREES) % FULL_TURN_DEGREES;

export const stagePointOfShare = (share: StageShare, stage: StageSize): StagePoint =>
  onStageOf(
    {
      rightMetres: stage.widthMetres / 2 - share.x * stage.widthMetres,
      backMetres: share.y * stage.depthMetres,
    },
    stage,
  );
