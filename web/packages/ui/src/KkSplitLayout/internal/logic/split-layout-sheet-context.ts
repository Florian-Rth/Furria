import type { MotionValue } from 'motion/react';
import { createContext, useContext } from 'react';

export interface SplitLayoutSheetState {
  lift: MotionValue<string>;
  isSheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
  isPaneOpen: boolean;
}

export const SplitLayoutSheetContext = createContext<SplitLayoutSheetState | null>(null);

export const useSheetState = (): SplitLayoutSheetState => {
  const state = useContext(SplitLayoutSheetContext);

  if (state === null) {
    throw new Error('useSheetState must be used inside KkSplitLayout.');
  }

  return state;
};

export const useKkPaneOpen = (): boolean => {
  const state = useContext(SplitLayoutSheetContext);

  return state === null || state.isPaneOpen;
};
