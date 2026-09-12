import type { CSSObject, Theme } from '@mui/material/styles';
import { accentWashScheme } from './internal/accent-wash';
import { redInkScheme } from './internal/red-ink';
import { applyScheme } from './internal/scheme-paint';

export const letterIndexCurrentPaint = (theme: Theme): CSSObject =>
  applyScheme(theme, redInkScheme, accentWashScheme(theme));
