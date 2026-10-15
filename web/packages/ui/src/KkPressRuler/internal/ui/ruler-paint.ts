import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import { applyScheme, schemeInk } from '../../../internal/scheme-paint';
import { kkTokens } from '../../../tokens';

const roll = keyframes`from { transform: scaleX(0); }`;
const press = keyframes`from { transform: scaleY(0); }`;
const plate = keyframes`from { transform: translate(4px, -3px); opacity: 0; }`;
const fade = keyframes`from { opacity: 0; }`;
const stamp = keyframes`from { transform: scale(1.35); opacity: 0; }`;

const gold = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeInk(kkTokens.color.light.gold, kkTokens.color.dark.gold));

const goldInk = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeInk(kkTokens.color.light.goldInk, kkTokens.color.dark.goldInk));

export const rulerGoldInk = goldInk;

const pressMotion: CSSObject = {
  '@media (prefers-reduced-motion: no-preference)': {
    '& [data-press="roll"]': {
      transformBox: 'fill-box',
      transformOrigin: 'left center',
      animation: `${roll} 450ms cubic-bezier(.2,.7,.2,1) both`,
    },
    '& [data-press="cell"]': {
      transformBox: 'fill-box',
      transformOrigin: 'center bottom',
      animation: `${press} 240ms cubic-bezier(.2,1.5,.4,1) both`,
    },
    '& [data-press="plate"]': { animation: `${plate} 320ms cubic-bezier(.3,1.6,.4,1) both` },
    '& [data-press="needle"]': {
      transformBox: 'fill-box',
      transformOrigin: 'center top',
      animation: `${press} 260ms cubic-bezier(.2,1.5,.4,1) both`,
    },
    '& [data-press="band"]': { animation: `${fade} 300ms ease-out both` },
    '& [data-press="stamp"]': {
      transformOrigin: 'center',
      animation: `${stamp} 260ms cubic-bezier(.2,1.4,.4,1) both`,
    },
  },
};

export const rulerPaint = (theme: Theme): CSSObject => {
  const palette = (theme.vars ?? theme).palette;

  return {
    display: 'block',
    overflow: 'visible',
    '& [data-paint="ink"]': { fill: palette.text.primary },
    '& [data-paint="faint"]': { fill: palette.text.disabled },
    '& [data-paint="red"]': { fill: palette.primary.main, stroke: palette.primary.main },
    '& [data-paint="red-line"]': { stroke: palette.primary.main },
    '& [data-paint="base"]': { stroke: palette.text.secondary },
    '& [data-paint="hair"]': { stroke: palette.divider },
    '& [data-paint="dot"]': { fill: palette.text.disabled },
    '& [data-paint="hatch"]': { stroke: palette.text.primary, strokeOpacity: 0.1 },
    '& [data-paint="gold"]': { ...gold(theme), stroke: 'currentColor', fill: 'none' },
    '& [data-paint="fest"]': {
      ...gold(theme),
      fill: 'currentColor',
      fillOpacity: 0.15,
    },
    ...pressMotion,
  };
};

export const rulerStampMotion: CSSObject = pressMotion;
