import type { CSSObject } from '@mui/material/styles';
import { kkTokens } from '../tokens';

export const displayTitle: CSSObject = {
  fontFamily: kkTokens.font.display,
  fontWeight: kkTokens.font.displayWeight,
  fontSize: kkTokens.type.blockTitle,
  letterSpacing: '0.03em',
  lineHeight: 1.15,
  color: 'text.primary',
  textTransform: 'uppercase',
};
