import type { CSSObject } from '@mui/material/styles';
import { kkTokens } from '../tokens';

export const calendarSurface = (): CSSObject => ({
  backgroundColor: 'background.paper',
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderColor: 'divider',
  borderRadius: `${kkTokens.radius.base}px`,
});
