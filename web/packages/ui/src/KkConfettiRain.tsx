import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import type { FC } from 'react';
import { buildConfettiPieces } from './confetti-pieces';

const fall = keyframes`
  from { transform: translateY(-10vh); }
  to { transform: translateY(110vh); }
`;

const sway = keyframes`
  from { transform: translateX(calc(var(--kk-confetti-sway) * -1)); }
  to { transform: translateX(var(--kk-confetti-sway)); }
`;

const tumble = keyframes`
  from {
    transform: perspective(700px) rotateX(0deg) rotateY(0deg) rotateZ(0deg);
  }
  to {
    transform: perspective(700px) rotateX(var(--kk-confetti-flip-x)) rotateY(var(--kk-confetti-flip-y)) rotateZ(var(--kk-confetti-spin));
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

export const KkConfettiRain: FC<KkConfettiRainProps> = ({
  count = 18,
  seed = 11,
  paused = false,
}) => {
  const pieces = buildConfettiPieces(count, seed);
  const playState = paused ? 'paused' : 'running';

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: -1,
        '@media (prefers-reduced-motion: reduce)': { display: 'none' },
      }}
    >
      {pieces.map((piece) => (
        <Box
          key={piece.id}
          sx={{
            position: 'absolute',
            top: 0,
            left: `${piece.leftPercent}%`,
            animation: `${fall} ${piece.durationSeconds}s linear infinite`,
            animationDelay: `${piece.delaySeconds}s`,
            animationPlayState: playState,
          }}
        >
          <Box
            sx={{
              animation: `${sway} ${piece.swayDurationSeconds}s ease-in-out infinite alternate`,
              animationDelay: `${piece.swayDelaySeconds}s`,
              animationPlayState: playState,
              '--kk-confetti-sway': `${piece.swayVw}vw`,
            }}
          >
            <Box
              component="span"
              sx={{
                display: 'block',
                width: piece.size,
                height: piece.isSlim ? piece.size * 0.45 : piece.size,
                borderRadius: piece.isRound ? '50%' : '2px',
                bgcolor: PIECE_COLOR[piece.color],
                opacity: 0.85,
                animation: `${tumble} ${piece.durationSeconds}s linear infinite`,
                animationDelay: `${piece.delaySeconds}s`,
                animationPlayState: playState,
                '--kk-confetti-spin': `${piece.spinDegrees}deg`,
                '--kk-confetti-flip-x': `${piece.flipXDegrees}deg`,
                '--kk-confetti-flip-y': `${piece.flipYDegrees}deg`,
              }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
};
