import { describe, expect, it } from 'vitest';
import { forgeChipsOf } from './honour-forge';

describe('forgeChipsOf', () => {
  it.each([
    [11, 11],
    [20, 11],
    [0, 0],
    [-2, 0],
  ])('throws %i asked chips as %i', (count, chips) => {
    expect(forgeChipsOf(count, 100)).toHaveLength(chips);
  });

  it('throws the first chip straight up and the others further out in steps', () => {
    const [first, second] = forgeChipsOf(11, 100);

    expect(first).toEqual({ key: 0, dx: 0, dy: -100, rotate: 200, delaySeconds: 0, paint: 'mid' });
    expect(Math.hypot(second?.dx ?? 0, second?.dy ?? 0)).toBeCloseTo(118, 0);
  });
});
