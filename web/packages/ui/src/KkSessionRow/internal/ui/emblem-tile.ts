import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../../../tokens';

const TILE_WIDTH = 11;
const TILE_HEIGHT = 8;
const TILE_INSET = 0.5;
const SPACING_PX = 8;

export const EMBLEM_SIZES = `${TILE_WIDTH * SPACING_PX}px`;

export const emblemTile = (theme: Theme): CSSObject => ({
  width: theme.spacing(TILE_WIDTH),
  height: theme.spacing(TILE_HEIGHT),
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(TILE_INSET),
  borderRadius: `${kkTokens.radius.base}px`,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderColor: (theme.vars ?? theme).palette.divider,
});
