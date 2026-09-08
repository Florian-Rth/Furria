import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { SplitLayoutSheetProvider } from '../logic/SplitLayoutSheetProvider';

interface KkSplitLayoutRootProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkSplitLayoutRoot: FC<KkSplitLayoutRootProps> = ({ sx, children }) => (
  <Stack
    direction={{ xs: 'column', desktop: 'row' }}
    data-kk-split-layout
    sx={[
      { minHeight: '100dvh', bgcolor: 'background.default' },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <SplitLayoutSheetProvider>{children}</SplitLayoutSheetProvider>
  </Stack>
);
