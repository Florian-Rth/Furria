import { areaOutlineOf } from './area-shape';
import type { Bounds, Shape } from './plan-geometry';
import { boundsOfShape, isPointInPolygon, rectShape, segmentRect } from './plan-geometry';
import type { HallDocument, HallElement, Point, SeatingStandard } from './schemas';

export interface Blocker {
  elementId: string;
  exit: boolean;
  shape: Shape;
  bounds: Bounds;
}

const wallShapes = (element: Extract<HallElement, { kind: 'wall' }>): Shape[] =>
  element.points.slice(1).flatMap((to, index) => {
    const from = element.points[index];

    return from === undefined ? [] : [rectShape(segmentRect(from, to, element.thicknessCm))];
  });

const crossOf = (a: Point, b: Point, c: Point): number =>
  (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

const signedAreaOf = (points: readonly Point[]): number =>
  points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length] ?? point;

    return sum + point.x * next.y - next.x * point.y;
  }, 0);

const isEar = (ring: readonly Point[], index: number, turn: number): boolean => {
  const previous = ring[(index - 1 + ring.length) % ring.length];
  const current = ring[index];
  const next = ring[(index + 1) % ring.length];
  if (previous === undefined || current === undefined || next === undefined) {
    return false;
  }
  if (crossOf(previous, current, next) * turn <= 0) {
    return false;
  }
  const triangle = [previous, current, next];

  return ring.every((point) => triangle.includes(point) || !isPointInPolygon(point, triangle));
};

export const triangulate = (outline: readonly Point[]): Point[][] => {
  const ring = [...outline];
  const turn = signedAreaOf(ring) >= 0 ? 1 : -1;
  const triangles: Point[][] = [];
  while (ring.length > 3) {
    const ear = ring.findIndex((_, index) => isEar(ring, index, turn));
    if (ear < 0) {
      return [...triangles, ring];
    }
    const previous = ring[(ear - 1 + ring.length) % ring.length];
    const current = ring[ear];
    const next = ring[(ear + 1) % ring.length];
    if (previous !== undefined && current !== undefined && next !== undefined) {
      triangles.push([previous, current, next]);
    }
    ring.splice(ear, 1);
  }

  return ring.length === 3 ? [...triangles, ring] : triangles;
};

const areaShapes = (element: Extract<HallElement, { kind: 'area' }>): Shape[] =>
  element.shape === 'rect'
    ? [
        rectShape({
          center: { x: element.x, y: element.y },
          width: element.widthCm,
          height: element.heightCm,
          rotation: element.rotation,
        }),
      ]
    : triangulate(areaOutlineOf(element)).map((points) => ({ kind: 'polygon', points }));

const pillarShapes = (element: Extract<HallElement, { kind: 'pillar' }>): Shape[] =>
  element.round
    ? [
        {
          kind: 'circle',
          center: { x: element.x, y: element.y },
          radius: Math.max(element.widthCm, element.heightCm) / 2,
        },
      ]
    : [
        rectShape({
          center: { x: element.x, y: element.y },
          width: element.widthCm,
          height: element.heightCm,
          rotation: 0,
        }),
      ];

const blockerShapesOf = (element: HallElement, standard: SeatingStandard): Shape[] => {
  switch (element.kind) {
    case 'wall':
      return wallShapes(element);
    case 'area':
      return areaShapes(element);
    case 'pillar':
      return pillarShapes(element);
    case 'door':
      return element.door === 'emergencyExit'
        ? [rectShape(segmentRect(element.from, element.to, 2 * standard.exitClearanceCm))]
        : [];
    default:
      return [];
  }
};

export const blockersOf = (hall: HallDocument, standard: SeatingStandard): Blocker[] =>
  hall.elements.flatMap((element) =>
    blockerShapesOf(element, standard).map((shape) => ({
      elementId: element.id,
      exit: element.kind === 'door',
      shape,
      bounds: boundsOfShape(shape),
    })),
  );
