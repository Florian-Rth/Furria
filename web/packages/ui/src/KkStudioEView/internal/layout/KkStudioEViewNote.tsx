import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioEViewNote: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-studio-e-note
    sx={{ minWidth: 0, width: '100%', maxWidth: { desktop: '44rem' }, mx: 'auto' }}
  >
    {children}
  </Box>
);
