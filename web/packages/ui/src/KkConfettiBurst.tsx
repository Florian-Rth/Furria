import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import type { FC } from 'react';
import { buildBurstPieces } from './burst-pieces';

const fling = keyframes`
  from {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
  to {
    transform: translate3d(var(--kk-burst-x), var(--kk-burst-y), 0);
    opacity: 0;
  }
`;

const tumble = keyframes`
  from {
    transform: perspective(700px) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
  }
  to {
    transform: perspective(700px) rotateX(var(--kk-burst-flip-x)) rotateY(var(--kk-burst-flip-y)) rotateZ(var(--kk-burst-spin));
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
            opacity: 0,
            animation: `${fling} ${piece.durationSeconds}s ease-out forwards`,
            '--kk-burst-x': `${piece.offsetX}px`,
            '--kk-burst-y': `${piece.offsetY}px`,
          }}
        >
          <Box
            component="span"
            sx={{
              display: 'block',
              width: piece.size,
              height: piece.isSlim ? piece.size * 0.5 : piece.size,
              borderRadius: piece.isRound ? '50%' : '2px',
              bgcolor: PIECE_COLOR[piece.color],
              animation: `${tumble} ${piece.durationSeconds}s ease-out forwards`,
              '--kk-burst-spin': `${piece.spinDegrees}deg`,
              '--kk-burst-flip-x': `${piece.flipXDegrees}deg`,
              '--kk-burst-flip-y': `${piece.flipYDegrees}deg`,
            }}
          />
        </Box>
      ))}
    </Box>
  );
};
