import { describe, expect, it } from 'vitest';
import { ashWednesdayOf, sessionAt, sessionProgressAt } from './club';

describe('sessionAt', () => {
  it('stays in the running session while the opening is still ahead', () => {
    expect(sessionAt(new Date(2026, 6, 21))).toEqual({
      startYear: 2025,
      yearsLabel: '2025/26',
    });
  });

  it('stays in the running session on the day before the opening', () => {
    expect(sessionAt(new Date(2026, 10, 10)).yearsLabel).toBe('2025/26');
  });

  it('switches to the new session on the opening day itself', () => {
    expect(sessionAt(new Date(2026, 10, 11))).toEqual({
      startYear: 2026,
      yearsLabel: '2026/27',
    });
  });

  it('switches on the first day of the month after the opening month', () => {
    expect(sessionAt(new Date(2026, 11, 1)).yearsLabel).toBe('2026/27');
  });

  it('keeps the session across the calendar year change', () => {
    expect(sessionAt(new Date(2027, 1, 14)).yearsLabel).toBe('2026/27');
  });

  it('pads the label across a century boundary', () => {
    expect(sessionAt(new Date(2099, 11, 31)).yearsLabel).toBe('2099/00');
  });
});

describe('ashWednesdayOf', () => {
  it.each([
    { year: 2024, month: 1, day: 14 },
    { year: 2025, month: 2, day: 5 },
    { year: 2026, month: 1, day: 18 },
    { year: 2027, month: 1, day: 10 },
    { year: 2028, month: 2, day: 1 },
    { year: 2038, month: 2, day: 10 },
  ])('falls on $day.$month. in $year', ({ year, month, day }) => {
    expect(ashWednesdayOf(year)).toEqual(new Date(year, month, day));
  });
});

describe('sessionProgressAt', () => {
  it('starts at nothing on the Eröffnung', () => {
    expect(sessionProgressAt(new Date(2025, 10, 11))).toBe(0);
  });

  it('is under way in the middle of the Session', () => {
    const progress = sessionProgressAt(new Date(2026, 0, 1));

    expect(progress).toBeGreaterThan(0.5);
    expect(progress).toBeLessThan(0.75);
  });

  it('still runs on Aschermittwoch itself', () => {
    const progress = sessionProgressAt(new Date(2026, 1, 18, 12));

    expect(progress).toBeGreaterThan(0.9);
    expect(progress).toBeLessThanOrEqual(1);
  });

  it('has nothing left to watch once Aschermittwoch is over', () => {
    expect(sessionProgressAt(new Date(2026, 1, 19))).toBeNull();
  });

  it('has nothing to watch in the summer between two Sessions', () => {
    expect(sessionProgressAt(new Date(2026, 6, 21))).toBeNull();
  });

  it('starts over with the next Eröffnung', () => {
    expect(sessionProgressAt(new Date(2026, 10, 11))).toBe(0);
  });
});
