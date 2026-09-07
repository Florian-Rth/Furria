import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkSplitLayoutStageProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkSplitLayoutStage: FC<KkSplitLayoutStageProps> = ({ sx, children }) => (
  <Stack
    data-kk-split-layout-stage
    sx={[
      { flex: { xs: '1 1 auto', desktop: '1 1 58%' }, minWidth: 0 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
