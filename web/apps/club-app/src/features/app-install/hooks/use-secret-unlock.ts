import { useState } from 'react';
import { enterBrowserMode } from '../browser-mode-store';
import type { SecretTaps } from '../secret-taps';
import { isSecretUnlocked, NO_SECRET_TAPS, secretChargeOf, tapSecret } from '../secret-taps';

const UNLOCK_SHOW_MS = 1400;

export interface SecretUnlock {
  charge: number;
  tapKey: number;
  isUnlocked: boolean;
  tap: () => void;
}

export const useSecretUnlock = (): SecretUnlock => {
  const [taps, setTaps] = useState<SecretTaps>(NO_SECRET_TAPS);
  const [tapKey, setTapKey] = useState(0);
  const isUnlocked = isSecretUnlocked(taps);

  const tap = (): void => {
    if (isUnlocked) {
      return;
    }
    const next = tapSecret(taps, Date.now());
    setTaps(next);
    setTapKey(tapKey + 1);
    if (isSecretUnlocked(next)) {
      window.setTimeout(enterBrowserMode, UNLOCK_SHOW_MS);
    }
  };

  return { charge: secretChargeOf(taps), tapKey, isUnlocked, tap };
};
