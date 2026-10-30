import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioGInspectorIdle: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-studio-g-inspector-idle sx={{ position: 'absolute', inset: 0, minHeight: 0 }}>
    {children}
  </Stack>
);
