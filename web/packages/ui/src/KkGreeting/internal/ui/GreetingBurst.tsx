import Box from '@mui/material/Box';
import type { FC } from 'react';
import { greetingBurstOf } from '../logic/greeting-burst';
import type { GreetingBurstShot } from '../logic/use-greeting-conductor';
import { GreetingBurstPiece } from './GreetingBurstPiece';

const SEED_SPREAD = 97;

const BURST_LAYER = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  clipPath: 'inset(-100vh -100vw 0 -100vw)',
  '@media (prefers-reduced-motion: reduce)': { display: 'none' },
} as const;

const ANCHOR = { position: 'absolute', width: 0, height: 0 } as const;

interface GreetingBurstProps {
  shot: GreetingBurstShot | null;
}

export const GreetingBurst: FC<GreetingBurstProps> = ({ shot }) => {
  if (shot === null) {
    return null;
  }

  const pieces = greetingBurstOf(shot.key % SEED_SPREAD).map((piece) => (
    <GreetingBurstPiece key={piece.id} piece={piece} />
  ));
  const anchor = { left: shot.origin.x, top: shot.origin.y };

  return (
    <Box aria-hidden data-kk-greeting-burst sx={BURST_LAYER}>
      <Box key={shot.key} style={anchor} sx={ANCHOR}>
        {pieces}
      </Box>
    </Box>
  );
};
