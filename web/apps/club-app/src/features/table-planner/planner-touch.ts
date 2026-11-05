import type { Bounds } from '@/features/hall-plan/plan-geometry';
import { padBounds } from '@/features/hall-plan/plan-geometry';
import type { TouchTarget } from '@/features/hall-plan/plan-touch';
import {
  actionBarWidthOf,
  EMPTY_TOUCH_TARGET,
  touchTargetOf,
} from '@/features/hall-plan/plan-touch';
import type { Point } from '@/features/hall-plan/schemas';
import type { RowLayout } from '@/features/hall-plan/table-layout';
import { findChair } from '@/features/hall-plan/table-layout';
import { hitTestChair, hitTestRowsNear, layoutsBounds } from '@/features/hall-plan/table-plan-ops';
import { chairIdOf, parseChairId } from './planner-scene';
import type { InspectorTarget, PlannerSelection } from './planner-selection';
import { selectedRowIdsOf } from './planner-selection';
import type { PlannerTool, PlannerView } from './planner-tools';

const CHAIR_FRAME_CM = 30;

export type PlannerActionKind = 'row' | 'group' | 'rows' | 'chair';

interface ActionShape {
  buttons: number;
  readouts: number;
}

const ACTION_SHAPES: Record<PlannerActionKind, ActionShape> = {
  row: { buttons: 7, readouts: 1 },
  group: { buttons: 6, readouts: 0 },
  rows: { buttons: 6, readouts: 0 },
  chair: { buttons: 5, readouts: 0 },
};

export interface PlannerTouchProbe {
  handleId: string | null;
  targetId: string | null;
  at: Point;
  view: PlannerView;
  tool: PlannerTool;
  toleranceCm: number;
}

const isSelected = (selection: PlannerSelection, id: string): boolean => {
  const chair = parseChairId(id);
  if (chair !== null) {
    return (
      selection.kind === 'chair' &&
      selection.chair.rowId === chair.rowId &&
      selection.chair.side === chair.side &&
      selection.chair.index === chair.index
    );
  }

  return selectedRowIdsOf(selection).includes(id);
};

const chairHitOf = (layouts: readonly RowLayout[], probe: PlannerTouchProbe): string | null => {
  if (probe.targetId !== null && parseChairId(probe.targetId) !== null) {
    return probe.targetId;
  }
  if (probe.view !== 'setup') {
    return null;
  }
  const chair = hitTestChair(layouts, probe.at, probe.toleranceCm);

  return chair === null ? null : chairIdOf(chair.rowId, chair.side, chair.index);
};

export const plannerTouchTargetOf = (
  layouts: readonly RowLayout[],
  selection: PlannerSelection,
  probe: PlannerTouchProbe,
): TouchTarget => {
  if (probe.tool !== 'select') {
    return EMPTY_TOUCH_TARGET;
  }
  const hit = chairHitOf(layouts, probe) ?? hitTestRowsNear(layouts, probe.at, probe.toleranceCm);

  return touchTargetOf(probe.handleId, hit, (id) => isSelected(selection, id));
};

export const touchTargetBoundsOf = (
  layouts: readonly RowLayout[],
  rowIdsOfTarget: (rowId: string) => readonly string[],
  target: TouchTarget,
): Bounds | null => {
  if (target.id === null) {
    return null;
  }
  const chair = parseChairId(target.id);
  if (chair !== null) {
    const placed = findChair(layouts, chair);

    return placed === null
      ? null
      : padBounds(
          {
            minX: placed.center.x,
            minY: placed.center.y,
            maxX: placed.center.x,
            maxY: placed.center.y,
          },
          CHAIR_FRAME_CM,
        );
  }

  return layoutsBounds(layouts, rowIdsOfTarget(target.id));
};

export const selectionBoundsOf = (
  layouts: readonly RowLayout[],
  selection: PlannerSelection,
): Bounds | null => {
  switch (selection.kind) {
    case 'none':
      return null;
    case 'rows':
      return layoutsBounds(layouts, selection.rowIds);
    case 'chair': {
      const { rowId, side, index } = selection.chair;

      return touchTargetBoundsOf(layouts, () => [], {
        kind: 'selected',
        id: chairIdOf(rowId, side, index),
      });
    }
  }
};

export const actionKindOf = (target: InspectorTarget): PlannerActionKind | null =>
  target.kind === 'plan' ? null : target.kind;

export const actionBarWidthFor = (kind: PlannerActionKind): number =>
  actionBarWidthOf(ACTION_SHAPES[kind].buttons, ACTION_SHAPES[kind].readouts);

export const draggedPoint = (current: Point, from: Point, to: Point): Point => ({
  x: current.x + to.x - from.x,
  y: current.y + to.y - from.y,
});
