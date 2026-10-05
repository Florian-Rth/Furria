import { useKkSheet } from '@furria/ui';
import { useEffect, useState } from 'react';
import type { Start } from '../schemas';
import type { VisitHold } from '../start-board';
import {
  isVisitOver,
  nextVisitHold,
  openVisitHold,
  sheetHeldVisitHold,
  touchedVisitHold,
} from '../start-board';
import type { StartVisit } from '../start-visit';

export interface StartVisitState {
  visit: StartVisit | null;
  touched: ReadonlySet<string>;
  touch: (key: string) => void;
}

const FIRST_TOUCHES = ['pointerdown', 'keydown', 'wheel', 'touchmove'] as const;
const LISTENING: AddEventListenerOptions = { capture: true, passive: true };

const frozenHold = (hold: VisitHold): VisitHold => (hold.frozen ? hold : { ...hold, frozen: true });

export const useStartVisit = (fresh: Start | undefined): StartVisitState => {
  const { openSheetId } = useKkSheet();
  const [hold, setHold] = useState<VisitHold>(() => openVisitHold(fresh));
  const refreshed = fresh === hold.source ? hold : nextVisitHold(hold, fresh);
  const next = sheetHeldVisitHold(refreshed, openSheetId !== null);

  if (next !== hold) {
    setHold(next);
  }

  useEffect(() => {
    if (hold.frozen) {
      return;
    }

    const freeze = (): void => {
      setHold(frozenHold);
    };

    for (const touch of FIRST_TOUCHES) {
      document.addEventListener(touch, freeze, LISTENING);
    }

    return () => {
      for (const touch of FIRST_TOUCHES) {
        document.removeEventListener(touch, freeze, LISTENING);
      }
    };
  }, [hold.frozen]);

  useEffect(() => {
    let hiddenSince: number | null = null;

    const watch = (): void => {
      if (document.visibilityState === 'hidden') {
        hiddenSince = Date.now();

        return;
      }
      if (hiddenSince !== null && isVisitOver(hiddenSince, Date.now())) {
        setHold((current) => openVisitHold(current.source));
      }

      hiddenSince = null;
    };

    document.addEventListener('visibilitychange', watch);

    return () => {
      document.removeEventListener('visibilitychange', watch);
    };
  }, []);

  const touch = (key: string): void => {
    setHold((current) => touchedVisitHold(current, key));
  };

  return { visit: hold.visit, touched: hold.touched, touch };
};
