import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const TeaserMasthead: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    component="header"
    sx={{
      alignItems: 'center',
      gap: 1,
      py: 3,
      px: 2,
      borderBottom: 1,
      borderColor: 'divider',
    }}
  >
    {children}
  </Stack>
);
