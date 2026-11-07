const PULSE_MS = 8;

export const pulseHaptic = (): void => {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(PULSE_MS);
  }
};
