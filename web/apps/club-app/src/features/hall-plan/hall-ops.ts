import type { AreaMergeRefusal } from './area-shape';
import {
  areaOutlineOf,
  mergeOutlines,
  movedArea,
  polygonAreaFrom,
  rotatedArea,
} from './area-shape';
import type { Bounds } from './plan-geometry';
import {
  add,
  boundsCenter,
  boundsFromCorners,
  boundsOfPoints,
  cornersOf,
  distanceBetween,
  isBoundsInside,
  isPointInPolygon,
  isPointInRect,
  midpointOf,
  nearestOnPolyline,
  normalizeDegrees,
  rotateAround,
  unionBounds,
} from './plan-geometry';
import { HALL_ELEMENT_ID_PREFIX, nextIds } from './plan-ids';
import type {
  AreaElement,
  AreaKind,
  DoorElement,
  DoorKind,
  HallDocument,
  HallElement,
  LineElement,
  PillarElement,
  Point,
  RectAreaElement,
  TextElement,
  TextSize,
  WallElement,
} from './schemas';

export const DEFAULT_WALL_THICKNESS_CM = 20;
export const DEFAULT_PILLAR_SIZE_CM = 40;
export const MIN_AREA_SIZE_CM = 10;
export const DUPLICATE_OFFSET: Point = { x: 50, y: 50 };

const TEXT_HEIGHT_CM: Record<TextSize, number> = { small: 30, medium: 60, large: 120 };
const TEXT_WIDTH_PER_CHAR = 0.6;

export const hallElementIds = (document: HallDocument): string[] =>
  document.elements.map((element) => element.id);

export const newHallElementId = (document: HallDocument): string =>
  nextIds(HALL_ELEMENT_ID_PREFIX, hallElementIds(document), 1)[0] ?? `${HALL_ELEMENT_ID_PREFIX}1`;

export const createWall = (id: string, points: readonly Point[]): WallElement => ({
  id,
  kind: 'wall',
  points: [...points],
  thicknessCm: DEFAULT_WALL_THICKNESS_CM,
});

export const createDoor = (
  id: string,
  from: Point,
  to: Point,
  door: DoorKind = 'entrance',
): DoorElement => ({
  id,
  kind: 'door',
  from,
  to,
  door,
});

export const createArea = (
  id: string,
  area: AreaKind,
  corner: Point,
  opposite: Point,
): RectAreaElement => {
  const bounds = boundsFromCorners(corner, opposite);

  return {
    id,
    kind: 'area',
    shape: 'rect',
    area,
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
    widthCm: Math.max(MIN_AREA_SIZE_CM, bounds.maxX - bounds.minX),
    heightCm: Math.max(MIN_AREA_SIZE_CM, bounds.maxY - bounds.minY),
    rotation: 0,
    label: null,
  };
};

export const createPillar = (id: string, at: Point, round = false): PillarElement => ({
  id,
  kind: 'pillar',
  x: at.x,
  y: at.y,
  widthCm: DEFAULT_PILLAR_SIZE_CM,
  heightCm: DEFAULT_PILLAR_SIZE_CM,
  round,
});

export const createLine = (id: string, points: readonly Point[]): LineElement => ({
  id,
  kind: 'line',
  points: [...points],
  label: null,
});

export const createText = (
  id: string,
  at: Point,
  text: string,
  size: TextSize = 'medium',
): TextElement => ({
  id,
  kind: 'text',
  x: at.x,
  y: at.y,
  text,
  size,
  rotation: 0,
});

export const addElement = (document: HallDocument, element: HallElement): HallDocument => ({
  elements: [...document.elements, element],
});

export const replaceElement = (document: HallDocument, element: HallElement): HallDocument => ({
  elements: document.elements.map((existing) => (existing.id === element.id ? element : existing)),
});

export const findElement = (document: HallDocument, id: string): HallElement | null =>
  document.elements.find((element) => element.id === id) ?? null;

export const removeElements = (document: HallDocument, ids: readonly string[]): HallDocument => ({
  elements: document.elements.filter((element) => !ids.includes(element.id)),
});

const movePoint = (point: Point, delta: Point): Point => add(point, delta);

export const movedElement = (element: HallElement, delta: Point): HallElement => {
  switch (element.kind) {
    case 'wall':
    case 'line':
      return { ...element, points: element.points.map((point) => movePoint(point, delta)) };
    case 'door':
      return { ...element, from: movePoint(element.from, delta), to: movePoint(element.to, delta) };
    case 'area':
      return movedArea(element, delta);
    default:
      return { ...element, x: element.x + delta.x, y: element.y + delta.y };
  }
};

export const moveElements = (
  document: HallDocument,
  ids: readonly string[],
  delta: Point,
): HallDocument => ({
  elements: document.elements.map((element) =>
    ids.includes(element.id) ? movedElement(element, delta) : element,
  ),
});

export const vertexCountOf = (element: HallElement): number => verticesOf(element).length;

