import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkReadoutLinesProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkReadoutLines: FC<KkReadoutLinesProps> = ({ sx, children }) => (
  <Stack
    component="ul"
    data-kk-readout-lines
    sx={[{ m: 0, p: 0, listStyle: 'none', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
