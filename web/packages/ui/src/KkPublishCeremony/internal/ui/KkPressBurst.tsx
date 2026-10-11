import Box from '@mui/material/Box';
import type { FC } from 'react';
import { KkConfettiBurst } from '../../../KkConfettiBurst';
import { PRESS_CONFETTI } from '../logic/press-motion';

export type BurstCorner = 'left' | 'right';

const BURST_PIECES = 34;

interface KkPressBurstProps {
  corner: BurstCorner;
  fireKey: number;
  seed: number;
}

export const KkPressBurst: FC<KkPressBurstProps> = ({ corner, fireKey, seed }) => (
  <Box aria-hidden sx={{ position: 'absolute', bottom: 0, [corner]: 0, width: 0, height: 0 }}>
    <KkConfettiBurst
      fireKey={fireKey}
      count={BURST_PIECES}
      seed={seed}
      colors={PRESS_CONFETTI}
      alwaysPlays
    />
  </Box>
);
