import { describe, expect, it } from 'vitest';
import { viewPointOf, viewRotationOf } from './stage-view';

const stage = { widthMetres: 10, depthMetres: 7, artworkSvg: null };

describe('viewPointOf', () => {
  it.each([
    ['audience', { rightMetres: 2, backMetres: 1 }, { x: 7, y: 6 }],
    ['dancers', { rightMetres: 2, backMetres: 1 }, { x: 3, y: 1 }],
    ['audience', { rightMetres: -5, backMetres: 7 }, { x: 0, y: 0 }],
  ] as const)('draws for the %s %o at %o', (viewpoint, point, expected) => {
    expect(viewPointOf(point, stage, viewpoint)).toEqual(expected);
  });
});

describe('viewRotationOf', () => {
  it.each([
    [90, 'audience', 90],
    [270, 'dancers', 90],
    [null, 'dancers', null],
  ] as const)('turns facing %s for the %s to %s', (facing, viewpoint, expected) => {
    expect(viewRotationOf(facing, viewpoint)).toBe(expected);
  });
});
