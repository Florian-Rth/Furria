import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioIEditorControls: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-studio-i-controls
    sx={{ gridArea: 'controls', minWidth: 0, alignItems: 'center', justifyContent: 'center' }}
  >
    {children}
  </Stack>
);
