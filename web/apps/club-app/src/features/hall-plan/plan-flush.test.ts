import { describe, expect, it } from 'vitest';
import { flushMove, flushReachOf } from './plan-flush';
import type { Shape } from './plan-geometry';
import { rectShape } from './plan-geometry';

const box = (x: number, y: number, width = 100, height = 50, rotation = 0): Shape =>
  rectShape({ center: { x, y }, width, height, rotation });

describe('flushMove', () => {
  it.each([
    ['snaps a near table flush to its neighbour', { x: 80, y: 0 }, true, { x: 100, y: 0 }],
    ['leaves a table out of reach where it is', { x: 60, y: 0 }, true, { x: 60, y: 0 }],
    ['pushes an overlapping table back to the edge', { x: 120, y: 0 }, true, { x: 100, y: 0 }],
    ['keeps the free move without snapping', { x: 80, y: 0 }, false, { x: 80, y: 0 }],
    ['still never overlaps on a free move', { x: 120, y: 0 }, false, { x: 100, y: 0 }],
  ])('%s', (_name, delta, magnetic, expected) => {
    const moved = flushMove([box(0, 0)], delta, [box(200, 0)], 30, magnetic);

    expect(moved.x).toBeCloseTo(expected.x);
    expect(moved.y).toBeCloseTo(expected.y);
  });

  it('does not snap to a table that sits diagonally', () => {
    expect(flushMove([box(0, 0)], { x: 80, y: 60 }, [box(200, 130)], 30, true)).toEqual({
      x: 80,
      y: 60,
    });
  });

  it('snaps rotated tables along their own faces', () => {
    const moved = flushMove(
      [box(0, 0, 100, 50, 45)],
      { x: 0, y: 0 },
      [box(0, 70, 100, 50, 45)],
      30,
      true,
    );
    const gapClosed = Math.hypot(moved.x, moved.y);

    expect(gapClosed).toBeGreaterThan(0);
    expect(gapClosed).toBeLessThanOrEqual(30);
  });
});

describe('flushReachOf', () => {
  it.each([
    [1, 30],
    [0.2, 60],
    [0, 30],
  ])('at %f px/cm reaches %f cm', (scale, expected) => {
    expect(flushReachOf(scale)).toBeCloseTo(expected);
  });
});
