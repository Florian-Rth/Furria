import { describe, expect, it } from 'vitest';
import {
  nearestRailOffset,
  railBoundsOf,
  railItemAt,
  railItemPlaying,
  railItemsOf,
  railOffsetOf,
} from './rail-layout';

const stepOf = (stepId: number, start: number | null, end: number | null) => ({
  stepId,
  name: `Schritt ${stepId}`,
  description: null,
  startSeconds: start,
  endSeconds: end,
  placement: start === null ? ('musicMissing' as const) : ('onTimeline' as const),
});

const items = railItemsOf([stepOf(2, 10, 30), stepOf(1, 0, 10), stepOf(3, null, null)]);

describe('railItemsOf', () => {
  it('lays timed steps out in time order, short ones at a minimum width', () => {
    expect(items.map((item) => [item.stepId, item.left, item.width])).toEqual([
      [1, 0, 92],
      [2, 92, 180],
    ]);
  });
});

describe('railOffsetOf and railBoundsOf', () => {
  it('centres a step and bounds the rail between the first and last centre', () => {
    const [first] = items;
    if (first === undefined) {
      throw new Error('first');
    }

    expect(railOffsetOf(first, 300)).toBe(104);
    expect(railBoundsOf(items, 300)).toEqual({ min: -32, max: 104 });
    expect(railBoundsOf([], 300)).toEqual({ min: 0, max: 0 });
  });
});

describe('railItemAt', () => {
  it.each([
    [10, 1],
    [140, 2],
    [500, null],
  ])('at %s px finds step %s', (x, stepId) => {
    expect(railItemAt(items, x)?.stepId ?? null).toBe(stepId);
  });
});

describe('nearestRailOffset', () => {
  it.each([
    [60, 104],
    [-60, -32],
    [-20, -32],
  ])('settles %s on %s', (offset, settled) => {
    expect(nearestRailOffset(items, 300, offset)).toBe(settled);
  });
});

describe('railItemPlaying', () => {
  it.each([
    [5, 1],
    [10, 2],
    [31, null],
  ])('at %s s plays step %s', (seconds, stepId) => {
    expect(railItemPlaying(items, seconds)?.stepId ?? null).toBe(stepId);
  });
});
