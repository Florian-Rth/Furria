import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import type { GreetingBurstColor, GreetingBurstPiece as Piece } from '../logic/greeting-burst';

const fling = keyframes`
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
    opacity: 1;
    animation-timing-function: cubic-bezier(0.2, 0.7, 0.4, 1);
  }
  45% {
    transform: translate3d(var(--kk-greeting-rise-x), var(--kk-greeting-rise-y), 0)
      rotate(calc(var(--kk-greeting-spin) * 0.5));
    opacity: 1;
    animation-timing-function: cubic-bezier(0.5, 0, 0.8, 0.6);
  }
  100% {
    transform: translate3d(var(--kk-greeting-drop-x), var(--kk-greeting-drop-y), 0)
      rotate(var(--kk-greeting-spin));
    opacity: 0;
  }
`;

const PIECE_COLOR: Record<GreetingBurstColor, string> = {
  red: 'primary.main',
  gold: 'warning.main',
  ink: 'text.primary',
};

const SLIM_SHARE = 0.5;

interface GreetingBurstPieceProps {
  piece: Piece;
}

export const GreetingBurstPiece: FC<GreetingBurstPieceProps> = ({ piece }) => {
  const height = piece.isRound ? piece.size : piece.size * SLIM_SHARE;
  const corner = piece.isRound ? '50%' : `${kkTokens.radius.bar}px`;

  return (
    <Box
      component="span"
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: piece.size,
        height,
        borderRadius: corner,
        bgcolor: PIECE_COLOR[piece.color],
        opacity: 0,
        animation: `${fling} ${piece.durationSeconds}s linear ${piece.delaySeconds}s both`,
        '--kk-greeting-rise-x': `${piece.riseX}px`,
        '--kk-greeting-rise-y': `${piece.riseY}px`,
        '--kk-greeting-drop-x': `${piece.dropX}px`,
        '--kk-greeting-drop-y': `${piece.dropY}px`,
        '--kk-greeting-spin': `${piece.spin}deg`,
      }}
    />
  );
};
