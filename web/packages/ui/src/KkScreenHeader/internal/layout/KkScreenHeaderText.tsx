import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkScreenHeaderText: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-screen-header-text sx={{ gap: 0.75, minWidth: 0 }}>
    {children}
  </Stack>
);
