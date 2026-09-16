import type { CSSObject, Theme } from '@mui/material/styles';
import type { KkScheme } from './scheme-paint';
import { applyScheme, schemeFill } from './scheme-paint';

const WASH_LIGHT = '10%';
const WASH_DARK = '18%';

const mix = (theme: Theme, amount: string): string =>
  `color-mix(in srgb, ${(theme.vars ?? theme).palette.primary.main} ${amount}, transparent)`;

export const accentWashScheme = (theme: Theme): KkScheme =>
  schemeFill(mix(theme, WASH_LIGHT), mix(theme, WASH_DARK));

export const accentWash = (theme: Theme): CSSObject => applyScheme(theme, accentWashScheme(theme));
