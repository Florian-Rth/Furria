import type { CSSObject, Theme } from '@mui/material/styles';
import type { KkGroupTone } from '../../internal/group-tone';
import { GROUP_TONE_ON_FIELD_LIGHT, groupToneRecipes } from '../../internal/group-tone';
import { applyScheme } from '../../internal/scheme-paint';
import { kkTokens } from '../../tokens';

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

export const SCORE_LANES = {
  slim: { height: '3.25rem', ruler: '0rem', parts: '1.125rem', steps: '0.625rem' },
  strip: { height: '5.5rem', ruler: '0rem', parts: '1.5rem', steps: '0.875rem' },
  full: { height: '12.5rem', ruler: '1.375rem', parts: '1.625rem', steps: '3.25rem' },
} as const;

export type KkScoreTrackSize = keyof typeof SCORE_LANES;

export const LANE_VARS = {
  ruler: '--kk-score-ruler',
  parts: '--kk-score-parts',
  steps: '--kk-score-steps',
} as const;

export const waveTop = `calc(var(${LANE_VARS.ruler}) + var(${LANE_VARS.parts}))`;
export const stepsTop = `calc(100% - var(${LANE_VARS.steps}))`;

export const WAVE_HEIGHT = 100;
const WAVE_MID = WAVE_HEIGHT / 2;
const BAR_FILL = 0.72;
const BAR_FLOOR = 0.6;

export const wavePathOf = (bars: readonly number[]): string =>
  bars
    .map((value, index) => {
      const half = Math.max(BAR_FLOOR, value * (WAVE_MID - 2));
      const left = index + (1 - BAR_FILL) / 2;

      return `M${left.toFixed(2)} ${(WAVE_MID - half).toFixed(2)}h${BAR_FILL}v${(half * 2).toFixed(2)}h-${BAR_FILL}z`;
    })
    .join('');
