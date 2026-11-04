import type { CSSObject, Theme } from '@mui/material/styles';
import { focusRing } from '../../../../internal/focus-ring';
import { inkWash } from '../../../../internal/ink-wash';
import { redInk } from '../../../../internal/red-ink';
import { kkTokens } from '../../../../tokens';

const MARK_HEIGHT = '0.1875rem';

export const headCellPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  textAlign: 'left',
  minWidth: 0,
  px: 1.5,
  py: 1,
  ...focusRing(theme),
  '&::after': {
    content: '""',
    position: 'absolute',
    left: theme.spacing(1.5),
    right: theme.spacing(1.5),
    bottom: 0,
    height: MARK_HEIGHT,
    borderRadius: `${kkTokens.radius.pill}px`,
    backgroundColor: 'transparent',
  },
  '&[aria-pressed="true"]': { backgroundColor: inkWash(theme, '5%') },
  '&[aria-pressed="true"]::after': { ...redInk(theme), backgroundColor: 'currentColor' },
  '@media (hover: hover)': {
    '&:hover:not([aria-pressed="true"])': { backgroundColor: inkWash(theme, '4%') },
  },
});
