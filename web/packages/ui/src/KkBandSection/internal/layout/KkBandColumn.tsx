import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkBandColumn: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-band-column sx={{ alignItems: 'center', gap: { xs: 4, md: 5 } }}>
    {children}
  </Stack>
);
