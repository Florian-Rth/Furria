import { describe, expect, it } from 'vitest';
import { parseBerlinDateTime } from '@/lib/date';
import { deriveCountdown, formatCountdownLabel } from './countdown';

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

  it('returns null once the moment has passed', () => {
    expect(deriveCountdown('2027-01-20T11:59', NOW)).toBeNull();
    expect(deriveCountdown('2027-01-20T12:00', NOW)).toBeNull();
  });
});

describe('formatCountdownLabel', () => {
  it('rounds far moments to days and hours', () => {
    expect(formatCountdownLabel({ days: 52, hours: 7, minutes: 11, seconds: 30 })).toBe(
      'in 52 Tagen 7 Std.',
    );
  });

  it('uses the German singular for one day', () => {
    expect(formatCountdownLabel({ days: 1, hours: 3, minutes: 0, seconds: 0 })).toBe(
      'in 1 Tag 3 Std.',
    );
  });

  it('drops to hours and minutes on the last day', () => {
    expect(formatCountdownLabel({ days: 0, hours: 7, minutes: 11, seconds: 30 })).toBe(
      'in 7 Std. 11 Min.',
    );
  });

  it('shows seconds only when they mean something', () => {
    expect(formatCountdownLabel({ days: 0, hours: 0, minutes: 11, seconds: 30 })).toBe(
      'in 11 Min. 30 Sek.',
    );
    expect(formatCountdownLabel({ days: 0, hours: 0, minutes: 0, seconds: 42 })).toBe('in 42 Sek.');
  });
});
