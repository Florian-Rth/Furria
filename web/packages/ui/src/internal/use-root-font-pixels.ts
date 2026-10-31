import { useSyncExternalStore } from 'react';
import { REM_PIXELS } from './type-pixels';

const subscribe = (changed: () => void): (() => void) => {
  window.addEventListener('resize', changed);

  return () => {
    window.removeEventListener('resize', changed);
  };
};

const snapshot = (): number =>
  Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || REM_PIXELS;

const serverSnapshot = (): number => REM_PIXELS;

export const useRootFontPixels = (): number =>
  useSyncExternalStore(subscribe, snapshot, serverSnapshot);
