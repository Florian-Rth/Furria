import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioETransportRow: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    sx={{
      alignItems: 'center',
      justifyContent: 'center',
      gap: { xs: 1, desktop: 1.5 },
      minWidth: 0,
    }}
  >
    {children}
  </Stack>
);
