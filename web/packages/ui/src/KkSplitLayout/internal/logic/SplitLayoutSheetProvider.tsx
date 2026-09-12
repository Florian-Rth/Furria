import { motion, useMotionValue } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import { useState } from 'react';
import { useIsMobile } from '../../../use-is-mobile';
import { SplitLayoutSheetContext } from './split-layout-sheet-context';

export const SplitLayoutSheetProvider: FC<PropsWithChildren> = ({ children }) => {
  const lift = useMotionValue('0px');
  const isMobile = useIsMobile();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const contentsStyle = { display: 'contents', '--kk-sheet-lift': lift };
  const state = { lift, isSheetOpen, setSheetOpen, isPaneOpen: !isMobile || isSheetOpen };

  return (
    <SplitLayoutSheetContext.Provider value={state}>
      <motion.div style={contentsStyle}>{children}</motion.div>
    </SplitLayoutSheetContext.Provider>
  );
};
