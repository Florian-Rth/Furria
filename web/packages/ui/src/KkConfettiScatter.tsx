import Box from '@mui/material/Box';
import type { FC } from 'react';
import { buildScatterPieces } from './scatter-pieces';

const PIECE_COLOR = {
  red: 'primary.main',
  gold: 'warning.main',
  ink: 'text.primary',
} as const;

interface KkConfettiScatterProps {
  count?: number;
  seed?: number;
}

export const KkConfettiScatter: FC<KkConfettiScatterProps> = ({ count = 12, seed = 12 }) => {
  const pieces = buildScatterPieces(count, seed);

  return (
    <Box
      data-kk-confetti-scatter
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      {pieces.map((piece) => (
        <Box
          key={piece.id}
          component="span"
          sx={{
            position: 'absolute',
            left: `${piece.xPercent}%`,
            top: `${piece.yPercent}%`,
            width: piece.size,
            height: piece.isSlim ? piece.size * 0.45 : piece.size,
            borderRadius: piece.isRound ? '50%' : '2px',
            bgcolor: PIECE_COLOR[piece.color],
            opacity: 0.7,
            transform: `rotate(${piece.rotation}deg)`,
          }}
        />
      ))}
    </Box>
  );
};
