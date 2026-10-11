import { describe, expect, it } from 'vitest';
import { hasHoldDrifted } from './hold-drift';

describe('hasHoldDrifted', () => {
  it.each([
    { point: { x: 100, y: 200 }, drifted: false },
    { point: { x: 106, y: 208 }, drifted: false },
    { point: { x: 107, y: 208 }, drifted: true },
    { point: { x: 100, y: 180 }, drifted: true },
  ])('treats a finger at $point.x,$point.y as drifted: $drifted', ({ point, drifted }) => {
    expect(hasHoldDrifted({ x: 100, y: 200 }, point)).toBe(drifted);
  });
});
