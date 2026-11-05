import { describe, expect, it } from 'vitest';
import type { TableRow, TableType } from '@/features/hall-plan/schemas';
import type { RowLayout } from '@/features/hall-plan/table-layout';
import { chairNoticeOf, countsOfRows, parseWhole, sideTogglesOf } from './planner-facts';

const layout = (rowId: string, tableCount: number, chairCount: number): RowLayout => ({
  rowId,
  groupId: null,
  shape: 'rectangle',
  center: { x: 0, y: 0 },
  rotation: 0,
  body: [],
  tables: [],
  chairs: [],
  tableCount,
  chairCount,
  bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
});

describe('countsOfRows', () => {
  it('adds up the chosen rows only', () => {
    const layouts = [layout('r1', 2, 8), layout('r2', 3, 12), layout('r3', 1, 4)];

    expect(countsOfRows(layouts, ['r1', 'r3'])).toEqual({ tables: 3, chairs: 12 });
  });
});

describe('sideTogglesOf', () => {
  const row: TableRow = {
    id: 'r1',
    tableTypeId: 1,
    count: 1,
    x: 0,
    y: 0,
    rotation: 0,
    seating: null,
    groupId: null,
    sides: { front: true, back: false, start: true, end: true },
    number: null,
    note: null,
    chairs: [],
  };
  const type = (seatsAtEnds: boolean): TableType => ({
    tableTypeId: 1,
    name: 'Tisch',
    shape: 'rectangle',
    lengthCm: 120,
    widthCm: 80,
    seatsAtEnds,
    archived: false,
  });

  it.each([
    { seatsAtEnds: true, seated: [true, false, true, true], available: [true, true, true, true] },
    {
      seatsAtEnds: false,
      seated: [true, false, false, false],
      available: [true, true, false, false],
    },
  ])('ends seatable: $seatsAtEnds', ({ seatsAtEnds, seated, available }) => {
    const toggles = sideTogglesOf(row, type(seatsAtEnds));

    expect([toggles.map((t) => t.seated), toggles.map((t) => t.available)]).toEqual([
      seated,
      available,
    ]);
  });
});

describe('chairNoticeOf', () => {
  it.each([
    ['removed', false, 'removed'],
    ['leftOut', false, 'leftOut'],
    ['seated', true, 'kept'],
    ['seated', false, null],
    [null, false, null],
  ] as const)('%s chair (kept %s) → %s', (state, kept, expected) => {
    expect(chairNoticeOf(state, kept)).toBe(expected);
  });
});

describe('parseWhole', () => {
  it.each([
    ['42', 42],
    [' 7 ', 7],
    ['', null],
    ['4.5', null],
    ['-3', null],
  ])('reads %j as %s', (value, expected) => {
    expect(parseWhole(value)).toBe(expected);
  });
});
