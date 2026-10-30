import type {
  SpotPath,
  StagePoint,
  TimedKeyframe,
} from '@/features/act-player/choreography-motion';
import { easedProgress, pointOnMove, poseAt } from '@/features/act-player/choreography-motion';
import type { TimelineRange } from '@/features/act-player/music-timeline';
import type { ViewShare } from '@/features/act-practice/practice-stage';
import { viewShareOf } from '@/features/act-practice/practice-stage';
import type { StudioStage } from '@/features/acts/schemas';
import type { StepSpan } from './studio-i-spans';

const CENTRE_DIVISOR = 2;
const PATH_SAMPLES = 16;
const SNAP_METRES = 0.25;
const SAME_PLACE_METRES = 1e-3;

export interface SpotMove {
  spotId: number;
  from: StagePoint;
  to: StagePoint;
  window: TimelineRange | null;
  bent: boolean;
  drafted: boolean;
}

export interface FormationDraft {
  places: ReadonlyMap<string, StagePoint>;
  starts: ReadonlyMap<string, number>;
}

export const draftKeyOf = (stepId: number, spotId: number): string => `${stepId}:${spotId}`;

const isSamePlace = (left: StagePoint, right: StagePoint): boolean =>
  Math.abs(left.rightMetres - right.rightMetres) < SAME_PLACE_METRES &&
  Math.abs(left.backMetres - right.backMetres) < SAME_PLACE_METRES;

const snapped = (metres: number): number => Math.round(metres / SNAP_METRES) * SNAP_METRES;

export const stagePointOfShare = (share: ViewShare, stage: StudioStage): StagePoint => {
  const halfWidth = stage.widthMetres / CENTRE_DIVISOR;

  return {
    rightMetres: Math.min(
      halfWidth,
      Math.max(-halfWidth, snapped(halfWidth - share.x * stage.widthMetres)),
    ),
    backMetres: Math.min(stage.depthMetres, Math.max(0, snapped(share.y * stage.depthMetres))),
  };
};

const keyframesWithin = (path: SpotPath, span: StepSpan): TimedKeyframe[] =>
  path.keyframes.filter(
    (keyframe) => keyframe.seconds > span.start + 1e-3 && keyframe.seconds <= span.end + 1e-3,
  );

export const moveWindowOf = (path: SpotPath, span: StepSpan): TimelineRange | null => {
  const inside = keyframesWithin(path, span);
  let previous = poseAt(path, span.start)?.position ?? null;
  let previousSeconds = span.start;
  let start: number | null = null;
  let end: number | null = null;

  for (const keyframe of inside) {
    const moving =
      previous !== null && (keyframe.bend !== null || !isSamePlace(previous, keyframe.position));
    if (moving) {
      start ??= previousSeconds;
      end = keyframe.seconds;
    }
    previous = keyframe.position;
    previousSeconds = keyframe.seconds;
  }

  return start === null || end === null ? null : { start, end };
};

const retimedWindow = (window: TimelineRange, start: number): TimelineRange => ({
  start: Math.min(start, window.end - 1e-2),
  end: window.end,
});

export const spotMovesOf = (
  paths: readonly SpotPath[],
  span: StepSpan,
  stepId: number,
  draft: FormationDraft,
): SpotMove[] =>
  paths.flatMap((path) => {
    const from = poseAt(path, span.start)?.position;
    const natural = poseAt(path, span.end)?.position;

    if (from === undefined || natural === undefined) {
      return [];
    }

    const key = draftKeyOf(stepId, path.spotId);
    const place = draft.places.get(key);
    const start = draft.starts.get(key);
    const to = place ?? natural;
    const moved = !isSamePlace(from, to);
    const window =
      moveWindowOf(path, span) ?? (moved ? { start: span.start, end: span.end } : null);
    const shown = window === null || !moved ? null : window;

    return [
      {
        spotId: path.spotId,
        from,
        to,
        window: shown === null || start === undefined ? shown : retimedWindow(shown, start),
        bent: place === undefined && keyframesWithin(path, span).some((k) => k.bend !== null),
        drafted: place !== undefined || start !== undefined,
      },
    ];
  });

const progressIn = (window: TimelineRange, seconds: number): number =>
  Math.min(1, Math.max(0, (seconds - window.start) / (window.end - window.start)));

export const draftPositionAt = (path: SpotPath, move: SpotMove, seconds: number): StagePoint => {
  if (!move.drafted) {
    return poseAt(path, seconds)?.position ?? move.to;
  }
  if (move.window === null) {
    return move.to;
  }

  return pointOnMove(
    move.from,
    move.to,
    null,
    easedProgress('easeInOut', progressIn(move.window, seconds)),
  );
};

export const routeOf = (path: SpotPath, move: SpotMove): StagePoint[] => {
  const window = move.window;

  if (window === null) {
    return [];
  }

  return Array.from({ length: PATH_SAMPLES + 1 }, (_, index) =>
    draftPositionAt(
      path,
      move,
      window.start + ((window.end - window.start) * index) / PATH_SAMPLES,
    ),
  );
};

export const shareOfPoint = (point: StagePoint, stage: StudioStage): ViewShare =>
  viewShareOf(point, stage);
