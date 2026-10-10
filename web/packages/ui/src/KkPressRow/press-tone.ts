import type { CSSObject, Theme } from '@mui/material/styles';
import { applyScheme, schemeFill, schemeInk } from '../internal/scheme-paint';
import { kkTokens } from '../tokens';

export type KkPressTone = 'red' | 'gold' | 'ink';

export type KkPressFactTone = 'warning' | 'success' | 'accent' | 'muted';

const light = kkTokens.color.light;
const dark = kkTokens.color.dark;

const PRESS_TONE_FILLS: Record<KkPressTone, (theme: Theme) => CSSObject> = {
  red: (theme) => applyScheme(theme, schemeFill(light.red, dark.red)),
  gold: (theme) => applyScheme(theme, schemeFill(light.gold, dark.gold)),
  ink: (theme) => applyScheme(theme, schemeFill(light.neutralInk, dark.neutralInk)),
};

const PRESS_FACT_INKS: Record<KkPressFactTone, (theme: Theme) => CSSObject> = {
  warning: (theme) => applyScheme(theme, schemeInk(light.goldInk, dark.goldInk)),
  success: (theme) => applyScheme(theme, schemeInk(light.greenInk, dark.greenInk)),
  accent: (theme) => applyScheme(theme, schemeInk(light.redInk, dark.redInk)),
  muted: () => ({ color: 'text.secondary' }),
};

export const pressToneFill = (theme: Theme, tone: KkPressTone): CSSObject =>
  PRESS_TONE_FILLS[tone](theme);

export const pressFactInk = (theme: Theme, tone: KkPressFactTone): CSSObject =>
  PRESS_FACT_INKS[tone](theme);
