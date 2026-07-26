import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const CtaBandColumn: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-cta-band-column sx={{ alignItems: 'center', gap: { xs: 4, md: 5 } }}>
    {children}
  </Stack>
);
