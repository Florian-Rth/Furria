import { describe, expect, it } from 'vitest';
import {
  centreBoundsOf,
  centreOffsetOf,
  centrePxPerSecondOf,
  centreScaleOf,
  centreSecondsOf,
  centreZoomLimitsOf,
  handleTargetsOf,
  STRIP_PITCH,
  secondsAtX,
  snapCandidatesOf,
  snapSecondsOf,
  stripBarCountOf,
  stripChunkOf,
  stripOutrunOf,
  stripSharesOf,
  stripWindowOf,
} from './centre-scrub';

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

describe('secondsAtX', () => {
  it.each([
    { x: 195, expected: 12.5 },
    { x: -1000, expected: 0 },
    { x: 99_999, expected: 180 },
  ])('reads the music second under $x px', ({ x, expected }) => {
    expect(secondsAtX(x, -305, 40, 180)).toBe(expected);
  });
});

describe('centreBoundsOf', () => {
  it('lets the start and the end of the music reach the centre line', () => {
    expect(centreBoundsOf(180, 40, 195)).toEqual({ min: 195 - 7200, max: 195 });
  });
});

describe('centreZoomLimitsOf', () => {
  it.each([
    { length: 180, width: 360, expected: { min: 2, max: 480 } },
    { length: 0, width: 360, expected: { min: 1, max: 480 } },
    { length: 0.5, width: 360, expected: { min: 720, max: 720 } },
  ])('fits $length s into $width px at the widest', ({ length, width, expected }) => {
    expect(centreZoomLimitsOf(length, width)).toEqual(expected);
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

    expect(strip.start % STRIP_PITCH).toBe(0);
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

describe('stripSharesOf / stripBarCountOf', () => {
  it('reads the window as shares of the music and as wave bars', () => {
    const strip = { start: 1800, width: 3600 };

    expect(stripSharesOf(strip, 7200)).toEqual({ start: 0.25, end: 0.75 });
    expect(stripBarCountOf(strip)).toBe(900);
  });

  it('shows the whole music while nothing is measured', () => {
    expect(stripSharesOf({ start: 0, width: 0 }, 0)).toEqual({ start: 0, end: 1 });
  });
});

describe('snapCandidatesOf', () => {
  const marks = [
    { seconds: 0, count: 1 },
    { seconds: 0.5, count: 2 },
    { seconds: 1, count: 3 },
    { seconds: 4, count: 1 },
  ];

  it.each([
    { pxPerSecond: 40, expected: [0, 0.5, 1, 4] },
    { pxPerSecond: 4, expected: [0, 4] },
  ])(
    'snaps to every count only when counts are apart at $pxPerSecond px/s',
    ({ pxPerSecond, expected }) => {
      expect(snapCandidatesOf(marks, pxPerSecond)).toEqual(expected);
    },
  );
});

describe('snapSecondsOf', () => {
  it.each([
    { seconds: 1.2, expected: { seconds: 1, snapped: true } },
    { seconds: 1.6, expected: { seconds: 1.6, snapped: false } },
    { seconds: 3.9, expected: { seconds: 4, snapped: true } },
  ])('pulls $seconds s to a count within the snap distance', ({ seconds, expected }) => {
    expect(snapSecondsOf(seconds, [0, 1, 4], 40)).toEqual(expected);
  });
});

describe('handleTargetsOf', () => {
  it('places each handle over the full height at its second, the active one selected', () => {
    expect(
      handleTargetsOf(
        [
          { key: 'start', seconds: 2 },
          { key: 'end', seconds: 10 },
        ],
        -100,
        40,
        200,
        'end',
      ),
    ).toEqual([
      { id: 'start', x: -21, y: 0, width: 2, height: 200, priority: 0, selected: false },
      { id: 'end', x: 299, y: 0, width: 2, height: 200, priority: 0, selected: true },
    ]);
  });
});
