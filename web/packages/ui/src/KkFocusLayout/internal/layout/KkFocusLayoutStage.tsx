import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkFocusLayoutStage: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-focus-stage
    sx={{
      gridArea: 'stage',
      position: 'relative',
      minWidth: 0,
      minHeight: 0,
    }}
  >
    {children}
  </Stack>
);
