import type { Point } from './schemas';

export const GEOMETRY_EPSILON = 0.001;

export interface OrientedRect {
  center: Point;
  width: number;
  height: number;
  rotation: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export type Shape =
  | { kind: 'polygon'; points: readonly Point[] }
  | { kind: 'circle'; center: Point; radius: number };

export interface ShapeGap {
  overlaps: boolean;
  distance: number;
  from: Point;
  to: Point;
}

export interface SegmentHit {
  distance: number;
  point: Point;
}

const DEGREES_PER_HALF_TURN = 180;
const FULL_TURN = 360;

export const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });

export const subtract = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });

export const scale = (point: Point, factor: number): Point => ({
  x: point.x * factor,
  y: point.y * factor,
});

export const dot = (a: Point, b: Point): number => a.x * b.x + a.y * b.y;

export const lengthOf = (vector: Point): number => Math.hypot(vector.x, vector.y);

export const distanceBetween = (a: Point, b: Point): number => lengthOf(subtract(a, b));

export const midpointOf = (a: Point, b: Point): Point => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
});

export const toRadians = (degrees: number): number => (degrees * Math.PI) / DEGREES_PER_HALF_TURN;

export const toDegrees = (radians: number): number => (radians * DEGREES_PER_HALF_TURN) / Math.PI;

export const normalizeDegrees = (degrees: number): number =>
  ((degrees % FULL_TURN) + FULL_TURN) % FULL_TURN;

export const angleOf = (from: Point, to: Point): number =>
  normalizeDegrees(toDegrees(Math.atan2(to.y - from.y, to.x - from.x)));

export const rotateVector = (vector: Point, degrees: number): Point => {
  const radians = toRadians(degrees);
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return { x: vector.x * cos - vector.y * sin, y: vector.x * sin + vector.y * cos };
};

export const rotateAround = (point: Point, pivot: Point, degrees: number): Point =>
  add(pivot, rotateVector(subtract(point, pivot), degrees));

export const toWorld = (local: Point, origin: Point, rotation: number): Point =>
  add(origin, rotateVector(local, rotation));

export const toLocal = (world: Point, origin: Point, rotation: number): Point =>
  rotateVector(subtract(world, origin), -rotation);

export const cornersOf = (rect: OrientedRect): Point[] => {
  const halfWidth = rect.width / 2;
  const halfHeight = rect.height / 2;

  return [
    { x: -halfWidth, y: -halfHeight },
    { x: halfWidth, y: -halfHeight },
    { x: halfWidth, y: halfHeight },
    { x: -halfWidth, y: halfHeight },
  ].map((corner) => toWorld(corner, rect.center, rect.rotation));
};

export const rectShape = (rect: OrientedRect): Shape => ({
  kind: 'polygon',
  points: cornersOf(rect),
});

export const segmentRect = (from: Point, to: Point, thickness: number): OrientedRect => ({
  center: midpointOf(from, to),
  width: distanceBetween(from, to),
  height: thickness,
  rotation: angleOf(from, to),
});

export const closestOnSegment = (point: Point, from: Point, to: Point): Point => {
  const along = subtract(to, from);
  const squared = dot(along, along);
  if (squared === 0) {
    return from;
  }
  const t = Math.min(1, Math.max(0, dot(subtract(point, from), along) / squared));

  return add(from, scale(along, t));
};

export const distanceToSegment = (point: Point, from: Point, to: Point): number =>
  distanceBetween(point, closestOnSegment(point, from, to));

export const nearestOnPolyline = (point: Point, points: readonly Point[]): SegmentHit | null => {
  let nearest: SegmentHit | null = null;
  for (let index = 1; index < points.length; index++) {
    const from = points[index - 1];
    const to = points[index];
    if (from === undefined || to === undefined) {
      continue;
    }
    const candidate = closestOnSegment(point, from, to);
    const distance = distanceBetween(point, candidate);
    if (nearest === null || distance < nearest.distance) {
      nearest = { distance, point: candidate };
    }
  }

  return nearest;
};

export const isPointInPolygon = (point: Point, polygon: readonly Point[]): boolean => {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const a = polygon[index];
    const b = polygon[previous];
    if (a === undefined || b === undefined) {
      continue;
    }
    const crosses =
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x;
    if (crosses) {
      inside = !inside;
    }
  }

  return inside;
};

