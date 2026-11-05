import { describe, expect, it } from 'vitest';
import type { Shape } from './plan-geometry';
import {
  angleOf,
  areBoundsApart,
  closestOnSegment,
  cornersOf,
  gapBetween,
  isPointInPolygon,
  isPointInRect,
  nearestOnPolyline,
  normalizeDegrees,
  rectShape,
  rotateAround,
  unionBounds,
} from './plan-geometry';

const square = (x: number, y: number, size: number, rotation = 0): Shape =>
  rectShape({ center: { x, y }, width: size, height: size, rotation });

describe('rotateAround', () => {
  it.each([
    [90, { x: 0, y: 10 }],
    [180, { x: -10, y: 0 }],
    [270, { x: 0, y: -10 }],
  ])('turns clockwise on screen by %i°', (degrees, expected) => {
    const turned = rotateAround({ x: 10, y: 0 }, { x: 0, y: 0 }, degrees);

    expect(turned.x).toBeCloseTo(expected.x);
    expect(turned.y).toBeCloseTo(expected.y);
  });
});

describe('normalizeDegrees / angleOf', () => {
  it.each([
    [-15, 345],
    [360, 0],
    [725, 5],
  ])('normalizes %i to %i', (raw, expected) => {
    expect(normalizeDegrees(raw)).toBe(expected);
  });

  it('measures the angle clockwise from +x', () => {
    expect(angleOf({ x: 0, y: 0 }, { x: 0, y: 5 })).toBeCloseTo(90);
  });
});

describe('cornersOf / isPointInRect', () => {
  it('rotates the corners with the rect', () => {
    const corners = cornersOf({ center: { x: 0, y: 0 }, width: 20, height: 10, rotation: 90 });

    expect(corners[0]?.x).toBeCloseTo(5);
    expect(corners[0]?.y).toBeCloseTo(-10);
  });

  it.each([
    [{ x: 0, y: 9 }, true],
    [{ x: 9, y: 0 }, false],
  ])('hits %o inside a rect turned upright: %s', (point, expected) => {
    expect(
      isPointInRect(point, { center: { x: 0, y: 0 }, width: 20, height: 10, rotation: 90 }),
    ).toBe(expected);
  });
});

describe('isPointInPolygon', () => {
  const triangle = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 0, y: 10 },
  ];

  it.each([
    [{ x: 2, y: 2 }, true],
    [{ x: 8, y: 8 }, false],
  ])('%o inside the triangle: %s', (point, expected) => {
    expect(isPointInPolygon(point, triangle)).toBe(expected);
  });
});

describe('closestOnSegment / nearestOnPolyline', () => {
  it.each([
    [
      { x: -5, y: 3 },
      { x: 0, y: 0 },
    ],
    [
      { x: 5, y: 3 },
      { x: 5, y: 0 },
    ],
    [
      { x: 15, y: 3 },
      { x: 10, y: 0 },
    ],
  ])('clamps %o onto the segment', (point, expected) => {
    expect(closestOnSegment(point, { x: 0, y: 0 }, { x: 10, y: 0 })).toEqual(expected);
  });

  it('finds the nearest leg of a polyline', () => {
    const hit = nearestOnPolyline({ x: 12, y: 5 }, [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ]);

    expect(hit).toEqual({ distance: 2, point: { x: 10, y: 5 } });
  });

  it('has no nearest point on a single point', () => {
    expect(nearestOnPolyline({ x: 0, y: 0 }, [{ x: 1, y: 1 }])).toBeNull();
  });
});

describe('gapBetween', () => {
  it.each<[string, Shape, Shape, boolean, number]>([
    ['separate squares', square(0, 0, 10), square(30, 0, 10), false, 20],
    ['touching squares', square(0, 0, 10), square(10, 0, 10), false, 0],
    ['overlapping squares', square(0, 0, 10), square(8, 0, 10), true, 0],
    ['turned square near a square', square(0, 0, 10), square(20, 0, Math.SQRT2 * 10, 45), false, 5],
    [
      'separate circles',
      { kind: 'circle', center: { x: 0, y: 0 }, radius: 5 },
      { kind: 'circle', center: { x: 20, y: 0 }, radius: 5 },
      false,
      10,
    ],
    [
      'overlapping circles',
      { kind: 'circle', center: { x: 0, y: 0 }, radius: 5 },
      { kind: 'circle', center: { x: 8, y: 0 }, radius: 5 },
      true,
      0,
    ],
    [
      'circle beside a square',
      { kind: 'circle', center: { x: 20, y: 0 }, radius: 5 },
      square(0, 0, 10),
      false,
      10,
    ],
    [
      'circle inside a square',
      { kind: 'circle', center: { x: 0, y: 0 }, radius: 2 },
      square(0, 0, 10),
      true,
      0,
    ],
    [
      'square beside a circle',
      square(0, 0, 10),
      { kind: 'circle', center: { x: 0, y: 20 }, radius: 5 },
      false,
      10,
    ],
  ])('%s', (_name, a, b, overlaps, distance) => {
    const gap = gapBetween(a, b);

    expect(gap.overlaps).toBe(overlaps);
    expect(gap.distance).toBeCloseTo(distance);
  });

  it('reports the nearest points from a to b', () => {
    const gap = gapBetween(square(0, 0, 10), square(30, 0, 10));

    expect(gap.from.x).toBeCloseTo(5);
    expect(gap.to.x).toBeCloseTo(25);
  });
});

describe('bounds', () => {
  it('unions bounds and skips missing ones', () => {
    expect(
      unionBounds([
        { minX: 0, minY: 0, maxX: 1, maxY: 1 },
        null,
        { minX: -2, minY: 3, maxX: 0, maxY: 4 },
      ]),
    ).toEqual({ minX: -2, minY: 0, maxX: 1, maxY: 4 });
  });

  it.each([
    [10, false],
    [4, true],
  ])('bounds 5 apart with margin %i apart: %s', (margin, expected) => {
    expect(
      areBoundsApart(
        { minX: 0, minY: 0, maxX: 1, maxY: 1 },
        { minX: 6, minY: 0, maxX: 7, maxY: 1 },
        margin,
      ),
    ).toBe(expected);
  });
});
