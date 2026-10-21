import { useState } from 'react';
import { leaveBrowserMode } from '../browser-mode-store';

export interface BrowserModeLeave {
  isAsking: boolean;
  ask: () => void;
  cancel: () => void;
  leave: () => void;
}

export const useBrowserModeLeave = (): BrowserModeLeave => {
  const [isAsking, setIsAsking] = useState(false);

  const ask = (): void => {
    setIsAsking(true);
  };

  const cancel = (): void => {
    setIsAsking(false);
  };

  const leave = (): void => {
    setIsAsking(false);
    leaveBrowserMode();
  };

  return { isAsking, ask, cancel, leave };
};
