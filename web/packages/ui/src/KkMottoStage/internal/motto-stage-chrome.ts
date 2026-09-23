import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../../tokens';

const MIN_HEIGHT_SPACING = { xs: 16, desktop: 19 };

export const MOTTO_STAGE_TEXT_WIDTH = { xs: '88%', desktop: '60%' };
export const MOTTO_STAGE_CONTENT_GAP = { xs: 1.5, desktop: 2 };
export const MOTTO_STAGE_HEADLINE_GAP = { xs: 1, desktop: 1.25 };

export const mottoStageChrome = (theme: Theme): CSSObject => ({
  position: 'relative',
  isolation: 'isolate',
  minWidth: 0,
  minHeight: theme.spacing(MIN_HEIGHT_SPACING.xs),
  justifyContent: 'flex-end',
  borderRadius: `${kkTokens.radius.base}px`,
  border: `${kkTokens.line.hair}px solid`,
  borderColor: (theme.vars ?? theme).palette.divider,
  color: (theme.vars ?? theme).palette.text.primary,
  backgroundColor: kkTokens.chrome.light.base,
  backgroundImage: kkTokens.chrome.light.gradient,
  boxShadow: kkTokens.chrome.light.lift,
  padding: theme.spacing(2.5, 3),
  [theme.breakpoints.up('desktop')]: {
    minHeight: theme.spacing(MIN_HEIGHT_SPACING.desktop),
    padding: theme.spacing(3, 4),
  },
  ...theme.applyStyles('dark', {
    backgroundColor: kkTokens.chrome.dark.base,
    backgroundImage: kkTokens.chrome.dark.gradient,
    boxShadow: kkTokens.chrome.dark.lift,
  }),
});
