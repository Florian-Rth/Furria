import { describe, expect, it } from 'vitest';
import type {
  SeatingStandard,
  TablePlanDocument,
  TableRow,
  TableType,
} from '@/features/hall-plan/schemas';
import { layoutPlan, tableTypesById } from '@/features/hall-plan/table-layout';
import { layoutsBounds } from '@/features/hall-plan/table-plan-ops';
import { chairIdOf } from './planner-scene';
import type { PlannerSelection } from './planner-selection';
import {
  actionBarWidthFor,
  actionKindOf,
  draggedPoint,
  plannerTouchTargetOf,
  selectionBoundsOf,
} from './planner-touch';

const standard: SeatingStandard = {
  comfortableChairSpacingCm: 60,
  maximumChairSpacingCm: 45,
  chairDepthCm: 50,
  aisleWidthCm: 120,
  exitClearanceCm: 120,
};

const types: TableType[] = [
  {
    tableTypeId: 1,
    name: 'Tisch',
    shape: 'rectangle',
    lengthCm: 120,
    widthCm: 80,
    seatsAtEnds: false,
    archived: false,
  },
];

const row: TableRow = {
  id: 'r1',
  tableTypeId: 1,
  count: 1,
  x: 0,
  y: 0,
  rotation: 0,
  seating: null,
  groupId: null,
  sides: { front: true, back: false, start: false, end: false },
  number: null,
  note: null,
  chairs: [],
};

const document: TablePlanDocument = { seating: 'comfortable', rows: [row], groups: [] };
const layouts = layoutPlan(document, tableTypesById(types), standard);
const none: PlannerSelection = { kind: 'none' };
const rowSelected: PlannerSelection = { kind: 'rows', rowIds: ['r1'] };

const probe = {
  handleId: null,
  targetId: null,
  at: { x: 0, y: 0 },
  view: 'plan' as const,
  tool: 'select' as const,
  toleranceCm: 0,
};

describe('plannerTouchTargetOf', () => {
  it.each([
    [{ tool: 'table' as const }, none, { kind: 'empty', id: null }],
    [{}, none, { kind: 'unselected', id: 'r1' }],
    [{}, rowSelected, { kind: 'selected', id: 'r1' }],
    [{ handleId: 'rotate' }, rowSelected, { kind: 'handle', id: null }],
    [{ at: { x: 0, y: 100 }, toleranceCm: 70 }, none, { kind: 'unselected', id: 'r1' }],
    [{ at: { x: 0, y: 100 }, toleranceCm: 10 }, none, { kind: 'empty', id: null }],
  ])('probe %o → %o', (overrides, selection, expected) => {
    expect(plannerTouchTargetOf(layouts, selection, { ...probe, ...overrides })).toEqual(expected);
  });

  it('finds a chair near the finger in the setup view', () => {
    const [chair] = layouts[0]?.chairs ?? [];
    if (chair === undefined) {
      throw new Error('fixture has no chair');
    }

    expect(
      plannerTouchTargetOf(layouts, none, {
        ...probe,
        at: chair.center,
        view: 'setup',
        toleranceCm: 20,
      }),
    ).toEqual({ kind: 'unselected', id: chairIdOf('r1', chair.side, chair.index) });
  });
});

describe('selectionBoundsOf', () => {
  it('has no bounds without a selection', () => {
    expect(selectionBoundsOf(layouts, none)).toBeNull();
  });

  it('frames the selected rows', () => {
    expect(selectionBoundsOf(layouts, rowSelected)).toEqual(layoutsBounds(layouts, ['r1']));
  });

  it('frames a selected chair around its centre', () => {
    const [chair] = layouts[0]?.chairs ?? [];
    if (chair === undefined) {
      throw new Error('fixture has no chair');
    }

    expect(
      selectionBoundsOf(layouts, {
        kind: 'chair',
        chair: { rowId: 'r1', side: chair.side, index: chair.index },
      }),
    ).toEqual({
      minX: chair.center.x - 30,
      minY: chair.center.y - 30,
      maxX: chair.center.x + 30,
      maxY: chair.center.y + 30,
    });
  });
});

describe('actionKindOf', () => {
  it.each([
    [{ kind: 'plan' as const }, null],
    [{ kind: 'row' as const, row }, 'row'],
    [{ kind: 'rows' as const, rowIds: ['a', 'b'] }, 'rows'],
  ])('%o → %s', (target, expected) => {
    expect(actionKindOf(target)).toBe(expected);
  });
});

describe('actionBarWidthFor', () => {
  it.each([
    ['row', 360],
    ['group', 276],
    ['chair', 232],
  ] as const)('%s → %i px', (kind, expected) => {
    expect(actionBarWidthFor(kind)).toBe(expected);
  });
});

describe('draggedPoint', () => {
  it('moves the point by the drag', () => {
    expect(draggedPoint({ x: 100, y: 100 }, { x: 10, y: 10 }, { x: 40, y: -20 })).toEqual({
      x: 130,
      y: 70,
    });
  });
});
