import { KkConfettiBurst } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';

interface HubCelebrationProps {
  fireKey: number;
}

export const HubCelebration: FC<HubCelebrationProps> = ({ fireKey }) => (
  <Box aria-hidden sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    <KkConfettiBurst fireKey={fireKey} />
  </Box>
);
