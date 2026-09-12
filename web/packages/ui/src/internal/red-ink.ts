import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../tokens';
import type { KkScheme } from './scheme-paint';
import { applyScheme, schemeInk } from './scheme-paint';

export const redInkScheme: KkScheme = schemeInk(
  kkTokens.color.light.redInk,
  kkTokens.color.dark.redInk,
);

export const redInk = (theme: Theme): CSSObject => applyScheme(theme, redInkScheme);
