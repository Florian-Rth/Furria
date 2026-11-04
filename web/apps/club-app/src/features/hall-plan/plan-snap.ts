import type { Bounds } from './plan-geometry';
import {
  add,
  angleOf,
  closestOnSegment,
  distanceBetween,
  normalizeDegrees,
  rotateVector,
} from './plan-geometry';
import type { Point } from './schemas';

export const GRID_STEP_CM = 10;
export const ROTATION_STEP_DEGREES = 15;
export const WALL_ANGLE_STEP_DEGREES = 45;
export const ALIGN_THRESHOLD_PX = 8;

export type GuideAxis = 'x' | 'y';

export interface Guide {
  axis: GuideAxis;
  at: number;
  from: number;
  to: number;
}

export interface AlignedMove {
  delta: Point;
  guides: Guide[];
}

export type SnapTarget = 'corner' | 'edge' | 'grid' | 'free';

export interface SnappedPoint {
  point: Point;
  target: SnapTarget;
}

export interface SnapSegment {
  from: Point;
  to: Point;
}

export const snapValue = (value: number, step: number = GRID_STEP_CM): number =>
  step <= 0 ? value : Math.round(value / step) * step;

export const snapToGrid = (point: Point, step: number = GRID_STEP_CM): Point => ({
  x: snapValue(point.x, step),
  y: snapValue(point.y, step),
});

export const snapAngle = (degrees: number, step: number = ROTATION_STEP_DEGREES): number =>
  normalizeDegrees(snapValue(degrees, step));

export const snapDirection = (
  from: Point,
  to: Point,
  step: number = WALL_ANGLE_STEP_DEGREES,
): Point => {
  const length = distanceBetween(from, to);

  return add(from, rotateVector({ x: length, y: 0 }, snapAngle(angleOf(from, to), step)));
};

export const thresholdInCm = (pixels: number, pixelsPerCm: number): number =>
  pixelsPerCm <= 0 ? 0 : pixels / pixelsPerCm;

const anchorsOf = (bounds: Bounds, axis: GuideAxis): number[] =>
  axis === 'x'
    ? [bounds.minX, (bounds.minX + bounds.maxX) / 2, bounds.maxX]
    : [bounds.minY, (bounds.minY + bounds.maxY) / 2, bounds.maxY];

interface AxisMatch {
  offset: number;
  at: number;
  other: Bounds;
}

const bestMatchOn = (
  moving: Bounds,
  others: readonly Bounds[],
  axis: GuideAxis,
  threshold: number,
): AxisMatch | null => {
  let best: AxisMatch | null = null;
  for (const other of others) {
    for (const mine of anchorsOf(moving, axis)) {
      for (const theirs of anchorsOf(other, axis)) {
        const offset = theirs - mine;
        if (
          Math.abs(offset) <= threshold &&
          (best === null || Math.abs(offset) < Math.abs(best.offset))
        ) {
          best = { offset, at: theirs, other };
        }
      }
    }
  }

  return best;
};

const guideOf = (match: AxisMatch, moved: Bounds, axis: GuideAxis): Guide =>
  axis === 'x'
    ? {
        axis,
        at: match.at,
        from: Math.min(moved.minY, match.other.minY),
        to: Math.max(moved.maxY, match.other.maxY),
      }
    : {
        axis,
        at: match.at,
        from: Math.min(moved.minX, match.other.minX),
        to: Math.max(moved.maxX, match.other.maxX),
      };

const shifted = (bounds: Bounds, delta: Point): Bounds => ({
  minX: bounds.minX + delta.x,
  minY: bounds.minY + delta.y,
  maxX: bounds.maxX + delta.x,
  maxY: bounds.maxY + delta.y,
});

export const alignMove = (
  moving: Bounds,
  delta: Point,
  others: readonly Bounds[],
  threshold: number,
): AlignedMove => {
  const moved = shifted(moving, delta);
  const onX = bestMatchOn(moved, others, 'x', threshold);
  const onY = bestMatchOn(moved, others, 'y', threshold);
  const aligned = { x: delta.x + (onX?.offset ?? 0), y: delta.y + (onY?.offset ?? 0) };
  const final = shifted(moving, aligned);
  const guides = [
    ...(onX === null ? [] : [guideOf(onX, final, 'x')]),
    ...(onY === null ? [] : [guideOf(onY, final, 'y')]),
  ];

  return { delta: aligned, guides };
};

export const snapToTargets = (
  point: Point,
  corners: readonly Point[],
  segments: readonly SnapSegment[],
  threshold: number,
  gridStep: number | null = GRID_STEP_CM,
): SnappedPoint => {
  let nearestCorner: Point | null = null;
  let cornerDistance = threshold;
  for (const corner of corners) {
    const distance = distanceBetween(point, corner);
    if (distance <= cornerDistance) {
      nearestCorner = corner;
      cornerDistance = distance;
    }
  }
  if (nearestCorner !== null) {
    return { point: nearestCorner, target: 'corner' };
  }
  let nearestEdge: Point | null = null;
  let edgeDistance = threshold;
  for (const segment of segments) {
    const candidate = closestOnSegment(point, segment.from, segment.to);
    const distance = distanceBetween(point, candidate);
    if (distance <= edgeDistance) {
      nearestEdge = candidate;
      edgeDistance = distance;
    }
  }
  if (nearestEdge !== null) {
    return { point: nearestEdge, target: 'edge' };
  }

  return gridStep === null
    ? { point, target: 'free' }
    : { point: snapToGrid(point, gridStep), target: 'grid' };
};
