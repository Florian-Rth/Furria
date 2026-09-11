import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../tokens';
import type { KkScheme } from './scheme-paint';
import { applyScheme, schemeFill, schemeInk } from './scheme-paint';

export type KkTone = 'neutral' | 'ink' | 'accent' | 'gold' | 'green' | 'blue';

interface KkToneRecipe {
  inkLight: string;
  inkDark: string;
  source: (theme: Theme) => string;
  groundLight: string;
  groundDark: string;
}

const light = kkTokens.color.light;
const dark = kkTokens.color.dark;

const primaryText = (theme: Theme): string => (theme.vars ?? theme).palette.text.primary;

const recipes: Record<KkTone, KkToneRecipe> = {
  neutral: {
    inkLight: light.sub,
    inkDark: dark.sub,
    source: primaryText,
    groundLight: '6%',
    groundDark: '12%',
  },
  ink: {
    inkLight: light.ink,
    inkDark: dark.ink,
    source: primaryText,
    groundLight: '8%',
    groundDark: '14%',
  },
  accent: {
    inkLight: light.redInk,
    inkDark: dark.redInk,
    source: (theme) => (theme.vars ?? theme).palette.primary.main,
    groundLight: '10%',
    groundDark: '18%',
  },
  gold: {
    inkLight: light.goldInk,
    inkDark: dark.goldInk,
    source: (theme) => (theme.vars ?? theme).palette.warning.main,
    groundLight: '16%',
    groundDark: '22%',
  },
  green: {
    inkLight: light.greenInk,
    inkDark: dark.greenInk,
    source: (theme) => (theme.vars ?? theme).palette.success.main,
    groundLight: '13%',
    groundDark: '20%',
  },
  blue: {
    inkLight: light.blueInk,
    inkDark: dark.blueInk,
    source: (theme) => (theme.vars ?? theme).palette.info.main,
    groundLight: '12%',
    groundDark: '20%',
  },
};

const mix = (color: string, amount: string): string =>
  `color-mix(in srgb, ${color} ${amount}, transparent)`;

const toneInkScheme = (tone: KkTone): KkScheme =>
  schemeInk(recipes[tone].inkLight, recipes[tone].inkDark);

const toneGroundScheme = (theme: Theme, tone: KkTone): KkScheme => {
  const recipe = recipes[tone];
  const source = recipe.source(theme);

  return schemeFill(mix(source, recipe.groundLight), mix(source, recipe.groundDark));
};

export const tonePaint = (theme: Theme, tone: KkTone): CSSObject =>
  applyScheme(theme, toneInkScheme(tone), toneGroundScheme(theme, tone));
