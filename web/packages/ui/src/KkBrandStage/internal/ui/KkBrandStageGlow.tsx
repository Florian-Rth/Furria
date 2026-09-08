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

export const KkBrandStageGlow: FC = () => (
  <Box
    aria-hidden
    data-kk-brand-stage-glow
    sx={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: -1,
    }}
  >
    <Box
      sx={(theme) => ({
        position: 'absolute',
        top: '-14%',
        left: '-10%',
        width: '82%',
        aspectRatio: '1 / 1',
        borderRadius: '50%',
        filter: POOL_BLUR,
        willChange: 'transform',
        opacity: WARM_OPACITY.light,
        backgroundImage: `radial-gradient(circle, ${(theme.vars ?? theme).palette.primary.main} 0%, transparent 68%)`,
        animation: `${driftWarm} ${WARM_DURATION_SECONDS}s ease-in-out infinite alternate`,
        ...theme.applyStyles('dark', { opacity: WARM_OPACITY.dark }),
      })}
    />
    <Box
      sx={(theme) => ({
        position: 'absolute',
        bottom: '-18%',
        right: '-14%',
        width: '68%',
        aspectRatio: '1 / 1',
        borderRadius: '50%',
        filter: POOL_BLUR,
        willChange: 'transform',
        opacity: GOLD_OPACITY.light,
        backgroundImage: `radial-gradient(circle, ${(theme.vars ?? theme).palette.warning.main} 0%, transparent 66%)`,
        animation: `${driftGold} ${GOLD_DURATION_SECONDS}s ease-in-out infinite alternate`,
        ...theme.applyStyles('dark', { opacity: GOLD_OPACITY.dark }),
      })}
    />
  </Box>
);
