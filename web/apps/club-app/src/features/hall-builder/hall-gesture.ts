import type { KkPlanResizeHandle } from '@furria/ui/floor-plan-view';
import { PLAN_ROTATE_HANDLE } from '@furria/ui/floor-plan-view';
import {
  createArea,
  createDoor,
  createLine,
  createPillar,
  createText,
  createWall,
  elementBounds,
  elementsInBounds,
  findElement,
  hitTestHall,
  MIN_AREA_SIZE_CM,
  moveElements,
  moveVertex,
  newHallElementId,
  removeElements,
  replaceElement,
  rotateElements,
  selectionBounds,
  snapCornersOf,
  snapSegmentsOf,
} from '@/features/hall-plan/hall-ops';
import type { Bounds } from '@/features/hall-plan/plan-geometry';
import {
  add,
  angleOf,
  boundsCenter,
  boundsFromCorners,
  distanceBetween,
  normalizeDegrees,
  rotateVector,
  subtract,
} from '@/features/hall-plan/plan-geometry';
import type { Guide } from '@/features/hall-plan/plan-snap';
import {
  ALIGN_THRESHOLD_PX,
  alignMove,
  GRID_STEP_CM,
  snapAngle,
  snapToTargets,
  snapValue,
  thresholdInCm,
  WALL_ANGLE_STEP_DEGREES,
} from '@/features/hall-plan/plan-snap';
import type { AreaKind, HallDocument, HallElement, Point } from '@/features/hall-plan/schemas';
import type { HallTool } from './hall-builder-tools';
import { isResizeHandle, resizeRect } from './hall-resize';

const HIT_TOLERANCE_PX = 8;
const MIN_DRAG_CM = 20;
const VERTEX_HANDLE_PREFIX = 'vertex:';
const TEXT_PLACEHOLDER = 'Text';

export type PolylineTool = 'wall' | 'line';

export type HallDraft =
  | { kind: 'idle' }
  | { kind: 'polyline'; tool: PolylineTool; points: Point[]; cursor: Point }
  | { kind: 'drag'; tool: 'door' | 'area'; from: Point; to: Point }
  | { kind: 'measure'; from: Point; to: Point; settled: boolean; dragging: boolean }
  | { kind: 'move'; ids: string[]; origin: Point; delta: Point; guides: Guide[]; moved: boolean }
  | { kind: 'vertex'; elementId: string; vertexIndex: number; at: Point }
  | { kind: 'resize'; elementId: string; handle: KkPlanResizeHandle; at: Point }
  | { kind: 'rotate'; ids: string[]; pivot: Point; start: Point; degrees: number }
  | { kind: 'marquee'; from: Point; to: Point; additive: boolean }
  | { kind: 'pan'; last: Point };

export const IDLE_DRAFT: HallDraft = { kind: 'idle' };

export interface GestureContext {
  document: HallDocument;
  selection: readonly string[];
  tool: HallTool;
  scale: number;
  areaKind: AreaKind;
}

export interface GesturePointer {
  at: Point;
  screen: Point;
  handleId: string | null;
  shiftKey: boolean;
  altKey: boolean;
  pointerType: string;
}

export interface GestureResult {
  draft: HallDraft;
  document?: HallDocument;
  selection?: string[];
  tool?: HallTool;
  pan?: Point;
}

export const vertexHandleId = (index: number): string => `${VERTEX_HANDLE_PREFIX}${index}`;

export const vertexIndexOf = (handleId: string | null): number | null => {
  if (handleId === null || !handleId.startsWith(VERTEX_HANDLE_PREFIX)) {
    return null;
  }
  const index = Number(handleId.slice(VERTEX_HANDLE_PREFIX.length));

  return Number.isInteger(index) && index >= 0 ? index : null;
};

const toleranceOf = (scale: number): number => thresholdInCm(HIT_TOLERANCE_PX, scale);

const snapThresholdOf = (scale: number): number => thresholdInCm(ALIGN_THRESHOLD_PX, scale);

export const snapPoint = (
  document: HallDocument,
  raw: Point,
  scale: number,
  free: boolean,
): Point =>
  free
    ? raw
    : snapToTargets(raw, snapCornersOf(document), snapSegmentsOf(document), snapThresholdOf(scale))
        .point;

const directionSnapped = (from: Point, raw: Point): Point => {
  const angle = snapAngle(angleOf(from, raw), WALL_ANGLE_STEP_DEGREES);
  const length = snapValue(distanceBetween(from, raw), GRID_STEP_CM);

  return add(from, rotateVector({ x: length, y: 0 }, angle));
};

