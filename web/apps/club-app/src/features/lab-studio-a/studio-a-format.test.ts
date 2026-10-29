import { describe, expect, it } from 'vitest';
import { clockOf, minuteOf, percentOf, shareOf, spanOf } from './studio-a-format';

describe('studio clock', () => {
  it.each([
    [0, '0:00', '0:00,0'],
    [42.36, '0:42', '0:42,3'],
    [178.99, '2:58', '2:58,9'],
    [-1, '0:00', '0:00,0'],
  ])('formats %s seconds', (seconds, minute, clock) => {
    expect(minuteOf(seconds)).toBe(minute);
    expect(clockOf(seconds)).toBe(clock);
  });

  it.each([
    [12, 20.5, '0:12–0:20'],
    [null, 3, null],
  ])('spans %s to %s', (start, end, span) => {
    expect(spanOf(start, end)).toBe(span);
  });

  it.each([
    [0.5, '50 %'],
    [1, '100 %'],
    [0.7000001, '70 %'],
  ])('formats rate %s', (rate, text) => {
    expect(percentOf(rate)).toBe(text);
  });
});

describe('shareOf', () => {
  it.each([
    [30, 120, 0.25],
    [200, 120, 1],
    [-3, 120, 0],
    [5, 0, 0],
  ])('places %s of %s seconds at %s', (seconds, length, share) => {
    expect(shareOf(seconds, length)).toBe(share);
  });
});
