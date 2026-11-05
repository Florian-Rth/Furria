import { describe, expect, it } from 'vitest';
import {
  alignMove,
  snapAngle,
  snapDirection,
  snapToGrid,
  snapToTargets,
  thresholdInCm,
} from './plan-snap';

describe('snapToGrid', () => {
  it('rounds to the nearest 10 cm', () => {
    expect(snapToGrid({ x: 14, y: -16 })).toEqual({ x: 10, y: -20 });
  });
});

describe('snapAngle', () => {
  it.each([
    [7, 0],
    [8, 15],
    [-8, 345],
    [358, 0],
  ])('snaps %i° to %i°', (raw, expected) => {
    expect(snapAngle(raw)).toBe(expected);
  });
});

describe('snapDirection', () => {
  it('keeps the length and turns to the nearest 45°', () => {
    const snapped = snapDirection({ x: 0, y: 0 }, { x: 100, y: 10 });

    expect(snapped.x).toBeCloseTo(Math.hypot(100, 10));
    expect(snapped.y).toBeCloseTo(0);
  });
});

describe('thresholdInCm', () => {
  it.each([
    [8, 0.5, 16],
    [8, 0, 0],
  ])('%i px at %f px/cm is %i cm', (pixels, scale, expected) => {
    expect(thresholdInCm(pixels, scale)).toBe(expected);
  });
});

describe('alignMove', () => {
  const moving = { minX: 0, minY: 0, maxX: 100, maxY: 50 };
  const other = { minX: 300, minY: 200, maxX: 400, maxY: 250 };

  it('pulls the moved edge onto a nearby edge and draws a guide', () => {
    const aligned = alignMove(moving, { x: 296, y: 0 }, [other], 10);

    expect(aligned.delta).toEqual({ x: 300, y: 0 });
    expect(aligned.guides).toEqual([{ axis: 'x', at: 300, from: 0, to: 250 }]);
  });

  it('leaves a move alone when nothing is near', () => {
    expect(alignMove(moving, { x: 150, y: 100 }, [other], 10)).toEqual({
      delta: { x: 150, y: 100 },
      guides: [],
    });
  });
});

describe('snapToTargets', () => {
  const corners = [{ x: 100, y: 100 }];
  const segments = [{ from: { x: 0, y: 0 }, to: { x: 0, y: 500 } }];

  it.each([
    [{ x: 104, y: 97 }, 'corner', { x: 100, y: 100 }],
    [{ x: 6, y: 251 }, 'edge', { x: 0, y: 251 }],
    [{ x: 53, y: 47 }, 'grid', { x: 50, y: 50 }],
  ])('snaps %o to a %s', (point, target, expected) => {
    expect(snapToTargets(point, corners, segments, 10)).toEqual({ point: expected, target });
  });

  it('stays free without a grid', () => {
    expect(snapToTargets({ x: 53, y: 47 }, [], [], 10, null)).toEqual({
      point: { x: 53, y: 47 },
      target: 'free',
    });
  });
});
