import { describe, expect, it } from 'vitest';
import type {
  ChairSide,
  Seating,
  SeatingStandard,
  TablePlanDocument,
  TableRow,
  TableType,
} from './schemas';
import {
  chairCountOf,
  clockwiseChairs,
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
  })),
});

const typeOf = (tableTypeId: number): TableType => {
  const type = byId.get(tableTypeId);
  if (type === undefined) {
    throw new Error(`unknown type ${tableTypeId}`);
  }

  return type;
};

describe('chairCountOf — parity fixtures (plan/club-app/hall-planner-parity.md)', () => {
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

      expect(chairCountOf(row, typeOf(typeId), standard, planSeating)).toBe(expected);
      expect(layoutRow(row, typeOf(typeId), standard, planSeating).chairCount).toBe(expected);
    },
  );
});

describe('planCountsOf', () => {
  it('sums tables and chairs and skips rows of unknown types', () => {
    const document: TablePlanDocument = {
      seating: 'comfortable',
      rows: [
        rowOf(1, 4, null, 'FB', []),
        rowOf(2, 1, null, 'FBSE', []),
        rowOf(99, 3, null, 'FB', []),
      ],
      groups: [],
    };

    expect(planCountsOf(document, byId, standard)).toEqual({ tables: 5, chairs: 34 });
  });
});

describe('layoutRow', () => {
  it('lays a rectangular row along its rotation with zones only on seated sides', () => {
    const row = { ...rowOf(2, 2, null, 'FS', []), x: 100, y: 100, rotation: 90 };
    const layout = layoutRow(row, typeOf(2), standard, 'comfortable');

    expect(layout.tables.map((table) => table.center)).toEqual([
      { x: 100, y: 40 },
      { x: 100, y: 160 },
    ]);
    expect(layout.zones.map((zone) => zone.side)).toEqual(['front', 'start']);
    expect(layout.bounds.minX).toBeCloseTo(60);
    expect(layout.bounds.maxX).toBeCloseTo(190);
    expect(layout.bounds.minY).toBeCloseTo(-70);
    expect(layout.bounds.maxY).toBeCloseTo(220);
  });

  it('spaces round tables so their chair zones touch', () => {
    const layout = layoutRow(rowOf(3, 2, null, '', []), typeOf(3), standard, 'comfortable');

    expect(layout.tables.map((table) => table.center.x)).toEqual([-130, 130]);
    expect(layout.zones).toHaveLength(2);
  });

  it('marks removed chairs without dropping their slot', () => {
    const layout = layoutRow(
      rowOf(2, 1, null, 'F', [['front', 1]]),
      typeOf(2),
      standard,
      'comfortable',
    );

    expect(layout.chairs.map((chair) => chair.removed)).toEqual([false, true]);
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
