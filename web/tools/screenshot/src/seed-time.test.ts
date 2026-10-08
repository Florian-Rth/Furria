import { describe, expect, it } from 'vitest';
import {
  addDays,
  berlinInstant,
  birthdayToday,
  dayOf,
  floorToMinutes,
  nextMonthDay,
  nextWeekday,
} from './seed-time.ts';

describe('dayOf', () => {
  it.each([
    ['2026-10-01T22:30:00Z', '2026-10-02'],
    ['2026-10-01T21:59:59Z', '2026-10-01'],
    ['2026-12-31T23:30:00Z', '2027-01-01'],
  ])('puts %s on the Berlin day %s', (instant, expected) => {
    expect(dayOf(new Date(instant))).toBe(expected);
  });
});

describe('addDays', () => {
  it.each([
    ['2027-03-01', -1, '2027-02-28'],
    ['2028-03-01', -1, '2028-02-29'],
    ['2026-12-31', 1, '2027-01-01'],
  ])('moves %s by %i days to %s', (day, days, expected) => {
    expect(addDays(day, days)).toBe(expected);
  });
});

describe('berlinInstant', () => {
  it.each([
    ['2026-10-02', '18:00', '2026-10-02T16:00:00.000Z'],
    ['2026-12-11', '18:00', '2026-12-11T17:00:00.000Z'],
    ['2027-03-28', '03:30', '2027-03-28T01:30:00.000Z'],
  ])('reads %s %s on the Berlin wall clock as %s', (day, time, expected) => {
    expect(berlinInstant(day, time).toISOString()).toBe(expected);
  });
});

describe('nextWeekday', () => {
  it.each([
    ['2026-10-02', 2, '2026-10-06'],
    ['2026-10-02', 5, '2026-10-09'],
    ['2026-10-04', 0, '2026-10-11'],
  ])('finds the weekday after %s numbered %i on %s', (today, weekday, expected) => {
    expect(nextWeekday(today, weekday)).toBe(expected);
  });
});

describe('nextMonthDay', () => {
  it.each([
    ['2026-10-02', '11-11', '2026-11-11'],
    ['2026-11-11', '11-11', '2026-11-11'],
    ['2026-11-12', '11-11', '2027-11-11'],
  ])('after %s finds the next %s on %s', (today, monthDay, expected) => {
    expect(nextMonthDay(today, monthDay)).toBe(expected);
  });
});

describe('birthdayToday', () => {
  it.each([
    ['2026-10-02', 1961, '1961-10-02'],
    ['2028-02-29', 1961, '1961-02-28'],
  ])('dates a birthday on %s born %i to %s', (today, birthYear, expected) => {
    expect(birthdayToday(today, birthYear)).toBe(expected);
  });
});

describe('floorToMinutes', () => {
  it.each([
    ['2026-10-02T14:09:59.999Z', 5, '2026-10-02T14:05:00.000Z'],
    ['2026-10-02T14:10:00.000Z', 5, '2026-10-02T14:10:00.000Z'],
  ])('floors %s to whole %i minutes at %s', (instant, minutes, expected) => {
    expect(floorToMinutes(new Date(instant), minutes).toISOString()).toBe(expected);
  });
});
