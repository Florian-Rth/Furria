import { describe, expect, it } from 'vitest';
import { blockersOf } from './plan-blockers';
import type {
  ChairSide,
  Seating,
  SeatingStandard,
  TablePlanDocument,
  TableRow,
  TableType,
} from './schemas';
import type { RowLayout } from './table-layout';
import {
  clockwiseChairs,
  layoutPlan,
  layoutRow,
  planCountsOf,
  tableTypesById,
} from './table-layout';

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
    name: 'Biertisch',
    shape: 'rectangle',
    lengthCm: 220,
    widthCm: 50,
    seatsAtEnds: false,
    archived: false,
  },
  {
    tableTypeId: 2,
    name: 'Tisch',
    shape: 'rectangle',
    lengthCm: 120,
    widthCm: 80,
    seatsAtEnds: true,
    archived: false,
  },
  {
    tableTypeId: 3,
    name: 'Rund',
    shape: 'round',
    lengthCm: 160,
    widthCm: 160,
    seatsAtEnds: false,
    archived: false,
  },
];
const byId = tableTypesById(types);

const rowOf = (
  tableTypeId: number,
  count: number,
  seating: Seating | null,
  sides: string,
  removed: [ChairSide, number][],
): TableRow => ({
  id: 'r1',
  tableTypeId,
  count,
  x: 0,
  y: 0,
  rotation: 0,
  seating,
  groupId: null,
  sides: {
    front: sides.includes('F'),
    back: sides.includes('B'),
    start: sides.includes('S'),
    end: sides.includes('E'),
  },
  number: null,
  note: null,
  chairs: removed.map(([side, index]) => ({
    side,
    index,
    number: null,
    note: null,
    removed: true,
    kept: false,
  })),
});

const typeOf = (tableTypeId: number): TableType => {
  const type = byId.get(tableTypeId);
  if (type === undefined) {
    throw new Error(`unknown type ${tableTypeId}`);
  }

  return type;
};

describe('layoutRow chair count', () => {
  it.each<[number, number, number, Seating | null, Seating, string, [ChairSide, number][], number]>(
    [
      [1, 1, 1, null, 'comfortable', 'FB', [], 6],
      [2, 1, 1, null, 'maximum', 'FB', [], 8],
      [3, 1, 4, null, 'comfortable', 'FB', [], 28],
      [4, 2, 1, null, 'comfortable', 'FBSE', [], 6],
      [5, 2, 1, null, 'maximum', 'FBSE', [], 6],
      [6, 2, 3, null, 'comfortable', 'FE', [], 7],
      [7, 1, 1, null, 'comfortable', 'FBSE', [], 6],
      [8, 3, 1, null, 'comfortable', 'FB', [], 10],
      [9, 3, 2, 'maximum', 'comfortable', 'FB', [], 28],
      [10, 3, 1, null, 'comfortable', '', [], 10],
      [
        11,
        2,
        1,
        null,
        'comfortable',
        'FBSE',
        [
          ['front', 0],
          ['start', 0],
          ['front', 5],
        ],
        4,
      ],
      [12, 1, 1, 'maximum', 'comfortable', 'FB', [], 8],
      [
        13,
        3,
        2,
        null,
        'comfortable',
        'FB',
        [
          ['around', 12],
          ['around', 25],
        ],
        19,
      ],
      [
        14,
        2,
        1,
        null,
        'comfortable',
        'FBSE',
        [
          ['front', 0],
          ['front', 0],
        ],
        5,
      ],
      [15, 2, 1, null, 'comfortable', 'FBSE', [['around', 0]], 6],
      [16, 3, 1, null, 'comfortable', 'FB', [['front', 0]], 10],
      [17, 1, 1, null, 'comfortable', '', [], 0],
      [18, 2, 2, null, 'comfortable', 'B', [['back', 3]], 3],
    ],
  )(
    'case %i: type %i × %i → chairs',
    (_case, typeId, count, rowSeating, planSeating, sides, removed, expected) => {
      const row = rowOf(typeId, count, rowSeating, sides, removed);

      expect(layoutRow(row, typeOf(typeId), standard, planSeating).chairCount).toBe(expected);
    },
  );
});

