import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkImageViewerActions: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-image-viewer-actions
    sx={{ flexShrink: 0, alignItems: 'center', gap: { xs: 1.5, desktop: 2.5 } }}
  >
    {children}
  </Stack>
);
