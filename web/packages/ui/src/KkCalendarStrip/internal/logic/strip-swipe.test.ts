import { describe, expect, it } from 'vitest';
import { pullOf, slideOffsetOf, travelOfSwipe } from './strip-swipe';

describe('travelOfSwipe', () => {
  it.each([
    [0, 0, 'none'],
    [-20, -100, 'none'],
    [-60, 0, 'later'],
    [70, 0, 'earlier'],
    [-10, -800, 'later'],
    [10, 900, 'earlier'],
    [40, -600, 'later'],
  ] as const)('offset %d velocity %d travels %s', (offset, velocity, expected) => {
    expect(travelOfSwipe(offset, velocity)).toBe(expected);
  });
});

describe('slideOffsetOf', () => {
  it.each([
    ['none', false, '0%'],
    ['later', false, '38%'],
    ['later', true, '-38%'],
    ['earlier', false, '-38%'],
    ['earlier', true, '38%'],
  ] as const)('%s leaving=%s slides to %s', (travel, leaving, expected) => {
    expect(slideOffsetOf(travel, leaving)).toBe(expected);
  });
});

describe('pullOf', () => {
  it.each([
    [0, 0, 'none'],
    [20, 100, 'none'],
    [40, 0, 'open'],
    [-40, 0, 'close'],
    [10, 700, 'open'],
    [-5, -900, 'close'],
    [-40, 900, 'close'],
  ] as const)('offset %d velocity %d pulls %s', (offset, velocity, expected) => {
    expect(pullOf(offset, velocity, 36)).toBe(expected);
  });
});
