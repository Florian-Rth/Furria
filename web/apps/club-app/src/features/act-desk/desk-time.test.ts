import { describe, expect, it } from 'vitest';
import {
  beatSecondsOf,
  canZoomOf,
  countPlaceAt,
  countsBetweenOf,
  followLeftOf,
  glidedLeftOf,
  musicTicksOf,
  neighbourCountOf,
  rulerTicksOf,
  zoomedOf,
  zoomRangeOf,
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

describe('zoom', () => {
  const range = zoomRangeOf(100, 1000, 0.5);

  it('spans from the whole act to a single count', () => {
    expect(range).toEqual({ min: 10, max: 128 });
  });

  it.each([
    [10, 1, 16],
    [100, 1, 128],
    [16, -1, 10],
    [10, -1, 10],
  ] as const)('steps %d by %d', (current, direction, expected) => {
    expect(zoomedOf(current, direction, range)).toBeCloseTo(expected);
  });

  it.each([
    [10, 1, true],
    [10, -1, false],
    [128, 1, false],
    [128, -1, true],
  ] as const)('can zoom from %d by %d', (current, direction, expected) => {
    expect(canZoomOf(current, direction, range)).toBe(expected);
  });

  it.each([
    [0, 100, 0],
    [20, 100, 2000],
  ])('centres the playhead at %ds', (seconds, perSecond, expected) => {
    expect(followLeftOf(seconds, perSecond)).toBe(expected);
  });

  it.each([
    [0, 100, 30],
    [99, 100, 100],
    [100, 0, 70],
  ])('glides from %d towards %d', (current, target, expected) => {
    expect(glidedLeftOf(current, target)).toBeCloseTo(expected);
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
    const ticks = musicTicksOf(marksOf(32, 0.5), 16, 5);
    expect(ticks.map((tick) => [tick.strong, tick.text])).toEqual([
      [true, '1'],
      [true, '2'],
      [true, '3'],
      [true, '4'],
    ]);
  });

  it('numbers every count when zoomed in', () => {
    const ticks = musicTicksOf(marksOf(9, 0.5), 4.5, 60);
    expect(ticks.map((tick) => tick.text)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '2']);
  });

  it('counts the first eight even when the music starts mid-eight', () => {
    const ticks = musicTicksOf(marksOf(6, 0.5, 5), 3, 60);
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
