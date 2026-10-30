import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioIHeadRoot: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-studio-i-step-head
    sx={{ flex: 1, minWidth: 0, alignItems: 'center', gap: { xs: 1.25, desktop: 2 } }}
  >
    {children}
  </Stack>
);
