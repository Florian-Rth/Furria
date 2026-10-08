import { describe, expect, it } from 'vitest';
import {
  captureRemainingLifetime,
  isAccessTokenStale,
  isWithinRefreshMargin,
  resolveElapsedLifetime,
} from './session-lifetime';

describe('captureRemainingLifetime', () => {
  it.each([
    ['2026-09-07T18:28:39+02:00', Date.UTC(2026, 8, 7, 16, 13, 39), 900_000],
    ['2026-09-07T16:28:39.034611+00:00', Date.UTC(2026, 8, 7, 16, 28, 39), 34],
    ['2026-09-07T16:28:39+00:00', Date.UTC(2026, 8, 7, 17, 0, 0), 0],
    ['2026-09-07T16:28:39+00:00', Date.UTC(2026, 8, 6, 16, 13, 39), 900_000],
    ['not-a-timestamp', Date.UTC(2026, 8, 7, 16, 13, 39), 0],
  ])('turns %s received at %d into %d ms of lifetime', (expiresAtIso, receivedAtMs, expected) => {
    expect(captureRemainingLifetime(expiresAtIso, receivedAtMs, 900_000)).toBe(expected);
  });
});

describe('resolveElapsedLifetime', () => {
  it.each([
    [300_050, 300_000, 300_050],
    [-3_600_000, 870_000, 870_000],
    [-500, 0, 0],
  ])(
    'resolves %d ms of wall-clock and %d ms of monotonic time to %d ms elapsed',
    (wallClockElapsedMs, monotonicElapsedMs, expected) => {
      expect(resolveElapsedLifetime(wallClockElapsedMs, monotonicElapsedMs)).toBe(expected);
    },
  );
});

describe('isWithinRefreshMargin', () => {
  it.each([
    [839_999, false],
    [840_000, true],
  ])('reports 900000 ms of lifetime after %d ms as %s', (elapsedMs, expected) => {
    expect(isWithinRefreshMargin(900_000, elapsedMs, 60_000)).toBe(expected);
  });
});

describe('isAccessTokenStale', () => {
  it.each([
    [900_000, 30_000, 0, false],
    [900_000, 840_000, 60_000, true],
    [0, 59_999, 60_000, false],
    [0, 60_000, 60_000, true],
  ])(
    'reports %d ms of lifetime after %d ms with a %d ms floor as %s',
    (remainingMs, elapsedMs, minIntervalMs, expected) => {
      expect(isAccessTokenStale(remainingMs, elapsedMs, 60_000, minIntervalMs)).toBe(expected);
    },
  );
});
