import type {
  KeyframeEasing,
  StagePoint,
  TimedKeyframe,
} from '@/features/act-player/choreography-motion';
import { poseAt } from '@/features/act-player/choreography-motion';
import type { StageShare, TimeSpan } from './studio-edits';
import { GRID_METRES, holdRunOf, KEY_TOLERANCE_SECONDS, samePlace } from './studio-edits';
import type { StageSize } from './studio-formation';
import { onStageOf } from './studio-formation';

const MIN_MOVE_SECONDS = 0.1;
const FULL_TURN_DEGREES = 360;
const HALF = 0.5;
const STRAIGHT_METRES = GRID_METRES / 2;

export const KEYFRAME_EASINGS: readonly KeyframeEasing[] = [
  'linear',
  'easeIn',
  'easeOut',
  'easeInOut',
];

const isAt = (keyframe: TimedKeyframe, seconds: number): boolean =>
  Math.abs(keyframe.seconds - seconds) <= KEY_TOLERANCE_SECONDS;

export const sameTrack = (
  left: readonly TimedKeyframe[],
  right: readonly TimedKeyframe[],
): boolean => left === right || JSON.stringify(left) === JSON.stringify(right);

const isMove = (from: TimedKeyframe, to: TimedKeyframe): boolean =>
  !samePlace(from.position, to.position) || to.bend !== null;

const holdOf = (keyframe: TimedKeyframe, seconds: number): TimedKeyframe => ({
  seconds,
  position: keyframe.position,
  bend: null,
  easing: 'linear',
  facingDegrees: keyframe.facingDegrees,
});

const withoutTwins = (keyframes: readonly TimedKeyframe[]): TimedKeyframe[] =>
  keyframes.filter(
    (keyframe, index) => index === 0 || !isAt(keyframe, keyframes[index - 1]?.seconds ?? 0),
  );

const clamped = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

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

export const retimedMoveOf = (
  keyframes: readonly TimedKeyframe[],
  index: number,
  target: TimeSpan,
): readonly TimedKeyframe[] => {
  const before = keyframes[index - 1];
  const from = keyframes[index];
  const to = keyframes[index + 1];
  const after = keyframes[index + 2];

  if (from === undefined || to === undefined) {
    return keyframes;
  }

  const floor =
    before === undefined
      ? Number.NEGATIVE_INFINITY
      : isMove(before, from)
        ? from.seconds
        : before.seconds;
  const ceiling =
    after === undefined ? Number.POSITIVE_INFINITY : isMove(to, after) ? to.seconds : after.seconds;

  if (floor > ceiling - MIN_MOVE_SECONDS) {
    return keyframes;
  }

  const start = clamped(target.start, floor, ceiling - MIN_MOVE_SECONDS);
  const end = clamped(target.end, start + MIN_MOVE_SECONDS, ceiling);
  const heldBefore = before !== undefined && samePlace(before.position, from.position);
  const heldAfter = after !== undefined && samePlace(after.position, to.position);
  const leaving =
    from.seconds < start - KEY_TOLERANCE_SECONDS && !heldBefore
      ? [from, holdOf(from, start)]
      : [{ ...from, seconds: start }];
  const arriving =
    to.seconds > end + KEY_TOLERANCE_SECONDS && !heldAfter
      ? [{ ...to, seconds: end }, holdOf(to, to.seconds)]
      : [{ ...to, seconds: end }];

  return withoutTwins([
    ...keyframes.slice(0, index),
    ...leaving,
    ...arriving,
    ...keyframes.slice(index + 2),
  ]);
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

export const easedMoveOf = (
  keyframes: readonly TimedKeyframe[],
  index: number,
  easing: KeyframeEasing,
): readonly TimedKeyframe[] =>
  withArrival(keyframes, index, (keyframe) => ({ ...keyframe, easing }));

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
