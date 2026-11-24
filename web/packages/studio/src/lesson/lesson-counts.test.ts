import { describe, expect, it } from 'vitest';
import { cellIndexAtSeconds, eightPlaceOf, stepCountsOf } from './lesson-counts';

describe('stepCountsOf', () => {
  it.each([
    {
      counts: [1, 2, 3, 4, 5, 6, 7, 8, 1, 2],
      expected: [
        [1, 2, 3, 4, 5, 6, 7, 8],
        [1, 2],
      ],
    },
    {
      counts: [5, 6, 7, 8, 1, 2, 3],
      expected: [
        [5, 6, 7, 8],
        [1, 2, 3],
      ],
    },
  ])('splits $counts into eights at every count 1', ({ counts, expected }) => {
    const marks = counts.map((count, index) => ({ seconds: index / 2, count }));

    expect(stepCountsOf(marks, { start: 0, end: 100 }).groups).toEqual(expected);
  });
});

describe('cellIndexAtSeconds', () => {
  it.each([
    { seconds: 0.2, expected: -1 },
    { seconds: 1.4, expected: 1 },
  ])('finds the count sounding at $seconds s', ({ seconds, expected }) => {
    const { cells } = stepCountsOf(
      [
        { seconds: 0.5, count: 1 },
        { seconds: 1, count: 2 },
        { seconds: 1.5, count: 3 },
      ],
      { start: 0, end: 2 },
    );

    expect(cellIndexAtSeconds(cells, seconds)).toBe(expected);
  });
});

describe('eightPlaceOf', () => {
  it.each([
    { index: 3, expected: { eight: 1, eights: 3 } },
    { index: 4, expected: { eight: 2, eights: 3 } },
    { index: 13, expected: null },
  ])('places count index $index in its eight', ({ index, expected }) => {
    const counts = [5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8, 1];
    const { cells } = stepCountsOf(
      counts.map((count, position) => ({ seconds: position / 2, count })),
      { start: 0, end: 100 },
    );

    expect(eightPlaceOf(cells, index)).toEqual(expected);
  });
});
