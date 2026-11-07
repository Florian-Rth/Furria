import { describe, expect, it } from 'vitest';
import { bordersInRangeOf, chosenBorderOf, neighbourBorderOf, tapMarksOf } from './setup-borders';

const counts = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4].map((seconds, index) => ({
  seconds,
  count: (index % 8) + 1,
}));

describe('tapMarksOf', () => {
  it.each([
    [[], 1, 4, 2.1, [1, 2]],
    [[0, 1], 1, 4, 2.1, [2]],
    [[0], 0, 4, 1.4, [1.5]],
    [[0, 1.5], 0, 4, 1.4, []],
    [[0], 1, 4, 0.9, [1]],
    [[0], 1, 4, 3.9, []],
    [[0], 1, 3, 2.1, [1, 2, 3]],
    [[0, 1, 3], 1, 3, 2.1, [2]],
    [[0], 1, 3, 3.4, [1, 3.5]],
  ])('starts %o, video %s–%s, tap %s → %o', (starts, videoStart, videoEnd, seconds, marks) => {
    expect(tapMarksOf({ starts, counts, videoStart, videoEnd, seconds, length: 4 })).toEqual(marks);
  });
});

const steps = [
  { stepId: 1, name: '', start: 0, end: 2 },
  { stepId: 2, name: '', start: 2, end: 5 },
  { stepId: 3, name: '', start: 5, end: 9 },
  { stepId: 4, name: '', start: 9, end: 12 },
];

describe('bordersInRangeOf', () => {
  it('lists the borders inside the range, edges included', () => {
    expect(bordersInRangeOf(steps, { start: 2, end: 9 }).map((border) => border.seconds)).toEqual([
      2, 5, 9,
    ]);
    expect(bordersInRangeOf(steps, { start: 5.5, end: 8 })).toEqual([]);
  });
});

describe('chosenBorderOf / neighbourBorderOf', () => {
  const borders = bordersInRangeOf(steps, { start: 0, end: 12 });

  it('falls back to the first border and walks to neighbours', () => {
    expect(chosenBorderOf(borders, null)?.seconds).toBe(2);
    expect(chosenBorderOf(borders, 'border-2')?.seconds).toBe(5);
    expect(neighbourBorderOf(borders, 'border-2', 1)?.seconds).toBe(9);
    expect(neighbourBorderOf(borders, 'border-3', 1)).toBeNull();
    expect(neighbourBorderOf(borders, null, -1)).toBeNull();
  });
});
