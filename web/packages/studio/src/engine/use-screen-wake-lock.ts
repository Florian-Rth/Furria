import { useEffect } from 'react';

const requestScreenLock = async (): Promise<WakeLockSentinel | null> => {
  if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') {
    return null;
  }

  try {
    return await navigator.wakeLock.request('screen');
  } catch {
    return null;
  }
};

export const useScreenWakeLock = (active: boolean): void => {
  useEffect(() => {
    if (!active) {
      return;
    }

    let lock: WakeLockSentinel | null = null;
    let held = true;

    const acquire = async (): Promise<void> => {
      const next = await requestScreenLock();
      if (held && next !== null) {
        const previous = lock;
        lock = next;
        void previous?.release();
      } else {
        void next?.release();
      }
    };
    const reacquire = (): void => {
      void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', reacquire);

    return () => {
      held = false;
      document.removeEventListener('visibilitychange', reacquire);
      void lock?.release();
    };
  }, [active]);
};
