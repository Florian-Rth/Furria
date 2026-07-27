import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const ChangelogDialogBody: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-changelog-body
    direction={{ xs: 'column', desktop: 'row' }}
    sx={{ alignItems: 'stretch', gap: { xs: 2, desktop: 4 } }}
  >
    {children}
  </Stack>
);
