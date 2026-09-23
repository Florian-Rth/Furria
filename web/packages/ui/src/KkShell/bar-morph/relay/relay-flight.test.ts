import { describe, expect, it } from 'vitest';
import {
  backOut,
  bezierAt,
  controlOf,
  echoAt,
  fitScaleOf,
  handInAt,
  handOffAt,
  landingGlowAt,
  markDropInAt,
  markShoulderInAt,
  markTumbleAt,
  passInAt,
  passOutAt,
  spanOf,
  textHandoverAt,
  textPlacementOf,
  textSpotAt,
  travelOf,
} from './relay-flight';

const FLIGHT = {
  from: { x: 40, y: 200, glyph: 56 },
  to: { x: 69, y: 50, glyph: 22 },
  control: { x: 100, y: 125 },
};

describe('spanOf', () => {
  it.each([
    [0.1, 0.2, 0.6, 0],
    [0.4, 0.2, 0.6, 0.5],
    [0.9, 0.2, 0.6, 1],
  ])('progress %d in %d..%d → %d', (progress, start, end, span) => {
    expect(spanOf(progress, start, end)).toBeCloseTo(span);
  });
});

describe('backOut', () => {
  it.each([
    [0, 0],
    [1, 1],
  ])('%d → %d', (amount, eased) => {
    expect(backOut(amount, 1.5)).toBeCloseTo(eased);
  });

  it('overshoots before settling', () => {
    expect(backOut(0.8, 1.5)).toBeGreaterThan(1);
  });
});

describe('bezierAt', () => {
  it('passes the middle of the curve halfway', () => {
    expect(bezierAt({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 0 }, 0.5)).toEqual({
      x: 10,
      y: 5,
    });
  });
});

describe('controlOf', () => {
  it('hops over a short distance', () => {
    expect(controlOf({ x: 60, y: 50 }, { x: 69, y: 50 }, 'swoop')).toEqual({ x: 64.5, y: 32 });
  });

  it('drops along a gentle curve', () => {
    expect(controlOf({ x: 69, y: 50 }, { x: 40, y: 200 }, 'toss').y).toBe(117.5);
  });

  it('swoops to the right of a climb', () => {
    expect(controlOf({ x: 40, y: 200 }, { x: 69, y: 50 }, 'swoop').x).toBeGreaterThan(69);
  });
});

describe('textSpotAt', () => {
  it('starts on the source anchor', () => {
    expect(textSpotAt(FLIGHT, 0)).toEqual({ x: 40, y: 200, glyph: 56 });
  });

  it('lands on the target anchor', () => {
    const spot = textSpotAt(FLIGHT, 1);

    expect([spot.x, spot.y, spot.glyph]).toEqual([69, 50, 22]);
  });

  it('crouches before launch', () => {
    expect(textSpotAt(FLIGHT, 0.02).y).toBeGreaterThan(200);
  });
});

describe('textHandoverAt', () => {
  it.each([
    [0, 1, 0],
    [1, 0, 1],
  ])('progress %d → source %d, target %d', (progress, source, target) => {
    expect(textHandoverAt(progress)).toEqual({ source, target });
  });
});

describe('echoAt', () => {
  it('stays hidden until its lag has passed', () => {
    expect(echoAt(0.06, 1)).toEqual({ progress: 0, opacity: 0 });
  });

  it('trails behind the flight', () => {
    expect(echoAt(0.5, 0).progress).toBeCloseTo(0.465);
  });

  it('fades weaker the further back it trails', () => {
    expect(echoAt(0.5, 2).opacity).toBeLessThan(echoAt(0.5, 0).opacity);
  });
});

describe('landingGlowAt', () => {
  it.each([
    [0.5, 1, 0],
    [1, 1.1, 0],
  ])('progress %d → scale %d, opacity %d', (progress, scale, opacity) => {
    const glow = landingGlowAt(progress);

    expect([glow.scale, glow.opacity]).toEqual([scale, opacity]);
  });

  it('flashes right after landing', () => {
    expect(landingGlowAt(0.86).opacity).toBeGreaterThan(0.3);
  });
});

describe('mark and label offsets', () => {
  it.each([
    ['tumble start', markTumbleAt(0), { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }],
    ['tumble end', markTumbleAt(1), { x: 22, y: 70, rotate: 210, scale: 0.65, opacity: 0 }],
    ['shoulder end', markShoulderInAt(1), { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }],
    ['drop end', markDropInAt(1), { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }],
    ['hand off end', handOffAt(1), { x: -24, y: 0, rotate: 0, scale: 0.86, opacity: 0 }],
    ['hand in end', handInAt(1), { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }],
    ['pass out end', passOutAt(1, -1), { x: -56, y: 0, rotate: 0, scale: 1, opacity: 0 }],
    ['pass in end', passInAt(1, -1), { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }],
  ])('%s', (_name, offset, expected) => {
    expect(offset.x).toBeCloseTo(expected.x);
    expect(offset.y).toBeCloseTo(expected.y);
    expect(offset.rotate).toBeCloseTo(expected.rotate);
    expect(offset.scale).toBeCloseTo(expected.scale);
    expect(offset.opacity).toBeCloseTo(expected.opacity);
  });

  it('shoulders the arrow in from the left', () => {
    expect(markShoulderInAt(0.16).x).toBeLessThan(0);
  });

  it('passes the incoming title in against the travel direction', () => {
    expect(passInAt(0.2, -1).x).toBeGreaterThan(0);
  });
});

describe('textPlacementOf', () => {
  it('centres the first line on the spot at the flown size', () => {
    expect(textPlacementOf({ x: 10, y: 100, glyph: 28 }, { glyph: 56, lineHeight: 60 })).toEqual({
      x: 10,
      y: 85,
      scale: 0.5,
    });
  });
});

describe('travelOf', () => {
  it.each([
    [0, 0],
    [1, 1],
  ])('progress %d → %d', (progress, travel) => {
    expect(travelOf(progress)).toBeCloseTo(travel);
  });

  it('launches promptly', () => {
    expect(travelOf(0.2)).toBeGreaterThan(0.4);
  });

  it('overshoots the landing', () => {
    expect(travelOf(0.9)).toBeGreaterThan(1);
  });
});

describe('fitScaleOf', () => {
  it.each([
    [1.5, 20, 100, 390, 1.5],
    [2.5, 20, 200, 390, 1.77],
  ])('scale %d at %d with width %d in %d → %d', (scale, left, width, viewport, fitted) => {
    expect(fitScaleOf(scale, left, width, viewport)).toBeCloseTo(fitted);
  });
});
