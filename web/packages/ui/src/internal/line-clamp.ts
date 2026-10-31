import type { CSSObject } from '@mui/material/styles';

export const DISPLAY_CLAMP_LINE_HEIGHT = 1.14;
const DIACRITIC_ROOM = '0.08em';

export const lineClamp = (lines: number): CSSObject => ({
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: lines,
  overflow: 'hidden',
  minWidth: 0,
});

export const displayLineClamp = (lines: number): CSSObject => ({
  ...lineClamp(lines),
  lineHeight: DISPLAY_CLAMP_LINE_HEIGHT,
  paddingTop: DIACRITIC_ROOM,
  marginTop: `calc(-1 * ${DIACRITIC_ROOM})`,
});
