import { describe, expect, it } from 'vitest';
import { showsElevenStar } from './number-star';

describe('showsElevenStar', () => {
  it.each([
    [33, true],
    [111, false],
    [0, false],
    [-11, false],
  ])('marks %d with the star: %s', (value, star) => {
    expect(showsElevenStar(value)).toBe(star);
  });
});
