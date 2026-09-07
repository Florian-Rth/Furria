export const REFRESH_MARGIN_MS = 60_000;

export const MIN_REFRESH_INTERVAL_MS = 60_000;

export const MAX_TRUSTED_LIFETIME_MS = 900_000;

export const captureRemainingLifetime = (
  expiresAtIso: string,
  receivedAtMs: number,
  maxTrustedMs: number,
): number => {
  const expiresAtMs = Date.parse(expiresAtIso);
  if (Number.isNaN(expiresAtMs)) {
    return 0;
  }
  return Math.min(Math.max(0, expiresAtMs - receivedAtMs), maxTrustedMs);
};

export const resolveElapsedLifetime = (
  wallClockElapsedMs: number,
  monotonicElapsedMs: number,
): number => Math.max(0, wallClockElapsedMs, monotonicElapsedMs);

export const isWithinRefreshMargin = (
  remainingMs: number,
  elapsedMs: number,
  marginMs: number,
): boolean => remainingMs - elapsedMs <= marginMs;

export const isAccessTokenStale = (
  remainingMs: number,
  elapsedMs: number,
  marginMs: number,
  minIntervalMs: number,
): boolean => elapsedMs >= minIntervalMs && isWithinRefreshMargin(remainingMs, elapsedMs, marginMs);
