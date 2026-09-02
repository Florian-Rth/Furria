import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const OrderFlowBarActions: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    sx={{
      gap: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      width: { xs: '100%', sm: 'auto' },
    }}
  >
    {children}
  </Stack>
);
