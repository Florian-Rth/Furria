import { describe, expect, it } from 'vitest';
import type { SeatingStandard, TablePlanDocument, TableRow, TableType } from './schemas';
import { layoutPlan, tableTypesById } from './table-layout';
import {
  changeRowCount,
  createRow,
  duplicateRows,
  expandToGroups,
  groupRows,
  hitTestChair,
  hitTestRows,
  numberPlan,
  patchChair,
  readingOrder,
  releaseChairs,
  removeRows,
  rotateRows,
  rowFromDrag,
  selectionFor,
  ungroup,
} from './table-plan-ops';

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
  seatsAtEnds: true,
  archived: false,
};
const round: TableType = {
  tableTypeId: 3,
  name: 'Rund',
  shape: 'round',
  lengthCm: 160,
  widthCm: 160,
  seatsAtEnds: false,
  archived: false,
};
const types = tableTypesById([table, round]);

const rowAt = (id: string, x: number, y: number, groupId: string | null = null): TableRow => ({
  ...createRow(id, 2, { x, y }),
  groupId,
});

const planOf = (rows: TableRow[], groupIds: string[] = []): TablePlanDocument => ({
  seating: 'comfortable',
  rows,
  groups: groupIds.map((id) => ({ id, number: null, note: null })),
});

describe('rowFromDrag', () => {
  it.each([
    ['a short drag as one table', table, 30, 1, 60],
    ['a long drag as a row', table, 470, 4, 240],
    ['round tables at their pitch', round, 700, 3, 340],
  ])('places %s', (_name, type, length, count, centerX) => {
    const row = rowFromDrag('r1', type, standard, { x: 0, y: 0 }, { x: length, y: 0 });

    expect(row.count).toBe(count);
    expect(row.x).toBeCloseTo(centerX);
  });

  it('turns the row along the drag', () => {
    const row = rowFromDrag('r1', table, standard, { x: 0, y: 0 }, { x: 0, y: 240 });

    expect(row.rotation).toBeCloseTo(90);
    expect(row.y).toBeCloseTo(120);
  });
});

describe('changeRowCount', () => {
  it.each([
    ['grows to the end and keeps the start edge', 1, 0, 1, 2, 60],
    ['shrinks back towards the start edge', 2, 60, -1, 1, 0],
    ['never drops below one table', 1, 0, -5, 1, 0],
  ])('%s', (_name, startCount, startX, delta, count, centerX) => {
    const plan = planOf([{ ...rowAt('r1', startX, 0), count: startCount }]);
    const [row] = changeRowCount(plan, 'r1', delta, table, standard).rows;

    expect(row?.count).toBe(count);
    expect(row?.x).toBeCloseTo(centerX);
  });
});

describe('groups', () => {
  it('groups rows, selects the whole group from one row and ungroups again', () => {
    const plan = planOf([rowAt('r1', 0, 0), rowAt('r2', 200, 0), rowAt('r3', 400, 0)]);
    const { document, groupId } = groupRows(plan, ['r1', 'r2']);

    expect(groupId).toBe('g1');
    expect(selectionFor(document, 'r2')).toEqual(['r1', 'r2']);
    expect(expandToGroups(document, ['r1', 'r3'])).toEqual(['r1', 'r2', 'r3']);
    expect(ungroup(document, 'g1')).toEqual(plan);
  });

  it('drops a group whose rows moved into a new group', () => {
    const plan = planOf([rowAt('r1', 0, 0, 'g1'), rowAt('r2', 200, 0, 'g1')], ['g1']);
    const { document } = groupRows(plan, ['r1', 'r2']);

    expect(document.groups.map((group) => group.id)).toEqual(['g2']);
  });

  it('drops a group when its last row is removed', () => {
    const plan = planOf([rowAt('r1', 0, 0, 'g1')], ['g1']);

    expect(removeRows(plan, ['r1'])).toEqual(planOf([]));
  });
});

describe('rotateRows', () => {
  it('turns rows about their common centre', () => {
    const plan = planOf([rowAt('r1', -100, 0), rowAt('r2', 100, 0)]);
    const [first, second] = rotateRows(plan, ['r1', 'r2'], 90).rows;

    expect(first?.x).toBeCloseTo(0);
    expect(first?.y).toBeCloseTo(-100);
    expect(second?.y).toBeCloseTo(100);
    expect(second?.rotation).toBe(90);
  });
});

