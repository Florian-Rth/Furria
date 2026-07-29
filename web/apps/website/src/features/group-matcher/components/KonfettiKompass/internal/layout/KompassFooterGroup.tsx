import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KompassFooterGroup: FC<PropsWithChildren> = ({ children }) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
    {children}
  </Stack>
);
