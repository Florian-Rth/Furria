import { describe, expect, it } from 'vitest';
import {
  cellWaveOf,
  countTargetOf,
  cursorAt,
  eightsOfMarks,
  keyedCellsOf,
  markIndexAt,
  movingCountIn,
  nearestMarkIndexOf,
  rowIndexAt,
  sheetRowsOf,
  stepTargetOf,
  zoomedOf,
} from './count-sheet';

const marksOf = (counts: readonly number[], beat = 0.5, from = 0) =>
  counts.map((count, index) => ({ seconds: from + index * beat, count }));

describe('sheetRowsOf', () => {
  it.each([
    ['half', [4, 4, 4, 4]],
    ['eight', [8, 8]],
    ['two', [16]],
    ['all', [16]],
  ] as const)('puts sixteen counts into rows at %s density', (density, sizes) => {
    const marks = marksOf([1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8]);

    expect(sheetRowsOf(marks, 8, density).map((row) => row.cells.length)).toEqual(sizes);
  });

  it('keeps counts in their column when a song starts mid-eight', () => {
    const marks = marksOf([1, 2, 3, 4, 5, 6, 3, 4, 5, 6, 7, 8, 1]);
    const rows = sheetRowsOf(marks, 7, 'eight');

    expect(rows.map((row) => row.cells.map((cell) => cell.column))).toEqual([
      [0, 1, 2, 3, 4, 5],
      [2, 3, 4, 5, 6, 7],
      [0],
    ]);
    expect(rows.map((row) => row.cells[0]?.eight)).toEqual([0, 1, 2]);
  });

  it('opens a pickup row before the first count', () => {
    const rows = sheetRowsOf(marksOf([1, 2], 0.5, 0.48), 1.5, 'eight');

    expect(rows.map((row) => [row.pickup, row.start, row.end])).toEqual([
      [true, 0, 0.48],
      [false, 0.48, 1.5],
    ]);
  });

  it('has no rows without counts', () => {
    expect(sheetRowsOf([], 30, 'eight')).toEqual([]);
  });
});

describe('cursorAt', () => {
  const rows = sheetRowsOf(marksOf([1, 2, 3, 4, 5, 6, 7, 8, 1, 2]), 5, 'eight');

  it.each([
    [0, { row: 0, column: 0, cell: 0 }],
    [1.25, { row: 0, column: 2.5, cell: 2 }],
    [4.25, { row: 1, column: 0.5, cell: 8 }],
    [5, { row: 1, column: 2, cell: 9 }],
  ])('places %s seconds', (seconds, cursor) => {
    expect(cursorAt(rows, seconds)).toEqual(cursor);
  });

  it('finds no row before the music', () => {
    expect(cursorAt(rows, -1)).toBeNull();
    expect(rowIndexAt(rows, -1)).toBe(-1);
  });
});

describe('cellWaveOf', () => {
  it('takes the loudest bucket per slot', () => {
    expect(cellWaveOf([0.1, 0.9, 0.3, 0.4], 4, { start: 0, end: 2 }, 2)).toEqual([0.1, 0.9]);
    expect(cellWaveOf([0.1, 0.9, 0.3, 0.4], 4, { start: 1, end: 4 }, 1)).toEqual([0.9]);
  });

  it('draws nothing without peaks', () => {
    expect(cellWaveOf([], 4, { start: 0, end: 1 }, 3)).toEqual([]);
  });
});

describe('zoomedOf', () => {
  it.each([
    ['eight', -1, 'half'],
    ['half', -1, 'half'],
    ['two', 1, 'all'],
    ['all', 1, 'all'],
  ] as const)('moves %s by %s to %s', (density, direction, zoomed) => {
    expect(zoomedOf(density, direction)).toBe(zoomed);
  });
});

describe('stepTargetOf', () => {
  const starts = [8, 0, 4];

  it.each([
    [5, 1, 8],
    [5, -1, 4],
    [4.1, -1, 0],
    [9, 1, null],
    [0.1, -1, null],
  ] as const)('from %s going %s lands on %s', (seconds, direction, target) => {
    expect(stepTargetOf(starts, seconds, direction)).toBe(target);
  });
});

describe('countTargetOf', () => {
  const marks = marksOf([1, 2, 3, 4]);

  it.each([
    [0.7, 1, 1],
    [0.7, -1, 0.5],
    [0.5, -1, 0],
    [1.5, 1, null],
  ] as const)('from %s going %s lands on %s', (seconds, direction, target) => {
    expect(countTargetOf(marks, seconds, direction)).toBe(target);
  });
});

describe('markIndexAt and nearestMarkIndexOf', () => {
  const marks = marksOf([1, 2, 3, 4]);

  it.each([
    [-0.2, -1, 0],
    [0.2, 0, 0],
    [0.3, 0, 1],
    [1.6, 3, 3],
  ])('at %s finds %s below and %s nearest', (seconds, below, nearest) => {
    expect(markIndexAt(marks, seconds)).toBe(below);
    expect(nearestMarkIndexOf(marks, seconds)).toBe(nearest);
  });
});

describe('eightsOfMarks', () => {
  it('counts a new eight whenever the count falls back', () => {
    expect(eightsOfMarks(marksOf([7, 8, 1, 2, 3, 1]))).toEqual([0, 0, 1, 1, 1, 2]);
  });
});

describe('keyedCellsOf', () => {
  it('puts every keyframe on the count it falls in', () => {
    expect([...keyedCellsOf(marksOf([1, 2, 3, 4]), [0.1, 0.6, 0.7, -1])]).toEqual([0, 1]);
  });
});

describe('movingCountIn', () => {
  const still = [
    { seconds: 0, right: 0, back: 1 },
    { seconds: 2, right: 0, back: 1 },
  ];
  const moving = [
    { seconds: 0, right: 0, back: 1 },
    { seconds: 2, right: 1, back: 1 },
  ];

  it.each([
    [{ start: 1, end: 3 }, 1],
    [{ start: 0, end: 1 }, 0],
    [{ start: 3, end: 4 }, 0],
  ])('counts dots that change place in %o', (span, count) => {
    expect(movingCountIn([still, moving], span)).toBe(count);
  });
});
