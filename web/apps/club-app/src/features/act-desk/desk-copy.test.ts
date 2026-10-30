import { describe, expect, it } from 'vitest';
import { clockOf, countShapeOf } from './desk-copy';

describe('clockOf', () => {
  it.each([
    [0, '0:00,0'],
    [9.46, '0:09,5'],
    [59.96, '1:00,0'],
    [125.2, '2:05,2'],
    [-3, '0:00,0'],
  ])('formats %ds', (seconds, expected) => {
    expect(clockOf(seconds)).toBe(expected);
  });
});

describe('countShapeOf', () => {
  it.each([
    [0, ''],
    [5, '5'],
    [16, '2 × 8'],
    [19, '2 × 8 + 3'],
  ])('shapes %d counts into eights', (counts, expected) => {
    expect(countShapeOf(counts)).toBe(expected);
  });
});
