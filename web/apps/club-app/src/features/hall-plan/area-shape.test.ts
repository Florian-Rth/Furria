import { describe, expect, it } from 'vitest';
import {
  areaEdgesOf,
  areaOutlineOf,
  mergeOutlines,
  movedArea,
  rotatedArea,
  withoutStraightCorners,
} from './area-shape';
import type { AreaElement } from './schemas';

const rect: AreaElement = {
  id: 'a1',
  kind: 'area',
  shape: 'rect',
  area: 'stage',
  x: 200,
  y: 100,
  widthCm: 400,
  heightCm: 200,
  rotation: 0,
  label: null,
};

const lShape: AreaElement = {
  id: 'a2',
  kind: 'area',
  shape: 'polygon',
  area: 'stage',
  points: [
    { x: 0, y: 0 },
    { x: 600, y: 0 },
    { x: 600, y: 200 },
    { x: 300, y: 200 },
    { x: 300, y: 400 },
    { x: 0, y: 400 },
  ],
  label: null,
};

describe('areaEdgesOf', () => {
  it('gives a rectangle its width and depth once, pointing out of the area', () => {
    const [top, side] = areaEdgesOf(rect);

    expect([top?.lengthCm, side?.lengthCm]).toEqual([400, 200]);
    expect(top?.outward.y).toBeCloseTo(-1);
    expect(side?.outward.x).toBeCloseTo(1);
  });

  it('gives every edge of a merged outline its length', () => {
    expect(areaEdgesOf(lShape).map((edge) => edge.lengthCm)).toEqual([
      600, 200, 300, 200, 300, 400,
    ]);
  });

  it('points outward whichever way the outline runs', () => {
    const reversed: AreaElement = { ...lShape, points: [...lShape.points].reverse() };

    const bottom = areaEdgesOf(reversed)[0];

    expect(bottom?.from).toEqual({ x: 0, y: 400 });
    expect(bottom?.outward.y).toBeCloseTo(1);
  });
});

describe('mergeOutlines', () => {
  it('joins two touching rectangles into one outline without straight corners', () => {
    const merged = mergeOutlines([areaOutlineOf(rect), areaOutlineOf({ ...rect, x: 600 })]);

    expect(merged.kind).toBe('merged');
    expect(merged.kind === 'merged' ? merged.outline : []).toHaveLength(4);
  });

  it.each([
    ['one outline', [areaOutlineOf(rect)], 'tooFew'],
    ['outlines apart', [areaOutlineOf(rect), areaOutlineOf({ ...rect, x: 2000 })], 'apart'],
  ])('refuses %s', (_name, outlines, reason) => {
    expect(mergeOutlines(outlines)).toEqual({ kind: 'refused', reason });
  });
});

describe('withoutStraightCorners', () => {
  it('drops points lying on the line between their neighbours', () => {
    expect(
      withoutStraightCorners([
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 200, y: 0 },
        { x: 200, y: 100 },
        { x: 0, y: 100 },
      ]),
    ).toEqual([
      { x: 0, y: 0 },
      { x: 200, y: 0 },
      { x: 200, y: 100 },
      { x: 0, y: 100 },
    ]);
  });
});

describe('movedArea / rotatedArea', () => {
  it('moves every corner of a merged outline', () => {
    expect(areaOutlineOf(movedArea(lShape, { x: 10, y: 5 }))[1]).toEqual({ x: 610, y: 5 });
  });

  it('turns a merged outline about the pivot', () => {
    const turned = areaOutlineOf(rotatedArea(lShape, { x: 0, y: 0 }, 90));

    expect(turned[1]?.x).toBeCloseTo(0);
    expect(turned[1]?.y).toBeCloseTo(600);
  });
});
