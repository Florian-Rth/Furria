import { snapCornersOf, snapSegmentsOf } from '@/features/hall-plan/hall-ops';
import type { Bounds } from '@/features/hall-plan/plan-geometry';
import { distanceBetween } from '@/features/hall-plan/plan-geometry';
import type { AlignedMove, SnapSegment } from '@/features/hall-plan/plan-snap';
import {
  ALIGN_THRESHOLD_PX,
  alignMove,
  ROTATION_STEP_DEGREES,
  snapDirection,
  snapToGrid,
  snapValue,
  thresholdInCm,
} from '@/features/hall-plan/plan-snap';
import type {
  HallDocument,
  Point,
  SeatingStandard,
  TableRow,
  TableType,
} from '@/features/hall-plan/schemas';
import type { RowLayout } from '@/features/hall-plan/table-layout';
import { createRow, rowFromDrag } from '@/features/hall-plan/table-plan-ops';

export const DRAG_START_PX = 4;

export interface SnapTargets {
  corners: Point[];
  segments: SnapSegment[];
}

export const moveDeltaOf = (
  moving: Bounds | null,
  others: readonly Bounds[],
  raw: Point,
  scale: number,
  free: boolean,
): AlignedMove => {
  if (free || moving === null) {
    return { delta: raw, guides: [] };
  }
  const aligned = alignMove(moving, raw, others, thresholdInCm(ALIGN_THRESHOLD_PX, scale));
  const guidedX = aligned.guides.some((guide) => guide.axis === 'x');
  const guidedY = aligned.guides.some((guide) => guide.axis === 'y');

  return {
    delta: {
      x: guidedX ? aligned.delta.x : snapValue(aligned.delta.x),
      y: guidedY ? aligned.delta.y : snapValue(aligned.delta.y),
    },
    guides: aligned.guides,
  };
};

export const isDragStarted = (from: Point, to: Point, scale: number): boolean =>
  distanceBetween(from, to) * scale >= DRAG_START_PX;

const edgesOf = (points: readonly Point[]): SnapSegment[] =>
  points.map((from, index) => ({ from, to: points[(index + 1) % points.length] ?? from }));

export const snapTargetsOf = (hall: HallDocument, layouts: readonly RowLayout[]): SnapTargets => {
  const bodies = layouts.flatMap((layout) =>
    layout.body.flatMap((shape) => (shape.kind === 'polygon' ? [shape.points] : [])),
  );

  return {
    corners: [...snapCornersOf(hall), ...bodies.flat()],
    segments: [...snapSegmentsOf(hall), ...bodies.flatMap(edgesOf)],
  };
};

export const placementPointOf = (point: Point, free: boolean): Point =>
  free ? point : snapToGrid(point);

export const drawnRowOf = (
  id: string,
  type: TableType,
  standard: SeatingStandard,
  from: Point,
  to: Point,
  free: boolean,
): TableRow => {
  const end = free ? to : snapDirection(from, to, ROTATION_STEP_DEGREES);
  if (distanceBetween(from, end) < type.lengthCm / 2) {
    return createRow(id, type.tableTypeId, from);
  }

  return rowFromDrag(id, type, standard, from, end);
};
