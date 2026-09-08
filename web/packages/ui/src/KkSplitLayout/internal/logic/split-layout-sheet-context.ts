import type { MotionValue } from 'motion/react';
import { createContext, useContext } from 'react';

export const SplitLayoutSheetContext = createContext<MotionValue<string> | null>(null);

export const useSheetLift = (): MotionValue<string> => {
  const sheetLift = useContext(SplitLayoutSheetContext);

  if (sheetLift === null) {
    throw new Error('useSheetLift must be used inside KkSplitLayout.');
  }

  return sheetLift;
};
