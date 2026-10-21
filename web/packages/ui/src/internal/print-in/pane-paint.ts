import type { CSSObject } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import { kkTokens } from '../../tokens';
import type { KkScheme } from '../scheme-paint';
import { PRINT_STILL, REDUCED_MOTION } from './print-stamp';

const { light, dark } = kkTokens.color;
const { material } = kkTokens.shell;
const HAIR = kkTokens.line.hair;
const PLATE_SHIFT = '3px';
const FROST_MS = 1000;
const NO_GLASS =
  '@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))';

export const POSTER_TINT = '--kk-poster-tint';

const PANE_SHARE = { light: 82, dark: 52 } as const;
const GLINT_SHARE = { light: 90, dark: 16 } as const;
const FROST = {
  light: 'blur(6px) saturate(1.05)',
  dark: 'blur(4px) saturate(1.6)',
} as const;

const mixOf = (color: string, share: number): string =>
  `color-mix(in srgb, ${color} ${share}%, transparent)`;

const frostOver = keyframes`
  0%, 50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const LAYER: CSSObject = {
  content: '""',
  position: 'absolute',
  inset: -HAIR,
  borderRadius: 'inherit',
  pointerEvents: 'none',
};

const TINT = `var(${POSTER_TINT}, transparent)`;

const sideOf = (
  pane: string,
  glint: string,
  plate: string,
  frost: string,
  paper: string,
): CSSObject => ({
  '--kk-pane-fill': pane,
  '--kk-pane-glint': glint,
  '--kk-pane-frost': frost,
  '--kk-pane-paper': paper,
  boxShadow: `${PLATE_SHIFT} ${PLATE_SHIFT} 0 0 ${plate}`,
});

export const PANE_SCHEME: KkScheme = {
  light: sideOf(
    mixOf(light.panel2, PANE_SHARE.light),
    mixOf(material.glint, GLINT_SHARE.light),
    light.ink,
    FROST.light,
    light.panel2,
  ),
  dark: sideOf(
    mixOf(dark.panel2, PANE_SHARE.dark),
    mixOf(material.glint, GLINT_SHARE.dark),
    dark.darkroom,
    FROST.dark,
    dark.panel2,
  ),
};

export const paneLayersOf = (settled: boolean): CSSObject => ({
  position: 'relative',
  isolation: 'isolate',
  backgroundColor: 'transparent',
  '&::before': {
    ...LAYER,
    zIndex: -2,
    backdropFilter: 'var(--kk-pane-frost)',
    WebkitBackdropFilter: 'var(--kk-pane-frost)',
    animation: settled ? 'none' : `${frostOver} ${FROST_MS}ms ease-out backwards`,
    animationDelay: 'inherit',
    [REDUCED_MOTION]: PRINT_STILL,
  },
  '&::after': {
    ...LAYER,
    zIndex: -1,
    borderWidth: HAIR,
    borderStyle: 'solid',
    borderColor: 'inherit',
    backgroundColor: 'var(--kk-pane-fill)',
    backgroundImage: `linear-gradient(${TINT}, ${TINT})`,
    boxShadow: 'inset 0 1px 0 0 var(--kk-pane-glint)',
  },
  [NO_GLASS]: { '&::after': { backgroundColor: 'var(--kk-pane-paper)' } },
});
