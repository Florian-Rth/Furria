import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../tokens';
import type { KkScheme } from './scheme-paint';
import { applyScheme, schemeEdge, schemeFill, schemeInk } from './scheme-paint';

export type KkTone = 'neutral' | 'ink' | 'accent' | 'gold' | 'green' | 'blue';

export interface KkToneRecipe {
  inkLight: string;
  inkDark: string;
  source: (theme: Theme) => string;
  groundLight: string;
  groundDark: string;
}

const light = kkTokens.color.light;
const dark = kkTokens.color.dark;

const primaryText = (theme: Theme): string => (theme.vars ?? theme).palette.text.primary;

export const toneRecipes: Record<KkTone, KkToneRecipe> = {
  neutral: {
    inkLight: light.neutralInk,
    inkDark: dark.neutralInk,
    source: primaryText,
    groundLight: '10%',
    groundDark: '16%',
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

const SELECTED_BOOST_LIGHT = 16;
const SELECTED_BOOST_DARK = 14;

const mix = (color: string, amount: string): string =>
  `color-mix(in srgb, ${color} ${amount}, transparent)`;

const boosted = (amount: string, boost: number): string => `${Number.parseFloat(amount) + boost}%`;

const toneInkScheme = (tone: KkTone): KkScheme =>
  schemeInk(toneRecipes[tone].inkLight, toneRecipes[tone].inkDark);

const toneGroundScheme = (theme: Theme, tone: KkTone): KkScheme => {
  const recipe = toneRecipes[tone];
  const source = recipe.source(theme);

  return schemeFill(mix(source, recipe.groundLight), mix(source, recipe.groundDark));
};

const toneSelectedGroundScheme = (theme: Theme, tone: KkTone): KkScheme => {
  const recipe = toneRecipes[tone];
  const source = recipe.source(theme);

  return schemeFill(
    mix(source, boosted(recipe.groundLight, SELECTED_BOOST_LIGHT)),
    mix(source, boosted(recipe.groundDark, SELECTED_BOOST_DARK)),
  );
};

const toneEdgeScheme = (tone: KkTone): KkScheme =>
  schemeEdge(toneRecipes[tone].inkLight, toneRecipes[tone].inkDark);

export const tonePaint = (theme: Theme, tone: KkTone): CSSObject =>
  applyScheme(theme, toneInkScheme(tone), toneGroundScheme(theme, tone));

export const toneSelectedPaint = (theme: Theme, tone: KkTone): CSSObject =>
  applyScheme(
    theme,
    toneInkScheme(tone),
    toneSelectedGroundScheme(theme, tone),
    toneEdgeScheme(tone),
  );
