import { describe, expect, it } from 'vitest';
import { showsElevenStar } from './number-star';

describe('showsElevenStar', () => {
  it.each([
    [11, true],
    [33, true],
    [99, true],
    [111, false],
    [121, true],
    [25, false],
    [0, false],
    [-11, false],
    [5.5, false],
  ])('marks %d with the star: %s', (value, star) => {
    expect(showsElevenStar(value)).toBe(star);
  });
});
