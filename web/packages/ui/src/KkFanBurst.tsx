import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import type { GreetingBurstFan } from './KkGreeting/internal/logic/greeting-burst';
import { greetingBurstOf } from './KkGreeting/internal/logic/greeting-burst';
import { GreetingBurstPiece } from './KkGreeting/internal/ui/GreetingBurstPiece';

const MS_PER_SECOND = 1000;

interface KkFanBurstProps {
  seed?: number;
  atMs?: number;
  fan?: GreetingBurstFan;
  sx?: SxProps<Theme>;
}

export const KkFanBurst: FC<KkFanBurstProps> = ({ seed = 0, atMs = 0, fan = 'up', sx }) => {
  const leadSeconds = atMs / MS_PER_SECOND;
  const pieces = greetingBurstOf(seed, fan).map((piece) => (
    <GreetingBurstPiece key={piece.id} piece={piece} leadSeconds={leadSeconds} />
  ));

  return (
    <Box
      aria-hidden
      sx={[
        {
          position: 'absolute',
          width: 0,
          height: 0,
          pointerEvents: 'none',
          '@media (prefers-reduced-motion: reduce)': { display: 'none' },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {pieces}
    </Box>
  );
};
