import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { LANE_VARS } from './KkTimeline/internal/timeline-paint';
import { kkTokens } from './tokens';

export type KkLaneFocusRow = 'steps' | 'keys' | 'slim';

const QUIET_OPACITY = 0.32;
const QUIET_ROWS = '[data-kk-timeline-row="videos"], [data-kk-timeline-part]';
const STEPS_LANE = '2.75rem';
const TIMELINE_ROOT = '[role="group"]:has(> [data-kk-timeline])';
const SLIM_HIDDEN = [
  '[data-kk-timeline-row]:not([data-kk-timeline-row="steps"])',
  '[data-kk-timeline-ruler]',
  '[data-kk-timeline-parts]',
  '[data-kk-timeline-lane-key]:not([data-kk-timeline-lane-key="steps"])',
]
  .map((selector) => `& ${selector}`)
  .join(', ');

export const SLIM_LANES = `calc(${STEPS_LANE} + ${2 * kkTokens.line.hair}px)`;

interface KkLaneFocusProps extends PropsWithChildren {
  row: KkLaneFocusRow;
}

export const KkLaneFocus: FC<KkLaneFocusProps> = ({ row, children }) => (
  <Box
    data-kk-lane-focus={row}
    sx={{
      minWidth: 0,
      minHeight: 0,
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: 'minmax(0, 1fr)',
      [`& ${TIMELINE_ROOT}`]: { height: '100%' },
      '& [data-kk-timeline-row], & [data-kk-timeline-lane-key]': {
        transition: 'opacity 200ms ease-out',
      },
      '&[data-kk-lane-focus="steps"]': {
        [`& [data-kk-timeline-row="keys"], & ${QUIET_ROWS}`]: { opacity: QUIET_OPACITY },
      },
      '&[data-kk-lane-focus="keys"]': {
        [`& [data-kk-timeline-row="steps"], & ${QUIET_ROWS}`]: { opacity: QUIET_OPACITY },
      },
      '&[data-kk-lane-focus="slim"]': {
        [`& ${TIMELINE_ROOT}`]: {
          [LANE_VARS.ruler]: '0rem',
          [LANE_VARS.parts]: '0rem',
          [LANE_VARS.videos]: '0rem',
          [LANE_VARS.keys]: '0rem',
          [LANE_VARS.steps]: STEPS_LANE,
        },
        [SLIM_HIDDEN]: { opacity: 0, visibility: 'hidden' },
      },
    }}
  >
    {children}
  </Box>
);
