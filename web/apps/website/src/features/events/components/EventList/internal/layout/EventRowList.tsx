import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const EventRowList: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-event-rows divider={<Divider />} sx={{ gap: { xs: 1, md: 1.5 } }}>
    {children}
  </Stack>
);
