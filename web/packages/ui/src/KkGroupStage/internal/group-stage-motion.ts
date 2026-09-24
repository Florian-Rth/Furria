import type { CSSObject } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import {
  GROUP_STAGE_EASING,
  GROUP_STAGE_REVEAL_SECONDS,
  groupStageDelayOf,
} from './group-stage-reveal';

const rise = keyframes`
  from { opacity: 0; transform: translate3d(0, 1.25rem, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
`;

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';

export const groupStageRevealAt = (step: number): CSSObject => ({
  animation: `${rise} ${GROUP_STAGE_REVEAL_SECONDS}s ${GROUP_STAGE_EASING} both`,
  animationDelay: `${groupStageDelayOf(step)}s`,
  [REDUCED_MOTION]: { animation: 'none' },
});
