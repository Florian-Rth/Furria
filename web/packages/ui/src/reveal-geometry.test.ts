import { describe, expect, it } from 'vitest';
import { computeRevealGeometry } from './reveal-geometry';

describe('computeRevealGeometry', () => {
  it('centers the reveal on the origin rect as a percentage of the viewport', () => {
    expect(computeRevealGeometry({ left: 10, top: 20, width: 40, height: 40 }, 300, 400)).toEqual({
      centerXPercent: 10,
      centerYPercent: 10,
    });
  });
});
