import type { CSSObject, Theme } from '@mui/material/styles';
import type { KkCalendarMark } from '../KkCalendarStrip/calendar-strip-types';
import { groupToneEdgeScheme } from './group-tone';
import { applyScheme } from './scheme-paint';

const RING = 1.5;

export const usualRingPaint = (theme: Theme, mark: KkCalendarMark): CSSObject => ({
  borderWidth: RING,
  borderStyle: 'solid',
  backgroundColor: 'transparent',
  ...(mark === 'club'
    ? { borderColor: (theme.vars ?? theme).palette.text.primary }
    : applyScheme(theme, groupToneEdgeScheme(mark))),
});
