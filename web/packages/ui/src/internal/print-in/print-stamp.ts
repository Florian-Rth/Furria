import type { CSSObject } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';

export const PRINT_EASE = 'cubic-bezier(0.3, 0.7, 0.2, 1)';
export const PRINT_STILL: CSSObject = { animation: 'none' };
export const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';

const STAMP_MS = 540;

const stamp = keyframes`
  0% {
    opacity: 0;
    transform: translate(-3px, -5px) scale(1.035);
  }
  45% {
    opacity: 1;
    transform: translate(0, 0) scale(0.992);
  }
  72% {
    transform: scale(1.003);
  }
  100% {
    opacity: 1;
    transform: none;
  }
`;

const bleed = keyframes`
  0% {
    opacity: 0.55;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(2.8);
  }
`;

export const printStampOf = (delayMs: number, settled: boolean): CSSObject =>
  settled
    ? PRINT_STILL
    : {
        animation: `${stamp} ${STAMP_MS}ms ${PRINT_EASE} ${delayMs}ms backwards`,
        [REDUCED_MOTION]: PRINT_STILL,
      };

export const inkBleedOf = (hidden: boolean, settled: boolean): CSSObject => ({
  content: '""',
  position: 'absolute',
  borderRadius: '50%',
  backgroundColor: 'currentColor',
  pointerEvents: 'none',
  animation: settled ? 'none' : `${bleed} 2.4s ease-out infinite`,
  animationPlayState: hidden ? 'paused' : 'running',
  [REDUCED_MOTION]: PRINT_STILL,
});
