import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const FeaturedAlbumOverlay: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-featured-album-overlay
    direction={{ xs: 'column', desktop: 'row' }}
    sx={(theme) => ({
      position: 'relative',
      zIndex: 2,
      minHeight: { xs: theme.spacing(34), desktop: theme.spacing(52) },
      justifyContent: { xs: 'flex-end', desktop: 'space-between' },
      alignItems: { desktop: 'flex-end' },
      gap: { xs: 2, desktop: 4 },
      p: { xs: 2.5, desktop: 4 },
    })}
  >
    {children}
  </Stack>
);
