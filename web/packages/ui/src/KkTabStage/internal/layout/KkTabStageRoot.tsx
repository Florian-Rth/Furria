import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { safeArea } from '../../../internal/safe-area';

const SIDE_GUTTER = 16;
const TOP_GUTTER = 12;
const FOOT_GUTTER = 16;
const MEASURE = '30rem';

export const KkTabStageRoot: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    component="main"
    data-kk-tab-stage
    sx={{ minHeight: '100dvh', bgcolor: 'background.default', color: 'text.primary' }}
  >
    <Stack
      sx={{
        flex: 1,
        width: '100%',
        maxWidth: MEASURE,
        mx: 'auto',
        minWidth: 0,
        gap: 2,
        pt: safeArea('top', TOP_GUTTER),
        pb: safeArea('bottom', FOOT_GUTTER),
        pl: safeArea('left', SIDE_GUTTER),
        pr: safeArea('right', SIDE_GUTTER),
      }}
    >
      {children}
    </Stack>
  </Stack>
);
