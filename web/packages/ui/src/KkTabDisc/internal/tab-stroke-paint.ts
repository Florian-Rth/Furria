import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import { goldInkOf } from '../../internal/gold-ink';
import { keepsPlaying } from '../../internal/motion-override';
import { redInk } from '../../internal/red-ink';

const DRAW_SECONDS = 0.42;

const draw = keyframes`
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
`;

export const TAB_STROKE_DRAW_DELAY_MS = 260;
export const TAB_STROKE_DRAW_STAGGER_MS = 180;

export const tabStrokePaint = (theme: Theme): CSSObject => ({
  '& [data-tab-stroke]': {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
  },
  '& [data-tab-stroke="open"]': { color: (theme.vars ?? theme).palette.text.primary },
  '& [data-tab-stroke="paid"]': { color: (theme.vars ?? theme).palette.text.disabled },
  '& [data-tab-stroke="overdue"]': goldInkOf(theme),
  '& [data-tab-stroke="fresh"]': {
    ...redInk(theme),
    strokeDasharray: 1,
    strokeDashoffset: 1,
    animation: `${draw} ${DRAW_SECONDS}s cubic-bezier(0.3, 0.7, 0.2, 1) forwards`,
    ...keepsPlaying(true, DRAW_SECONDS, 1),
  },
});
