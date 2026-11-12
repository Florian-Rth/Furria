import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../tokens';
import { focusRing } from './focus-ring';
import { inkWashSurface } from './ink-wash';

export const choiceChipPaint = (theme: Theme): CSSObject => ({
  gap: 0.5,
  px: 1.25,
  py: 0.75,
  borderRadius: `${kkTokens.radius.pill}px`,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderColor: 'divider',
  typography: 'caption',
  fontWeight: 800,
  lineHeight: 1.2,
  color: 'text.primary',
  ...focusRing(theme),
  '&[aria-checked="true"], &[aria-pressed="true"]': {
    color: 'background.paper',
    backgroundColor: 'text.primary',
    borderColor: 'text.primary',
  },
  '&.Mui-disabled': { color: 'text.disabled', borderStyle: 'dashed' },
  '@media (hover: hover)': {
    '&:hover:not([aria-checked="true"]):not([aria-pressed="true"])': inkWashSurface(
      theme,
      '6%',
      '10%',
    ),
  },
});
