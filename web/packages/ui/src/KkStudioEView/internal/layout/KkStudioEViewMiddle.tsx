import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { trackEdgeOf } from '../../../KkShell/internal/track-edge';

export const KkStudioEViewMiddle: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-studio-e-middle
    sx={{
      position: 'relative',
      display: 'grid',
      placeItems: 'center',
      minWidth: 0,
      minHeight: 0,
      containerType: 'size',
      ml: { xs: `calc(-1 * ${trackEdgeOf('left')})`, desktop: 0 },
      mr: { xs: `calc(-1 * ${trackEdgeOf('right')})`, desktop: 0 },
    }}
  >
    {children}
  </Box>
);
