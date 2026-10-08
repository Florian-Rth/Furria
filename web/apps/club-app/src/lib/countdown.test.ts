import { describe, expect, it } from 'vitest';
import { formatCountdown, secondsUntil } from './countdown';

describe('secondsUntil', () => {
  it.each<[string, string, string, number]>([
    ['a quarter of an hour ahead', '2026-09-26T12:15:00Z', '2026-09-26T12:00:00Z', 900],
    ['a part second rounds up', '2026-09-26T12:00:01.200Z', '2026-09-26T12:00:00Z', 2],
    ['an instant already past', '2026-09-26T11:59:00Z', '2026-09-26T12:00:00Z', 0],
    ['an offset expiry', '2026-09-26T14:15:00+02:00', '2026-09-26T12:00:00Z', 900],
  ])('counts %s', (_case, expiresAt, now, expected) => {
    expect(secondsUntil(expiresAt, new Date(now))).toBe(expected);
  });
});

describe('formatCountdown', () => {
  it.each<[number, string]>([
    [900, '15:00'],
    [65, '1:05'],
    [-3, '0:00'],
    [4.2, '0:05'],
  ])('writes %d seconds as %s', (seconds, expected) => {
    expect(formatCountdown(seconds)).toBe(expected);
  });
});
