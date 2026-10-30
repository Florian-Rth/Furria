import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { WAY_WIDE } from '../logic/way-view-query';

export const KkWayViewKeys: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    sx={{
      gridArea: 'keys',
      minWidth: 0,
      alignItems: 'center',
      justifyContent: 'center',
      [WAY_WIDE]: { justifyContent: 'flex-end' },
    }}
  >
    {children}
  </Stack>
);
