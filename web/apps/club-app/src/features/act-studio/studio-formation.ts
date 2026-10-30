import type {
  SpotPath,
  StagePoint,
  TimedKeyframe,
} from '@/features/act-player/choreography-motion';
import { poseAt } from '@/features/act-player/choreography-motion';
import type { MusicAnchor, MusicSegment } from '@/features/act-player/music-timeline';
import { timelineSecondsOf } from '@/features/act-player/music-timeline';
import type { Keyframe, StudioStage } from '@/features/acts/schemas';
import type { TimeSpan } from './studio-edits';
import { GRID_METRES, KEY_TOLERANCE_SECONDS, samePlace, snappedToGrid } from './studio-edits';

const SPACING_METRES = 1.5;
const MARGIN_METRES = 1;
const FREE_DISTANCE_METRES = 0.75;
const FRONT_ROW_METRES = 1;
const FULL_TURN_DEGREES = 360;

export type FormationPreset = 'line' | 'block' | 'circle';
export type ArrangeAxis = 'across' | 'deep';
export type StageSize = Pick<StudioStage, 'widthMetres' | 'depthMetres'>;

export const onStageOf = (point: StagePoint, stage: StageSize): StagePoint => {
  const half = stage.widthMetres / 2;

  return {
    rightMetres: Math.min(half, Math.max(-half, point.rightMetres)),
    backMetres: Math.min(stage.depthMetres, Math.max(0, point.backMetres)),
  };
};

const gridPointOf = (point: StagePoint, stage: StageSize): StagePoint =>
  onStageOf(
    { rightMetres: snappedToGrid(point.rightMetres), backMetres: snappedToGrid(point.backMetres) },
    stage,
  );

const spreadOf = (count: number, room: number): number[] => {
  const spacing = count < 2 ? 0 : Math.min(SPACING_METRES, room / (count - 1));

  return Array.from({ length: count }, (_, index) => (index - (count - 1) / 2) * spacing);
};

const linePointsOf = (count: number, stage: StageSize): StagePoint[] =>
  spreadOf(count, stage.widthMetres - 2 * MARGIN_METRES).map((right) => ({
    rightMetres: right,
    backMetres: stage.depthMetres / 2,
  }));

const blockPointsOf = (count: number, stage: StageSize): StagePoint[] => {
  const columns = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / columns);
  const across = spreadOf(columns, stage.widthMetres - 2 * MARGIN_METRES);
  const deep = spreadOf(rows, stage.depthMetres - 2 * MARGIN_METRES);

  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / columns);
    const inRow = Math.min(columns, count - row * columns);
    const offset = (columns - inRow) / 2;
    const first = across[0] ?? 0;
    const step = (across[1] ?? first) - first;

    return {
      rightMetres: first + (index % columns) * step + offset * step,
      backMetres: stage.depthMetres / 2 + (deep[row] ?? 0),
    };
  });
};

const circlePointsOf = (count: number, stage: StageSize): StagePoint[] => {
  const widest = Math.min(stage.widthMetres, stage.depthMetres) / 2 - MARGIN_METRES;
  const radius = Math.max(GRID_METRES, Math.min(widest, (count * SPACING_METRES) / (2 * Math.PI)));

  return Array.from({ length: count }, (_, index) => {
    const angle = (2 * Math.PI * index) / count;

    return {
      rightMetres: radius * Math.sin(angle),
      backMetres: stage.depthMetres / 2 - radius * Math.cos(angle),
    };
  });
};

export const presetPointsOf = (
  preset: FormationPreset,
  count: number,
  stage: StageSize,
): StagePoint[] => {
  const points =
    preset === 'line'
      ? linePointsOf(count, stage)
      : preset === 'block'
        ? blockPointsOf(count, stage)
        : circlePointsOf(count, stage);

  return points.map((point) => gridPointOf(point, stage));
};

const along = (point: StagePoint, axis: ArrangeAxis): number =>
  axis === 'across' ? point.rightMetres : point.backMetres;

const withAlong = (point: StagePoint, axis: ArrangeAxis, value: number): StagePoint =>
  axis === 'across' ? { ...point, rightMetres: value } : { ...point, backMetres: value };

const mean = (values: readonly number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);

export const alignedOf = (
  points: readonly StagePoint[],
  axis: ArrangeAxis,
  stage: StageSize,
): StagePoint[] => {
  const across: ArrangeAxis = axis === 'across' ? 'deep' : 'across';
  const shared = snappedToGrid(mean(points.map((point) => along(point, across))));

  return points.map((point) => onStageOf(withAlong(point, across, shared), stage));
};

export const distributedOf = (
  points: readonly StagePoint[],
  axis: ArrangeAxis,
  stage: StageSize,
): StagePoint[] => {
  if (points.length < 3) {
    return [...points];
  }

  const order = points
    .map((point, index) => ({ index, value: along(point, axis) }))
    .sort((left, right) => left.value - right.value || left.index - right.index);
  const low = order[0]?.value ?? 0;
  const high = order.at(-1)?.value ?? 0;
  const result = [...points];

  order.forEach(({ index }, rank) => {
    const point = points[index];
    if (point !== undefined) {
      const value = low + ((high - low) * rank) / (points.length - 1);
      result[index] = onStageOf(withAlong(point, axis, value), stage);
    }
  });

  return result;
};

export const mirroredOf = (point: StagePoint): StagePoint => ({
  rightMetres: -point.rightMetres + 0,
  backMetres: point.backMetres,
});

