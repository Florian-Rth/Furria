import { describe, expect, it } from 'vitest';
import { swipeDirectionOf } from './studio-i-swipe';

describe('swipeDirectionOf', () => {
  it.each([
    [-80, 10, 'forward'],
    [90, -20, 'back'],
    [30, 0, null],
    [-80, 70, null],
  ] as const)('dx %d dy %d → %s', (dx, dy, expected) => {
    expect(swipeDirectionOf(dx, dy)).toBe(expected);
  });
});
