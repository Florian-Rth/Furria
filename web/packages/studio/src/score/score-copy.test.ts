import { describe, expect, it } from 'vitest';
import { clockOf, countsTextOf, rangeTextOf } from './score-copy';

describe('clockOf', () => {
  it.each([
    [0, '0:00'],
    [7.619, '0:07'],
    [186.09, '3:06'],
    [-2, '0:00'],
  ])('formats %f seconds as %s', (seconds, expected) => {
    expect(clockOf(seconds)).toBe(expected);
  });
});

describe('rangeTextOf', () => {
  it('formats a step range', () => {
    expect(rangeTextOf({ start: 15.2, end: 30.5 })).toBe('0:15–0:30');
  });
});

describe('countsTextOf', () => {
  it.each([
    [{ eights: 2, rest: 0 }, '2×8'],
    [{ eights: 3, rest: 4 }, '3×8+4'],
    [null, ''],
  ])('formats %o as %s', (counts, expected) => {
    expect(countsTextOf(counts)).toBe(expected);
  });
});
