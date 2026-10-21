import { describe, expect, it } from 'vitest';
import { tileLandDelayMs, tileLandDelaySeconds } from './tile-land';

describe('tileLandDelayMs', () => {
  it.each([
    [0, 120],
    [1, 205],
    [3, 375],
    [-2, 120],
    [9, 885],
    [40, 885],
  ])('lands tile %i after %i ms', (order, expected) => {
    expect(tileLandDelayMs(order)).toBe(expected);
  });
});

describe('tileLandDelaySeconds', () => {
  it.each([
    [0, 0, 0.12],
    [2, 300, 0.59],
  ])('turns order %i plus %i ms into %f s', (order, after, expected) => {
    expect(tileLandDelaySeconds(order, after)).toBeCloseTo(expected);
  });
});
