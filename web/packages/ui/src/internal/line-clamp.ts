import type { CSSObject } from '@mui/material/styles';

export const lineClamp = (lines: number): CSSObject => ({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: lines,
  overflow: 'hidden',
  minWidth: 0,
});
