import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkSplitLayoutStage: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-split-layout-stage
    sx={{
      flex: { xs: '1 1 auto', desktop: '1 1 58%' },
      minWidth: 0,
    }}
  >
    {children}
  </Stack>
);
