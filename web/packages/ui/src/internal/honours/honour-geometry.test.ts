import { describe, expect, it } from 'vitest';
import {
  arcPath,
  bearingOf,
  coinSpotsOf,
  pieceArcs,
  pieceIndexAt,
  pointOn,
} from './honour-geometry';

describe('pointOn', () => {
  it.each([
    [0, { x: 10, y: 0 }],
    [90, { x: 20, y: 10 }],
    [180, { x: 10, y: 20 }],
    [270, { x: 0, y: 10 }],
  ])('measures %i° clockwise from twelve o’clock', (degrees, point) => {
    expect(pointOn(10, 10, degrees)).toEqual(point);
  });
});

describe('arcPath', () => {
  it.each([
    [{ startDegrees: 0, endDegrees: 90 }, 'M10 0A10 10 0 0 1 20 10'],
    [{ startDegrees: 0, endDegrees: 270 }, 'M10 0A10 10 0 1 1 0 10'],
  ])('traces %o clockwise', (arc, path) => {
    expect(arcPath(10, 10, arc)).toBe(path);
  });
});

describe('pieceArcs', () => {
  it('keeps the gap a fixed length whatever the radius', () => {
    const [narrow] = pieceArcs(4, 10, Math.PI);
    const [wide] = pieceArcs(4, 20, Math.PI);

    expect(narrow).toEqual({ startDegrees: 9, endDegrees: 81 });
    expect(wide).toEqual({ startDegrees: 4.5, endDegrees: 85.5 });
  });

  it.each([
    [0, 10],
    [5, 0],
  ])('draws nothing for %i pieces at radius %i', (pieces, radius) => {
    expect(pieceArcs(pieces, radius, 1)).toEqual([]);
  });
});

describe('bearingOf', () => {
  it.each([
    [0, -1, 0],
    [1, 0, 90],
    [0, 1, 180],
    [-1, 0, 270],
  ])('turns offset (%i, %i) into %i°', (dx, dy, degrees) => {
    expect(bearingOf(dx, dy)).toBeCloseTo(degrees);
  });
});

describe('pieceIndexAt', () => {
  it.each([
    [0, 0],
    [71.9, 0],
    [72, 1],
    [359.9, 4],
    [360, 4],
  ])('finds the piece under %f° of five', (degrees, index) => {
    expect(pieceIndexAt(degrees, 5)).toBe(index);
  });
});

describe('coinSpotsOf', () => {
  it('sets coins clockwise on the ring from the start bearing', () => {
    expect(coinSpotsOf(3, 0.5, 0, 90)).toEqual([
      { x: 50, y: 0 },
      { x: 100, y: 50 },
      { x: 50, y: 100 },
    ]);
  });

  it('sets no coins for none', () => {
    expect(coinSpotsOf(0, 0.5, 34, 40)).toEqual([]);
  });
});