describe('layoutRow', () => {
  it('lays a rectangular row along its rotation with zones only on seated sides', () => {
    const row = { ...rowOf(2, 2, null, 'FS', []), x: 100, y: 100, rotation: 90 };
    const layout = layoutRow(row, typeOf(2), standard, 'comfortable');

    expect(layout.tables.map((table) => table.center)).toEqual([
      { x: 100, y: 40 },
      { x: 100, y: 160 },
    ]);
    expect([...new Set(layout.chairs.map((chair) => chair.side))]).toEqual(['front', 'start']);
    expect(layout.bounds.minX).toBeCloseTo(60);
    expect(layout.bounds.maxX).toBeCloseTo(190);
    expect(layout.bounds.minY).toBeCloseTo(-70);
    expect(layout.bounds.maxY).toBeCloseTo(220);
  });

  it('spaces round tables so their chair zones touch', () => {
    const layout = layoutRow(rowOf(3, 2, null, '', []), typeOf(3), standard, 'comfortable');

    expect(layout.tables.map((table) => table.center.x)).toEqual([-130, 130]);
  });

  it('marks removed chairs without dropping their slot', () => {
    const layout = layoutRow(
      rowOf(2, 1, null, 'F', [['front', 1]]),
      typeOf(2),
      standard,
      'comfortable',
    );

    expect(layout.chairs.map((chair) => chair.state)).toEqual(['seated', 'removed']);
  });
});

describe('clockwiseChairs', () => {
  it('runs front left to right, end, back right to left, start', () => {
    const layout = layoutRow(rowOf(2, 1, null, 'FBSE', []), typeOf(2), standard, 'comfortable');

    expect(clockwiseChairs(layout).map((chair) => `${chair.side}${chair.index}`)).toEqual([
      'front0',
      'front1',
      'end0',
      'back1',
      'back0',
      'start0',
    ]);
  });
});

const placed = (
  id: string,
  tableTypeId: number,
  at: { x: number; y: number },
  extra: Partial<TableRow> = {},
): TableRow => ({ ...rowOf(tableTypeId, 1, null, 'FBSE', []), id, x: at.x, y: at.y, ...extra });

const planOf = (rows: TableRow[], groups: string[] = []): TablePlanDocument => ({
  seating: 'comfortable',
  rows,
  groups: groups.map((id) => ({ id, number: null, note: null })),
});

const statesOf = (layout: RowLayout | undefined): string[] =>
  layout?.chairs.map((chair) => `${chair.side}${chair.index}:${chair.state}`) ?? [];

describe('layoutPlan', () => {
  it.each<[string, string | null, number, number]>([
    ['grouped tables drop the chairs between them', 'g1', 5, 0],
    ['ungrouped tables leave the clashing chairs out', null, 6, 1],
  ])('%s', (_name, groupId, chairsPerRow, leftOutPerRow) => {
    const layouts = layoutPlan(
      planOf(
        [
          placed('r1', 2, { x: 0, y: 0 }, { groupId }),
          placed('r2', 2, { x: 120, y: 0 }, { groupId }),
        ],
        groupId === null ? [] : [groupId],
      ),
      byId,
      standard,
    );

    expect(layouts.map((layout) => layout.chairs.length)).toEqual([chairsPerRow, chairsPerRow]);
    expect(
      layouts.map((layout) => layout.chairs.filter((chair) => chair.state === 'leftOut').length),
    ).toEqual([leftOutPerRow, leftOutPerRow]);
    expect(planCountsOf(layouts)).toEqual({ tables: 2, chairs: 10 });
  });

  it('leaves out the chairs of the later row when two rows face each other too closely', () => {
    const layouts = layoutPlan(
      planOf([placed('r1', 1, { x: 0, y: 0 }), placed('r2', 1, { x: 0, y: 120 })]),
      byId,
      standard,
    );

    expect(statesOf(layouts[0]).filter((state) => state.endsWith('leftOut'))).toEqual([]);
    expect(statesOf(layouts[1]).filter((state) => state.endsWith('leftOut'))).toEqual([
      'front0:leftOut',
      'front1:leftOut',
      'front2:leftOut',
    ]);
    expect(layouts.map((layout) => layout.chairCount)).toEqual([6, 3]);
  });

  it('keeps a chair the planner put back despite the clash', () => {
    const kept = placed(
      'r2',
      1,
      { x: 0, y: 120 },
      {
        chairs: [{ side: 'front', index: 0, number: null, note: null, removed: false, kept: true }],
      },
    );
    const layouts = layoutPlan(planOf([placed('r1', 1, { x: 0, y: 0 }), kept]), byId, standard);

    expect(layouts.map((layout) => layout.chairCount)).toEqual([6, 4]);
  });

  it('leaves out chairs that stand in a wall', () => {
    const hall = {
      elements: [
        {
          id: 'w1',
          kind: 'wall' as const,
          points: [
            { x: -200, y: -60 },
            { x: 200, y: -60 },
          ],
          thicknessCm: 20,
        },
      ],
    };
    const layouts = layoutPlan(
      planOf([placed('r1', 1, { x: 0, y: 0 })]),
      byId,
      standard,
      blockersOf(hall, standard),
    );

    expect(layouts[0]?.chairCount).toBe(3);
  });
});
