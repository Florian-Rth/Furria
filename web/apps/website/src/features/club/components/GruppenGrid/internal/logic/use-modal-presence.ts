import { useState } from 'react';
import type { ActiveGroup } from './use-group-modal';

export interface ModalPresence {
  shown: ActiveGroup | null;
  isOpen: boolean;
  clear: () => void;
}

export const useModalPresence = (active: ActiveGroup | null): ModalPresence => {
  const activeId = active?.group.title ?? null;
  const [shown, setShown] = useState<ActiveGroup | null>(active);
  const [prevActiveId, setPrevActiveId] = useState<string | null>(activeId);

  if (activeId !== prevActiveId) {
    setPrevActiveId(activeId);
    if (active !== null) {
      setShown(active);
    }
  }

  return {
    shown,
    isOpen: active !== null,
    clear: (): void => setShown(null),
  };
};
