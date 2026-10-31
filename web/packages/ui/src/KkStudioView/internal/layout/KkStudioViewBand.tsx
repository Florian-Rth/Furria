import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkStudioViewBandProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkStudioViewBand: FC<KkStudioViewBandProps> = ({ sx, children }) => (
  <Box
    data-kk-studio-band
    sx={[{ gridArea: 'band', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Box>
);
