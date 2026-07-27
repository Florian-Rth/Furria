import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkCardBody: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-card-body
    sx={{
      width: '100%',
      flexGrow: 1,
      minWidth: 0,
      alignItems: 'flex-start',
      gap: 1,
      p: { xs: 2, md: 2.5 },
    }}
  >
    {children}
  </Stack>
);
