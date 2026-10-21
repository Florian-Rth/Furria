import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkCalendarStripToolsProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkCalendarStripTools: FC<KkCalendarStripToolsProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    data-kk-calendar-strip-tools
    sx={[
      { alignItems: 'center', gap: 0.5, flexShrink: 0, ml: 'auto' },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
