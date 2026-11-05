import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../tokens';
import { focusRing } from './focus-ring';
import { inkWashSurface } from './ink-wash';
import { tapArea } from './tap-area';

export const planRaisedSurface = (theme: Theme): CSSObject => ({
  borderRadius: `${kkTokens.radius.base + 4}px`,
  backgroundColor: (theme.vars ?? theme).palette.background.paper,
  boxShadow: kkTokens.shadow.raised,
});

export const planButtonPaint = (theme: Theme, pressed: boolean): CSSObject => ({
  flexShrink: 0,
  borderRadius: `${kkTokens.radius.base}px`,
  color: pressed ? (theme.vars ?? theme).palette.background.paper : 'text.primary',
  backgroundColor: pressed ? (theme.vars ?? theme).palette.text.primary : 'transparent',
  ...focusRing(theme),
  ...tapArea(),
  '&.Mui-disabled': { color: 'text.disabled' },
  '@media (hover: hover)': {
    '&:hover': pressed ? {} : inkWashSurface(theme, '8%', '14%'),
  },
});
