import { describe, expect, it } from 'vitest';
import type { ClearanceFinding } from '@/features/hall-plan/plan-clearance';
import type {
  SeatingStandard,
  TablePlanDocument,
  TableRow,
  TableType,
} from '@/features/hall-plan/schemas';
import { layoutPlan, tableTypesById } from '@/features/hall-plan/table-layout';
import { chairIdOf, parseChairId, plannerSceneOf } from './planner-scene';
import type { PlannerSelection } from './planner-selection';
import type { PlannerView } from './planner-tools';

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
    seatsAtEnds: true,
    archived: false,
  },
  {
    tableTypeId: 2,
    name: 'Rund',
    shape: 'round',
    lengthCm: 160,
    widthCm: 160,
    seatsAtEnds: false,
    archived: false,
  },
];

const row = (id: string, overrides: Partial<TableRow> = {}): TableRow => ({
  id,
  tableTypeId: 1,
  count: 2,
  x: 500,
  y: 300,
  rotation: 30,
  seating: null,
  groupId: null,
  sides: { front: true, back: false, start: true, end: true },
  number: null,
  note: null,
  chairs: [],
  ...overrides,
});

const sceneOf = (
  document: TablePlanDocument,
  selection: PlannerSelection,
  view: PlannerView,
  findings: ClearanceFinding[] = [],
) => {
  const byId = tableTypesById(types);

  return plannerSceneOf({
    document,
    layouts: layoutPlan(document, byId, standard),
    types: byId,
    standard,
    findings,
    selection,
    view,
    focusedFinding: null,
  });
};

const plan = (rows: TableRow[]): TablePlanDocument => ({
  seating: 'comfortable',
  rows,
  groups: [],
});

describe('plannerSceneOf', () => {
  it('draws a rectangular row as one table body with its seated sides', () => {
    const scene = sceneOf(plan([row('r1')]), { kind: 'none' }, 'plan');

    expect([scene.tables.length, scene.tables[0]?.lengthCm, scene.zones[0]?.sides]).toEqual([
      1,
      240,
      { front: true, back: false, start: true, end: true },
    ]);
  });

  it('draws each round table of a row', () => {
    const scene = sceneOf(
      plan([row('r1', { tableTypeId: 2, count: 3 })]),
      { kind: 'none' },
      'plan',
    );

    expect([scene.tables.length, scene.zones.length]).toEqual([3, 3]);
  });

  it.each([
    { view: 'plan' as const, zones: 1, chairs: 0 },
    { view: 'setup' as const, zones: 0, chairs: 6 },
  ])('shows chairs only in the $view view as expected', ({ view, zones, chairs }) => {
    const scene = sceneOf(plan([row('r1')]), { kind: 'none' }, view);

    expect([scene.zones.length, scene.chairs.length]).toEqual([zones, chairs]);
  });

  it('frames one selected row along its own rotation', () => {
    const scene = sceneOf(plan([row('r1')]), { kind: 'rows', rowIds: ['r1'] }, 'plan');

    expect(scene.frame).toEqual({ x: 500, y: 300, widthCm: 240, heightCm: 80, rotation: 30 });
  });

  it('frames several rows axis aligned', () => {
    const rows = [
      row('r1', { rotation: 0, count: 1, x: 0, y: 0 }),
      row('r2', { rotation: 0, count: 1, x: 300, y: 0 }),
    ];
    const scene = sceneOf(plan(rows), { kind: 'rows', rowIds: ['r1', 'r2'] }, 'plan');

    expect(scene.frame).toEqual({ x: 150, y: 0, widthCm: 420, heightCm: 80, rotation: 0 });
  });

  it('marks the zone of a side caught in an overlap', () => {
    const finding: ClearanceFinding = {
      key: 'f1',
      severity: 'conflict',
      kind: 'chairsOverlap',
      from: { x: 0, y: 0 },
      to: { x: 0, y: 0 },
      distanceCm: 0,
      rowIds: ['r1'],
      sides: [{ rowId: 'r1', side: 'front' }],
      blockerId: null,
    };
    const scene = sceneOf(plan([row('r1'), row('r2', { y: 2000 })]), { kind: 'none' }, 'plan', [
      finding,
    ]);

    expect(scene.zones.map((zone) => zone.conflict)).toEqual([true, false]);
  });

  it('marks the selected chair', () => {
    const scene = sceneOf(
      plan([row('r1')]),
      { kind: 'chair', chair: { rowId: 'r1', side: 'start', index: 0 } },
      'setup',
    );

    expect(scene.chairs.filter((chair) => chair.selected).map((chair) => chair.key)).toEqual([
      'start:0',
    ]);
  });
});

describe('parseChairId', () => {
  it.each([
    { id: chairIdOf('r4', 'back', 3), parsed: { rowId: 'r4', side: 'back', index: 3 } },
    { id: 'r4', parsed: null },
    { id: 'chair:r4:top:1', parsed: null },
    { id: 'chair:r4:front:x', parsed: null },
  ])('$id', ({ id, parsed }) => {
    expect(parseChairId(id)).toEqual(parsed);
  });
});
