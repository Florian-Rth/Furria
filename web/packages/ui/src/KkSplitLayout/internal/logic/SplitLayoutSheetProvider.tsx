import { motion, useMotionValue } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import { SplitLayoutSheetContext } from './split-layout-sheet-context';

export const SplitLayoutSheetProvider: FC<PropsWithChildren> = ({ children }) => {
  const sheetLift = useMotionValue('0px');
  const contentsStyle = { display: 'contents', '--kk-sheet-lift': sheetLift };

  return (
    <SplitLayoutSheetContext.Provider value={sheetLift}>
      <motion.div style={contentsStyle}>{children}</motion.div>
    </SplitLayoutSheetContext.Provider>
  );
};
