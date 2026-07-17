import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import type { FC } from 'react';
import { buildConfettiPieces } from './confetti-pieces';

const fall = keyframes`
  from {
    transform: translate3d(0, -10vh, 0) rotate(0deg);
  }
  to {
    transform: translate3d(var(--kk-confetti-drift), 110vh, 0) rotate(var(--kk-confetti-spin));
  }
`;

const PIECE_COLOR = {
  red: 'primary.main',
  gold: 'warning.main',
  ink: 'text.primary',
} as const;

interface KkConfettiRainProps {
  count?: number;
  seed?: number;
  paused?: boolean;
}

// Decorative full-viewport confetti rain (Konfetti Kinetik signature gesture).
// Purely visual: hidden from assistive tech, ignores pointer events, and
// disabled entirely for users who prefer reduced motion.
// Pause the rain while a backdrop-filter surface (e.g. a blurred dialog
// backdrop) covers it — animated content beneath a backdrop filter forces a
// full-viewport re-blur on every frame.
export const KkConfettiRain: FC<KkConfettiRainProps> = ({
  count = 18,
  seed = 11,
  paused = false,
}) => {
  const pieces = buildConfettiPieces(count, seed);

  return (
    <Box
      aria-hidden
      sx={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        '@media (prefers-reduced-motion: reduce)': { display: 'none' },
      }}
    >
      {pieces.map((piece) => (
        <Box
          key={piece.id}
          component="span"
          sx={{
            position: 'absolute',
            top: 0,
            left: `${piece.leftPercent}%`,
            width: piece.size,
            height: piece.isSlim ? piece.size * 0.45 : piece.size,
            borderRadius: piece.isRound ? '50%' : '2px',
            bgcolor: PIECE_COLOR[piece.color],
            opacity: 0.85,
            animation: `${fall} ${piece.durationSeconds}s linear infinite`,
            animationDelay: `${piece.delaySeconds}s`,
            animationPlayState: paused ? 'paused' : 'running',
            '--kk-confetti-drift': `${piece.driftVw}vw`,
            '--kk-confetti-spin': `${piece.spinDegrees}deg`,
          }}
        />
      ))}
    </Box>
  );
};
