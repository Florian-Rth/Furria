import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioEViewHead: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-studio-e-head
    sx={{ gridArea: 'head', alignItems: 'center', gap: { xs: 1.5, desktop: 2 }, minWidth: 0 }}
  >
    {children}
  </Stack>
);
