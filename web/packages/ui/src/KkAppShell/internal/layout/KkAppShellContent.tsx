import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkAppShellContent: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    component="main"
    data-kk-app-shell-content
    sx={{
      flex: 1,
      minWidth: 0,
      gap: { xs: 3, desktop: 4 },
      px: { xs: 2.5, desktop: 5 },
      py: { xs: 3, desktop: 4 },
    }}
  >
    {children}
  </Stack>
);
