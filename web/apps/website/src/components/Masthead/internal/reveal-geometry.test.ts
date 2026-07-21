import { describe, expect, it } from 'vitest';
import { computeRevealGeometry } from './reveal-geometry';

describe('computeRevealGeometry', () => {
  it('centers the reveal on the origin rect', () => {
    const geometry = computeRevealGeometry({ left: 10, top: 20, width: 40, height: 40 }, 200, 200);

    expect(geometry.centerX).toBe(30);
    expect(geometry.centerY).toBe(40);
  });

  it('grows the radius to the farthest corner from a top-left origin', () => {
    const geometry = computeRevealGeometry({ left: 0, top: 0, width: 0, height: 0 }, 300, 400);

    expect(geometry.radius).toBeCloseTo(500);
  });

  it('grows the radius to the farthest corner from a bottom-right origin', () => {
    const geometry = computeRevealGeometry({ left: 300, top: 400, width: 0, height: 0 }, 300, 400);

    expect(geometry.radius).toBeCloseTo(500);
  });
});
