import { useSyncExternalStore } from 'react';
import { hasSideSheet, isTouchPlanMode } from './plan-touch';

const COARSE_POINTER_QUERY = '(pointer: coarse)';

export interface PlanTouchMode {
  isTouch: boolean;
  hasSideSheet: boolean;
}

const subscribe = (notify: () => void): (() => void) => {
  const coarse = window.matchMedia(COARSE_POINTER_QUERY);
  coarse.addEventListener('change', notify);
  window.addEventListener('resize', notify);

  return () => {
    coarse.removeEventListener('change', notify);
    window.removeEventListener('resize', notify);
  };
};

const snapshot = (): string => {
  const coarse = window.matchMedia(COARSE_POINTER_QUERY).matches;
  const width = window.innerWidth;

  return `${isTouchPlanMode(coarse, width)}:${hasSideSheet(width)}`;
};

const serverSnapshot = (): string => 'false:true';

export const usePlanTouchMode = (): PlanTouchMode => {
  const [touch, sideSheet] = useSyncExternalStore(subscribe, snapshot, serverSnapshot).split(':');

  return { isTouch: touch === 'true', hasSideSheet: sideSheet === 'true' };
};
