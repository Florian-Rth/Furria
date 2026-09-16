import type { CSSObject } from '@mui/material/styles';
import { kkTokens } from '../tokens';

export const rowDividerTop: CSSObject = {
  borderTopWidth: kkTokens.line.hair,
  borderTopStyle: 'solid',
  borderColor: 'divider',
  '&:first-of-type': { borderTopWidth: 0 },
};

export const rowDividerBottom: CSSObject = {
  borderBottomWidth: kkTokens.line.hair,
  borderBottomStyle: 'solid',
  borderColor: 'divider',
  '&:last-of-type': { borderBottomWidth: 0 },
};
