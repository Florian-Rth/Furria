import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import type { FC } from 'react';
import { buildBurstPieces } from './burst-pieces';

const burst = keyframes`
  from {
    transform: translate3d(0, 0, 0) rotate(0deg);
    opacity: 1;
  }
  to {
    transform: translate3d(var(--kk-burst-x), var(--kk-burst-y), 0) rotate(var(--kk-burst-spin));
    opacity: 0;
  }
`;

const PIECE_COLOR = {
  red: 'primary.main',
  gold: 'warning.main',
  ink: 'text.primary',
} as const;

interface KkConfettiBurstProps {
  fireKey: number;
  count?: number;
  seed?: number;
}

export const KkConfettiBurst: FC<KkConfettiBurstProps> = ({ fireKey, count = 12, seed = 11 }) => {
  if (fireKey === 0) {
    return null;
  }

  const pieces = buildBurstPieces(count, seed + fireKey);

  return (
    <Box
      key={fireKey}
      aria-hidden
      sx={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 0,
        height: 0,
        pointerEvents: 'none',
        '@media (prefers-reduced-motion: reduce)': { display: 'none' },
      }}
    >
      {pieces.map((piece) => (
        <Box
          key={piece.id}
          component="span"
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: piece.size,
            height: piece.isSlim ? piece.size * 0.5 : piece.size,
            borderRadius: piece.isRound ? '50%' : '2px',
            bgcolor: PIECE_COLOR[piece.color],
            opacity: 0,
            animation: `${burst} ${piece.durationSeconds}s ease-out forwards`,
            '--kk-burst-x': `${piece.offsetX}px`,
            '--kk-burst-y': `${piece.offsetY}px`,
            '--kk-burst-spin': `${piece.spinDegrees}deg`,
          }}
        />
      ))}
    </Box>
  );
};
