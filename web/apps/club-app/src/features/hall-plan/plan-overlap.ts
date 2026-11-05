import type { Bounds, Shape } from './plan-geometry';
import { areBoundsApart, boundsOfShape, gapBetween } from './plan-geometry';
import type { Point } from './schemas';

export const OVERLAP_TOLERANCE_CM = 1;

const centroidOf = (points: readonly Point[]): Point => ({
  x: points.reduce((sum, point) => sum + point.x, 0) / Math.max(points.length, 1),
  y: points.reduce((sum, point) => sum + point.y, 0) / Math.max(points.length, 1),
});

const towards = (point: Point, target: Point, distance: number): Point => {
  const length = Math.hypot(target.x - point.x, target.y - point.y);
  if (length <= distance) {
    return target;
  }

  return {
    x: point.x + ((target.x - point.x) / length) * distance,
    y: point.y + ((target.y - point.y) / length) * distance,
  };
};

export const shrinkShape = (shape: Shape, distance: number): Shape => {
  if (shape.kind === 'circle') {
    return { ...shape, radius: Math.max(shape.radius - distance, 0) };
  }
  const center = centroidOf(shape.points);

  return { kind: 'polygon', points: shape.points.map((point) => towards(point, center, distance)) };
};

export interface Footprint {
  shape: Shape;
  bounds: Bounds;
}

export const footprintOf = (shape: Shape): Footprint => ({ shape, bounds: boundsOfShape(shape) });

export const isClearlyOverlapping = (a: Footprint, b: Footprint): boolean =>
  !areBoundsApart(a.bounds, b.bounds, 0) &&
  gapBetween(shrinkShape(a.shape, OVERLAP_TOLERANCE_CM), b.shape).overlaps;
