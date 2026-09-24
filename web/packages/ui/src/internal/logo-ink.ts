import type { CSSObject, Theme } from '@mui/material/styles';

const DARK_FILTER = 'invert(1) hue-rotate(180deg)';

export const logoInk = (theme: Theme, darkExtras: CSSObject = {}): CSSObject => ({
  mixBlendMode: 'multiply',
  ...theme.applyStyles('dark', { filter: DARK_FILTER, mixBlendMode: 'screen', ...darkExtras }),
});
