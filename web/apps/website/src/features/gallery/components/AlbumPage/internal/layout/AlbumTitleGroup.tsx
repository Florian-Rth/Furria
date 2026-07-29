import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const AlbumTitleGroup: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-album-title-group
    sx={{ minWidth: 0, alignItems: 'flex-start', gap: { xs: 1, md: 1.5 } }}
  >
    {children}
  </Stack>
);
