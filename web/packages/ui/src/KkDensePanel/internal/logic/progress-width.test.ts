import { describe, expect, it } from 'vitest';
import { toProgressWidth } from './progress-width';

describe('toProgressWidth', () => {
  it.each([
    [0, '0%'],
    [0.22, '22%'],
    [0.2234, '22.3%'],
    [0.5, '50%'],
    [1, '100%'],
  ])('draws progress %d as %s of the line', (progress, width) => {
    expect(toProgressWidth(progress)).toBe(width);
  });

  it.each([
    [-0.4, '0%'],
    [1.7, '100%'],
  ])('clamps progress %d to %s', (progress, width) => {
    expect(toProgressWidth(progress)).toBe(width);
  });

  it.each([[null], [undefined], [Number.NaN], [Number.POSITIVE_INFINITY]])(
    'draws no rule for %s',
    (progress) => {
      expect(toProgressWidth(progress)).toBeNull();
    },
  );
});
