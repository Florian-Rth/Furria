import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const ChangelogDialogBody: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-changelog-body
    direction={{ xs: 'column', md: 'row' }}
    sx={{ alignItems: 'stretch', gap: { xs: 2, md: 4 } }}
  >
    {children}
  </Stack>
);
