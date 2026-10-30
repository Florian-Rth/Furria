import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioGViewerBar: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-studio-g-viewer-bar
    sx={{ gridArea: 'bar', alignItems: 'flex-end', gap: 1, minWidth: 0 }}
  >
    {children}
  </Stack>
);
