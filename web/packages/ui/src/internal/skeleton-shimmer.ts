import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../tokens';
import { inkWash } from './ink-wash';

const SHIMMER_LOW = '7%';
const SHIMMER_HIGH = '14%';
const SHIMMER_LOW_DARK = '10%';
const SHIMMER_HIGH_DARK = '20%';

const gradient = (theme: Theme, low: string, high: string): string =>
  `linear-gradient(90deg, ${inkWash(theme, low)}, ${inkWash(theme, high)} 50%, ${inkWash(theme, low)})`;

export const skeletonSurface = (theme: Theme): CSSObject => ({
  backgroundImage: gradient(theme, SHIMMER_LOW, SHIMMER_HIGH),
  backgroundSize: '200% 100%',
  animation: kkTokens.motion.shimmer,
  ...theme.applyStyles('dark', {
    backgroundImage: gradient(theme, SHIMMER_LOW_DARK, SHIMMER_HIGH_DARK),
  }),
});
