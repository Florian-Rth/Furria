import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const AlbumHeader: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    component="header"
    data-kk-album-header
    sx={{ gap: { xs: 2, md: 2.5 }, alignItems: 'flex-start', minWidth: 0 }}
  >
    {children}
  </Stack>
);
