import type { CSSObject, Theme } from '@mui/material/styles';
import type { KkScheme } from '../../../../internal/scheme-paint';
import { applyScheme, schemeEdge, schemeFill } from '../../../../internal/scheme-paint';
import { kkTokens } from '../../../../tokens';

const { color, line, shell } = kkTokens;
const { glint, shadowInk } = shell.material;

const mix = (ink: string, percent: number): string =>
  `color-mix(in srgb, ${ink} ${percent}%, transparent)`;

const lensOf = (spot: number, caustic: number): string =>
  `radial-gradient(circle at 32% 24%, ${mix(glint, spot)} 0%, ${mix(glint, 0)} 30%), radial-gradient(circle at 62% 88%, ${mix(glint, caustic)} 0%, ${mix(glint, 0)} 42%)`;

const SKIN_FILL = schemeFill(mix(color.light.panel2, 24), mix(color.dark.panel2, 38));
const SKIN_EDGE = schemeEdge(mix(color.light.ink, 10), mix(color.dark.ink, 16));
const SKIN_LENS: KkScheme = {
  light: {
    backgroundImage: lensOf(95, 60),
    boxShadow: `inset 0 0 0 1px ${mix(glint, 60)}, inset 0 -2px 6px ${mix(shadowInk.light, 7)}, 0 6px 14px ${mix(shadowInk.light, 16)}`,
  },
  dark: {
    backgroundImage: lensOf(45, 22),
    boxShadow: `inset 0 0 0 1px ${mix(glint, 18)}, inset 0 -3px 7px ${mix(shadowInk.dark, 40)}, 0 6px 16px ${mix(shadowInk.dark, 50)}`,
  },
};

const ringOf = (ink: string, percent: number): string =>
  `radial-gradient(closest-side, ${mix(ink, 0)} 58%, ${mix(ink, percent)} 80%, ${mix(ink, 0)} 100%)`;

const RING: KkScheme = {
  light: { backgroundImage: ringOf(color.light.ink, 14) },
  dark: { backgroundImage: ringOf(glint, 18) },
};

const SHEEN: KkScheme = {
  light: {
    backgroundImage: `linear-gradient(105deg, ${mix(glint, 0)} 38%, ${mix(glint, 85)} 50%, ${mix(glint, 0)} 62%)`,
  },
  dark: {
    backgroundImage: `linear-gradient(105deg, ${mix(glint, 0)} 38%, ${mix(glint, 20)} 50%, ${mix(glint, 0)} 62%)`,
  },
};

const SKIN_BACKDROP = 'blur(5px) saturate(1.6)';

export const glassSkinPaint = (theme: Theme): CSSObject => ({
  borderWidth: line.hair,
  borderStyle: 'solid',
  borderRadius: '50%',
  backdropFilter: SKIN_BACKDROP,
  WebkitBackdropFilter: SKIN_BACKDROP,
  ...applyScheme(theme, SKIN_FILL, SKIN_EDGE, SKIN_LENS),
});

export const glassRingPaint = (theme: Theme): CSSObject => applyScheme(theme, RING);

export const glassSheenPaint = (theme: Theme): CSSObject => applyScheme(theme, SHEEN);
