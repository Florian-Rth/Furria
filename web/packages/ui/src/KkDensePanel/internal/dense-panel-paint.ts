import type { CSSObject, Theme } from '@mui/material/styles';
import { raisedSurfaceScheme } from '../../internal/raised-surface';
import type { KkScheme } from '../../internal/scheme-paint';
import { applyScheme, schemeEdge } from '../../internal/scheme-paint';
import { kkTokens } from '../../tokens';

export type KkDensePanelMaterial = 'own' | 'club';

const { light, dark } = kkTokens.color;
const { anchor, stackedAnchor, cellMin } = kkTokens.densePanel;

export const DENSE_INSET = 1.5;
export const DENSE_GAP = kkTokens.densePanel.gap;
export const DENSE_HEAD_LINE_BOX = '1.25rem';
export const DENSE_TICK_HEIGHT = '1.75rem';
export const DENSE_INNER_RADIUS = `${kkTokens.radius.base - kkTokens.line.hair}px`;
export const DENSE_CELLS_CONTAINER = 'kk-dense-cells';
export const DENSE_CELLS_TWO_UP = `@container ${DENSE_CELLS_CONTAINER} (min-width: calc(${cellMin} * 2))`;
export const LAST_LINE_OF_PANEL = '[data-kk-dense-lines]:last-child > &:last-of-type';
export const DENSE_LINE_CONTAINER = 'kk-dense-line';
export const DENSE_LINE_STACKED = `@container ${DENSE_LINE_CONTAINER} (max-width: 16rem)`;

const restShadow: KkScheme = {
  light: { boxShadow: kkTokens.shadow.rest },
  dark: { boxShadow: 'none' },
};

const ruleImage = (ink: string): string => `linear-gradient(${ink}, ${ink})`;

const factRuleScheme: KkScheme = {
  light: { backgroundImage: ruleImage(light.line2) },
  dark: { backgroundImage: ruleImage(dark.line2) },
};

export const densePanelFrame: CSSObject = {
  minWidth: 0,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderRadius: `${kkTokens.radius.base}px`,
  pt: DENSE_INSET,
};

export const densePanelMaterials: Record<KkDensePanelMaterial, (theme: Theme) => CSSObject> = {
  own: (theme) =>
    applyScheme(theme, raisedSurfaceScheme, schemeEdge(light.line2, dark.line2), restShadow),
  club: () => ({ backgroundColor: 'transparent', borderColor: 'text.disabled' }),
};

export const factColumnOf = (theme: Theme): string =>
  `calc(${theme.spacing(DENSE_INSET)} + ${anchor} + ${theme.spacing(DENSE_GAP)})`;

const ruleSizeFrom = (start: string): string => `calc(100% - ${start}) ${kkTokens.line.hair}px`;

export const DENSE_STACKED_SPINE = `minmax(${stackedAnchor}, auto)`;

export const factRulePaint = (theme: Theme): CSSObject => ({
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right top',
  backgroundSize: ruleSizeFrom(factColumnOf(theme)),
  ...applyScheme(theme, factRuleScheme),
});

export const stackedFactRulePaint = (theme: Theme): CSSObject => ({
  backgroundSize: ruleSizeFrom(
    `(${theme.spacing(DENSE_INSET)} + ${stackedAnchor} + ${theme.spacing(DENSE_GAP)})`,
  ),
  '&:has([data-kk-dense-stamp])': { backgroundSize: ruleSizeFrom(theme.spacing(DENSE_INSET)) },
});

export const FACT_YIELD: CSSObject = { flexShrink: 1, minWidth: 0 };

export const factHoldPaint = (theme: Theme): CSSObject => ({
  flexShrink: 0,
  maxWidth: `calc(100% - ${theme.spacing(DENSE_GAP)})`,
});

export const insetFocusRing = (theme: Theme): CSSObject => ({
  outline: `${kkTokens.line.section}px solid`,
  outlineColor: (theme.vars ?? theme).palette.primary.main,
  outlineOffset: -kkTokens.line.section,
});

export const denseRowFrame: CSSObject = {
  position: 'relative',
  minWidth: 0,
  minHeight: kkTokens.tapTarget,
  alignItems: 'center',
  gap: DENSE_GAP,
  px: DENSE_INSET,
};

export const denseSpineFrame: CSSObject = {
  width: anchor,
  flexShrink: 0,
  alignSelf: 'stretch',
  alignItems: 'flex-start',
  justifyContent: 'center',
};
