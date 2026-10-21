import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkCalendarAgendaDaysProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkCalendarAgendaDays: FC<KkCalendarAgendaDaysProps> = ({ sx, children }) => (
  <Stack
    data-kk-calendar-agenda-days
    sx={[{ minWidth: 0, gap: 0.25 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
