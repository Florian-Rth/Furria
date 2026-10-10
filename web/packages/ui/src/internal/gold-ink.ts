import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../tokens';
import { applyScheme, schemeInk } from './scheme-paint';

export const goldInkOf = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeInk(kkTokens.color.light.goldInk, kkTokens.color.dark.goldInk));
