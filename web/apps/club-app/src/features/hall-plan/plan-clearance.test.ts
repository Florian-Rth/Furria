import { describe, expect, it } from 'vitest';
import { blockersOf } from './plan-blockers';
import { clearanceOf, tallyFindings } from './plan-clearance';
import type { HallDocument, RowSides, SeatingStandard, TableRow, TableType } from './schemas';
import { layoutPlan, tableTypesById } from './table-layout';

const standard: SeatingStandard = {
  comfortableChairSpacingCm: 60,
  maximumChairSpacingCm: 45,
  chairDepthCm: 50,
  aisleWidthCm: 120,
  exitClearanceCm: 120,
};

const table: TableType = {
  tableTypeId: 2,
  name: 'Tisch',
  shape: 'rectangle',
  lengthCm: 120,
  widthCm: 80,
  seatsAtEnds: false,
  archived: false,
};

const LONG_SIDES: RowSides = { front: true, back: true, start: false, end: false };
const NO_SIDES: RowSides = { front: false, back: false, start: false, end: false };

const KEPT_FRONT = [0, 1].map((index) => ({
  side: 'front' as const,
  index,
  number: null,
  note: null,
  removed: false,
  kept: true,
}));

const rowAt = (id: string, y: number, sides: RowSides = LONG_SIDES, x = 0): TableRow => ({
  id,
  tableTypeId: 2,
  count: 1,
  x,
  y,
  rotation: 0,
  seating: null,
  groupId: null,
  sides,
  number: null,
  note: null,
  chairs: [],
});

const findingsFor = (rows: TableRow[], hall: HallDocument = { elements: [] }) => {
  const blockers = blockersOf(hall, standard);
  const layouts = layoutPlan(
    { seating: 'comfortable', rows, groups: [] },
    tableTypesById([table]),
    standard,
    blockers,
  );

  return clearanceOf(layouts, blockers, standard);
};

const keptFront = (row: TableRow): TableRow => ({ ...row, chairs: KEPT_FRONT });

describe('clearanceOf between rows', () => {
  it.each([
    ['far apart rows', 400, []],
    ['rows with a full aisle', 300, []],
    ['rows with a narrow aisle', 250, ['hint:narrowAisle']],
    ['rows whose chairs would overlap leave them out', 150, ['hint:narrowAisle']],
    ['rows whose tables overlap', 40, ['conflict:tablesOverlap']],
  ])('%s', (_name, y, expected) => {
    expect(
      findingsFor([rowAt('r1', 0), rowAt('r2', y)]).map(
        (finding) => `${finding.severity}:${finding.kind}`,
      ),
    ).toEqual(expected);
  });

  it('measures the narrow aisle between the facing chair zones', () => {
    const [finding] = findingsFor([rowAt('r1', 0), rowAt('r2', 250)]);

    expect(finding?.distanceCm).toBeCloseTo(70);
    expect(finding?.from.y).toBeCloseTo(90);
    expect(finding?.to.y).toBeCloseTo(160);
  });

  it('reports kept chairs that overlap with every chair involved', () => {
    const [finding] = findingsFor([rowAt('r1', 0), keptFront(rowAt('r2', 150))]);

    expect(finding?.kind).toBe('chairsOverlap');
    expect(finding?.chairs).toEqual(
      expect.arrayContaining([
        { rowId: 'r2', side: 'front', index: 0 },
        { rowId: 'r2', side: 'front', index: 1 },
        { rowId: 'r1', side: 'back', index: 0 },
        { rowId: 'r1', side: 'back', index: 1 },
      ]),
    );
  });

  it('never warns about tables pushed together without chairs between them', () => {
    expect(findingsFor([rowAt('r1', 0, NO_SIDES), rowAt('r2', 85, NO_SIDES)])).toEqual([]);
  });
});

describe('clearanceOf against the hall', () => {
  const wall = (y: number): HallDocument => ({
    elements: [
      {
        id: 'w1',
        kind: 'wall',
        points: [
          { x: -500, y },
          { x: 500, y },
        ],
        thicknessCm: 20,
      },
    ],
  });

  it.each([
    ['chairs facing a wall too close', 150, LONG_SIDES, ['hint:narrowAisle']],
    ['chairs running into a wall are left out', 95, LONG_SIDES, []],
    ['a bare table touching a wall', 50, NO_SIDES, []],
    ['a table through a wall', 30, NO_SIDES, ['conflict:tableBlocked']],
  ])('%s', (_name, wallY, sides, expected) => {
    expect(
      findingsFor([rowAt('r1', 0, sides)], wall(wallY)).map(
        (finding) => `${finding.severity}:${finding.kind}`,
      ),
    ).toEqual(expected);
  });

  it('reports kept chairs that stand in a wall', () => {
    const flipped = { ...rowAt('r1', 0), rotation: 180 };

    expect(findingsFor([keptFront(flipped)], wall(95)).map((finding) => finding.kind)).toEqual([
      'chairsBlocked',
    ]);
  });

  it('flags anything inside an emergency exit keep-clear zone', () => {
    const exit: HallDocument = {
      elements: [
        {
          id: 'd1',
          kind: 'door',
          from: { x: -50, y: 150 },
          to: { x: 50, y: 150 },
          door: 'emergencyExit',
        },
      ],
    };

    expect(findingsFor([rowAt('r1', 0, NO_SIDES)], exit).map((finding) => finding.kind)).toEqual([
      'exitBlocked',
    ]);
  });

  it('ignores ordinary doors, lines and texts', () => {
    const hall: HallDocument = {
      elements: [
        { id: 'd1', kind: 'door', from: { x: -50, y: 60 }, to: { x: 50, y: 60 }, door: 'door' },
        {
          id: 'l1',
          kind: 'line',
          points: [
            { x: -50, y: 0 },
            { x: 50, y: 0 },
          ],
          label: null,
        },
        { id: 't1', kind: 'text', x: 0, y: 0, text: 'Bar', size: 'small', rotation: 0 },
      ],
    };

    expect(findingsFor([rowAt('r1', 0, NO_SIDES)], hall)).toEqual([]);
  });
});

describe('tallyFindings', () => {
  it('counts conflicts and hints', () => {
    const findings = findingsFor([rowAt('r1', 0), rowAt('r2', 40), rowAt('r3', 290)]);

    expect(tallyFindings(findings)).toEqual({ conflicts: 1, hints: 1 });
  });
});
