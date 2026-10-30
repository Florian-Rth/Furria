import type {
  SpotPath,
  StagePoint,
  TimedKeyframe,
} from '@/features/act-player/choreography-motion';
import type { CountMark, MusicSegment } from '@/features/act-player/music-timeline';
import type { Studio, StudioSong, StudioStep } from '@/features/acts/schemas';
import { songLimitOf } from './studio-music';

const MIN_STEP_SECONDS = 0.5;
const MIN_SONG_SECONDS = 2;
export const KEY_TOLERANCE_SECONDS = 1e-3;
const MIN_MOVE_SECONDS = 0.1;

export interface TimeSpan {
  start: number;
  end: number;
}

export interface StepText {
  name: string;
  description: string;
}

export interface StudioEdits {
  bounds: Readonly<Record<number, TimeSpan>>;
  texts: Readonly<Record<number, StepText>>;
  tracks: Readonly<Record<number, readonly TimedKeyframe[]>>;
  starts: Readonly<Record<number, number>>;
}

export const NO_EDITS: StudioEdits = { bounds: {}, texts: {}, tracks: {}, starts: {} };

export const withoutKeys = <TValue>(
  record: Readonly<Record<number, TValue>>,
  keys: readonly number[],
): Record<number, TValue> =>
  Object.fromEntries(Object.entries(record).filter(([key]) => !keys.includes(Number(key))));

export const workedStudioOf = (studio: Studio, edits: StudioEdits): Studio => ({
  ...studio,
  videos: studio.videos.map((video) => {
    const start = edits.starts[video.videoId];

    return start === undefined ? video : { ...video, startSeconds: start };
  }),
});

export const workedStepsOf = (
  steps: readonly StudioStep[],
  edits: StudioEdits,
): readonly StudioStep[] =>
  steps.map((step) => {
    const bounds = edits.bounds[step.stepId];
    const text = edits.texts[step.stepId];

    return {
      ...step,
      startSeconds: bounds?.start ?? step.startSeconds,
      endSeconds: bounds?.end ?? step.endSeconds,
      name: text?.name ?? step.name,
      description: text === undefined ? step.description : text.description || null,
    };
  });

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

export const retimedTrackOf = (
  keyframes: readonly TimedKeyframe[],
  index: number,
  target: TimeSpan,
): readonly TimedKeyframe[] => {
  if (keyframes[index] === undefined || keyframes[index + 1] === undefined) {
    return keyframes;
  }

  const floor = (keyframes[index - 1]?.seconds ?? Number.NEGATIVE_INFINITY) + KEY_TOLERANCE_SECONDS;
  const ceiling =
    (keyframes[index + 2]?.seconds ?? Number.POSITIVE_INFINITY) - KEY_TOLERANCE_SECONDS;
  const start = Math.min(ceiling - MIN_MOVE_SECONDS, Math.max(floor, target.start));
  const end = Math.min(ceiling, Math.max(start + MIN_MOVE_SECONDS, target.end));

  return keyframes.map((keyframe, at) => {
    if (at === index) {
      return { ...keyframe, seconds: start };
    }

    return at === index + 1 ? { ...keyframe, seconds: end } : keyframe;
  });
};

export type CutEdge = 'start' | 'end';

export const trimmedCutOf = (
  song: StudioSong,
  segment: MusicSegment,
  edge: CutEdge,
  seconds: number,
): TimeSpan => {
  const length = songLimitOf(song);

  if (edge === 'end') {
    const end = song.endSeconds + (seconds - segment.timelineEnd);

    return {
      start: song.startSeconds,
      end: Math.min(length, Math.max(song.startSeconds + MIN_SONG_SECONDS, end)),
    };
  }

  const start = song.startSeconds + (seconds - segment.timelineStart);

  return {
    start: Math.max(0, Math.min(song.endSeconds - MIN_SONG_SECONDS, start)),
    end: song.endSeconds,
  };
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
