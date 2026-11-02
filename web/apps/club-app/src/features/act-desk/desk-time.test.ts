import { describe, expect, it } from 'vitest';
import {
  beatSecondsOf,
  countPlaceAt,
  countsBetweenOf,
  musicTicksOf,
  neighbourCountOf,
  rulerTicksOf,
} from './desk-time';

const marksOf = (beats: number, beat: number, firstCount = 1) =>
  Array.from({ length: beats }, (_, index) => ({
    seconds: index * beat,
    count: ((index + firstCount - 1) % 8) + 1,
  }));

describe('beatSecondsOf', () => {
  it.each([
    [marksOf(16, 0.5), 0.5],
    [marksOf(9, 0.4), 0.4],
    [[], 0.5],
  ])('finds the typical beat', (marks, expected) => {
    expect(beatSecondsOf(marks)).toBeCloseTo(expected);
  });
});

describe('rulerTicksOf', () => {
  it.each([
    [55, 10, 6, '0:50'],
    [60, 100, 61, '1:00'],
  ])('labels %ds at %d px per second', (length, perSecond, ticks, last) => {
    const result = rulerTicksOf(length, perSecond);
    expect(result).toHaveLength(ticks);
    expect(result.at(-1)?.text).toBe(last);
  });
});

describe('musicTicksOf', () => {
  it('keeps only the ones when zoomed out', () => {
    const ticks = musicTicksOf(marksOf(32, 0.5), 5);
    expect(ticks.map((tick) => [tick.strong, tick.text])).toEqual([
      [true, '1'],
      [true, '2'],
      [true, '3'],
      [true, '4'],
    ]);
  });

  it('numbers every count when zoomed in', () => {
    const ticks = musicTicksOf(marksOf(9, 0.5), 60);
    expect(ticks.map((tick) => tick.text)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '2']);
  });

  it('counts the first eight even when the music starts mid-eight', () => {
    const ticks = musicTicksOf(marksOf(6, 0.5, 5), 60);
    expect(ticks.map((tick) => tick.text)).toEqual(['5', '6', '7', '8', '2', '2']);
  });
});

describe('counts', () => {
  const marks = marksOf(24, 0.5);

  it.each([
    [0, { eight: 1, count: 1 }],
    [4.25, { eight: 2, count: 1 }],
    [7.6, { eight: 2, count: 8 }],
    [-1, null],
  ])('places %ds', (seconds, expected) => {
    expect(countPlaceAt(marks, seconds)).toEqual(expected);
  });

  it.each([
    [1, 1, 1.5],
    [1.2, 1, 1.5],
    [1.2, -1, 1],
    [0, -1, null],
    [11.5, 1, null],
  ] as const)('finds the count next to %ds going %d', (seconds, direction, expected) => {
    expect(neighbourCountOf(marks, seconds, direction)).toBe(expected);
  });

  it.each([
    [0, 4, 8],
    [1, 2.2, 3],
    [11.5, 20, 1],
  ])('counts between %d and %d', (start, end, expected) => {
    expect(countsBetweenOf(marks, start, end)).toBe(expected);
  });
});
