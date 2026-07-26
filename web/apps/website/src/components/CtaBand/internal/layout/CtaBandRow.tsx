import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const CtaBandRow: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-cta-band-row
    direction={{ xs: 'column', md: 'row' }}
    sx={{
      alignItems: { xs: 'flex-start', md: 'center' },
      justifyContent: 'space-between',
      gap: { xs: 4, md: 6 },
    }}
  >
    {children}
  </Stack>
);
