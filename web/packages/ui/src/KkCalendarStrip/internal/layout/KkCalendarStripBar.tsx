import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { KK_CALENDAR_STICKY } from '../../calendar-sticky';

interface KkCalendarStripBarProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkCalendarStripBar: FC<KkCalendarStripBarProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    data-kk-calendar-strip-bar
    sx={[
      {
        alignItems: 'center',
        gap: 1,
        minWidth: 0,
        height: `${KK_CALENDAR_STICKY.stripHead}px`,
        pl: 0.5,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