export const polylinePoint = (
  document: HallDocument,
  previous: Point | null,
  pointer: GesturePointer,
  scale: number,
): Point => {
  if (pointer.altKey) {
    return pointer.at;
  }
  const snapped = snapToTargets(
    pointer.at,
    snapCornersOf(document),
    snapSegmentsOf(document),
    snapThresholdOf(scale),
  );
  if (snapped.target === 'corner' || previous === null || pointer.shiftKey) {
    return snapped.point;
  }

  return directionSnapped(previous, pointer.at);
};

const withoutRepeats = (points: readonly Point[]): Point[] =>
  points.filter((point, index) => {
    const previous = points[index - 1];

    return previous === undefined || distanceBetween(previous, point) > 0.5;
  });

const createdPolyline = (
  document: HallDocument,
  tool: PolylineTool,
  points: readonly Point[],
): GestureResult => {
  const clean = withoutRepeats(points);
  if (clean.length < 2) {
    return { draft: IDLE_DRAFT };
  }
  const id = newHallElementId(document);
  const element = tool === 'wall' ? createWall(id, clean) : createLine(id, clean);

  return {
    draft: IDLE_DRAFT,
    document: { elements: [...document.elements, element] },
    selection: [id],
  };
};

export const finishPolyline = (document: HallDocument, draft: HallDraft): GestureResult =>
  draft.kind === 'polyline' ? createdPolyline(document, draft.tool, draft.points) : { draft };

const created = (document: HallDocument, element: HallElement, tool?: HallTool): GestureResult => ({
  draft: IDLE_DRAFT,
  document: { elements: [...document.elements, element] },
  selection: [element.id],
  ...(tool === undefined ? {} : { tool }),
});

const isPolylineTool = (tool: HallTool): tool is PolylineTool => tool === 'wall' || tool === 'line';

const polylineDown = (
  context: GestureContext,
  draft: HallDraft,
  tool: PolylineTool,
  pointer: GesturePointer,
): GestureResult => {
  if (draft.kind !== 'polyline' || draft.tool !== tool) {
    const start = polylinePoint(context.document, null, pointer, context.scale);

    return { draft: { kind: 'polyline', tool, points: [start], cursor: start } };
  }
  const previous = draft.points.at(-1) ?? null;
  const point = polylinePoint(context.document, previous, pointer, context.scale);
  const first = draft.points[0];
  const closes =
    tool === 'wall' &&
    first !== undefined &&
    draft.points.length >= 3 &&
    distanceBetween(first, pointer.at) <= toleranceOf(context.scale);
  if (closes) {
    return createdPolyline(context.document, tool, [...draft.points, first]);
  }

  return { draft: { ...draft, points: [...draft.points, point], cursor: point } };
};

const selectionPivot = (document: HallDocument, ids: readonly string[]): Point | null => {
  const bounds = selectionBounds(document, ids);

  return bounds === null ? null : boundsCenter(bounds);
};

const selectDown = (context: GestureContext, pointer: GesturePointer): GestureResult => {
  const { document, selection } = context;
  if (pointer.handleId === PLAN_ROTATE_HANDLE) {
    const pivot = selectionPivot(document, selection);
    if (pivot !== null) {
      return {
        draft: { kind: 'rotate', ids: [...selection], pivot, start: pointer.at, degrees: 0 },
      };
    }
  }
  const [only] = selection;
  if (isResizeHandle(pointer.handleId) && only !== undefined && selection.length === 1) {
    return {
      draft: { kind: 'resize', elementId: only, handle: pointer.handleId, at: pointer.at },
    };
  }
  const vertexIndex = vertexIndexOf(pointer.handleId);
  if (vertexIndex !== null && only !== undefined && selection.length === 1) {
    return { draft: { kind: 'vertex', elementId: only, vertexIndex, at: pointer.at } };
  }
  const hit = hitTestHall(document, pointer.at, toleranceOf(context.scale));
  if (hit !== null && pointer.shiftKey) {
    const toggled = selection.includes(hit)
      ? selection.filter((id) => id !== hit)
      : [...selection, hit];

    return { draft: IDLE_DRAFT, selection: toggled };
  }
  if (hit !== null) {
    const ids = selection.includes(hit) ? [...selection] : [hit];

    return {
      draft: {
        kind: 'move',
        ids,
        origin: pointer.at,
        delta: { x: 0, y: 0 },
        guides: [],
        moved: false,
      },
      selection: ids,
    };
  }
  if (pointer.pointerType === 'touch') {
    return { draft: { kind: 'pan', last: pointer.screen } };
  }

  return {
    draft: { kind: 'marquee', from: pointer.at, to: pointer.at, additive: pointer.shiftKey },
  };
};

