import { describe, expect, it } from 'vitest';
import { countGroupsOf, eightPlaceOf, markIndexAt, stepMarksOf } from './lesson-counts';

describe('stepMarksOf', () => {
  it.each([
    { range: { start: 1, end: 3 }, expected: [1, 1.5, 2, 2.5] },
    { range: { start: 0.9, end: 1.5 }, expected: [1] },
    { range: null, expected: [] },
  ])('keeps the counts from the start up to the end of $range', ({ range, expected }) => {
    const marks = [0.5, 1, 1.5, 2, 2.5, 3].map((seconds, index) => ({
      seconds,
      count: (index % 8) + 1,
    }));

    expect(stepMarksOf(marks, range).map((mark) => mark.seconds)).toEqual(expected);
  });
});

describe('countGroupsOf', () => {
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
    { counts: [], expected: [] },
  ])('splits $counts into eights at every count 1', ({ counts, expected }) => {
    const marks = counts.map((count, index) => ({ seconds: index / 2, count }));

    expect(countGroupsOf(marks)).toEqual(expected);
  });
});

describe('markIndexAt', () => {
  it.each([
    { seconds: 0.2, expected: -1 },
    { seconds: 1, expected: 1 },
    { seconds: 1.4, expected: 1 },
    { seconds: 9, expected: 2 },
  ])('finds the count sounding at $seconds s', ({ seconds, expected }) => {
    const marks = [
      { seconds: 0.5, count: 1 },
      { seconds: 1, count: 2 },
      { seconds: 1.5, count: 3 },
    ];

    expect(markIndexAt(marks, seconds)).toBe(expected);
  });
});

describe('eightPlaceOf', () => {
  it.each([
    { index: -1, expected: null },
    { index: 0, expected: { eight: 1, eights: 3 } },
    { index: 3, expected: { eight: 1, eights: 3 } },
    { index: 4, expected: { eight: 2, eights: 3 } },
    { index: 12, expected: { eight: 3, eights: 3 } },
    { index: 13, expected: null },
  ])('places count index $index in its eight', ({ index, expected }) => {
    const groups = [[5, 6, 7, 8], [1, 2, 3, 4, 5, 6, 7, 8], [1]];

    expect(eightPlaceOf(groups, index)).toEqual(expected);
  });
});
