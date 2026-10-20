import { describe, expect, it } from 'vitest';
import { rowDelayOf } from './agenda-motion';

describe('rowDelayOf', () => {
  it.each([
    [0, 0.06],
    [1, 0.105],
    [10, 0.51],
    [16, 0.78],
    [40, 0.78],
    [-3, 0.06],
  ])('row %d settles after %d s', (order, seconds) => {
    expect(rowDelayOf(order)).toBeCloseTo(seconds, 5);
  });
});
