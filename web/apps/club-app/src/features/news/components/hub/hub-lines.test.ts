import { describe, expect, it } from 'vitest';
import { factDayOf, rowDateOf, sessionNumberOf } from './hub-lines';

describe('sessionNumberOf', () => {
  it.each([
    { startYear: 2025, expected: 70 },
    { startYear: 2023, expected: 68 },
  ])('numbers the session starting $startYear as $expected', ({ startYear, expected }) => {
    expect(sessionNumberOf(startYear)).toBe(expected);
  });
});

describe('rowDateOf', () => {
  it('formats a day with a two-digit year', () => {
    expect(rowDateOf('2026-07-18T10:11:00')).toBe('18.07.26');
  });
});

describe('factDayOf', () => {
  it('formats a day without the year', () => {
    expect(factDayOf('2026-10-09T12:02:00')).toBe('09.10.');
  });
});
