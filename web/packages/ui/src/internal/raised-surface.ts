import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../tokens';

export const raisedSurface = (theme: Theme): CSSObject => ({
  backgroundColor: kkTokens.color.light.panel2,
  ...theme.applyStyles('dark', { backgroundColor: kkTokens.color.dark.panel2 }),
});
