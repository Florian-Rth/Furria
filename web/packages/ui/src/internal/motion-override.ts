import type { CSSObject } from '@mui/material/styles';

const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';

export const keepsPlaying = (
  alwaysPlays: boolean,
  seconds: number,
  iterations: 'infinite' | 1,
): CSSObject =>
  alwaysPlays
    ? {
        [REDUCED_MOTION]: {
          animationDuration: `${seconds}s !important`,
          animationIterationCount: `${iterations} !important`,
        },
      }
    : {};
