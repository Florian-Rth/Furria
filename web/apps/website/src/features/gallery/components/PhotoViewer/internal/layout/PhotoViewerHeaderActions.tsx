import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const PhotoViewerHeaderActions: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-photo-viewer-actions
    sx={{ flexShrink: 0, alignItems: 'center', gap: { xs: 1.5, desktop: 2.5 } }}
  >
    {children}
  </Stack>
);
