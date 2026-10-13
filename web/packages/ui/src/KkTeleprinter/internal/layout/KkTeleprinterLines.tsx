import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkTeleprinterLinesProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkTeleprinterLines: FC<KkTeleprinterLinesProps> = ({ sx, children }) => (
  <Stack
    component="ul"
    data-kk-teleprinter-lines
    sx={[{ m: 0, p: 0, listStyle: 'none', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
