import { describe, expect, it } from 'vitest';
import { parseBerlinDateTime } from '@/lib/date';
import type { Countdown, CountdownLabelKind } from './countdown';
import { countdownLabelKindOf, deriveCountdown } from './countdown';

const NOW = parseBerlinDateTime('2027-01-20T12:00');

describe('deriveCountdown', () => {
  it('splits the remaining time into days, hours, minutes and seconds', () => {
    expect(deriveCountdown('2027-01-23T19:11', NOW)).toEqual({
      days: 3,
      hours: 7,
      minutes: 11,
      seconds: 0,
    });
  });

  it('returns null once the moment has come', () => {
    expect(deriveCountdown('2027-01-20T12:00', NOW)).toBeNull();
  });
});

describe('countdownLabelKindOf', () => {
  it.each<[Countdown, CountdownLabelKind]>([
    [{ days: 52, hours: 7, minutes: 11, seconds: 30 }, 'days'],
    [{ days: 1, hours: 3, minutes: 0, seconds: 0 }, 'oneDay'],
    [{ days: 0, hours: 7, minutes: 11, seconds: 30 }, 'hours'],
    [{ days: 0, hours: 0, minutes: 11, seconds: 30 }, 'minutes'],
    [{ days: 0, hours: 0, minutes: 0, seconds: 42 }, 'seconds'],
  ])('labels %j by %s', (countdown, kind) => {
    expect(countdownLabelKindOf(countdown)).toBe(kind);
  });
});
