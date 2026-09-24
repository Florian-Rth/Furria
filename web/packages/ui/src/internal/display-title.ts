import type { CSSObject } from '@mui/material/styles';
import { kkTokens } from '../tokens';

export const displayTitle: CSSObject = {
  typography: 'h3',
  letterSpacing: kkTokens.type.tracking.display,
  lineHeight: 1.15,
  color: 'text.primary',
  textTransform: 'uppercase',
};
