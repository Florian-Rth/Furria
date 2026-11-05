import { union } from 'polyclip-ts';
import {
  cornersOf,
  distanceBetween,
  GEOMETRY_EPSILON,
  lengthOf,
  normalizeDegrees,
  rotateAround,
  subtract,
} from './plan-geometry';
import type { AreaElement, Point, PolygonAreaElement } from './schemas';

export interface AreaEdge {
  from: Point;
  to: Point;
  lengthCm: number;
  outward: Point;
}

export type AreaMergeRefusal = 'tooFew' | 'apart';

type Ring = [number, number][];

const RECT_EDGES_SHOWN = 2;
const COLLINEAR_TOLERANCE_CM = 0.5;

export const areaOutlineOf = (area: AreaElement): Point[] =>
  area.shape === 'polygon'
    ? [...area.points]
    : cornersOf({
        center: { x: area.x, y: area.y },
        width: area.widthCm,
        height: area.heightCm,
        rotation: area.rotation,
      });

const signedAreaOf = (points: readonly Point[]): number =>
  points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length] ?? point;

    return sum + point.x * next.y - next.x * point.y;
  }, 0);

export const areaLabelPointOf = (area: AreaElement): Point => {
  const outline = areaOutlineOf(area);
  const count = Math.max(1, outline.length);

  return {
    x: outline.reduce((sum, point) => sum + point.x, 0) / count,
    y: outline.reduce((sum, point) => sum + point.y, 0) / count,
  };
};

const edgesAround = (points: readonly Point[]): AreaEdge[] => {
  const turn = signedAreaOf(points) >= 0 ? 1 : -1;

  return points.flatMap((from, index) => {
    const to = points[(index + 1) % points.length];
    if (to === undefined) {
      return [];
    }
    const direction = subtract(to, from);
    const length = lengthOf(direction);
    if (length < GEOMETRY_EPSILON) {
      return [];
    }

    return [
      {
        from,
        to,
        lengthCm: length,
        outward: { x: (turn * direction.y) / length, y: (-turn * direction.x) / length },
      },
    ];
  });
};

export const areaEdgesOf = (area: AreaElement): AreaEdge[] => {
  const edges = edgesAround(areaOutlineOf(area));

  return area.shape === 'rect' ? edges.slice(0, RECT_EDGES_SHOWN) : edges;
};

const isOnLineBetween = (before: Point, point: Point, after: Point): boolean => {
  const span = distanceBetween(before, after);
  if (span < GEOMETRY_EPSILON) {
    return true;
  }
  const cross = Math.abs(
    (after.x - before.x) * (point.y - before.y) - (after.y - before.y) * (point.x - before.x),
  );

  return cross / span <= COLLINEAR_TOLERANCE_CM;
};

export const withoutStraightCorners = (points: readonly Point[]): Point[] => {
  const kept = points.filter((point, index) => {
    const before = points[(index - 1 + points.length) % points.length] ?? point;
    const after = points[(index + 1) % points.length] ?? point;

    return !isOnLineBetween(before, point, after);
  });

  return kept.length >= 3 ? kept : [...points];
};

const ringOf = (outline: readonly Point[]): Ring => {
  const ring: Ring = outline.map((point) => [point.x, point.y]);
  const first = ring[0];

  return first === undefined ? ring : [...ring, first];
};

const outlineOfRing = (ring: Ring): Point[] => {
  const open = ring.slice(0, -1);

  return open.map(([x, y]) => ({ x, y }));
};

export type AreaMerge =
  | { kind: 'merged'; outline: Point[] }
  | { kind: 'refused'; reason: AreaMergeRefusal };

export const mergeOutlines = (outlines: readonly (readonly Point[])[]): AreaMerge => {
  const [first, ...rest] = outlines.map((outline) => [ringOf(outline)]);
  if (first === undefined || rest.length === 0) {
    return { kind: 'refused', reason: 'tooFew' };
  }
  const merged = union(first, ...rest);
  const outer = merged.length === 1 ? merged[0]?.[0] : undefined;

  return outer === undefined
    ? { kind: 'refused', reason: 'apart' }
    : { kind: 'merged', outline: withoutStraightCorners(outlineOfRing(outer)) };
};

export const movedArea = (area: AreaElement, delta: Point): AreaElement =>
  area.shape === 'polygon'
    ? {
        ...area,
        points: area.points.map((point) => ({ x: point.x + delta.x, y: point.y + delta.y })),
      }
    : { ...area, x: area.x + delta.x, y: area.y + delta.y };

export const rotatedArea = (area: AreaElement, pivot: Point, degrees: number): AreaElement => {
  if (area.shape === 'polygon') {
    return { ...area, points: area.points.map((point) => rotateAround(point, pivot, degrees)) };
  }
  const center = rotateAround({ x: area.x, y: area.y }, pivot, degrees);

  return { ...area, x: center.x, y: center.y, rotation: normalizeDegrees(area.rotation + degrees) };
};

export const polygonAreaFrom = (
  source: AreaElement,
  outline: readonly Point[],
): PolygonAreaElement => ({
  id: source.id,
  kind: 'area',
  shape: 'polygon',
  area: source.area,
  points: [...outline],
  label: source.label,
});
