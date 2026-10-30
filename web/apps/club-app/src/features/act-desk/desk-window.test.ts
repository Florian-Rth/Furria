import { describe, expect, it } from 'vitest';
import { pannedCentreOf, resizedFrameOf, windowOf, windowSharesOf } from './desk-window';

describe('windowOf', () => {
  it.each([
    [0, 10, 200, { start: -10, end: 10 }],
    [500, 10, 200, { start: 40, end: 60 }],
    [500, 0, 200, { start: 0, end: 0 }],
  ])('reads the window at scroll %d and %d px per second', (left, perSecond, visible, expected) => {
    expect(windowOf(left, perSecond, visible)).toEqual(expected);
  });
});

describe('windowSharesOf', () => {
  it.each([
    [{ start: -10, end: 10 }, 100, { start: 0, end: 0.1 }],
    [{ start: 90, end: 110 }, 100, { start: 0.9, end: 1 }],
    [{ start: 10, end: 20 }, 0, { start: 0, end: 0 }],
  ])('places %o on the whole act', (window, length, expected) => {
    expect(windowSharesOf(window, length)).toEqual(expected);
  });
});

describe('resizedFrameOf', () => {
  const window = { start: 20, end: 40 };

  it.each([
    ['end', 60, { perSecond: 5, centre: 40 }],
    ['start', 30, { perSecond: 20, centre: 35 }],
    ['start', 39.8, { perSecond: 200, centre: 39.5 }],
    ['end', 500, { perSecond: 2.5, centre: 60 }],
  ] as const)('drags the %s edge to %ds', (side, seconds, expected) => {
    const frame = resizedFrameOf(window, side, seconds, 100, 200);
    expect(frame.perSecond).toBeCloseTo(expected.perSecond);
    expect(frame.centre).toBeCloseTo(expected.centre);
  });

  it('measures from the part of the window that lies on the act', () => {
    const frame = resizedFrameOf({ start: -10, end: 10 }, 'end', 20, 100, 200);
    expect(frame).toEqual({ perSecond: 10, centre: 10 });
  });
});

describe('pannedCentreOf', () => {
  it.each([
    [1, 35],
    [-1, 25],
  ] as const)('pans a quarter window going %d', (direction, expected) => {
    expect(pannedCentreOf({ start: 20, end: 40 }, direction, 100)).toBe(expected);
  });

  it.each([
    [{ start: -10, end: 4 }, -1, 0],
    [{ start: 95, end: 115 }, 1, 100],
  ] as const)('stays on the act', (window, direction, expected) => {
    expect(pannedCentreOf(window, direction, 100)).toBe(expected);
  });
});
