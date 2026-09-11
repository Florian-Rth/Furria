import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../tokens';

const RING_OFFSET = 2;

export const focusRing = (theme: Theme): CSSObject => ({
  '&:focus-visible': {
    outline: `${kkTokens.line.section}px solid`,
    outlineColor: (theme.vars ?? theme).palette.primary.main,
    outlineOffset: RING_OFFSET,
  },
});
