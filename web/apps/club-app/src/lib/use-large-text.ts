import { useSyncExternalStore } from 'react';
import { isLargeText } from './large-text';

const DEFAULT_FONT_PX = 16;

const subscribe = (changed: () => void): (() => void) => {
  window.addEventListener('resize', changed);

  return () => {
    window.removeEventListener('resize', changed);
  };
};

const snapshot = (): boolean =>
  isLargeText(
    Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || DEFAULT_FONT_PX,
    window.innerWidth,
  );

const serverSnapshot = (): boolean => false;

export const useLargeText = (): boolean =>
  useSyncExternalStore(subscribe, snapshot, serverSnapshot);
