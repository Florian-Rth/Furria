import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../tokens';
import { applyScheme, schemeInk } from './scheme-paint';

export const blueInkOf = (theme: Theme): CSSObject =>
  applyScheme(theme, schemeInk(kkTokens.color.light.blueInk, kkTokens.color.dark.blueInk));
