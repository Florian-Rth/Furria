import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { calendarSurface } from '../../../KkCalendarStrip/calendar-surface';
import type { KkSx } from '../../../kk-sx';

interface KkCalendarMonthRootProps extends PropsWithChildren {
  label: string;
  landing?: string;
  sx?: KkSx;
}

export const KkCalendarMonthRoot: FC<KkCalendarMonthRootProps> = ({
  label,
  landing,
  sx,
  children,
}) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-calendar-month
    data-kk-landing={landing}
    sx={[
      { ...calendarSurface(), px: 0.5, pt: 0.5, pb: 1, minWidth: 0 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
