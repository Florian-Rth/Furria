import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../tokens';
import type { KkGroupTone } from './group-tone';
import { GROUP_TONE_ON_FIELD_LIGHT, groupToneRecipes } from './group-tone';
import { applyScheme } from './scheme-paint';

const PERCENT = 100;
const SHADE_MIXES: readonly (readonly [string, string])[] = [
  ['100%', 'transparent'],
  ['74%', kkTokens.color.light.onyx],
  ['78%', GROUP_TONE_ON_FIELD_LIGHT],
];
const NEUTRAL_LIGHT = kkTokens.color.light.neutralInk;
const NEUTRAL_DARK = kkTokens.color.dark.sub;

export const SCORE_FIGURES: CSSObject = {
  fontVariantNumeric: 'tabular-nums lining-nums',
};

export const percentOf = (share: number): string => `${(share * PERCENT).toFixed(3)}%`;

const mixOf = (base: string, shade: number): string => {
  const [amount, other] = SHADE_MIXES[shade % SHADE_MIXES.length] ?? ['100%', 'transparent'];

  return amount === '100%' ? base : `color-mix(in srgb, ${base} ${amount}, ${other})`;
};

export const shadeColorsOf = (tone: KkGroupTone | null, shade: number): [string, string] =>
  tone === null
    ? [mixOf(NEUTRAL_LIGHT, shade), mixOf(NEUTRAL_DARK, shade)]
    : [
        mixOf(groupToneRecipes[tone].fieldLight, shade),
        mixOf(groupToneRecipes[tone].fieldDark, shade),
      ];

export const shadeFill = (theme: Theme, tone: KkGroupTone | null, shade: number): CSSObject => {
  const [light, dark] = shadeColorsOf(tone, shade);

  return applyScheme(theme, {
    light: { backgroundColor: light, color: kkTokens.color.light.panel2 },
    dark: { backgroundColor: dark, color: kkTokens.color.dark.ink },
  });
};

export const shadeWash = (theme: Theme, tone: KkGroupTone | null, shade: number): CSSObject => {
  const [light, dark] = shadeColorsOf(tone, shade);

  return applyScheme(theme, {
    light: { backgroundColor: `color-mix(in srgb, ${light} 9%, transparent)` },
    dark: { backgroundColor: `color-mix(in srgb, ${dark} 14%, transparent)` },
  });
};

export const shadeInk = (theme: Theme, tone: KkGroupTone | null, shade: number): CSSObject => {
  const [light, dark] = shadeColorsOf(tone, shade);

  return applyScheme(theme, { light: { color: light }, dark: { color: dark } });
};