describe('duplicateRows', () => {
  it('copies rows into a fresh group without numbers', () => {
    const plan = planOf([{ ...rowAt('r1', 0, 0, 'g1'), number: '7', note: 'Elferrat' }], ['g1']);
    const { document, ids } = duplicateRows(plan, ['r1'], { x: 0, y: 150 });

    expect(ids).toEqual(['r2']);
    expect(document.rows[1]).toMatchObject({
      id: 'r2',
      y: 150,
      groupId: 'g2',
      number: null,
      note: 'Elferrat',
    });
    expect(document.groups.map((group) => group.id)).toEqual(['g1', 'g2']);
  });
});

describe('patchChair', () => {
  it('stores a trimmed note and drops the override once it is plain again', () => {
    const plan = planOf([rowAt('r1', 0, 0)]);
    const ref = { rowId: 'r1', side: 'front' as const, index: 1 };
    const noted = patchChair(plan, ref, { note: '  Oma Erna ' });

    expect(noted.rows[0]?.chairs).toEqual([
      { side: 'front', index: 1, number: null, note: 'Oma Erna', removed: false, kept: false },
    ]);
    expect(patchChair(noted, ref, { note: '' }).rows[0]?.chairs).toEqual([]);
  });

  it.each([
    ['keeping', { kept: true }, [{ removed: false, kept: true }]],
    ['removing a kept chair', { removed: true }, [{ removed: true, kept: false }]],
  ])('records %s', (_name, patch, expected) => {
    const plan = planOf([rowAt('r1', 0, 0)]);
    const ref = { rowId: 'r1', side: 'front' as const, index: 0 };
    const kept = patchChair(plan, ref, { kept: true });

    expect(patchChair(kept, ref, patch).rows[0]?.chairs).toMatchObject(expected);
  });
});

describe('releaseChairs', () => {
  it('lets kept chairs be left out again and forgets plain overrides', () => {
    const plan = planOf([rowAt('r1', 0, 0)]);
    const ref = { rowId: 'r1', side: 'front' as const, index: 0 };

    expect(releaseChairs(patchChair(plan, ref, { kept: true }), [ref]).rows[0]?.chairs).toEqual([]);
  });
});

describe('readingOrder', () => {
  it('reads top to bottom by lines, left to right within a line', () => {
    const order = readingOrder([
      { id: 'c', x: 0, y: 400 },
      { id: 'b', x: 300, y: 40 },
      { id: 'a', x: 0, y: 0 },
    ]);

    expect(order.map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('numberPlan', () => {
  it('numbers rows in reading order and chairs clockwise, skipping removed ones', () => {
    const plan = planOf([
      { ...rowAt('r1', 0, 300), sides: { front: true, back: false, start: false, end: false } },
      {
        ...rowAt('r2', 0, 0),
        sides: { front: true, back: false, start: false, end: false },
        chairs: [
          { side: 'front', index: 0, number: null, note: null, removed: true, kept: false },
          { side: 'front', index: 9, number: null, note: 'alt', removed: false, kept: false },
        ],
      },
    ]);
    const numbered = numberPlan(plan, layoutPlan(plan, types, standard));

    expect(numbered.rows.map((row) => row.number)).toEqual(['2', '1']);
    expect(numbered.rows[1]?.chairs).toEqual([
      { side: 'front', index: 0, number: null, note: null, removed: true, kept: false },
      { side: 'front', index: 1, number: '1', note: null, removed: false, kept: false },
    ]);
  });
});

describe('hit testing', () => {
  const plan = planOf([rowAt('r1', 0, 0)]);
  const layouts = layoutPlan(plan, types, standard);

  it.each([
    [{ x: 10, y: 10 }, 'r1'],
    [{ x: 10, y: 60 }, 'r1'],
    [{ x: 10, y: 200 }, null],
  ])('finds the row at %o', (at, expected) => {
    expect(hitTestRows(layouts, at)).toBe(expected);
  });

  it('finds the nearest chair within reach', () => {
    expect(hitTestChair(layouts, { x: -25, y: -60 }, 20)).toEqual({
      rowId: 'r1',
      side: 'front',
      index: 0,
    });
    expect(hitTestChair(layouts, { x: 0, y: 0 }, 20)).toBeNull();
  });
});
