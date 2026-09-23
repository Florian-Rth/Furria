import Box from '@mui/material/Box';
import type { FC, ReactNode } from 'react';
import { useKkShellHandover } from '../use-shell-handover';

const STACKED = '1 / 1';

interface KonfettiDockPlainSwapProps {
  rest: ReactNode;
  title: ReactNode;
}

export const KonfettiDockPlainSwap: FC<KonfettiDockPlainSwapProps> = ({ rest, title }) => {
  const { handover } = useKkShellHandover();

  return (
    <Box sx={{ display: 'grid', alignItems: 'center', minWidth: 0 }}>
      <Box sx={{ gridArea: STACKED, minWidth: 0, opacity: handover.restOpacity }}>{rest}</Box>
      <Box sx={{ gridArea: STACKED, minWidth: 0, opacity: handover.titleOpacity }}>{title}</Box>
    </Box>
  );
};
