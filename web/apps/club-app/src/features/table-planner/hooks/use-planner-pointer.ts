import { PLAN_ROTATE_HANDLE } from '@furria/ui/floor-plan-view';
import type { KkPlanPointerEvent } from '@furria/ui/KkFloorPlan';
import { useRef, useState } from 'react';
import { flushMove, flushReachOf } from '@/features/hall-plan/plan-flush';
import type { Bounds, Shape } from '@/features/hall-plan/plan-geometry';
import { angleOf, boundsFromCorners, subtract } from '@/features/hall-plan/plan-geometry';
import type { Guide } from '@/features/hall-plan/plan-snap';
import { snapAngle, snapToTargets, thresholdInCm } from '@/features/hall-plan/plan-snap';
import type {
  HallDocument,
  Point,
  SeatingStandard,
  TablePlanDocument,
  TableRow,
  TableType,
} from '@/features/hall-plan/schemas';
import type { SeatOffer } from '@/features/hall-plan/seat-request';
import { withSeatOffer } from '@/features/hall-plan/seat-request';
import type { RowLayout } from '@/features/hall-plan/table-layout';
import { layoutRow } from '@/features/hall-plan/table-layout';
import {
  addRow,
  createRow,
  expandToGroups,
  hitTestRows,
  layoutsBounds,
  moveRows,
  newRowId,
  rotateRows,
  rowsInBounds,
  rowsPivot,
} from '@/features/hall-plan/table-plan-ops';
import {
  drawnRowOf,
  isDragStarted,
  moveDeltaOf,
  placementPointOf,
  snapTargetsOf,
} from '../planner-gesture';
import { parseChairId } from '../planner-scene';
import type { PlannerSelection } from '../planner-selection';
import { NO_SELECTION, pressRow, rowsSelection, selectedRowIdsOf } from '../planner-selection';
import type { PlannerTool } from '../planner-tools';
import type { PlanEditor } from './use-plan-editor';

const SNAP_REACH_PX = 10;
const MOUSE = 'mouse';
const PRIMARY_BUTTON = 0;

type Gesture =
  | { kind: 'idle' }
  | {
      kind: 'move';
      start: Point;
      origin: TablePlanDocument;
      originBounds: Bounds | null;
      ids: readonly string[];
      bodies: readonly Shape[];
      others: readonly Shape[];
      moved: boolean;
      drill: string | null;
      key: string;
    }
  | {
      kind: 'rotate';
      pivot: Point;
      startAngle: number;
      origin: TablePlanDocument;
      ids: readonly string[];
      key: string;
    }
  | { kind: 'marquee'; additive: boolean; base: readonly string[] }
  | { kind: 'pan'; lastX: number; lastY: number; moved: boolean }
  | { kind: 'draw'; from: Point }
  | { kind: 'measure' }
  | { kind: 'tap' };

export interface PlannerOverlay {
  hover: Point | null;
  marquee: { from: Point; to: Point } | null;
  measure: { from: Point; to: Point } | null;
  draw: { from: Point; to: Point } | null;
  guides: Guide[];
}

export interface PlannerPointer {
  overlay: PlannerOverlay;
  ghost: readonly TableRow[];
  down: (event: KkPlanPointerEvent) => void;
  move: (event: KkPlanPointerEvent) => void;
  up: (event: KkPlanPointerEvent) => void;
  cancel: () => void;
  doubleClick: (event: KkPlanPointerEvent) => void;
  clearMeasure: () => void;
}

interface PointerInput {
  editor: PlanEditor;
  hall: HallDocument;
  layouts: readonly RowLayout[];
  standard: SeatingStandard;
  paletteType: TableType | null;
  types: ReadonlyMap<number, TableType>;
  seatOfferAt: (center: Point) => SeatOffer | null;
  tool: PlannerTool;
  scale: number;
  selection: PlannerSelection;
  select: (selection: PlannerSelection) => void;
  panBy: (deltaXPx: number, deltaYPx: number) => void;
  onTap: () => void;
}

