import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import { inkWash } from '../../internal/ink-wash';
import { applyScheme, schemeInk } from '../../internal/scheme-paint';
import { toneRecipes } from '../../internal/tone';
import { kkTokens } from '../../tokens';

export type KkStateTone = 'ink' | 'green' | 'gold' | 'accent';

export const RAIL_CONTAINER = 'kk-state-rail';
export const RAIL_WIDE = `@container ${RAIL_CONTAINER} (min-width: 40rem)`;
export const RAIL_TILE_INSET_X = 2;
export const RAIL_TILE_INSET_Y = 1.5;
export const RAIL_EDGE = '0.25rem';
export const RAIL_RISE_SECONDS = 0.3;
export const RAIL_STEP_SECONDS = 0.05;
export const RAIL_START_SECONDS = 0.18;
export const RAIL_STAGGERED_TILES = 8;

export const railRise = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const railEdgeDraw = keyframes`
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
`;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const toneSource = (theme: Theme, tone: KkStateTone): string => {
  switch (tone) {
    case 'ink':
      return inkWash(theme, '28%');
    case 'green':
      return palette(theme).success.main;
    case 'gold':
      return palette(theme).warning.main;
    case 'accent':
      return palette(theme).primary.main;
  }
};

export const toneValueInk = (theme: Theme, tone: KkStateTone): CSSObject =>
  tone === 'ink'
    ? { color: 'text.primary' }
    : applyScheme(theme, schemeInk(toneRecipes[tone].inkLight, toneRecipes[tone].inkDark));

export const jumpPaint = (theme: Theme): CSSObject => ({
  appearance: 'none',
  border: 0,
  m: 0,
  color: 'inherit',
  textAlign: 'left',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  '&:focus-visible': {
    outline: `${kkTokens.line.section}px solid`,
    outlineColor: palette(theme).primary.main,
    outlineOffset: -kkTokens.line.section,
  },
  '@media (hover: hover)': {
    '&:hover [data-kk-state-value]': { textDecoration: 'underline' },
  },
});
