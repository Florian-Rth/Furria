import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const ProgramList: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-program-list sx={{ display: { xs: 'flex', md: 'none' }, gap: 1.5 }}>
    {children}
  </Stack>
);
