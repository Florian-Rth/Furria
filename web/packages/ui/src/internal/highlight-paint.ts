import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../tokens';
import { accentWash } from './accent-wash';

export const HIGHLIGHT_ATTRIBUTE = 'data-kk-row-highlight';

const HELD_BEHIND = `& [${HIGHLIGHT_ATTRIBUTE}]::before`;
const HELD_ABOVE = `& [${HIGHLIGHT_ATTRIBUTE}]::after`;

const wash = (theme: Theme, radius: number): CSSObject => ({
  content: '""',
  position: 'absolute',
  insetBlock: 0,
  insetInline: 0,
  pointerEvents: 'none',
  borderRadius: `${radius}px`,
  ...accentWash(theme),
  animation: kkTokens.motion.rowHighlight,
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
});

export const highlightPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  isolation: 'isolate',
  '&::before': { ...wash(theme, kkTokens.radius.bar), zIndex: -1 },
});

export const highlightOverlayPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  '&::after': { ...wash(theme, kkTokens.radius.base), zIndex: 1 },
});

export const highlightHoldPaint: CSSObject = {
  [HELD_BEHIND]: { animation: 'none' },
  [HELD_ABOVE]: { animation: 'none' },
};

export const highlightMark = (highlight: boolean): Record<string, true> =>
  highlight ? { [HIGHLIGHT_ATTRIBUTE]: true } : {};
