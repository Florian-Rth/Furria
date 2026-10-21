import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import type { KkScheme } from '../../internal/scheme-paint';
import { applyScheme, schemeEdge, schemeFill, schemeInk } from '../../internal/scheme-paint';
import { kkTokens } from '../../tokens';

const { light, dark } = kkTokens.color;

export const TILE_INSET = 1.5;
export const TILE_GAP = 1.25;
export const TILE_CONTROL = '[data-kk-start-tile-control]';
export const TILE_REACH = '[data-kk-start-tile-reach]';
export const TILE_RADIUS = `${kkTokens.radius.base}px`;
export const TILE_INNER_RADIUS = `${kkTokens.radius.base - 4}px`;
export const TABULAR: CSSObject = { fontVariantNumeric: 'tabular-nums' };
export const TILE_AUTHOR_FACE = '1.625rem';
export const TILE_AUTHOR_GAP = 1;
export const TILE_ROW_COLUMNS = 'max-content 3px minmax(0, 1fr) auto';
export const SUBGRID_ROW: CSSObject = {
  display: 'grid',
  gridColumn: '1 / -1',
  gridTemplateColumns: 'subgrid',
};

export const tileBreath = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.6);
    opacity: 0.35;
  }
`;

export const tileAttentionEdge = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeEdge(light.gold, dark.gold));

export const tileHoverEdge = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeEdge(light.line, dark.line));

export const tilePressFill = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeFill(light.line2, dark.line2));

export const goldInkScheme: KkScheme = schemeInk(light.goldInk, dark.goldInk);
export const greenInkScheme: KkScheme = schemeInk(light.greenInk, dark.greenInk);
export const blueInkScheme: KkScheme = schemeInk(light.blueInk, dark.blueInk);
export const hairRuleScheme: KkScheme = schemeEdge(light.line2, dark.line2);
export const coinGroundScheme: KkScheme = schemeFill(light.avatar, dark.avatar);
export const goldGroundScheme: KkScheme = schemeFill(
  `color-mix(in srgb, ${light.gold} 22%, transparent)`,
  `color-mix(in srgb, ${dark.gold} 18%, transparent)`,
);

export const goldInk = (theme: Theme): CSSObject => applyScheme(theme, goldInkScheme);
export const greenInk = (theme: Theme): CSSObject => applyScheme(theme, greenInkScheme);
export const hairRule = (theme: Theme): CSSObject => applyScheme(theme, hairRuleScheme);
export const coinGround = (theme: Theme): CSSObject => applyScheme(theme, coinGroundScheme);
export const goldGround = (theme: Theme): CSSObject => applyScheme(theme, goldGroundScheme);

export const OWED_RING_SIZE = '0.875rem';

export const owedRing = (theme: Theme): CSSObject => ({
  display: 'block',
  width: OWED_RING_SIZE,
  height: OWED_RING_SIZE,
  borderRadius: '50%',
  borderWidth: kkTokens.line.section,
  borderStyle: 'solid',
  borderColor: 'currentColor',
  ...goldGround(theme),
});

export const EYEBROW: CSSObject = {
  ...kkTokens.eyebrow,
  m: 0,
  minWidth: 0,
  color: 'text.secondary',
};

export const DISPLAY_NUMBER: CSSObject = {
  ...TABULAR,
  lineHeight: 0.9,
  letterSpacing: kkTokens.type.tracking.tight,
};

export const controlFocus = (theme: Theme): CSSObject => ({
  '&.Mui-focusVisible, &:focus-visible': {
    outline: `${kkTokens.line.section}px solid`,
    outlineColor: (theme.vars ?? theme).palette.primary.main,
    outlineOffset: 1,
  },
});

export const tilePop = keyframes`
  from {
    opacity: 0;
    transform: scale(0.4);
  }
  60% {
    opacity: 1;
    transform: scale(1.12);
  }
  to {
    opacity: 1;
    transform: none;
  }
`;

const POP_MS = 380;
const POP_STEP_MS = 70;
const POP_SLOTS = 8;

export const staggeredPop = (selector: string, startMs: number): CSSObject =>
  Object.fromEntries(
    Array.from({ length: POP_SLOTS }, (_, index) => [
      `& > ${selector}:nth-of-type(${index + 1})`,
      { animation: `${tilePop} ${POP_MS}ms ease-out ${startMs + index * POP_STEP_MS}ms both` },
    ]),
  );
