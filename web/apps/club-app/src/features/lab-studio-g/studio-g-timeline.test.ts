import { describe, expect, it } from 'vitest';
import {
  clampedZoomOf,
  countReadingAt,
  rulerOf,
  scrubbedSecondsOf,
  snappedToCountOf,
} from './studio-g-timeline';

const marks = Array.from({ length: 24 }, (_, index) => ({
  seconds: index * 0.5,
  count: (index % 8) + 1,
}));

describe('studio-g timeline', () => {
  it.each([
    [1, 3],
    [50, 50],
    [1000, 240],
  ])('clamps zoom %d to %d', (wanted, expected) => {
    expect(clampedZoomOf(wanted)).toBe(expected);
  });

  it.each([
    [10, 20, 10, 8],
    [10, -100, 10, 12],
    [1, 50, 10, 0],
  ])('scrubs from %d by %d px', (start, delta, pps, expected) => {
    expect(scrubbedSecondsOf(start, delta, pps, 12)).toBe(expected);
  });

  it('labels every eight when there is room and thins labels and counts when zoomed out', () => {
    const near = rulerOf(marks, 40);
    const far = rulerOf(marks, 4);

    expect(near.labels.map((label) => label.eight)).toEqual([1, 2, 3]);
    expect(near.ticks).toHaveLength(24);
    expect(far.labels.map((label) => label.eight)).toEqual([1, 3]);
    expect(far.ticks.map((tick) => tick.weight)).toEqual(['eight', 'eight', 'eight']);
  });

  it.each([
    [2.1, 0.2, 2],
    [2.3, 0.2, 2.3],
  ])('snaps %d within %d to the nearest count', (seconds, tolerance, expected) => {
    expect(snappedToCountOf(seconds, marks, tolerance)).toBe(expected);
  });

  it.each([
    [0, { eight: 1, count: 1 }],
    [4.6, { eight: 2, count: 2 }],
    [-1, null],
  ])('reads the count at %d', (seconds, expected) => {
    expect(countReadingAt(marks, seconds)).toEqual(expected);
  });
});
