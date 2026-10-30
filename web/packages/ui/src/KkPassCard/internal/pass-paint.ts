import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import { applyScheme, schemeEdge, schemeFill, schemeInk } from '../../internal/scheme-paint';
import { kkTokens } from '../../tokens';

const { light, dark } = kkTokens.color;

export const PASS_REDUCED_MOTION = '@media (prefers-reduced-motion: reduce)';
export const PASS_INSET = 2;
export const PASS_SECTION_GAP = 1.5;
export const PASS_STAGGER_MS = 70;
export const PASS_ASSEMBLE_MS = 380;
export const PASS_ROLL_MS = 620;
export const PASS_ROLL_DELAY_MS = 120;
export const PASS_STAGGERED_PARTS = 8;
export const PASS_TABULAR: CSSObject = { fontVariantNumeric: 'tabular-nums' };

export const passAssemble = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  to {
    opacity: 1;
    transform: none;
  }
`;

export const passRoll = keyframes`
  0% {
    transform: translateY(110%);
  }
  70% {
    transform: translateY(-6%);
  }
  100% {
    transform: none;
  }
`;

export const PASS_EYEBROW: CSSObject = {
  ...kkTokens.eyebrow,
  m: 0,
  minWidth: 0,
  color: 'text.secondary',
  typography: 'caption',
  fontWeight: 900,
  textTransform: 'uppercase',
};

export const passHairRule = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeEdge(light.line2, dark.line2));

export const passGoldInk = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeInk(light.goldInk, dark.goldInk));

export const passGoldEdge = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeEdge(light.gold, dark.gold));

export const passRedInk = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeInk(light.redInk, dark.redInk));

export const passCoinGround = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeFill(light.avatar, dark.avatar));

export const passFocus = (theme: Theme): CSSObject => ({
  '&.Mui-focusVisible, &:focus-visible': {
    outline: `${kkTokens.line.section}px solid`,
    outlineColor: (theme.vars ?? theme).palette.primary.main,
    outlineOffset: 2,
  },
});

const staggerOf = (count: number): CSSObject =>
  Object.fromEntries(
    Array.from({ length: count - 1 }, (_, index) => [
      `& > [data-kk-pass-part]${' + [data-kk-pass-part]'.repeat(index + 1)}`,
      { animationDelay: `${(index + 1) * PASS_STAGGER_MS}ms` },
    ]),
  );

export const passAssembly: CSSObject = {
  '& > [data-kk-pass-part]': {
    animation: `${passAssemble} ${PASS_ASSEMBLE_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1) both`,
  },
  ...staggerOf(PASS_STAGGERED_PARTS),
  [PASS_REDUCED_MOTION]: { '& > [data-kk-pass-part]': { animation: 'none' } },
};
