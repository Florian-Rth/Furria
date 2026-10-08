import { describe, expect, it } from 'vitest';
import { toProgressWidth } from './progress-width';

describe('toProgressWidth', () => {
  it.each([
    [0.2234, '22.3%'],
    [-0.4, '0%'],
    [1.7, '100%'],
    [null, null],
    [Number.NaN, null],
  ])('draws progress %d as %s of the line', (progress, width) => {
    expect(toProgressWidth(progress)).toBe(width);
  });
});
