import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../../../tokens';

export const inlinePaint = (theme: Theme): CSSObject => ({
  width: '100%',
  color: 'inherit',
  borderRadius: '0.25rem',
  boxShadow: `inset 0 -1px 0 transparent`,
  transition: 'box-shadow 160ms ease-out, background-color 160ms ease-out',
  '&:hover': {
    boxShadow: `inset 0 -${kkTokens.line.hair}px 0 ${(theme.vars ?? theme).palette.divider}`,
  },
  '&.Mui-focused': {
    backgroundColor: (theme.vars ?? theme).palette.action.hover,
    boxShadow: `inset 0 -${kkTokens.line.section}px 0 ${(theme.vars ?? theme).palette.primary.main}`,
  },
  '& input, & textarea': { padding: 0, userSelect: 'text' },
});
