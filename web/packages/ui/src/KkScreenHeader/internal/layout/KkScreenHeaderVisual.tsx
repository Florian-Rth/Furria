import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkScreenHeaderVisual: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-screen-header-visual sx={{ flexShrink: 0 }}>
    {children}
  </Stack>
);
