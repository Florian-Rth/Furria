import { kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const PhotoViewerHeader: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    component="header"
    direction="row"
    data-kk-photo-viewer-header
    sx={{
      gridArea: 'header',
      minWidth: 0,
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      py: { xs: 1.5, desktop: 2.5 },
      borderBottom: `${kkTokens.line.hair}px solid`,
      borderColor: 'divider',
    }}
  >
    {children}
  </Stack>
);