export const freePointOf = (occupied: readonly StagePoint[], stage: StageSize): StagePoint => {
  const half = stage.widthMetres / 2;
  const rows = Math.floor(stage.depthMetres - FRONT_ROW_METRES) + 1;
  const across = Math.floor(half);

  for (let row = 0; row < rows; row += 1) {
    for (let step = 0; step <= 2 * across; step += 1) {
      const right = step % 2 === 0 ? step / 2 : -(step + 1) / 2;
      const candidate = { rightMetres: right + 0, backMetres: FRONT_ROW_METRES + row };
      const free = occupied.every(
        (point) =>
          Math.hypot(
            point.rightMetres - candidate.rightMetres,
            point.backMetres - candidate.backMetres,
          ) >= FREE_DISTANCE_METRES,
      );
      if (free && Math.abs(candidate.rightMetres) <= half) {
        return candidate;
      }
    }
  }

  return { rightMetres: 0, backMetres: stage.depthMetres / 2 };
};

const isAt = (keyframe: TimedKeyframe, seconds: number): boolean =>
  Math.abs(keyframe.seconds - seconds) <= KEY_TOLERANCE_SECONDS;

const heldFrom = (
  keyframes: readonly TimedKeyframe[],
  first: number,
  span: TimeSpan,
  place: StagePoint,
): number => {
  const holds = (next: TimedKeyframe | undefined): boolean =>
    next !== undefined &&
    next.seconds < span.end - KEY_TOLERANCE_SECONDS &&
    samePlace(next.position, place);
  let last = first;
  while (holds(keyframes[last + 1])) {
    last += 1;
  }

  return last;
};

export const formationPlacedOf = (
  spotId: number,
  keyframes: readonly TimedKeyframe[],
  span: TimeSpan,
  position: StagePoint,
): TimedKeyframe[] => {
  const existing = keyframes.findIndex((keyframe) => isAt(keyframe, span.start));
  const pose = poseAt({ spotId, keyframes }, span.start);
  const inserted: TimedKeyframe = {
    seconds: span.start,
    position,
    bend: null,
    easing: 'linear',
    facingDegrees: pose?.facingDegrees ?? null,
  };
  const track =
    existing >= 0
      ? [...keyframes]
      : [...keyframes, inserted].sort((left, right) => left.seconds - right.seconds);
  const first = existing >= 0 ? existing : track.indexOf(inserted);
  const held = existing >= 0 ? keyframes[existing]?.position : pose?.position;
  const last = held === undefined ? first : heldFrom(track, first, span, held);

  return track.map((keyframe, index) =>
    index >= first && index <= last ? { ...keyframe, position } : keyframe,
  );
};

export interface SpotGrab {
  selected: readonly number[];
  spotId: number;
  multi: boolean;
  playing: boolean;
}

export const grabbedSpotsOf = ({
  selected,
  spotId,
  multi,
  playing,
}: SpotGrab): readonly number[] => {
  if (playing && selected.length > 0) {
    return selected;
  }
  if (multi) {
    return selected.includes(spotId)
      ? selected.filter((id) => id !== spotId)
      : [...selected, spotId];
  }

  return selected.includes(spotId) ? selected : [spotId];
};

export const shownSelectionOf = (
  selected: readonly number[],
  standing: ReadonlyMap<number, StagePoint>,
): readonly number[] => selected.filter((spotId) => standing.has(spotId));

export const formationAt = (
  paths: readonly SpotPath[],
  seconds: number,
): ReadonlyMap<number, StagePoint> => {
  const points = new Map<number, StagePoint>();
  for (const path of paths) {
    const pose = poseAt(path, seconds);
    if (pose !== null) {
      points.set(path.spotId, pose.position);
    }
  }

  return points;
};

export const anchorAt = (
  segments: readonly MusicSegment[],
  seconds: number,
): MusicAnchor | null => {
  const last = segments.at(-1);
  const segment =
    segments.find(
      (candidate) => seconds >= candidate.timelineStart && seconds < candidate.timelineEnd,
    ) ??
    (last !== undefined && Math.abs(seconds - last.timelineEnd) <= KEY_TOLERANCE_SECONDS
      ? last
      : undefined);

  return segment === undefined
    ? null
    : {
        sourceMediaItemId: segment.mediaItemId,
        seconds: segment.sourceStart + (seconds - segment.timelineStart),
      };
};

const turnOf = (degrees: number | null): number | null =>
  degrees === null ? null : ((degrees % FULL_TURN_DEGREES) + FULL_TURN_DEGREES) % FULL_TURN_DEGREES;

export const anchoredTrackOf = (
  stored: readonly Keyframe[],
  timed: readonly TimedKeyframe[],
  segments: readonly MusicSegment[],
  stage: StageSize,
): Keyframe[] => {
  const offTimeline = stored.filter((keyframe) => timelineSecondsOf(segments, keyframe) === null);
  const onTimeline = timed.flatMap((keyframe) => {
    const anchor = anchorAt(segments, keyframe.seconds);

    return anchor === null
      ? []
      : [
          {
            ...anchor,
            position: onStageOf(keyframe.position, stage),
            bend: keyframe.bend,
            easing: keyframe.easing,
            facingDegrees: turnOf(keyframe.facingDegrees),
          },
        ];
  });

  return [...onTimeline, ...offTimeline];
};

export const baseVersionOf = (saved: number | null, cached: number | null): number | null => {
  const known = Math.max(saved ?? 0, cached ?? 0);

  return known > 0 ? known : null;
};
