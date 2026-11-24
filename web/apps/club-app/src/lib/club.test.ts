import { describe, expect, it } from 'vitest';
import {
  ashWednesdayOf,
  calendarDaysBetween,
  carnivalDaysOf,
  daysUntilOpening,
  isBetweenSessions,
  relevantSessionYear,
  sessionAt,
  sessionDayOf,
} from './club';

describe('sessionAt', () => {
  it.each([
    { label: 'on the day before the opening', date: new Date(2026, 10, 10), expected: 2025 },
    { label: 'on the opening day itself', date: new Date(2026, 10, 11), expected: 2026 },
  ])('starts in $expected $label', ({ date, expected }) => {
    expect(sessionAt(date).startYear).toBe(expected);
  });
});

describe('ashWednesdayOf', () => {
  it.each([
    { year: 2025, month: 2, day: 5 },
    { year: 2038, month: 2, day: 10 },
  ])('falls on $day.$month. in $year', ({ year, month, day }) => {
    expect(ashWednesdayOf(year)).toEqual(new Date(year, month, day));
  });
});

describe('isBetweenSessions', () => {
  it.each([
    { label: 'the day after Aschermittwoch', date: new Date(2026, 1, 19), expected: true },
    { label: 'midnight on 11.11.', date: new Date(2026, 10, 11, 0, 0), expected: false },
  ])('is $expected on $label', ({ date, expected }) => {
    expect(isBetweenSessions(date)).toBe(expected);
  });
});

describe('relevantSessionYear', () => {
  it.each([{ label: 'Aschermittwoch itself', date: new Date(2026, 1, 18, 12), expected: 2025 }])(
    'looks at $expected on $label',
    ({ date, expected }) => {
      expect(relevantSessionYear(date)).toBe(expected);
    },
  );
});

describe('calendarDaysBetween', () => {
  it.each([
    {
      label: 'late evening to early morning',
      from: new Date(2026, 9, 2, 23, 59),
      to: new Date(2026, 9, 3, 0, 1),
      days: 1,
    },
    {
      label: 'across the end of summer time',
      from: new Date(2026, 9, 20, 12),
      to: new Date(2026, 10, 11),
      days: 22,
    },
  ])('counts $days days for $label', ({ from, to, days }) => {
    expect(calendarDaysBetween(from, to)).toBe(days);
  });
});

describe('daysUntilOpening', () => {
  it.each([
    {
      label: 'a minute before midnight on 10.11.',
      date: new Date(2026, 10, 10, 23, 59),
      expected: 1,
    },
  ])('counts $expected whole days $label', ({ date, expected }) => {
    expect(daysUntilOpening(date, 2026)).toBe(expected);
  });
});

describe('carnivalDaysOf', () => {
  it('places the street carnival before Aschermittwoch across a month boundary', () => {
    expect(carnivalDaysOf(2024)).toEqual({
      womensCarnivalDay: new Date(2025, 1, 27),
      roseMonday: new Date(2025, 2, 3),
      carnivalTuesday: new Date(2025, 2, 4),
      ashWednesday: new Date(2025, 2, 5),
    });
  });
});

describe('sessionDayOf', () => {
  it.each([
    { label: 'Aschermittwoch', date: new Date(2027, 1, 10, 23, 59), expected: 92 },
    { label: 'the day after Aschermittwoch', date: new Date(2027, 1, 11, 0, 0), expected: null },
  ])('is $expected on $label', ({ date, expected }) => {
    expect(sessionDayOf(date)).toBe(expected);
  });
});