export const isPointInRect = (point: Point, rect: OrientedRect): boolean => {
  const local = toLocal(point, rect.center, rect.rotation);

  return Math.abs(local.x) <= rect.width / 2 && Math.abs(local.y) <= rect.height / 2;
};

export const isPointInShape = (point: Point, shape: Shape): boolean =>
  shape.kind === 'circle'
    ? distanceBetween(point, shape.center) <= shape.radius
    : isPointInPolygon(point, shape.points);

const edgesOf = (points: readonly Point[]): [Point, Point][] =>
  points.flatMap((point, index): [Point, Point][] => {
    const next = points[(index + 1) % points.length];

    return next === undefined ? [] : [[point, next]];
  });

const axesOf = (points: readonly Point[]): Point[] =>
  edgesOf(points).map(([from, to]) => {
    const edge = subtract(to, from);
    const length = lengthOf(edge);

    return length === 0 ? { x: 0, y: 0 } : { x: -edge.y / length, y: edge.x / length };
  });

const projectionOf = (points: readonly Point[], axis: Point): [number, number] => {
  const values = points.map((point) => dot(point, axis));

  return [Math.min(...values), Math.max(...values)];
};

const penetrationOf = (a: readonly Point[], b: readonly Point[]): number => {
  let smallest = Number.POSITIVE_INFINITY;
  for (const axis of [...axesOf(a), ...axesOf(b)]) {
    if (axis.x === 0 && axis.y === 0) {
      continue;
    }
    const [minA, maxA] = projectionOf(a, axis);
    const [minB, maxB] = projectionOf(b, axis);
    smallest = Math.min(smallest, Math.min(maxA, maxB) - Math.max(minA, minB));
  }

  return smallest;
};

const centroidOf = (points: readonly Point[]): Point =>
  scale(
    points.reduce((sum, point) => add(sum, point), { x: 0, y: 0 }),
    1 / Math.max(1, points.length),
  );

const overlapPointOf = (a: readonly Point[], b: readonly Point[]): Point => {
  const inside = [
    ...a.filter((point) => isPointInPolygon(point, b)),
    ...b.filter((point) => isPointInPolygon(point, a)),
  ];

  return inside.length > 0 ? centroidOf(inside) : midpointOf(centroidOf(a), centroidOf(b));
};

const nearestEdgePair = (a: readonly Point[], b: readonly Point[]): ShapeGap => {
  let best: ShapeGap = {
    overlaps: false,
    distance: Number.POSITIVE_INFINITY,
    from: { x: 0, y: 0 },
    to: { x: 0, y: 0 },
  };
  const consider = (from: Point, to: Point): void => {
    const distance = distanceBetween(from, to);
    if (distance < best.distance) {
      best = { overlaps: false, distance, from, to };
    }
  };
  for (const [from, to] of edgesOf(b)) {
    for (const point of a) {
      consider(point, closestOnSegment(point, from, to));
    }
  }
  for (const [from, to] of edgesOf(a)) {
    for (const point of b) {
      consider(closestOnSegment(point, from, to), point);
    }
  }

  return best;
};

const polygonGap = (a: readonly Point[], b: readonly Point[]): ShapeGap => {
  if (penetrationOf(a, b) > GEOMETRY_EPSILON) {
    const at = overlapPointOf(a, b);

    return { overlaps: true, distance: 0, from: at, to: at };
  }

  return nearestEdgePair(a, b);
};

const circleGap = (
  a: { center: Point; radius: number },
  b: { center: Point; radius: number },
): ShapeGap => {
  const between = distanceBetween(a.center, b.center);
  const gap = between - a.radius - b.radius;
  if (gap < -GEOMETRY_EPSILON) {
    const at = midpointOf(a.center, b.center);

    return { overlaps: true, distance: 0, from: at, to: at };
  }
  const direction =
    between === 0 ? { x: 1, y: 0 } : scale(subtract(b.center, a.center), 1 / between);

  return {
    overlaps: false,
    distance: Math.max(0, gap),
    from: add(a.center, scale(direction, a.radius)),
    to: subtract(b.center, scale(direction, b.radius)),
  };
};

