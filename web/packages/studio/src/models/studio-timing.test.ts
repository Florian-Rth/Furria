import { describe, expect, it } from 'vitest';
import { countCellsOf } from './studio-timing';

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
