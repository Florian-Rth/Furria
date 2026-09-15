import Box from '@mui/material/Box';
import type { FC, ReactNode } from 'react';
import { useKkShell } from '../logic/shell-context';

const STACKED = '1 / 1';

interface KkShellBarSwapProps {
  rest: ReactNode;
  title: ReactNode;
}

export const KkShellBarSwap: FC<KkShellBarSwapProps> = ({ rest, title }) => {
  const { handover } = useKkShell();

  return (
    <Box data-kk-shell-bar-swap sx={{ display: 'grid', alignItems: 'center', minWidth: 0 }}>
      <Box sx={{ gridArea: STACKED, minWidth: 0, opacity: handover.restOpacity }}>{rest}</Box>
      <Box
        sx={{
          gridArea: STACKED,
          minWidth: 0,
          opacity: handover.titleOpacity,
          transform: `translateY(${handover.titleRise}px)`,
        }}
      >
        {title}
      </Box>
    </Box>
  );
};
