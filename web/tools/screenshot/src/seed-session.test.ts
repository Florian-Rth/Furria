import { describe, expect, it } from 'vitest';
import { ashWednesdayOf, easterSundayOf, nthWeekdayOf, sessionYearOf } from './seed-session.ts';

describe('easterSundayOf', () => {
  it.each([
    [2026, '2026-04-05'],
    [2027, '2027-03-28'],
    [2028, '2028-04-16'],
    [2038, '2038-04-25'],
  ])('puts Easter %i on %s', (year, expected) => {
    expect(easterSundayOf(year)).toBe(expected);
  });
});

describe('ashWednesdayOf', () => {
  it.each([
    [2026, '2026-02-18'],
    [2027, '2027-02-10'],
  ])('puts Ash Wednesday %i on %s', (year, expected) => {
    expect(ashWednesdayOf(year)).toBe(expected);
  });
});

describe('sessionYearOf', () => {
  it.each([
    ['2026-11-09', 2026],
    ['2026-11-14', 2026],
    ['2027-02-10', 2026],
    ['2027-02-11', 2027],
    ['2027-01-16', 2026],
  ])('places %s in the session starting %i', (today, expected) => {
    expect(sessionYearOf(today)).toBe(expected);
  });
});

describe('nthWeekdayOf', () => {
  it.each([
    [2027, 1, 6, 2, '2027-01-09'],
    [2027, 1, 0, 4, '2027-01-24'],
    [2026, 11, 3, 1, '2026-11-04'],
  ])('finds in %i-%i weekday %i number %i on %s', (year, month, weekday, nth, expected) => {
    expect(nthWeekdayOf(year, month, weekday, nth)).toBe(expected);
  });
});
