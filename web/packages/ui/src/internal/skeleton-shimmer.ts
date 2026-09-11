import type { CSSObject, Theme } from '@mui/material/styles';
import { inkWash } from './ink-wash';

const SHIMMER_ANIMATION = 'kk-skeleton-shimmer';
const SHIMMER_DURATION = '1.4s';
const SHIMMER_LOW = '7%';
const SHIMMER_HIGH = '14%';

export const skeletonSurface = (theme: Theme): CSSObject => {
  const low = inkWash(theme, SHIMMER_LOW);
  const high = inkWash(theme, SHIMMER_HIGH);

  return {
    backgroundImage: `linear-gradient(90deg, ${low}, ${high} 50%, ${low})`,
    backgroundSize: '200% 100%',
    animation: `${SHIMMER_ANIMATION} ${SHIMMER_DURATION} linear infinite`,
    [`@keyframes ${SHIMMER_ANIMATION}`]: {
      from: { backgroundPosition: '100% 0' },
      to: { backgroundPosition: '-100% 0' },
    },
  };
};
