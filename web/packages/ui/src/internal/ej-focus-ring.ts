import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../tokens';

const RING_OFFSET = 2;

export const ejFocusRing = (theme: Theme): CSSObject => ({
  '&:focus-visible': {
    outline: `${kkTokens.line.section}px solid`,
    outlineColor: (theme.vars ?? theme).palette.text.primary,
    outlineOffset: RING_OFFSET,
  },
});
