import { describe, expect, it } from 'vitest';
import {
  fitView,
  followViewToSeconds,
  panBoundsOf,
  secondsOfX,
  snapSecondsOf,
  xOfSeconds,
  zoomedView,
  zoomLimitsOf,
} from './timeline-view';

describe('xOfSeconds and secondsOfX', () => {
  it.each([
    [{ pxPerSecond: 10, offsetPx: 0 }, 3, 30],
    [{ pxPerSecond: 10, offsetPx: -50 }, 8, 30],
    [{ pxPerSecond: 2.5, offsetPx: 20 }, 4, 30],
  ])('places %j second %s at %s', (view, seconds, x) => {
    expect(xOfSeconds(seconds, view)).toBe(x);
    expect(secondsOfX(x, view)).toBe(seconds);
  });
});

describe('zoomLimitsOf', () => {
  it.each([
    [120, 360, { min: 3, max: 480 }],
    [0, 360, { min: 1, max: 480 }],
    [1, 1000, { min: 1000, max: 1000 }],
  ])('limits %s s on %s px', (length, width, limits) => {
    expect(zoomLimitsOf(length, width)).toEqual(limits);
  });
});

describe('fitView', () => {
  it('shows the whole music', () => {
    expect(fitView(120, 360)).toEqual({ pxPerSecond: 3, offsetPx: 0 });
  });
});

describe('panBoundsOf', () => {
  it.each([
    [
      { pxPerSecond: 3, offsetPx: 0 },
      { min: 0, max: 0 },
    ],
    [
      { pxPerSecond: 10, offsetPx: 0 },
      { min: -840, max: 0 },
    ],
  ])('bounds %j', (view, bounds) => {
    expect(panBoundsOf(view, 120, 360)).toEqual(bounds);
  });
});

describe('zoomedView', () => {
  const limits = { min: 2, max: 40 };

  it.each([
    [2, 100, { pxPerSecond: 20, offsetPx: -100 }],
    [10, 100, { pxPerSecond: 40, offsetPx: -300 }],
    [0.01, 0, { pxPerSecond: 2, offsetPx: 0 }],
  ])('scales by %s around %s px', (scale, focal, view) => {
    expect(zoomedView({ pxPerSecond: 10, offsetPx: 0 }, scale, focal, limits)).toEqual(view);
  });

  it('keeps the second under the fingers', () => {
    const before = { pxPerSecond: 10, offsetPx: -40 };
    const after = zoomedView(before, 1.7, 130, limits);

    expect(secondsOfX(130, after)).toBeCloseTo(secondsOfX(130, before));
  });
});

describe('snapSecondsOf', () => {
  const view = { pxPerSecond: 100, offsetPx: 0 };

  it.each([
    [1.05, { seconds: 1, snapped: true }],
    [1.2, { seconds: 1.2, snapped: false }],
    [1.44, { seconds: 1.5, snapped: true }],
  ])('snaps %s', (seconds, result) => {
    expect(snapSecondsOf(seconds, [0.5, 1, 1.5], view)).toEqual(result);
  });
});

describe('followViewToSeconds', () => {
  const view = { pxPerSecond: 10, offsetPx: 0 };

  it.each([
    [10, view],
    [40, { pxPerSecond: 10, offsetPx: -380 }],
  ])('follows %s s', (seconds, next) => {
    expect(followViewToSeconds(view, seconds, 300, 20)).toEqual(next);
  });
});
