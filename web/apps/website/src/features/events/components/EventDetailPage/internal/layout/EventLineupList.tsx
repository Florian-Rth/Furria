import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const EventLineupList: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    component="ol"
    data-kk-event-lineup
    sx={{ gap: 0, m: 0, p: 0, listStyle: 'none', maxWidth: '36rem' }}
  >
    {children}
  </Stack>
);
