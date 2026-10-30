import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioSideRoot: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-studio-side
    sx={{ position: 'absolute', inset: 0, minHeight: 0, gap: 1, containerType: 'size' }}
  >
    {children}
  </Stack>
);
