import { describe, expect, it } from 'vitest';
import { lerp, ramp } from './ramp';

describe('ramp', () => {
  it.each([
    [-5, 0, 10, 0],
    [0, 0, 10, 0],
    [5, 0, 10, 0.5],
    [10, 0, 10, 1],
    [20, 0, 10, 1],
  ])('ramps %d between %d and %d to %d', (value, from, to, expected) => {
    expect(ramp(value, from, to)).toBe(expected);
  });
});

describe('lerp', () => {
  it.each([
    [10, 20, 0, 10],
    [10, 20, 0.5, 15],
    [10, 20, 1, 20],
  ])('blends %d to %d at %d into %d', (from, to, amount, expected) => {
    expect(lerp(from, to, amount)).toBe(expected);
  });
});
