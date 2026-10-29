import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../../../tokens';

const GLASS_SHARE = '78%';

export const studioFGlass = (theme: Theme): CSSObject => ({
  backgroundColor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.background.paper} ${GLASS_SHARE}, transparent)`,
  backdropFilter: `blur(${kkTokens.glass.blur})`,
  WebkitBackdropFilter: `blur(${kkTokens.glass.blur})`,
  boxShadow: kkTokens.shadow.rest,
});
