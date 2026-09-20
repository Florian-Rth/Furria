import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkGroupStageBodyProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkGroupStageBody: FC<KkGroupStageBodyProps> = ({ sx, children }) => (
  <Stack
    data-kk-group-stage-body
    sx={[
      { minWidth: 0, gap: { xs: 1, desktop: 1.25 }, pt: { xs: 1.75, desktop: 2.25 } },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
