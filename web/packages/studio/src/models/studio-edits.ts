import type { SpotPath, StagePoint, TimedKeyframe } from '@furria/studio/choreography-motion';
import type { CountMark } from '@furria/studio/music-timeline';
import type { StudioStep } from '@furria/studio/studio-schemas';

const MIN_STEP_SECONDS = 0.5;
export const KEY_TOLERANCE_SECONDS = 1e-3;

export interface TimeSpan {
  start: number;
  end: number;
}

export interface StudioEdits {
  tracks: Readonly<Record<number, readonly TimedKeyframe[]>>;
}

export const NO_EDITS: StudioEdits = { tracks: {} };

export const workedPathsOf = (
  paths: readonly SpotPath[],
  edits: StudioEdits,
): readonly SpotPath[] => {
  const known = new Set(paths.map((path) => path.spotId));
  const added = Object.entries(edits.tracks)
    .map(([spotId, keyframes]) => ({ spotId: Number(spotId), keyframes }))
    .filter((path) => !known.has(path.spotId));

  return [
    ...paths.map((path) => {
      const track = edits.tracks[path.spotId];

      return track === undefined ? path : { spotId: path.spotId, keyframes: track };
    }),
    ...added,
  ];
};

export const tracksWithoutOf = (
  tracks: StudioEdits['tracks'],
  settled: StudioEdits['tracks'],
): StudioEdits['tracks'] =>
  Object.fromEntries(
    Object.entries(tracks).filter(([spotId, keyframes]) => settled[Number(spotId)] !== keyframes),
  );

export const snappedOf = (marks: readonly CountMark[], seconds: number): number => {
  let best = seconds;
  let distance = Number.POSITIVE_INFINITY;

  for (const mark of marks) {
    const gap = Math.abs(mark.seconds - seconds);
    if (gap < distance) {
      distance = gap;
      best = mark.seconds;
    }
  }

  return best;
};

export const borderMovedOf = (
  steps: readonly StudioStep[],
  beforeStepId: number,
  seconds: number,
  marks: readonly CountMark[],
): Record<number, TimeSpan> => {
  const index = steps.findIndex((step) => step.stepId === beforeStepId);
  const before = steps[index];
  const after = steps[index + 1];

  if (
    before === undefined ||
    after === undefined ||
    before.startSeconds === null ||
    after.endSeconds === null
  ) {
    return {};
  }

  const lowest = before.startSeconds + MIN_STEP_SECONDS;
  const highest = after.endSeconds - MIN_STEP_SECONDS;
  const reachable = marks.filter((mark) => mark.seconds >= lowest && mark.seconds <= highest);
  const border = Math.min(highest, Math.max(lowest, snappedOf(reachable, seconds)));

  return {
    [before.stepId]: { start: before.startSeconds, end: border },
    [after.stepId]: { start: border, end: after.endSeconds },
  };
};

export const samePlace = (left: StagePoint, right: StagePoint): boolean =>
  left.rightMetres === right.rightMetres && left.backMetres === right.backMetres;

export const formationIndexOf = (
  keyframes: readonly TimedKeyframe[],
  seconds: number,
): number | null => {
  if (keyframes.length === 0) {
    return null;
  }

  const index = keyframes.findLastIndex(
    (keyframe) => keyframe.seconds <= seconds + KEY_TOLERANCE_SECONDS,
  );

  return Math.max(0, index);
};

export const holdRunOf = (keyframes: readonly TimedKeyframe[], index: number): TimeSpan => {
  const anchor = keyframes[index];

  if (anchor === undefined) {
    return { start: index, end: index };
  }

  const matches = (at: number): boolean => {
    const keyframe = keyframes[at];

    return keyframe !== undefined && samePlace(keyframe.position, anchor.position);
  };
  let start = index;
  let end = index;
  while (matches(start - 1)) {
    start -= 1;
  }
  while (matches(end + 1)) {
    end += 1;
  }

  return { start, end };
};

export const placedTrackOf = (
  keyframes: readonly TimedKeyframe[],
  seconds: number,
  position: StagePoint,
): readonly TimedKeyframe[] => {
  const index = formationIndexOf(keyframes, seconds);

  if (index === null) {
    return keyframes;
  }

  const run = holdRunOf(keyframes, index);

  return keyframes.map((keyframe, at) =>
    at >= run.start && at <= run.end ? { ...keyframe, position } : keyframe,
  );
};

export const GRID_METRES = 0.25;

export const snappedToGrid = (value: number): number =>
  Math.round(value / GRID_METRES) * GRID_METRES + 0;

export interface StageShare {
  x: number;
  y: number;
}

export const draggedPointOf = (
  origin: StagePoint,
  delta: StageShare,
  stage: { widthMetres: number; depthMetres: number },
): StagePoint => {
  const half = stage.widthMetres / 2;
  const right = origin.rightMetres - delta.x * stage.widthMetres;
  const back = origin.backMetres + delta.y * stage.depthMetres;

  return {
    rightMetres: Math.min(half, Math.max(-half, snappedToGrid(right))),
    backMetres: Math.min(stage.depthMetres, Math.max(0, snappedToGrid(back))),
  };
};
