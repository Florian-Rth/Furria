import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';
import { safeArea } from '../../../internal/safe-area';
import { KK_CALENDAR_STICKY } from '../../../KkCalendarStrip/calendar-sticky';
import { calendarSurface } from '../../../KkCalendarStrip/calendar-surface';
import type { KkSx } from '../../../kk-sx';

interface KkCalendarDeskPaneProps extends PropsWithChildren {
  label: string;
  sx?: KkSx;
}

export const KkCalendarDeskPane: FC<KkCalendarDeskPaneProps> = ({ label, sx, children }) => (
  <Grid
    size={4}
    component="aside"
    aria-label={label}
    data-kk-calendar-desk-pane
    sx={[
      {
        ...calendarSurface(),
        position: 'sticky',
        top: safeArea('top', KK_CALENDAR_STICKY.stripTop),
        display: 'flex',
        flexDirection: 'column',
        maxHeight: `calc(100dvh - ${KK_CALENDAR_STICKY.stripTop + KK_CALENDAR_STICKY.foot}px)`,
        minWidth: 0,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Grid>
);
