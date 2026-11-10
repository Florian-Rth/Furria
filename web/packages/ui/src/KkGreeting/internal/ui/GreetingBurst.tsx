import Box from '@mui/material/Box';
import type { FC } from 'react';
import { KkFanBurst } from '../../../KkFanBurst';
import type { GreetingBurstShot } from '../logic/use-greeting-conductor';

const SEED_SPREAD = 97;

const BURST_LAYER = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  clipPath: 'inset(-100vh -100vw 0 -100vw)',
  '@media (prefers-reduced-motion: reduce)': { display: 'none' },
} as const;

interface GreetingBurstProps {
  shot: GreetingBurstShot | null;
}

export const GreetingBurst: FC<GreetingBurstProps> = ({ shot }) => {
  if (shot === null) {
    return null;
  }

  const anchor = { left: shot.origin.x, top: shot.origin.y };

  return (
    <Box aria-hidden data-kk-greeting-burst sx={BURST_LAYER}>
      <KkFanBurst key={shot.key} seed={shot.key % SEED_SPREAD} sx={anchor} />
    </Box>
  );
};
