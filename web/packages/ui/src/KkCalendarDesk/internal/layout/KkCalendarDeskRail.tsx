import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';
import { safeArea } from '../../../internal/safe-area';
import { KK_CALENDAR_STICKY } from '../../../KkCalendarStrip/calendar-sticky';
import type { KkSx } from '../../../kk-sx';

interface KkCalendarDeskRailProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkCalendarDeskRail: FC<KkCalendarDeskRailProps> = ({ sx, children }) => (
  <Grid
    size={3}
    data-kk-calendar-desk-rail
    sx={[
      {
        position: 'sticky',
        top: safeArea('top', KK_CALENDAR_STICKY.stripTop),
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minWidth: 0,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Grid>
);
