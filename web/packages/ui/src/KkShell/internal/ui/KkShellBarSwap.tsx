import Box from '@mui/material/Box';
import { motion } from 'motion/react';
import type { FC, ReactNode } from 'react';
import { useBarSwapMotion } from '../logic/use-bar-swap-motion';

const STACKED = '1 / 1';

interface KkShellBarSwapProps {
  rest: ReactNode;
  title: ReactNode;
}

export const KkShellBarSwap: FC<KkShellBarSwapProps> = ({ rest, title }) => {
  const swap = useBarSwapMotion();
  const restStyle = { gridArea: STACKED, minWidth: 0, opacity: swap.restOpacity };
  const titleStyle = {
    gridArea: STACKED,
    minWidth: 0,
    opacity: swap.titleOpacity,
    y: swap.titleRise,
  };

  return (
    <Box data-kk-shell-bar-swap sx={{ display: 'grid', alignItems: 'center', minWidth: 0 }}>
      <motion.div style={restStyle}>{rest}</motion.div>
      <motion.div style={titleStyle}>{title}</motion.div>
    </Box>
  );
};
