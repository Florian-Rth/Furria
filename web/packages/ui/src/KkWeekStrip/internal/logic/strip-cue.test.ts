import { describe, expect, it } from 'vitest';
import { toDayDelaySeconds, toMarkDelaySeconds } from './strip-cue';

describe('toMarkDelaySeconds', () => {
  it.each([
    { day: 0, mark: 0, expected: 0.18 },
    { day: 2, mark: 0, expected: 0.33 },
    { day: 2, mark: 2, expected: 0.42 },
    { day: -1, mark: -3, expected: 0.18 },
  ])('lands mark $mark of day $day after $expected s', ({ day, mark, expected }) => {
    expect(toMarkDelaySeconds(day, mark)).toBeCloseTo(expected, 5);
  });

  it('lands every mark of a day before the next day starts its first mark', () => {
    expect(toMarkDelaySeconds(1, 1)).toBeLessThan(toMarkDelaySeconds(2, 0));
  });
});

describe('toDayDelaySeconds', () => {
  it('matches the first mark of the day', () => {
    expect(toDayDelaySeconds(3)).toBeCloseTo(toMarkDelaySeconds(3, 0), 5);
  });
});
