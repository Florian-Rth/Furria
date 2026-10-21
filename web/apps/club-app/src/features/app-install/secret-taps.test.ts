import { describe, expect, it } from 'vitest';
import { isSecretUnlocked, NO_SECRET_TAPS, secretChargeOf, tapSecret } from './secret-taps';

const tapAt = (moments: readonly number[]) => moments.reduce(tapSecret, NO_SECRET_TAPS);

describe('tapSecret', () => {
  it.each([
    { label: 'a first tap starts the chain', moments: [1000], expected: 1 },
    { label: 'quick taps chain up', moments: [1000, 1500, 2300], expected: 3 },
    { label: 'a slow tap starts over', moments: [1000, 1500, 2500], expected: 1 },
    { label: 'a tap right at the gap still chains', moments: [1000, 1900], expected: 2 },
  ])('$label', ({ moments, expected }) => {
    expect(tapAt(moments).count).toBe(expected);
  });
});

describe('isSecretUnlocked', () => {
  it.each([
    { label: 'eleven quick taps unlock', count: 11, expected: true },
    { label: 'ten quick taps do not', count: 10, expected: false },
  ])('$label', ({ count, expected }) => {
    const moments = Array.from({ length: count }, (_tap, index) => 1000 + index * 400);
    expect(isSecretUnlocked(tapAt(moments))).toBe(expected);
  });
});

describe('secretChargeOf', () => {
  it.each([
    { count: 0, expected: 0 },
    { count: 11, expected: 1 },
    { count: 14, expected: 1 },
  ])('$count taps', ({ count, expected }) => {
    expect(secretChargeOf({ count, lastAt: 0 })).toBe(expected);
  });
});
