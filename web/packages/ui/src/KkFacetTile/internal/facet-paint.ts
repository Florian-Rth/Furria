import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import { redInk } from '../../internal/red-ink';
import { applyScheme, schemeEdge, schemeFill, schemeInk } from '../../internal/scheme-paint';
import { kkTokens } from '../../tokens';

const { light, dark } = kkTokens.color;

export const FACET_RADIUS = `${kkTokens.radius.base}px`;
export const FACET_INNER_RADIUS = `${kkTokens.radius.base - 4}px`;
export const FACET_CONTROL = '[data-kk-facet-control]';
export const FACET_DOOR = '[data-kk-facet-door]';
export const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';
export const TABULAR: CSSObject = { fontVariantNumeric: 'tabular-nums' };

const ASSEMBLE_MS = 420;
const ASSEMBLE_STEP_MS = 90;
const ASSEMBLE_EASE = 'cubic-bezier(0.2, 0.8, 0.2, 1)';

const assemble = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.75rem) scale(0.96);
  }
  to {
    opacity: 1;
    transform: none;
  }
`;

export const assembleOf = (order: number): CSSObject => ({
  animation: `${assemble} ${ASSEMBLE_MS}ms ${ASSEMBLE_EASE} ${order * ASSEMBLE_STEP_MS}ms backwards`,
  [REDUCED_MOTION]: { animation: 'none' },
});

export const assembleEndMs = (order: number): number => order * ASSEMBLE_STEP_MS + ASSEMBLE_MS;

const breath = keyframes`
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 color-mix(in srgb, currentColor 0%, transparent);
  }
  45% {
    transform: scale(1.14);
    box-shadow: 0 0 0 0.5rem color-mix(in srgb, currentColor 22%, transparent);
  }
`;

const swell = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  45% {
    transform: scale(1.1);
  }
`;

const BREATH_MS = 1100;

export const swellOnceAfter = (delayMs: number): CSSObject => ({
  animation: `${swell} ${BREATH_MS}ms ease-in-out ${delayMs}ms 1 both`,
  [REDUCED_MOTION]: { animation: 'none' },
});

export const breathOnceAfter = (delayMs: number): CSSObject => ({
  animation: `${breath} ${BREATH_MS}ms ease-in-out ${delayMs}ms 1 both`,
  [REDUCED_MOTION]: { animation: 'none' },
});

export const attentionEdge = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeEdge(light.gold, dark.gold));

export const facetSurface = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeFill(light.panel2, dark.panel), schemeEdge(light.line, dark.line));

export const pressFill = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeFill(light.line2, dark.line2));

export const goldInk = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeInk(light.goldInk, dark.goldInk));

export const greenInk = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeInk(light.greenInk, dark.greenInk));

export const goldWash = (theme: Theme): CSSObject =>
  applyScheme(
    theme,
    schemeFill(
      `color-mix(in srgb, ${light.gold} 14%, transparent)`,
      `color-mix(in srgb, ${dark.gold} 10%, transparent)`,
    ),
  );

export const currentMark = (theme: Theme): CSSObject => ({
  '&::before': {
    content: '""',
    position: 'absolute',
    left: '1rem',
    right: '1rem',
    top: 0,
    height: kkTokens.line.page,
    borderRadius: `0 0 ${kkTokens.radius.bar}px ${kkTokens.radius.bar}px`,
    backgroundColor: 'currentColor',
    ...redInk(theme),
  },
});

export const controlFocus = (theme: Theme): CSSObject => ({
  '&.Mui-focusVisible, &:focus-visible': {
    outline: `${kkTokens.line.section}px solid`,
    outlineColor: (theme.vars ?? theme).palette.primary.main,
    outlineOffset: 1,
  },
});

export const EYEBROW: CSSObject = {
  ...kkTokens.eyebrow,
  letterSpacing: kkTokens.type.tracking.display,
  m: 0,
  minWidth: 0,
  color: 'text.secondary',
};

export const DISPLAY_FIGURE: CSSObject = {
  ...TABULAR,
  lineHeight: 0.95,
  letterSpacing: kkTokens.type.tracking.tight,
};
