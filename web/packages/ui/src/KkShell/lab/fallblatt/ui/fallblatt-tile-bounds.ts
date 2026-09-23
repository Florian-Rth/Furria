import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../../../../tokens';

const TILE_BLEED_Y = -0.375;

export const fallblattTileBounds = (theme: Theme): CSSObject => ({
  position: 'absolute',
  top: theme.spacing(TILE_BLEED_Y),
  bottom: theme.spacing(TILE_BLEED_Y),
  left: 0,
  right: kkTokens.line.hair / 2,
  borderRadius: `${kkTokens.radius.bar}px`,
});
