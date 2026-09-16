import type { CSSObject, Theme } from '@mui/material/styles';
import type { KkScheme } from './scheme-paint';
import { applyScheme, schemeFill } from './scheme-paint';

export const inkWash = (theme: Theme, amount: string): string =>
  `color-mix(in srgb, ${(theme.vars ?? theme).palette.text.primary} ${amount}, transparent)`;

export const inkWashScheme = (theme: Theme, light: string, dark: string): KkScheme =>
  schemeFill(inkWash(theme, light), inkWash(theme, dark));

export const inkWashSurface = (theme: Theme, light: string, dark: string): CSSObject =>
  applyScheme(theme, inkWashScheme(theme, light, dark));
