import type { CSSObject, Theme } from '@mui/material/styles';
import { focusRing } from '../../../internal/focus-ring';
import { KK_STUDIO_I_WIDE } from '../../../KkStudioIEditor/studio-i-editor-query';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const tilePaint =
  (current: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    flexShrink: 0,
    width: '9.5rem',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 1,
    p: 0.75,
    pr: 1,
    borderRadius: `${kkTokens.radius.base * 0.75}px`,
    textAlign: 'left',
    backgroundColor: current ? palette(theme).action.selected : palette(theme).background.paper,
    boxShadow: current
      ? `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).text.primary}`
      : `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
    transition: 'background-color 160ms ease-out, box-shadow 160ms ease-out',
    ...focusRing(theme),
    [KK_STUDIO_I_WIDE]: {
      width: '100%',
      boxShadow: current
        ? `inset ${kkTokens.line.page}px 0 0 ${palette(theme).primary.main}`
        : 'none',
      backgroundColor: current ? palette(theme).action.selected : 'transparent',
      '&:hover': { backgroundColor: palette(theme).action.hover },
    },
  });
