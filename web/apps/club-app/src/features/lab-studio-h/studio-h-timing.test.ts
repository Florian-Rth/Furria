import { describe, expect, it } from 'vitest';
import { cellIndexAt, cellSpanOf, countCellsOf, countSpanViewOf } from './studio-h-timing';

const marks = Array.from({ length: 20 }, (_, index) => ({
  seconds: index * 0.5,
  count: (index % 8) + 1,
}));

describe('countCellsOf', () => {
  it('lists the counts of a step and starts a new eight on every 1', () => {
    const cells = countCellsOf(marks, { start: 3, end: 6 });

    expect(cells.map((cell) => [cell.count, cell.eight])).toEqual([
      [7, 0],
      [8, 0],
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 1],
    ]);
    expect(cells.at(-1)?.end).toBe(6);
  });
});

describe('cell spans', () => {
  const cells = countCellsOf(marks, { start: 0, end: 8 });

  it.each([
    [0, 0],
    [0.5, 8],
    [1, 15],
  ])('maps a touch at %s to cell %s', (share, index) => {
    expect(cellIndexAt(cells, share)).toBe(index);
  });

  it('covers the cells a move runs through', () => {
    const span = cellSpanOf(cells, { start: 1, end: 3 });

    expect(span).toEqual({ first: 2, last: 5 });
    expect(span === null ? null : countSpanViewOf(cells, span)).toEqual({
      fromCount: 3,
      toCount: 6,
      fromEight: 0,
      toEight: 0,
    });
  });
});
