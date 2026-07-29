import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const PhotoViewerFooter: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    component="footer"
    data-kk-photo-viewer-footer
    sx={{ gridArea: 'footer', minWidth: 0, gap: 0.75 }}
  >
    {children}
  </Stack>
);
