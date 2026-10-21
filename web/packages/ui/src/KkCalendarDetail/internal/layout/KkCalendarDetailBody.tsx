import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkCalendarDetailBodyProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkCalendarDetailBody: FC<KkCalendarDetailBodyProps> = ({ sx, children }) => (
  <Stack
    data-kk-calendar-detail-body
    sx={[
      {
        flex: '1 1 auto',
        minHeight: 0,
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        gap: 2,
        px: 2,
        pt: 0.5,
        pb: 2,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
