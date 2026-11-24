import { describe, expect, it } from 'vitest';
import { berlinDayNumber, parseBerlinDateTime, toBerlinWallClock } from './date';

describe('parseBerlinDateTime', () => {
  it.each([
    ['2027-01-23T19:11', '2027-01-23T18:11:00.000Z'],
    ['2026-07-01T12:00', '2026-07-01T10:00:00.000Z'],
    ['2026-07-18', '2026-07-17T22:00:00.000Z'],
  ])('resolves the Berlin wall clock %s to the instant %s', (wallClock, instant) => {
    expect(parseBerlinDateTime(wallClock).toISOString()).toBe(instant);
  });
});

describe('berlinDayNumber', () => {
  it('places a real instant on the Berlin calendar', () => {
    expect(berlinDayNumber(new Date('2027-01-23T23:30:00Z'))).toBe(berlinDayNumber('2027-01-24'));
  });
});

describe('toBerlinWallClock', () => {
  it.each([
    ['2026-07-01T10:00:00Z', '2026-07-01T12:00'],
    ['2027-01-23T23:30:00+00:00', '2027-01-24T00:30'],
  ])('reads %s as the Berlin wall clock %s', (instant, wallClock) => {
    expect(toBerlinWallClock(instant)).toBe(wallClock);
  });
});
