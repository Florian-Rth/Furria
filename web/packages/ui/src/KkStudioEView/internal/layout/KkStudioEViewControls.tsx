import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioEViewControls: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-studio-e-controls
    sx={{ gridArea: 'controls', gap: { xs: 1.25, desktop: 1.5 }, minWidth: 0 }}
  >
    {children}
  </Stack>
);
