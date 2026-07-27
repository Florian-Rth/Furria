import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkHeroActions: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-hero-actions
    sx={{ alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}
  >
    {children}
  </Stack>
);
