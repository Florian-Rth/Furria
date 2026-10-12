import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

export const KkImageViewerHeader: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    component="header"
    direction="row"
    data-kk-image-viewer-header
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
