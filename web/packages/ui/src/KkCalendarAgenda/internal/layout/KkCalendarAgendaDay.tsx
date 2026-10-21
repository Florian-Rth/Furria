import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkCalendarAgendaDayProps extends PropsWithChildren {
  isoDay: string;
  anchor: string;
  label: string;
  sx?: KkSx;
}

export const KkCalendarAgendaDay: FC<KkCalendarAgendaDayProps> = ({
  isoDay,
  anchor,
  label,
  sx,
  children,
}) => (
  <Stack
    component="section"
    aria-label={label}
    data-kk-calendar-day={isoDay}
    data-kk-calendar-anchor={anchor}
    sx={[
      { position: 'relative', minWidth: 0, pb: 1, gap: 0.5 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