export const verticesOf = (element: HallElement): Point[] => {
  switch (element.kind) {
    case 'wall':
    case 'line':
      return [...element.points];
    case 'door':
      return [element.from, element.to];
    case 'area':
      return element.shape === 'polygon' ? [...element.points] : [];
    default:
      return [];
  }
};

export const moveVertex = (
  document: HallDocument,
  id: string,
  vertexIndex: number,
  to: Point,
): HallDocument => {
  const element = findElement(document, id);
  if (element === null || vertexIndex < 0 || vertexIndex >= vertexCountOf(element)) {
    return document;
  }
  switch (element.kind) {
    case 'wall':
    case 'line':
      return replaceElement(document, {
        ...element,
        points: element.points.map((point, index) => (index === vertexIndex ? to : point)),
      });
    case 'door':
      return replaceElement(
        document,
        vertexIndex === 0 ? { ...element, from: to } : { ...element, to },
      );
    case 'area':
      return element.shape === 'polygon'
        ? replaceElement(document, {
            ...element,
            points: element.points.map((point, index) => (index === vertexIndex ? to : point)),
          })
        : document;
    default:
      return document;
  }
};

const rotatedElement = (element: HallElement, pivot: Point, degrees: number): HallElement => {
  const turn = (point: Point): Point => rotateAround(point, pivot, degrees);
  switch (element.kind) {
    case 'wall':
    case 'line':
      return { ...element, points: element.points.map(turn) };
    case 'door':
      return { ...element, from: turn(element.from), to: turn(element.to) };
    case 'pillar': {
      const center = turn({ x: element.x, y: element.y });

      return { ...element, x: center.x, y: center.y };
    }
    case 'area':
      return rotatedArea(element, pivot, degrees);
    default: {
      const center = turn({ x: element.x, y: element.y });

      return {
        ...element,
        x: center.x,
        y: center.y,
        rotation: normalizeDegrees(element.rotation + degrees),
      };
    }
  }
};

