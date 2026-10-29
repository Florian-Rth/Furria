import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioEViewHead: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-studio-e-head
    sx={{
      alignItems: 'center',
      gap: { xs: 1.5, desktop: 3 },
      minWidth: 0,
      width: '100%',
      maxWidth: { desktop: '44rem' },
      mx: 'auto',
    }}
  >
    {children}
  </Stack>
);
