import { describe, expect, it } from 'vitest';
import {
  centreBoundsOf,
  centreOffsetOf,
  centrePxPerSecondOf,
  centreScaleOf,
  centreSecondsOf,
  momentumTargetOf,
  stripChunkOf,
  stripOutrunOf,
  stripWindowOf,
} from './centre-view';
import { BAR_PITCH } from './timeline-layers';

describe('centreOffsetOf / centreSecondsOf', () => {
  it('puts the given second under the centre line and reads it back', () => {
    const offset = centreOffsetOf(12.5, 40, 195);

    expect(offset).toBe(-305);
    expect(centreSecondsOf(offset, 40, 195, 180)).toBe(12.5);
  });

  it.each([
    { offset: 400, expected: 0 },
    { offset: -20_000, expected: 180 },
  ])('clamps a rubber-banded offset $offset to the music', ({ offset, expected }) => {
    expect(centreSecondsOf(offset, 40, 195, 180)).toBe(expected);
  });
});

describe('centreBoundsOf', () => {
  it('lets the start and the end of the music reach the centre line', () => {
    expect(centreBoundsOf(180, 40, 195)).toEqual({ min: 195 - 7200, max: 195 });
  });
});

describe('momentumTargetOf', () => {
  it.each([
    { velocity: -1000, expected: -640 },
    { velocity: 0, expected: -40 },
  ])('projects a release at $velocity px/s ahead of the finger', ({ velocity, expected }) => {
    expect(momentumTargetOf(-40, { velocity, power: 0.6 })).toBe(expected);
  });
});

describe('centrePxPerSecondOf', () => {
  it.each([
    { chosen: 2, expected: 2.5 },
    { chosen: 900, expected: 480 },
    { chosen: 120, expected: 120 },
  ])('settles $chosen within the zoom limits', ({ chosen, expected }) => {
    expect(centrePxPerSecondOf(chosen, { min: 2.5, max: 480 })).toBe(expected);
  });
});

describe('centreScaleOf', () => {
  it.each([
    { scale: 2, expected: 2 },
    { scale: 100, expected: 12 },
    { scale: 0.01, expected: 0.0625 },
  ])('keeps a pinch scale of $scale inside the zoom limits', ({ scale, expected }) => {
    expect(centreScaleOf(40, scale, { min: 2.5, max: 480 })).toBe(expected);
  });
});

describe('stripWindowOf', () => {
  it.each([0, 800, 1600, 4321, 7100])(
    'covers at least two widths on each side of %i px, within the music',
    (nowPx) => {
      const strip = stripWindowOf(stripChunkOf(nowPx, 390), 390, 7200);

      expect(strip.start).toBeLessThanOrEqual(Math.max(0, nowPx - 780));
      expect(strip.start + strip.width).toBeGreaterThanOrEqual(Math.min(7200, nowPx + 780));
      expect(strip.start + strip.width).toBeLessThanOrEqual(7200);
    },
  );

  it('moves in whole bar steps so the wave never shifts', () => {
    const strip = stripWindowOf(stripChunkOf(5000, 391), 391, 100_000);

    expect(strip.start % BAR_PITCH).toBe(0);
  });
});

describe('stripOutrunOf', () => {
  const strip = { start: 780, width: 2340 };

  it.each([
    { nowPx: 1950, expected: false },
    { nowPx: 1200, expected: false },
    { nowPx: 1100, expected: true },
    { nowPx: 2800, expected: true },
    { nowPx: 500, expected: true },
  ])('asks for a new window at $nowPx px: $expected', ({ nowPx, expected }) => {
    expect(stripOutrunOf(strip, nowPx, 390, 7200)).toBe(expected);
  });

  it('keeps the window at the start and the end of the music', () => {
    expect(stripOutrunOf({ start: 0, width: 1560 }, 10, 390, 7200)).toBe(false);
    expect(stripOutrunOf({ start: 6240, width: 960 }, 7190, 390, 7200)).toBe(false);
  });
});
