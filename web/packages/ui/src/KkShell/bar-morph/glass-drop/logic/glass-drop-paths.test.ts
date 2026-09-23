import { describe, expect, it } from 'vitest';
import {
  beadPathOf,
  burstDepthOf,
  landingSecondsOf,
  pillPathOf,
  sheenPathOf,
  sprayOf,
} from './glass-drop-paths';

describe('beadPathOf', () => {
  it.each(['leave', 'arrive', 'wobble'] as const)('mirrors the %s path upward', (role) => {
    const down = beadPathOf(role, 1);
    const up = beadPathOf(role, -1);

    expect(up.y).toEqual(down.y.map((offset) => 0 - offset));
  });

  it('drips the arriving drop in from above when going deeper', () => {
    expect(beadPathOf('arrive', 1).y[0]).toBeLessThan(0);
  });
});

describe('pillPathOf', () => {
  it('wobbles the pill when the drop lands', () => {
    expect(pillPathOf('exchange').delay).toBe(landingSecondsOf('exchange'));
  });

  it('softens the wobble for a sideways wave', () => {
    const full = pillPathOf('exchange').scaleY[1] ?? 1;
    const soft = pillPathOf('wave').scaleY[1] ?? 1;

    expect(1 - soft).toBeCloseTo((1 - full) * 0.4);
  });
});

describe('sheenPathOf', () => {
  it.each([
    [1, '160%', '-60%'],
    [-1, '-60%', '160%'],
  ] as const)('sweeps the sheen in direction %d', (direction, from, to) => {
    expect(sheenPathOf('wave', direction)).toMatchObject({ from, to });
  });
});

describe('sprayOf', () => {
  it('bursts around the point where the drop pops', () => {
    const drops = sprayOf(1);
    const centreY = drops.reduce((sum, drop) => sum + drop.y, 0) / drops.length;

    expect(drops).toHaveLength(7);
    expect(centreY).toBeGreaterThan(60);
    expect(centreY).toBeLessThan(80);
  });

  it('bursts above the bar when the drop floats up', () => {
    expect(sprayOf(-1).every((drop) => drop.y < 0)).toBe(true);
  });
});

describe('burstDepthOf', () => {
  it.each([
    [1, 70],
    [-1, -70],
  ] as const)('pops the drop on the side it travels to', (direction, depth) => {
    expect(burstDepthOf(direction)).toBe(depth);
  });
});
