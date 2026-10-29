import { describe, expect, it } from 'vitest';
import { dragOffsetOf, swipeOutcomeOf } from './swipe-outcome';

describe('swipeOutcomeOf', () => {
  it.each([
    [{ dx: -120, dy: 10, width: 360, milliseconds: 400 }, 'next'],
    [{ dx: 120, dy: 10, width: 360, milliseconds: 400 }, 'previous'],
    [{ dx: -40, dy: 0, width: 360, milliseconds: 600 }, 'stay'],
    [{ dx: -40, dy: 0, width: 360, milliseconds: 60 }, 'next'],
    [{ dx: -120, dy: 140, width: 360, milliseconds: 300 }, 'stay'],
    [{ dx: 10, dy: 0, width: 360, milliseconds: 5 }, 'stay'],
  ] as const)('%o ends as %s', (swipe, expected) => {
    expect(swipeOutcomeOf(swipe)).toBe(expected);
  });
});

describe('dragOffsetOf', () => {
  it.each([
    [-100, true, true, -100],
    [-100, true, false, -25],
    [100, false, true, 25],
    [100, true, false, 100],
  ])('drag %s (previous %s, next %s) moves %s', (dx, canPrevious, canNext, expected) => {
    expect(dragOffsetOf(dx, canPrevious, canNext)).toBe(expected);
  });
});
