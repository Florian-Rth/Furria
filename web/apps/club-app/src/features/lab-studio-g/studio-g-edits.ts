import type { SpotPath, StagePoint } from '@/features/act-player/choreography-motion';
import type { StageViewpoint } from '@/features/act-player/stage-view';
import type { StudioStage, StudioStep, StudioVideo } from '@/features/acts/schemas';

const MIN_STEP_SECONDS = 0.5;
const HOLD_TOLERANCE_SECONDS = 0.05;
const CENTRE_DIVISOR = 2;

export interface ShareDelta {
  x: number;
  y: number;
}

const startOf = (step: StudioStep): number => step.startSeconds ?? 0;

const endOf = (step: StudioStep): number => step.endSeconds ?? startOf(step);

export const clampedBorderOf = (
  steps: readonly StudioStep[],
  stepId: number,
  seconds: number,
): number | null => {
  const index = steps.findIndex((step) => step.stepId === stepId);
  const step = steps[index];
  const previous = steps[index - 1];

  if (step === undefined || previous === undefined) {
    return null;
  }

  return Math.min(
    endOf(step) - MIN_STEP_SECONDS,
    Math.max(startOf(previous) + MIN_STEP_SECONDS, seconds),
  );
};

export const withBordersOf = (
  steps: readonly StudioStep[],
  borders: ReadonlyMap<number, number>,
): StudioStep[] =>
  steps.map((step, index) => {
    const start = borders.get(step.stepId);
    const nextStep = steps[index + 1];
    const nextStart = nextStep === undefined ? undefined : borders.get(nextStep.stepId);

    return start === undefined && nextStart === undefined
      ? step
      : {
          ...step,
          startSeconds: start ?? step.startSeconds,
          endSeconds: nextStart ?? step.endSeconds,
        };
  });

export const clampedVideoStartOf = (seconds: number, length: number): number =>
  Math.min(Math.max(0, length - 1), Math.max(0, seconds));

export const withVideoStartsOf = (
  videos: readonly StudioVideo[],
  starts: ReadonlyMap<number, number>,
): StudioVideo[] =>
  videos.map((video) => {
    const start = starts.get(video.videoId);

    return start === undefined ? video : { ...video, startSeconds: start };
  });

export const keyframeKeyOf = (spotId: number, index: number): string => `${spotId}:${index}`;

const isSamePlace = (left: StagePoint, right: StagePoint): boolean =>
  left.rightMetres === right.rightMetres && left.backMetres === right.backMetres;

export const heldIndexesOf = (path: SpotPath, seconds: number): number[] => {
  const { keyframes } = path;
  const at = keyframes.findIndex(
    (keyframe) => Math.abs(keyframe.seconds - seconds) <= HOLD_TOLERANCE_SECONDS,
  );
  const anchor = at >= 0 ? at : keyframes.findLastIndex((keyframe) => keyframe.seconds <= seconds);

  if (anchor < 0) {
    return keyframes.length === 0 ? [] : [0];
  }

  const held = [anchor];
  for (let index = anchor + 1; index < keyframes.length; index += 1) {
    const from = keyframes[anchor];
    const to = keyframes[index];
    if (from === undefined || to === undefined || !isSamePlace(from.position, to.position)) {
      break;
    }
    held.push(index);
  }
  for (let index = anchor - 1; index >= 0; index -= 1) {
    const from = keyframes[anchor];
    const to = keyframes[index];
    if (from === undefined || to === undefined || !isSamePlace(from.position, to.position)) {
      break;
    }
    held.unshift(index);
  }

  return held;
};

export const withKeyframeMovesOf = (
  paths: readonly SpotPath[],
  moves: ReadonlyMap<string, StagePoint>,
): SpotPath[] =>
  moves.size === 0
    ? [...paths]
    : paths.map((path) => ({
        ...path,
        keyframes: path.keyframes.map((keyframe, index) => {
          const position = moves.get(keyframeKeyOf(path.spotId, index));

          return position === undefined ? keyframe : { ...keyframe, position };
        }),
      }));

export const draggedPointOf = (
  origin: StagePoint,
  delta: ShareDelta,
  stage: StudioStage,
  viewpoint: StageViewpoint,
): StagePoint => {
  const towardsAudience = viewpoint === 'audience' ? 1 : -1;
  const right = origin.rightMetres + towardsAudience * delta.x * stage.widthMetres;
  const back = origin.backMetres - towardsAudience * delta.y * stage.depthMetres;
  const half = stage.widthMetres / CENTRE_DIVISOR;

  return {
    rightMetres: Math.min(half, Math.max(-half, right)),
    backMetres: Math.min(stage.depthMetres, Math.max(0, back)),
  };
};

export const nearestKeyframeSecondsOf = (path: SpotPath, seconds: number): number | null => {
  let nearest: number | null = null;

  for (const keyframe of path.keyframes) {
    if (nearest === null || Math.abs(keyframe.seconds - seconds) < Math.abs(nearest - seconds)) {
      nearest = keyframe.seconds;
    }
  }

  return nearest;
};