const nearestOnPolygonEdge = (point: Point, polygon: readonly Point[]): Point => {
  let best = polygon[0] ?? point;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const [from, to] of edgesOf(polygon)) {
    const candidate = closestOnSegment(point, from, to);
    const distance = distanceBetween(point, candidate);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best;
};

const circlePolygonGap = (
  circle: { center: Point; radius: number },
  polygon: readonly Point[],
): ShapeGap => {
  const edgePoint = nearestOnPolygonEdge(circle.center, polygon);
  const toEdge = distanceBetween(circle.center, edgePoint);
  const centerInside = isPointInPolygon(circle.center, polygon);
  if (centerInside || toEdge < circle.radius - GEOMETRY_EPSILON) {
    const at = centerInside ? circle.center : midpointOf(circle.center, edgePoint);

    return { overlaps: true, distance: 0, from: at, to: at };
  }
  const direction =
    toEdge === 0 ? { x: 1, y: 0 } : scale(subtract(edgePoint, circle.center), 1 / toEdge);

  return {
    overlaps: false,
    distance: Math.max(0, toEdge - circle.radius),
    from: add(circle.center, scale(direction, circle.radius)),
    to: edgePoint,
  };
};

const swapped = (gap: ShapeGap): ShapeGap => ({ ...gap, from: gap.to, to: gap.from });

export const gapBetween = (a: Shape, b: Shape): ShapeGap => {
  if (a.kind === 'circle' && b.kind === 'circle') {
    return circleGap(a, b);
  }
  if (a.kind === 'circle' && b.kind === 'polygon') {
    return circlePolygonGap(a, b.points);
  }
  if (a.kind === 'polygon' && b.kind === 'circle') {
    return swapped(circlePolygonGap(b, a.points));
  }
  if (a.kind === 'polygon' && b.kind === 'polygon') {
    return polygonGap(a.points, b.points);
  }

  return {
    overlaps: false,
    distance: Number.POSITIVE_INFINITY,
    from: { x: 0, y: 0 },
    to: { x: 0, y: 0 },
  };
};

export const boundsOfPoints = (points: readonly Point[]): Bounds | null => {
  if (points.length === 0) {
    return null;
  }
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);

  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
};

export const boundsOfShape = (shape: Shape): Bounds => {
  if (shape.kind === 'circle') {
    return {
      minX: shape.center.x - shape.radius,
      minY: shape.center.y - shape.radius,
      maxX: shape.center.x + shape.radius,
      maxY: shape.center.y + shape.radius,
    };
  }

  return boundsOfPoints(shape.points) ?? { minX: 0, minY: 0, maxX: 0, maxY: 0 };
};

export const unionBounds = (all: readonly (Bounds | null)[]): Bounds | null =>
  all.reduce<Bounds | null>((union, next) => {
    if (next === null) {
      return union;
    }
    if (union === null) {
      return next;
    }

    return {
      minX: Math.min(union.minX, next.minX),
      minY: Math.min(union.minY, next.minY),
      maxX: Math.max(union.maxX, next.maxX),
      maxY: Math.max(union.maxY, next.maxY),
    };
  }, null);

export const padBounds = (bounds: Bounds, padding: number): Bounds => ({
  minX: bounds.minX - padding,
  minY: bounds.minY - padding,
  maxX: bounds.maxX + padding,
  maxY: bounds.maxY + padding,
});

export const boundsCenter = (bounds: Bounds): Point => ({
  x: (bounds.minX + bounds.maxX) / 2,
  y: (bounds.minY + bounds.maxY) / 2,
});

export const boundsFromCorners = (a: Point, b: Point): Bounds => ({
  minX: Math.min(a.x, b.x),
  minY: Math.min(a.y, b.y),
  maxX: Math.max(a.x, b.x),
  maxY: Math.max(a.y, b.y),
});

export const areBoundsApart = (a: Bounds, b: Bounds, margin: number): boolean =>
  a.maxX + margin < b.minX ||
  b.maxX + margin < a.minX ||
  a.maxY + margin < b.minY ||
  b.maxY + margin < a.minY;

export const isBoundsInside = (inner: Bounds, outer: Bounds): boolean =>
  inner.minX >= outer.minX &&
  inner.minY >= outer.minY &&
  inner.maxX <= outer.maxX &&
  inner.maxY <= outer.maxY;
