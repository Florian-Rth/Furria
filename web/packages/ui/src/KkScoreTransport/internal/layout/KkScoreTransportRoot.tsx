import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkScoreTransportRootProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkScoreTransportRoot: FC<KkScoreTransportRootProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    data-kk-score-transport
    sx={[
      { alignItems: 'center', gap: 1.25, minWidth: 0, flexWrap: 'wrap' },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
