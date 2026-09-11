import type { CSSObject, Theme } from '@mui/material/styles';

const WASH_LIGHT = '10%';
const WASH_DARK = '18%';

const mix = (theme: Theme, amount: string): string =>
  `color-mix(in srgb, ${(theme.vars ?? theme).palette.primary.main} ${amount}, transparent)`;

export const accentWash = (theme: Theme): CSSObject => ({
  backgroundColor: mix(theme, WASH_LIGHT),
  ...theme.applyStyles('dark', { backgroundColor: mix(theme, WASH_DARK) }),
});