const EMPTY_OVERLAY: PlannerOverlay = {
  hover: null,
  marquee: null,
  measure: null,
  draw: null,
  guides: [],
};

const GHOST_ID = 'ghost';

export const usePlannerPointer = ({
  editor,
  hall,
  layouts,
  standard,
  paletteType,
  types,
  seatOfferAt,
  tool,
  scale,
  selection,
  select,
  panBy,
  onTap,
}: PointerInput): PlannerPointer => {
  const gesture = useRef<Gesture>({ kind: 'idle' });
  const gestureCount = useRef(0);
  const nextGestureKey = (kind: string): string => {
    gestureCount.current += 1;

    return `${kind}:${gestureCount.current}`;
  };
  const [overlay, setOverlay] = useState<PlannerOverlay>(EMPTY_OVERLAY);
  const document = editor.document;
  const reach = thresholdInCm(SNAP_REACH_PX, scale);
  const flushReach = flushReachOf(scale);
  const bodiesOfRows = (ids: readonly string[]): Shape[] =>
    layouts.filter((layout) => ids.includes(layout.rowId)).flatMap((layout) => layout.body);
  const bodiesBesides = (ids: readonly string[]): Shape[] =>
    layouts.filter((layout) => !ids.includes(layout.rowId)).flatMap((layout) => layout.body);
  const settledRows = (rows: readonly TableRow[], free: boolean): TableRow[] => {
    const bodies = rows.flatMap((row) => {
      const type = types.get(row.tableTypeId);

      return type === undefined ? [] : layoutRow(row, type, standard, document.seating).body;
    });
    const delta = flushMove(bodies, { x: 0, y: 0 }, bodiesBesides([]), flushReach, !free);

    return rows.map((row) => ({ ...row, x: row.x + delta.x, y: row.y + delta.y }));
  };

  const measurePoint = (point: Point, free: boolean): Point => {
    if (free) {
      return point;
    }
    const targets = snapTargetsOf(hall, layouts);

    return snapToTargets(point, targets.corners, targets.segments, reach).point;
  };

  const rowAt = (event: KkPlanPointerEvent): string | null => {
    const byTarget =
      event.targetId !== null && document.rows.some((row) => row.id === event.targetId)
        ? event.targetId
        : null;

    return byTarget ?? hitTestRows(layouts, event);
  };

  const startMove = (event: KkPlanPointerEvent, rowId: string): void => {
    const press = pressRow(document, selection, rowId, event.shiftKey);
    select(press.selection);
    const ids = selectedRowIdsOf(press.selection);
    gesture.current = ids.includes(rowId)
      ? {
          kind: 'move',
          start: { x: event.x, y: event.y },
          origin: document,
          originBounds: layoutsBounds(layouts, ids),
          ids,
          bodies: bodiesOfRows(ids),
          others: bodiesBesides(ids),
          moved: false,
          drill: press.drillOnRelease,
          key: nextGestureKey('move'),
        }
      : { kind: 'idle' };
  };

  const startRotate = (event: KkPlanPointerEvent): void => {
    const ids = selectedRowIdsOf(selection);
    const pivot = rowsPivot(document, ids);
    if (pivot === null) {
      return;
    }
    gesture.current = {
      kind: 'rotate',
      pivot,
      startAngle: angleOf(pivot, event),
      origin: document,
      ids,
      key: nextGestureKey('rotate'),
    };
  };

  const pressSelect = (event: KkPlanPointerEvent): void => {
    if (event.handleId === PLAN_ROTATE_HANDLE) {
      startRotate(event);

      return;
    }
    const chair = event.targetId === null ? null : parseChairId(event.targetId);
    if (chair !== null) {
      select({ kind: 'chair', chair });
      gesture.current = { kind: 'tap' };

      return;
    }
    const rowId = rowAt(event);
    if (rowId !== null) {
      startMove(event, rowId);

      return;
    }
    if (event.pointerType === MOUSE) {
      gesture.current = {
        kind: 'marquee',
        additive: event.shiftKey,
        base: event.shiftKey ? selectedRowIdsOf(selection) : [],
      };
      setOverlay((current) => ({
        ...current,
        marquee: { from: { x: event.x, y: event.y }, to: { x: event.x, y: event.y } },
      }));

      return;
    }
    gesture.current = { kind: 'pan', lastX: event.screenX, lastY: event.screenY, moved: false };
  };

  const placeTable = (event: KkPlanPointerEvent): void => {
    if (paletteType === null) {
      return;
    }
    const [row] = settledRows(
      [
        createRow(
          newRowId(document),
          paletteType.tableTypeId,
          placementPointOf(event, event.altKey),
        ),
      ],
      event.altKey,
    );
    if (row !== undefined) {
      editor.apply(addRow(document, row));
      select(rowsSelection([row.id]));
    }
  };

  const placeSeats = (event: KkPlanPointerEvent): void => {
    const offer = seatOfferAt(placementPointOf(event, event.altKey));
    if (offer === null) {
      return;
    }
    const rows = settledRows(offer.rows, event.altKey);
    editor.apply(withSeatOffer(document, { ...offer, rows }));
    select(rowsSelection(rows.map((row) => row.id)));
  };

  const down = (event: KkPlanPointerEvent): void => {
    if (event.pointerType === MOUSE && event.button !== PRIMARY_BUTTON) {
      return;
    }
    switch (tool) {
      case 'select':
        pressSelect(event);
        return;
      case 'table':
        placeTable(event);
        return;
      case 'seats':
        placeSeats(event);
        return;
      case 'row': {
        const from = placementPointOf(event, event.altKey);
        gesture.current = { kind: 'draw', from };
        setOverlay((current) => ({ ...current, draw: { from, to: from } }));
        return;
      }
      case 'measure': {
        const from = measurePoint(event, event.altKey);
        gesture.current = { kind: 'measure' };
        setOverlay((current) => ({ ...current, measure: { from, to: from } }));
        return;
      }
    }
  };

  const moveRowsBy = (
    current: Extract<Gesture, { kind: 'move' }>,
    event: KkPlanPointerEvent,
  ): void => {
    const point = { x: event.x, y: event.y };
    if (!current.moved && !isDragStarted(current.start, point, scale)) {
      return;
    }
    current.moved = true;
    const others = layouts
      .filter((layout) => !current.ids.includes(layout.rowId))
      .map((layout) => layout.bounds);
    const offset = moveDeltaOf(
      current.originBounds,
      others,
      subtract(point, current.start),
      scale,
      event.altKey,
    );
    const delta = flushMove(
      current.bodies,
      offset.delta,
      current.others,
      flushReach,
      !event.altKey,
    );
    editor.apply(moveRows(current.origin, current.ids, delta), current.key);
    setOverlay((now) => ({ ...now, guides: offset.guides }));
  };

  const move = (event: KkPlanPointerEvent): void => {
    const current = gesture.current;
    switch (current.kind) {
      case 'idle':
      case 'tap':
        if (tool === 'table' || tool === 'seats') {
          setOverlay((now) => ({ ...now, hover: placementPointOf(event, event.altKey) }));
        }
        return;
      case 'move':
        moveRowsBy(current, event);
        return;
      case 'rotate': {
        const raw = angleOf(current.pivot, event) - current.startAngle;
        const degrees = event.altKey ? raw : snapAngle(raw);
        editor.apply(rotateRows(current.origin, current.ids, degrees), current.key);
        return;
      }
      case 'marquee':
        setOverlay((now) =>
          now.marquee === null
            ? now
            : { ...now, marquee: { from: now.marquee.from, to: { x: event.x, y: event.y } } },
        );
        return;
      case 'pan':
        panBy(event.screenX - current.lastX, event.screenY - current.lastY);
        current.lastX = event.screenX;
        current.lastY = event.screenY;
        current.moved = true;
        return;
      case 'draw':
        setOverlay((now) => ({
          ...now,
          draw: { from: current.from, to: { x: event.x, y: event.y } },
        }));
        return;
      case 'measure': {
        const to = measurePoint(event, event.altKey);
        setOverlay((now) =>
          now.measure === null ? now : { ...now, measure: { ...now.measure, to } },
        );
        return;
      }
    }
  };

  const finishMarquee = (current: Extract<Gesture, { kind: 'marquee' }>): void => {
    const box = overlay.marquee;
    setOverlay((now) => ({ ...now, marquee: null }));
    if (box === null || !isDragStarted(box.from, box.to, scale)) {
      if (!current.additive) {
        select(NO_SELECTION);
      }
      return;
    }
    const inside = expandToGroups(
      document,
      rowsInBounds(layouts, boundsFromCorners(box.from, box.to)),
    );
    select(rowsSelection([...current.base, ...inside.filter((id) => !current.base.includes(id))]));
  };

  const finishDraw = (
    current: Extract<Gesture, { kind: 'draw' }>,
    event: KkPlanPointerEvent,
  ): void => {
    setOverlay((now) => ({ ...now, draw: null }));
    if (paletteType === null) {
      return;
    }
    const [row] = settledRows(
      [
        drawnRowOf(
          newRowId(document),
          paletteType,
          standard,
          current.from,
          { x: event.x, y: event.y },
          event.altKey,
        ),
      ],
      event.altKey,
    );
    if (row !== undefined) {
      editor.apply(addRow(document, row));
      select(rowsSelection([row.id]));
    }
  };

  const up = (event: KkPlanPointerEvent): void => {
    const current = gesture.current;
    gesture.current = { kind: 'idle' };
    switch (current.kind) {
      case 'move':
        editor.settle();
        setOverlay((now) => ({ ...now, guides: [] }));
        if (!current.moved) {
          if (current.drill !== null) {
            select(rowsSelection([current.drill]));
          }
          onTap();
        }
        return;
      case 'rotate':
        editor.settle();
        return;
      case 'marquee':
        finishMarquee(current);
        return;
      case 'pan':
        if (!current.moved) {
          select(NO_SELECTION);
        }
        return;
      case 'draw':
        finishDraw(current, event);
        return;
      case 'tap':
        onTap();
        return;
      case 'measure':
      case 'idle':
        return;
    }
  };

  const cancel = (): void => {
    const current = gesture.current;
    gesture.current = { kind: 'idle' };
    if (current.kind === 'move' || current.kind === 'rotate') {
      editor.apply(current.origin, current.key);
      editor.settle();
    }
    setOverlay((now) => ({ ...now, marquee: null, draw: null, guides: [] }));
  };

  const doubleClick = (event: KkPlanPointerEvent): void => {
    if (tool !== 'select') {
      return;
    }
    const rowId = rowAt(event);
    if (rowId !== null) {
      select(rowsSelection([rowId]));
    }
  };

  const ghostOf = (): readonly TableRow[] => {
    if (tool === 'row') {
      return overlay.draw === null || paletteType === null
        ? []
        : [drawnRowOf(GHOST_ID, paletteType, standard, overlay.draw.from, overlay.draw.to, false)];
    }
    if (overlay.hover === null) {
      return [];
    }
    if (tool === 'seats') {
      return seatOfferAt(overlay.hover)?.rows ?? [];
    }

    return tool === 'table' && paletteType !== null
      ? [createRow(GHOST_ID, paletteType.tableTypeId, overlay.hover)]
      : [];
  };

  return {
    overlay,
    ghost: ghostOf(),
    down,
    move,
    up,
    cancel,
    doubleClick,
    clearMeasure: () => {
      setOverlay((now) => ({ ...now, measure: null }));
    },
  };
};
