import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const FeaturedAlbumCaption: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-featured-album-caption
    sx={{ minWidth: 0, alignItems: 'flex-start', gap: { xs: 1.5, desktop: 2 } }}
  >
    {children}
  </Stack>
);