const measureDown = (
  context: GestureContext,
  draft: HallDraft,
  pointer: GesturePointer,
): GestureResult => {
  const point = snapPoint(context.document, pointer.at, context.scale, pointer.altKey);
  if (draft.kind === 'measure' && !draft.settled && !draft.dragging) {
    return { draft: { ...draft, to: point, settled: true } };
  }

  return { draft: { kind: 'measure', from: point, to: point, settled: false, dragging: true } };
};

export const pointerDown = (
  context: GestureContext,
  draft: HallDraft,
  pointer: GesturePointer,
): GestureResult => {
  const { tool, document, scale } = context;
  if (isPolylineTool(tool)) {
    return polylineDown(context, draft, tool, pointer);
  }
  switch (tool) {
    case 'select':
      return selectDown(context, pointer);
    case 'measure':
      return measureDown(context, draft, pointer);
    case 'door':
    case 'area': {
      const from = snapPoint(document, pointer.at, scale, pointer.altKey);

      return { draft: { kind: 'drag', tool, from, to: from } };
    }
    case 'pillar':
      return created(
        document,
        createPillar(
          newHallElementId(document),
          snapPoint(document, pointer.at, scale, pointer.altKey),
        ),
      );
    case 'text':
      return created(
        document,
        createText(
          newHallElementId(document),
          snapPoint(document, pointer.at, scale, pointer.altKey),
          TEXT_PLACEHOLDER,
        ),
        'select',
      );
    default:
      return { draft };
  }
};

const othersBounds = (document: HallDocument, ids: readonly string[]): Bounds[] =>
  document.elements.filter((element) => !ids.includes(element.id)).map(elementBounds);

const movedDraft = (
  context: GestureContext,
  draft: Extract<HallDraft, { kind: 'move' }>,
  pointer: GesturePointer,
): HallDraft => {
  const raw = subtract(pointer.at, draft.origin);
  const moved = draft.moved || Math.hypot(raw.x, raw.y) > toleranceOf(context.scale);
  const own = selectionBounds(context.document, draft.ids);
  if (pointer.altKey || own === null) {
    return { ...draft, delta: raw, guides: [], moved };
  }
  const gridded = { x: snapValue(raw.x), y: snapValue(raw.y) };
  const aligned = alignMove(
    own,
    gridded,
    othersBounds(context.document, draft.ids),
    snapThresholdOf(context.scale),
  );

  return { ...draft, delta: aligned.delta, guides: aligned.guides, moved };
};

const vertexTargets = (document: HallDocument, elementId: string): HallDocument =>
  removeElements(document, [elementId]);

export const pointerMove = (
  context: GestureContext,
  draft: HallDraft,
  pointer: GesturePointer,
): GestureResult => {
  const { document, scale } = context;
  switch (draft.kind) {
    case 'polyline':
      return {
        draft: {
          ...draft,
          cursor: polylinePoint(document, draft.points.at(-1) ?? null, pointer, scale),
        },
      };
    case 'drag':
      return { draft: { ...draft, to: snapPoint(document, pointer.at, scale, pointer.altKey) } };
    case 'measure':
      return draft.settled
        ? { draft }
        : { draft: { ...draft, to: snapPoint(document, pointer.at, scale, pointer.altKey) } };
    case 'move':
      return { draft: movedDraft(context, draft, pointer) };
    case 'vertex':
      return {
        draft: {
          ...draft,
          at: snapPoint(
            vertexTargets(document, draft.elementId),
            pointer.at,
            scale,
            pointer.altKey,
          ),
        },
      };
    case 'resize':
      return {
        draft: {
          ...draft,
          at: pointer.altKey
            ? pointer.at
            : { x: snapValue(pointer.at.x), y: snapValue(pointer.at.y) },
        },
      };
    case 'rotate': {
      const raw = angleOf(draft.pivot, pointer.at) - angleOf(draft.pivot, draft.start);
      const degrees = pointer.shiftKey || pointer.altKey ? normalizeDegrees(raw) : snapAngle(raw);

      return { draft: { ...draft, degrees } };
    }
    case 'marquee':
      return { draft: { ...draft, to: pointer.at } };
    case 'pan':
      return {
        draft: { kind: 'pan', last: pointer.screen },
        pan: subtract(pointer.screen, draft.last),
      };
    default:
      return { draft };
  }
};

