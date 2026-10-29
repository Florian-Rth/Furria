import { motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import { DOCK_HEADLINE_VISIBILITY } from './dock-headline-visibility';
import { useDockHeaderFade } from './use-dock-header-fade';

export const ConfettiHeaderFollowFade: FC<PropsWithChildren> = ({ children }) => {
  const fade = useDockHeaderFade();
  const headerStyle = {
    opacity: fade.opacity,
    y: fade.drift,
    [DOCK_HEADLINE_VISIBILITY]: fade.headlineOpacity,
  };

  return (
    <motion.div data-kk-dock-header style={headerStyle}>
      {children}
    </motion.div>
  );
};
