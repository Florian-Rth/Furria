import type { CSSObject, Theme } from '@mui/material/styles';
import { inkFocusRing } from '../../../internal/ink-focus-ring';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const compassCellOf = (theme: Theme, pressed: boolean): CSSObject => ({
  width: kkTokens.tapTarget,
  height: kkTokens.tapTarget,
  borderRadius: `${kkTokens.radius.pill}px`,
  color: pressed ? palette(theme).background.paper : palette(theme).text.primary,
  backgroundColor: pressed ? palette(theme).text.primary : 'transparent',
  boxShadow: pressed ? 'none' : `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
  transition: 'background-color 160ms ease-out, color 160ms ease-out',
  '&:hover': pressed
    ? {}
    : { backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 6%, transparent)` },
  ...inkFocusRing(theme),
});