export const elementBounds = (element: HallElement): Bounds => {
  switch (element.kind) {
    case 'wall': {
      const half = element.thicknessCm / 2;
      const raw = boundsOfPoints(element.points) ?? { minX: 0, minY: 0, maxX: 0, maxY: 0 };

      return {
        minX: raw.minX - half,
        minY: raw.minY - half,
        maxX: raw.maxX + half,
        maxY: raw.maxY + half,
      };
    }
    case 'line':
      return boundsOfPoints(element.points) ?? { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    case 'door':
      return boundsFromCorners(element.from, element.to);
    case 'area':
      return boundsOfPoints(areaOutlineOf(element)) ?? { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    case 'pillar':
      return {
        minX: element.x - element.widthCm / 2,
        minY: element.y - element.heightCm / 2,
        maxX: element.x + element.widthCm / 2,
        maxY: element.y + element.heightCm / 2,
      };
    default: {
      const height = TEXT_HEIGHT_CM[element.size];
      const width = Math.max(1, element.text.length) * height * TEXT_WIDTH_PER_CHAR;

      return (
        boundsOfPoints(
          cornersOf({
            center: { x: element.x, y: element.y },
            width,
            height,
            rotation: element.rotation,
          }),
        ) ?? { minX: element.x, minY: element.y, maxX: element.x, maxY: element.y }
      );
    }
  }
};

export const hallBounds = (document: HallDocument): Bounds | null =>
  unionBounds(document.elements.map(elementBounds));

export const selectionBounds = (document: HallDocument, ids: readonly string[]): Bounds | null =>
  unionBounds(document.elements.filter((element) => ids.includes(element.id)).map(elementBounds));

export const rotateElements = (
  document: HallDocument,
  ids: readonly string[],
  degrees: number,
): HallDocument => {
  const bounds = selectionBounds(document, ids);
  if (bounds === null) {
    return document;
  }
  const pivot = boundsCenter(bounds);

  return {
    elements: document.elements.map((element) =>
      ids.includes(element.id) ? rotatedElement(element, pivot, degrees) : element,
    ),
  };
};

export interface Duplication<T> {
  document: T;
  ids: string[];
}

export const duplicateElements = (
  document: HallDocument,
  ids: readonly string[],
  offset: Point = DUPLICATE_OFFSET,
): Duplication<HallDocument> => {
  const sources = document.elements.filter((element) => ids.includes(element.id));
  const freshIds = nextIds(HALL_ELEMENT_ID_PREFIX, hallElementIds(document), sources.length);
  const copies = sources.map((element, index) => ({
    ...movedElement(element, offset),
    id: freshIds[index] ?? element.id,
  }));

  return {
    document: { elements: [...document.elements, ...copies] },
    ids: copies.map((copy) => copy.id),
  };
};

const closedOutline = (points: readonly Point[]): Point[] => [...points, ...points.slice(0, 1)];

const isHitByPolyline = (points: readonly Point[], at: Point, tolerance: number): boolean => {
  const nearest = nearestOnPolyline(at, points);

  return nearest !== null && nearest.distance <= tolerance;
};

export const isElementHit = (element: HallElement, at: Point, tolerance: number): boolean => {
  switch (element.kind) {
    case 'wall':
      return isHitByPolyline(element.points, at, tolerance + element.thicknessCm / 2);
    case 'line':
      return isHitByPolyline(element.points, at, tolerance);
    case 'door':
      return isHitByPolyline([element.from, element.to], at, tolerance);
    case 'pillar':
      return element.round
        ? distanceBetween(at, { x: element.x, y: element.y }) <=
            Math.max(element.widthCm, element.heightCm) / 2 + tolerance
        : isPointInRect(at, {
            center: { x: element.x, y: element.y },
            width: element.widthCm + 2 * tolerance,
            height: element.heightCm + 2 * tolerance,
            rotation: 0,
          });
    case 'area':
      return element.shape === 'polygon'
        ? isPointInPolygon(at, element.points) ||
            isHitByPolyline(closedOutline(element.points), at, tolerance)
        : isPointInRect(at, {
            center: { x: element.x, y: element.y },
            width: element.widthCm + 2 * tolerance,
            height: element.heightCm + 2 * tolerance,
            rotation: element.rotation,
          });
    default: {
      const bounds = elementBounds(element);

      return (
        at.x >= bounds.minX - tolerance &&
        at.x <= bounds.maxX + tolerance &&
        at.y >= bounds.minY - tolerance &&
        at.y <= bounds.maxY + tolerance
      );
    }
  }
};

const HIT_PRIORITY: Record<HallElement['kind'], number> = {
  text: 0,
  door: 1,
  pillar: 2,
  line: 3,
  wall: 4,
  area: 5,
};

export const hitTestHall = (
  document: HallDocument,
  at: Point,
  tolerance: number,
): string | null => {
  const hits = document.elements
    .map((element, order) => ({ element, order }))
    .filter(({ element }) => isElementHit(element, at, tolerance));
  hits.sort((a, b) =>
    HIT_PRIORITY[a.element.kind] !== HIT_PRIORITY[b.element.kind]
      ? HIT_PRIORITY[a.element.kind] - HIT_PRIORITY[b.element.kind]
      : b.order - a.order,
  );

  return hits[0]?.element.id ?? null;
};

export interface VertexHit {
  elementId: string;
  vertexIndex: number;
}

export const hitTestVertex = (
  document: HallDocument,
  ids: readonly string[],
  at: Point,
  tolerance: number,
): VertexHit | null => {
  for (const element of document.elements) {
    if (!ids.includes(element.id)) {
      continue;
    }
    const index = verticesOf(element).findIndex(
      (vertex) => distanceBetween(vertex, at) <= tolerance,
    );
    if (index >= 0) {
      return { elementId: element.id, vertexIndex: index };
    }
  }

  return null;
};

export const elementsInBounds = (document: HallDocument, bounds: Bounds): string[] =>
  document.elements
    .filter((element) => isBoundsInside(elementBounds(element), bounds))
    .map((element) => element.id);

export const snapCornersOf = (document: HallDocument): Point[] =>
  document.elements.flatMap((element) => {
    switch (element.kind) {
      case 'wall':
      case 'line':
        return element.points;
      case 'door':
        return [element.from, element.to, midpointOf(element.from, element.to)];
      case 'area':
        return areaOutlineOf(element);
      case 'pillar':
        return [{ x: element.x, y: element.y }];
      default:
        return [];
    }
  });

const closedAreaOutline = (element: AreaElement): Point[] => closedOutline(areaOutlineOf(element));

const snapOutlineOf = (element: HallElement): readonly Point[] => {
  switch (element.kind) {
    case 'wall':
    case 'line':
      return element.points;
    case 'area':
      return closedAreaOutline(element);
    default:
      return [];
  }
};

export const snapSegmentsOf = (document: HallDocument): { from: Point; to: Point }[] =>
  document.elements.flatMap((element) => {
    const points = snapOutlineOf(element);

    return points.slice(1).flatMap((to, index) => {
      const from = points[index];

      return from === undefined ? [] : [{ from, to }];
    });
  });

export const doorWidthOf = (door: DoorElement): number => distanceBetween(door.from, door.to);

export type AreaMergeResult =
  | { kind: 'merged'; document: HallDocument; id: string }
  | { kind: 'refused'; reason: AreaMergeRefusal };

const selectedAreas = (document: HallDocument, ids: readonly string[]): AreaElement[] =>
  ids.flatMap((id) => {
    const element = findElement(document, id);

    return element?.kind === 'area' ? [element] : [];
  });

export const mergeAreas = (document: HallDocument, ids: readonly string[]): AreaMergeResult => {
  const areas = selectedAreas(document, ids);
  const [first] = areas;
  if (first === undefined || areas.length < 2) {
    return { kind: 'refused', reason: 'tooFew' };
  }
  const merge = mergeOutlines(areas.map(areaOutlineOf));
  if (merge.kind === 'refused') {
    return merge;
  }
  const absorbed = areas.slice(1).map((area) => area.id);
  const merged = polygonAreaFrom(first, merge.outline);

  return {
    kind: 'merged',
    document: removeElements(replaceElement(document, merged), absorbed),
    id: merged.id,
  };
};
