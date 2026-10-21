export interface SecretTaps {
  count: number;
  lastAt: number;
}

export const SECRET_TAP_COUNT = 11;
export const SECRET_TAP_GAP_MS = 900;
export const NO_SECRET_TAPS: SecretTaps = { count: 0, lastAt: 0 };

export const tapSecret = (taps: SecretTaps, now: number): SecretTaps => {
  const isChained = taps.count > 0 && now - taps.lastAt <= SECRET_TAP_GAP_MS;
  return { count: isChained ? taps.count + 1 : 1, lastAt: now };
};

export const isSecretUnlocked = (taps: SecretTaps): boolean => taps.count >= SECRET_TAP_COUNT;

export const secretChargeOf = (taps: SecretTaps): number =>
  Math.min(taps.count / SECRET_TAP_COUNT, 1);
