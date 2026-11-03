import { isInside } from '@furria/studio/score-live';
import { describe, expect, it } from 'vitest';

describe('isInside', () => {
  it.each([
    [{ start: 10, end: 20 }, 15, true],
    [{ start: 10, end: 20 }, 10, false],
    [{ start: 10, end: 20 }, 20, false],
    [null, 15, false],
  ])('range %o at %f is %s', (range, seconds, expected) => {
    expect(isInside(range, seconds)).toBe(expected);
  });
});