const resizedElement = (
  element: HallElement,
  handle: KkPlanResizeHandle,
  at: Point,
): HallElement => {
  if (element.kind !== 'area' && element.kind !== 'pillar') {
    return element;
  }
  const rotation = element.kind === 'area' ? element.rotation : 0;
  const next = resizeRect(
    {
      center: { x: element.x, y: element.y },
      width: element.widthCm,
      height: element.heightCm,
      rotation,
    },
    handle,
    at,
    MIN_AREA_SIZE_CM,
  );

  return {
    ...element,
    x: next.center.x,
    y: next.center.y,
    widthCm: Math.round(next.width),
    heightCm: Math.round(next.height),
  };
};

export const previewDocument = (document: HallDocument, draft: HallDraft): HallDocument => {
  switch (draft.kind) {
    case 'move':
      return draft.moved ? moveElements(document, draft.ids, draft.delta) : document;
    case 'vertex':
      return moveVertex(document, draft.elementId, draft.vertexIndex, draft.at);
    case 'resize': {
      const element = findElement(document, draft.elementId);

      return element === null
        ? document
        : replaceElement(document, resizedElement(element, draft.handle, draft.at));
    }
    case 'rotate':
      return draft.degrees === 0 ? document : rotateElements(document, draft.ids, draft.degrees);
    default:
      return document;
  }
};

const dragEnd = (
  context: GestureContext,
  draft: Extract<HallDraft, { kind: 'drag' }>,
): GestureResult => {
  const { document } = context;
  const id = newHallElementId(document);
  if (draft.tool === 'door') {
    return distanceBetween(draft.from, draft.to) < MIN_DRAG_CM
      ? { draft: IDLE_DRAFT }
      : created(document, createDoor(id, draft.from, draft.to));
  }
  const bounds = boundsFromCorners(draft.from, draft.to);
  const tooSmall =
    bounds.maxX - bounds.minX < MIN_DRAG_CM || bounds.maxY - bounds.minY < MIN_DRAG_CM;

  return tooSmall
    ? { draft: IDLE_DRAFT }
    : created(document, createArea(id, context.areaKind, draft.from, draft.to));
};

const marqueeEnd = (
  context: GestureContext,
  draft: Extract<HallDraft, { kind: 'marquee' }>,
): GestureResult => {
  const tiny = distanceBetween(draft.from, draft.to) < toleranceOf(context.scale);
  const kept = draft.additive ? [...context.selection] : [];
  if (tiny) {
    return { draft: IDLE_DRAFT, selection: kept };
  }
  const caught = elementsInBounds(context.document, boundsFromCorners(draft.from, draft.to));

  return { draft: IDLE_DRAFT, selection: [...new Set([...kept, ...caught])] };
};

const committed = (context: GestureContext, draft: HallDraft): GestureResult => {
  const next = previewDocument(context.document, draft);

  return next === context.document ? { draft: IDLE_DRAFT } : { draft: IDLE_DRAFT, document: next };
};

export const pointerUp = (context: GestureContext, draft: HallDraft): GestureResult => {
  switch (draft.kind) {
    case 'drag':
      return dragEnd(context, draft);
    case 'measure': {
      if (!draft.dragging) {
        return { draft };
      }
      const isClick = distanceBetween(draft.from, draft.to) < toleranceOf(context.scale);

      return { draft: { ...draft, dragging: false, settled: !isClick } };
    }
    case 'move':
    case 'vertex':
    case 'resize':
    case 'rotate':
      return committed(context, draft);
    case 'marquee':
      return marqueeEnd(context, draft);
    case 'pan':
      return { draft: IDLE_DRAFT };
    default:
      return { draft };
  }
};

export const pointerCancel = (draft: HallDraft): HallDraft => {
  switch (draft.kind) {
    case 'polyline':
      return draft;
    case 'measure':
      return draft.settled ? draft : IDLE_DRAFT;
    default:
      return IDLE_DRAFT;
  }
};

export const doubleClick = (context: GestureContext, draft: HallDraft): GestureResult =>
  draft.kind === 'polyline' ? finishPolyline(context.document, draft) : { draft };
