import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../tokens';
import type { KkScheme } from './scheme-paint';
import { applyScheme, schemeFill } from './scheme-paint';

export const raisedSurfaceScheme: KkScheme = schemeFill(
  kkTokens.color.light.panel2,
  kkTokens.color.dark.panel2,
);

export const raisedSurface = (theme: Theme): CSSObject => applyScheme(theme, raisedSurfaceScheme);
