import type { CSSObject, Theme } from '@mui/material/styles';
import { focusRing } from './focus-ring';

const UNDERLINE_OFFSET = '0.18em';
const EXTERNAL_MARK = '" ↗" / ""';

export const newsTextPaint = (theme: Theme): CSSObject => {
  const palette = (theme.vars ?? theme).palette;
  return {
    ...theme.typography.body1,
    lineHeight: 1.72,
    color: palette.text.primary,
    '& p': { margin: 0, marginBottom: theme.spacing(2), textWrap: 'pretty' },
    '& h2': { ...theme.typography.h3, margin: 0, marginBlock: theme.spacing(3, 1.5) },
    '& ul': { margin: 0, marginBottom: theme.spacing(2), paddingLeft: theme.spacing(3) },
    '& li': { marginBottom: theme.spacing(0.5) },
    '& li > p': { margin: 0 },
    '& strong': { fontWeight: 800 },
    '& a': {
      color: palette.primary.main,
      textDecoration: 'underline',
      textUnderlineOffset: UNDERLINE_OFFSET,
      '&::after': { content: EXTERNAL_MARK, fontWeight: 800 },
      ...focusRing(theme),
    },
  };
};
