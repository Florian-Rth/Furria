import { describe, expect, it } from 'vitest';
import {
  captureRemainingLifetime,
  isAccessTokenStale,
  isWithinRefreshMargin,
} from './session-lifetime';

describe('captureRemainingLifetime', () => {
  it.each([
    ['2026-09-07T16:28:39+00:00', Date.UTC(2026, 8, 7, 16, 13, 39), 900_000],
    ['2026-09-07T18:28:39+02:00', Date.UTC(2026, 8, 7, 16, 13, 39), 900_000],
    ['2026-09-07T16:28:39.034611+00:00', Date.UTC(2026, 8, 7, 16, 28, 39), 34],
    ['2026-09-07T16:28:39+00:00', Date.UTC(2026, 8, 7, 16, 28, 39), 0],
    ['2026-09-07T16:28:39+00:00', Date.UTC(2026, 8, 7, 17, 0, 0), 0],
    ['not-a-timestamp', Date.UTC(2026, 8, 7, 16, 13, 39), 0],
  ])('turns %s received at %d into %d ms of lifetime', (expiresAtIso, receivedAtMs, expected) => {
    expect(captureRemainingLifetime(expiresAtIso, receivedAtMs)).toBe(expected);
  });
});

describe('isWithinRefreshMargin', () => {
  it.each([
    [900_000, 0, 60_000, false],
    [900_000, 839_999, 60_000, false],
    [900_000, 840_000, 60_000, true],
    [900_000, 900_000, 60_000, true],
    [900_000, 1_200_000, 60_000, true],
    [0, 0, 60_000, true],
  ])(
    'reports %d ms of lifetime after %d ms with a %d ms margin as %s',
    (remainingMs, elapsedMs, marginMs, expected) => {
      expect(isWithinRefreshMargin(remainingMs, elapsedMs, marginMs)).toBe(expected);
    },
  );
});

describe('isAccessTokenStale', () => {
  it.each([
    [900_000, 0, 60_000, 60_000, false],
    [900_000, 840_000, 60_000, 60_000, true],
    [0, 0, 60_000, 60_000, false],
    [0, 59_999, 60_000, 60_000, false],
    [0, 60_000, 60_000, 60_000, true],
    [0, 600_000, 60_000, 60_000, true],
    [900_000, 30_000, 60_000, 0, false],
    [0, 0, 60_000, 0, true],
  ])(
    'reports %d ms of lifetime after %d ms with a %d ms margin and a %d ms floor as %s',
    (remainingMs, elapsedMs, marginMs, minIntervalMs, expected) => {
      expect(isAccessTokenStale(remainingMs, elapsedMs, marginMs, minIntervalMs)).toBe(expected);
    },
  );
});
