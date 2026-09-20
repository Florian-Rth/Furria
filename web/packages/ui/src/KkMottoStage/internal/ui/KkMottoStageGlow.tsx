import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import type { FC } from 'react';

const driftWarm = keyframes`
  from { transform: translate3d(-12%, -8%, 0) scale(1); }
  to { transform: translate3d(14%, 10%, 0) scale(1.18); }
`;

const driftGold = keyframes`
  from { transform: translate3d(12%, 14%, 0) scale(1.14); }
  to { transform: translate3d(-16%, -12%, 0) scale(0.92); }
`;

const WARM_DURATION_SECONDS = 26;
const GOLD_DURATION_SECONDS = 34;
const POOL_BLUR = 'blur(56px)';
const WARM_OPACITY = { light: 0.11, dark: 0.24 } as const;
const GOLD_OPACITY = { light: 0.09, dark: 0.16 } as const;
const STILL = 'none';
const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';

interface KkMottoStageGlowProps {
  ambient: boolean;
}

export const KkMottoStageGlow: FC<KkMottoStageGlowProps> = ({ ambient }) => {
  const warmAnimation = ambient
    ? `${driftWarm} ${WARM_DURATION_SECONDS}s ease-in-out infinite alternate`
    : STILL;
  const goldAnimation = ambient
    ? `${driftGold} ${GOLD_DURATION_SECONDS}s ease-in-out infinite alternate`
    : STILL;

  return (
    <Box
      aria-hidden
      data-kk-motto-stage-glow
      sx={{
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      <Box
        sx={(theme) => ({
          position: 'absolute',
          top: '-16%',
          left: '-12%',
          width: '78%',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          filter: POOL_BLUR,
          willChange: 'transform',
          opacity: WARM_OPACITY.light,
          backgroundImage: `radial-gradient(circle, ${(theme.vars ?? theme).palette.primary.main} 0%, transparent 68%)`,
          animation: warmAnimation,
          [REDUCED_MOTION]: { animation: STILL },
          ...theme.applyStyles('dark', { opacity: WARM_OPACITY.dark }),
        })}
      />
      <Box
        sx={(theme) => ({
          position: 'absolute',
          bottom: '-20%',
          right: '-16%',
          width: '66%',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          filter: POOL_BLUR,
          willChange: 'transform',
          opacity: GOLD_OPACITY.light,
          backgroundImage: `radial-gradient(circle, ${(theme.vars ?? theme).palette.warning.main} 0%, transparent 66%)`,
          animation: goldAnimation,
          [REDUCED_MOTION]: { animation: STILL },
          ...theme.applyStyles('dark', { opacity: GOLD_OPACITY.dark }),
        })}
      />
    </Box>
  );
};
