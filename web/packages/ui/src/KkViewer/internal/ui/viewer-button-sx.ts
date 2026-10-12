import type { CSSObject, Theme } from '@mui/material/styles';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

export const viewerButtonSx =
  (size: string) =>
  (theme: Theme): CSSObject => ({
    flexShrink: 0,
    width: size,
    height: size,
    color: 'inherit',
    border: `${kkTokens.line.hair}px solid`,
    borderColor: 'divider',
    '&:hover': { bgcolor: 'background.paper' },
    '&.Mui-disabled': { color: 'text.disabled', borderColor: 'action.disabledBackground' },
    ...focusRing(theme),
  });
