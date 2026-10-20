import type { CSSObject, Theme } from '@mui/material/styles';
import { focusRing } from '../internal/focus-ring';
import { inkWash } from '../internal/ink-wash';
import { applyScheme, schemeEdge, schemeFill, schemeInk } from '../internal/scheme-paint';
import { toneSelectedPaint } from '../internal/tone';
import { kkTokens } from '../tokens';

const { calendarStrip, radius, line, motion, color } = kkTokens;
const PRESS_SCALE = 0.94;
const HIT_REACH = 4;

export const calendarToolGroupPaint = (theme: Theme): CSSObject => ({
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  boxSizing: 'border-box',
  height: calendarStrip.tool,
  p: `${calendarStrip.toolInset - line.hair}px`,
  gap: '2px',
  borderRadius: `${radius.pill}px`,
  boxShadow: `inset 0 0 0 ${line.hair}px ${(theme.vars ?? theme).palette.divider}`,
});

export const calendarToolPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  gap: 0.5,
  minWidth: calendarStrip.toolSegment,
  height: `calc(${calendarStrip.tool} - ${calendarStrip.toolInset * 2}px)`,
  px: 0.5,
  borderRadius: `${radius.pill}px`,
  color: 'text.primary',
  transition: `background-color 160ms ease-out, color 160ms ease-out, ${motion.press}`,
  '&::after': { content: '""', position: 'absolute', inset: `-${HIT_REACH}px -1px` },
  '&:active': { transform: `scale(${PRESS_SCALE})` },
  '&[aria-pressed="true"]': { backgroundColor: 'text.primary', color: 'background.paper' },
  '@media (hover: hover)': {
    '&:hover:not([aria-pressed="true"])': { backgroundColor: inkWash(theme, '7%') },
  },
  ...focusRing(theme),
});

const alertPressedPaint = (theme: Theme): CSSObject =>
  applyScheme(
    theme,
    schemeFill(color.light.gold, color.dark.gold),
    schemeInk(color.light.onyx, color.dark.onyx),
    schemeEdge(color.light.gold, color.dark.gold),
  );

export const calendarAlertToolPaint = (theme: Theme, pressed: boolean): CSSObject => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  boxSizing: 'border-box',
  gap: 0.375,
  height: calendarStrip.tool,
  px: 1,
  borderRadius: `${radius.pill}px`,
  borderWidth: line.hair,
  borderStyle: 'solid',
  fontVariantNumeric: 'tabular-nums',
  transition: `background-color 160ms ease-out, color 160ms ease-out, ${motion.press}`,
  '&::after': { content: '""', position: 'absolute', inset: `-${HIT_REACH}px -1px` },
  '&:active': { transform: `scale(${PRESS_SCALE})` },
  ...(pressed ? alertPressedPaint(theme) : toneSelectedPaint(theme, 'gold')),
  ...focusRing(theme),
});
