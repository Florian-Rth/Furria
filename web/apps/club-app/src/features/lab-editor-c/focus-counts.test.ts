import { describe, expect, it } from 'vitest';
import { countCellsOf, countEightsOf, countStepOf, currentCellOf } from './focus-counts';

const marks = Array.from({ length: 20 }, (_, index) => ({
  seconds: index * 0.5,
  count: (index % 8) + 1,
}));

describe('countCellsOf', () => {
  it('keeps the counts inside the step, numbering its eights', () => {
    const cells = countCellsOf(marks, { start: 1, end: 6 });

    expect(cells.map((cell) => [cell.seconds, cell.eight])).toEqual([
      [1, 1],
      [1.5, 1],
      [2, 1],
      [2.5, 1],
      [3, 1],
      [3.5, 1],
      [4, 1],
      [4.5, 1],
      [5, 2],
      [5.5, 2],
    ]);
  });

  it('is empty without a range', () => {
    expect(countCellsOf(marks, null)).toEqual([]);
  });
});

describe('countEightsOf', () => {
  it('groups cells by eight', () => {
    const eights = countEightsOf(countCellsOf(marks, { start: 0, end: 10 }));

    expect(eights.map((eight) => [eight.number, eight.cells.length])).toEqual([
      [1, 8],
      [2, 8],
      [3, 4],
    ]);
  });
});

describe('currentCellOf', () => {
  const cells = countCellsOf(marks, { start: 1, end: 3 });

  it.each([
    { seconds: 0.5, expected: -1 },
    { seconds: 1, expected: 0 },
    { seconds: 1.7, expected: 1 },
    { seconds: 2.9, expected: 3 },
  ])('at $seconds is $expected', ({ seconds, expected }) => {
    expect(currentCellOf(cells, seconds)).toBe(expected);
  });
});

describe('countStepOf', () => {
  it.each([
    { seconds: 1, direction: 1 as const, expected: 1.5 },
    { seconds: 1.2, direction: -1 as const, expected: 1 },
    { seconds: 1, direction: -1 as const, expected: 0.5 },
    { seconds: 9.5, direction: 1 as const, expected: null },
    { seconds: 0, direction: -1 as const, expected: null },
  ])('from $seconds by $direction', ({ seconds, direction, expected }) => {
    expect(countStepOf(marks, seconds, direction)).toBe(expected);
  });
});
