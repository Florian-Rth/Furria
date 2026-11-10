import { useEffect } from 'react';

export const useProjectorMode = (): (() => void) => {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;

    const hold = (): void => {
      if (document.visibilityState !== 'visible' || !('wakeLock' in navigator)) {
        return;
      }
      void navigator.wakeLock
        .request('screen')
        .then((sentinel) => {
          lock = sentinel;
        })
        .catch(() => undefined);
    };

    hold();
    document.addEventListener('visibilitychange', hold);

    return () => {
      document.removeEventListener('visibilitychange', hold);
      void lock?.release();
    };
  }, []);

  return () => {
    if (document.fullscreenElement === null) {
      void document.documentElement.requestFullscreen().catch(() => undefined);
    }
  };
};
