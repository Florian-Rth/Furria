import type { CSSObject } from '@mui/material/styles';
import {
  STUDIO_G_ARRIVE_MS,
  STUDIO_G_EASE,
  STUDIO_G_STAGGER_MS,
} from '../logic/studio-g-desk-queries';

export type KkStudioGArrival = 'settle' | 'rise';

const FRAMES: Record<KkStudioGArrival, CSSObject> = {
  settle: {
    from: { opacity: 0, transform: 'scale(0.97)' },
    to: { opacity: 1, transform: 'none' },
  },
  rise: {
    from: { opacity: 0, transform: 'translateY(1.25rem)' },
    to: { opacity: 1, transform: 'none' },
  },
};

export const arrivalOf = (kind: KkStudioGArrival, order: number): CSSObject => ({
  animation: `kk-studio-g-${kind} ${STUDIO_G_ARRIVE_MS}ms ${STUDIO_G_EASE} ${order * STUDIO_G_STAGGER_MS}ms both`,
  [`@keyframes kk-studio-g-${kind}`]: FRAMES[kind],
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
});
