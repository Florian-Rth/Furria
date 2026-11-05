import type { Shape } from './plan-geometry';
import { add, dot, scale } from './plan-geometry';
import type { Point } from './schemas';

export const FLUSH_REACH_PX = 12;
export const FLUSH_REACH_CM = 30;
export const FLUSH_TOLERANCE_CM = 0.5;

const CIRCLE_SIDES = 24;
const PARALLEL_COSINE = 0.999;
const MAX_PUSHES = 6;
const NO_MOVE: Point = { x: 0, y: 0 };

type Polygon = readonly Point[];

const polygonOf = (shape: Shape): Polygon => {
  if (shape.kind === 'polygon') {
    return shape.points;
  }

  return Array.from({ length: CIRCLE_SIDES }, (_, index) => {
    const angle = (index * 2 * Math.PI) / CIRCLE_SIDES;

    return {
      x: shape.center.x + Math.cos(angle) * shape.radius,
      y: shape.center.y + Math.sin(angle) * shape.radius,
    };
  });
};

const shifted = (polygon: Polygon, delta: Point): Polygon =>
  polygon.map((point) => add(point, delta));

const normalsOf = (polygon: Polygon): Point[] =>
  polygon.map((point, index) => {
    const next = polygon[(index + 1) % polygon.length] ?? point;
    const edge = { x: next.x - point.x, y: next.y - point.y };
    const length = Math.hypot(edge.x, edge.y);

    return length === 0 ? NO_MOVE : { x: -edge.y / length, y: edge.x / length };
  });

const projectionOf = (polygon: Polygon, axis: Point): [number, number] => {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const point of polygon) {
    const value = dot(point, axis);
    min = Math.min(min, value);
    max = Math.max(max, value);
  }

  return [min, max];
};

interface AxisReading {
  axis: Point;
  overlap: number;
  towardOther: number;
}

const readingsOf = (moving: Polygon, other: Polygon): AxisReading[] =>
  [...normalsOf(moving), ...normalsOf(other)]
    .filter((axis) => axis.x !== 0 || axis.y !== 0)
    .map((axis) => {
      const [minMoving, maxMoving] = projectionOf(moving, axis);
      const [minOther, maxOther] = projectionOf(other, axis);

      return {
        axis,
        overlap: Math.min(maxMoving, maxOther) - Math.max(minMoving, minOther),
        towardOther: (minOther + maxOther) / 2 >= (minMoving + maxMoving) / 2 ? 1 : -1,
      };
    });

const flushCorrection = (moving: Polygon, other: Polygon, reach: number): Point | null => {
  const readings = readingsOf(moving, other);
  const apart = readings.filter((reading) => reading.overlap < -FLUSH_TOLERANCE_CM);
  const widest = apart.reduce<AxisReading | null>(
    (best, reading) => (best === null || reading.overlap < best.overlap ? reading : best),
    null,
  );
  if (widest === null || -widest.overlap > reach) {
    return null;
  }
  const facing = apart.every(
    (reading) => Math.abs(dot(reading.axis, widest.axis)) > PARALLEL_COSINE,
  );

  return facing ? scale(widest.axis, -widest.overlap * widest.towardOther) : null;
};

const pushOut = (moving: Polygon, other: Polygon): Point | null => {
  const readings = readingsOf(moving, other);
  if (readings.some((reading) => reading.overlap <= FLUSH_TOLERANCE_CM)) {
    return null;
  }
  const smallest = readings.reduce((best, reading) =>
    reading.overlap < best.overlap ? reading : best,
  );

  return scale(smallest.axis, -smallest.overlap * smallest.towardOther);
};

const lengthOf = (vector: Point): number => Math.hypot(vector.x, vector.y);

const nearestFlush = (moving: readonly Polygon[], others: readonly Polygon[], reach: number) => {
  let best: Point | null = null;
  for (const mine of moving) {
    for (const theirs of others) {
      const correction = flushCorrection(mine, theirs, reach);
      if (correction !== null && (best === null || lengthOf(correction) < lengthOf(best))) {
        best = correction;
      }
    }
  }

  return best;
};

const firstPush = (moving: readonly Polygon[], others: readonly Polygon[]): Point | null => {
  for (const mine of moving) {
    for (const theirs of others) {
      const push = pushOut(mine, theirs);
      if (push !== null) {
        return push;
      }
    }
  }

  return null;
};

export const flushMove = (
  moving: readonly Shape[],
  delta: Point,
  others: readonly Shape[],
  reach: number,
  magnetic: boolean,
): Point => {
  const own = moving.map(polygonOf);
  const theirs = others.map(polygonOf);
  const snapped = magnetic
    ? add(
        delta,
        nearestFlush(
          own.map((polygon) => shifted(polygon, delta)),
          theirs,
          reach,
        ) ?? NO_MOVE,
      )
    : delta;
  let settled = snapped;
  for (let push = 0; push < MAX_PUSHES; push += 1) {
    const correction = firstPush(
      own.map((polygon) => shifted(polygon, settled)),
      theirs,
    );
    if (correction === null) {
      break;
    }
    settled = add(settled, correction);
  }

  return settled;
};

export const flushReachOf = (pixelsPerCm: number): number =>
  pixelsPerCm <= 0 ? FLUSH_REACH_CM : Math.max(FLUSH_REACH_PX / pixelsPerCm, FLUSH_REACH_CM);
