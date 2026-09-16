import { describe, expect, it } from 'vitest';
import { isFutureDay, toIsoDay } from './day';

describe('toIsoDay', () => {
  it.each([
    { date: new Date(2025, 10, 11), expected: '2025-11-11' },
    { date: new Date(2026, 0, 6), expected: '2026-01-06' },
    { date: new Date(2026, 11, 31), expected: '2026-12-31' },
  ])('writes $expected as the wire day', ({ date, expected }) => {
    expect(toIsoDay(date)).toBe(expected);
  });

  it('reads the local calendar day, not UTC', () => {
    expect(toIsoDay(new Date(2026, 2, 1, 0, 30))).toBe('2026-03-01');
  });
});

describe('isFutureDay', () => {
  it.each([
    { isoDay: '2026-03-02', expected: true },
    { isoDay: '2026-03-01', expected: false },
    { isoDay: '2026-02-28', expected: false },
    { isoDay: '2027-01-01', expected: true },
  ])('answers $expected for $isoDay', ({ isoDay, expected }) => {
    expect(isFutureDay(isoDay, '2026-03-01')).toBe(expected);
  });
});
