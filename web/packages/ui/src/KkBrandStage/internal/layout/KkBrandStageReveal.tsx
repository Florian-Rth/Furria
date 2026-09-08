import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';

const rise = keyframes`
  from { opacity: 0; transform: translate3d(0, 1.5rem, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
`;

const wipe = keyframes`
  from { opacity: 0; transform: scaleX(0); }
  to { opacity: 1; transform: scaleX(1); }
`;

const revealMotions = { rise, wipe } as const;

type KkBrandStageRevealMotion = keyof typeof revealMotions;

const DURATION_SECONDS: Record<KkBrandStageRevealMotion, number> = { rise: 0.72, wipe: 0.56 };
const BASE_DELAY_SECONDS = 0.08;
const STEP_DELAY_SECONDS = 0.14;
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

interface KkBrandStageRevealProps extends PropsWithChildren {
  step: number;
  motion?: KkBrandStageRevealMotion;
}

export const KkBrandStageReveal: FC<KkBrandStageRevealProps> = ({
  step,
  motion = 'rise',
  children,
}) => {
  const animation = `${revealMotions[motion]} ${DURATION_SECONDS[motion]}s ${EASING} both`;
  const animationDelay = `${BASE_DELAY_SECONDS + step * STEP_DELAY_SECONDS}s`;

  return (
    <Box data-kk-brand-stage-reveal sx={{ animation, animationDelay }}>
      {children}
    </Box>
  );
};
