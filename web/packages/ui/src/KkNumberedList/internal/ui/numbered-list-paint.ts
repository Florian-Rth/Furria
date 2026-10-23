import type { CSSObject, Theme } from '@mui/material/styles';
import { applyScheme, schemeFill } from '../../../internal/scheme-paint';
import { kkTokens } from '../../../tokens';

export const NUMBER_WIDTH = '2rem';
export const GUTTER_WIDTH = '0.875rem';
export const ROW_PADDING_X = { xs: 1, md: 1.5 } as const;

const goldWash = (theme: Theme, amount: string): string =>
  `color-mix(in srgb, ${(theme.vars ?? theme).palette.warning.main} ${amount}, transparent)`;

export const goldWashSurface = (theme: Theme, light: string, dark: string): CSSObject =>
  applyScheme(theme, schemeFill(goldWash(theme, light), goldWash(theme, dark)));

const redWash = (theme: Theme, amount: string): string =>
  `color-mix(in srgb, ${(theme.vars ?? theme).palette.primary.main} ${amount}, transparent)`;

export const redWashSurface = (theme: Theme, light: string, dark: string): CSSObject =>
  applyScheme(theme, schemeFill(redWash(theme, light), redWash(theme, dark)));

export const liftedSurface = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeFill(kkTokens.color.light.panel2, kkTokens.color.dark.panel2), {
    light: { boxShadow: kkTokens.shadow.raised },
    dark: { boxShadow: kkTokens.shadow.floating },
  });

export const figures: CSSObject = {
  fontVariantNumeric: 'tabular-nums lining-nums',
};
