import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import { scrollLinkedPaint } from '../../../internal/scroll-linked';
import { DOCK_TRAVEL } from './dock-flight';
import { DOCK_HEADER_LEAVING } from './dock-header-frames';
import { DOCK_HEADLINE_VISIBILITY } from './dock-headline-visibility';
import { useDockHeadline } from './use-dock-headline';

const LEAVING = scrollLinkedPaint(DOCK_HEADER_LEAVING, DOCK_TRAVEL, 'ramped');

export const ConfettiHeaderScrollFade: FC<PropsWithChildren> = ({ children }) => {
  const headline = useDockHeadline();
  const headlineStyle = { minWidth: 0, [DOCK_HEADLINE_VISIBILITY]: headline };

  return (
    <Box data-kk-dock-header sx={LEAVING}>
      <motion.div style={headlineStyle}>{children}</motion.div>
    </Box>
  );
};
