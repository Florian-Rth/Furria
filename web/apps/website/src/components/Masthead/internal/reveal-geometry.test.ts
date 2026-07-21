import { describe, expect, it } from 'vitest';
import { computeRevealGeometry } from './reveal-geometry';

describe('computeRevealGeometry', () => {
  it('centers the reveal on the origin rect as a percentage of the viewport', () => {
    const geometry = computeRevealGeometry({ left: 10, top: 20, width: 40, height: 40 }, 300, 400);

    expect(geometry.centerXPercent).toBe(10);
    expect(geometry.centerYPercent).toBe(10);
  });

  it('centers the reveal on a zero-size origin point', () => {
    const geometry = computeRevealGeometry({ left: 150, top: 200, width: 0, height: 0 }, 300, 400);

    expect(geometry.centerXPercent).toBe(50);
    expect(geometry.centerYPercent).toBe(50);
  });
});
