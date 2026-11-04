import { describe, expect, it } from 'vitest';
import { formatDistance, measure } from './plan-measure';

describe('formatDistance', () => {
  it.each([
    [85.4, '85 cm'],
    [99.4, '99 cm'],
    [120, '1,20 m'],
    [1234.5, '12,35 m'],
  ])('formats %f cm as %s', (centimetres, expected) => {
    expect(formatDistance(centimetres)).toBe(expected);
  });
});

describe('measure', () => {
  it('measures the straight distance and labels its middle', () => {
    expect(measure({ x: 0, y: 0 }, { x: 300, y: 400 })).toEqual({
      from: { x: 0, y: 0 },
      to: { x: 300, y: 400 },
      distanceCm: 500,
      labelAt: { x: 150, y: 200 },
    });
  });
});
