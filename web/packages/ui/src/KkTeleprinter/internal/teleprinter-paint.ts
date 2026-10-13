import type { CSSObject, Theme } from '@mui/material/styles';
import { inkWash } from '../../internal/ink-wash';
import type { KkStatusLevel } from '../../internal/status-paint';
import { statusTick } from '../../internal/status-paint';
import { kkTokens } from '../../tokens';

export type KkTeleprinterLevel = 'information' | 'warning' | 'error' | 'fatal';

const LEVEL_TICKS: Record<KkTeleprinterLevel, KkStatusLevel> = {
  information: 'unknown',
  warning: 'attention',
  error: 'broken',
  fatal: 'broken',
};

export const levelTickPaint =
  (level: KkTeleprinterLevel) =>
  (theme: Theme): CSSObject =>
    level === 'information'
      ? { backgroundColor: inkWash(theme, '18%') }
      : statusTick(theme, LEVEL_TICKS[level]);

export const quietButton = (theme: Theme): CSSObject => ({
  ...theme.typography.caption,
  appearance: 'none',
  border: 'none',
  background: 'none',
  p: 0,
  m: 0,
  fontWeight: 800,
  color: 'text.secondary',
  cursor: 'pointer',
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
  '&:focus-visible': {
    outline: `${kkTokens.line.section}px solid`,
    outlineColor: (theme.vars ?? theme).palette.primary.main,
    outlineOffset: 2,
  },
});
