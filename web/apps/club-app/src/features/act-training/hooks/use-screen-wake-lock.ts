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

export const useScreenWakeLock = (): void => {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    let active = true;

    const acquire = async (): Promise<void> => {
      const next = await requestScreenLock();
      if (active && next !== null) {
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
      active = false;
      document.removeEventListener('visibilitychange', reacquire);
      void lock?.release();
    };
  }, []);
};
